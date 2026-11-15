import type { BrowserMultiFormatReader } from '@zxing/browser'
import { cleanIsbn, parseIsbn } from '~/utils/isbn'

export type ScannerState =
  | 'idle'
  | 'starting'
  | 'scanning'
  // Camera access was refused
  | 'denied'
  // Another app (or tab) is using the camera
  | 'busy'
  // No camera
  | 'unavailable'
  // The page isn't served over https, so browsers hide the camera
  | 'insecure'
  // Anything else, e.g. the barcode reader failed to load
  | 'error'

// The Shape Detection API is not in TypeScript's DOM types yet
type DetectedBarcode = { rawValue: string }
type Detector = {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>
}
type BarcodeDetectorClass = {
  new (options: { formats: string[] }): Detector
  getSupportedFormats: () => Promise<string[]>
}
// Torch and focus are not in the standard track types either
type CameraCapabilities = MediaTrackCapabilities & {
  torch?: boolean
  focusMode?: string[]
}

const DETECT_INTERVAL_MS = 120
// After this long without reading anything, show tips
const STRUGGLING_AFTER_MS = 7000
// Frames are decoded at most this wide: enough for a barcode, still fast
const MAX_DECODE_WIDTH = 1280

/** Why a camera could not be started, from getUserMedia's error */
function stateForError(error: unknown): ScannerState {
  switch ((error as DOMException)?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'unavailable'
    default:
      return 'error'
  }
}

async function nativeDetector(): Promise<Detector | null> {
  const Native = (
    window as unknown as { BarcodeDetector?: BarcodeDetectorClass }
  ).BarcodeDetector
  if (!Native) return null
  try {
    const formats = await Native.getSupportedFormats()
    return formats.includes('ean_13')
      ? new Native({ formats: ['ean_13', 'upc_a'] })
      : null
  } catch {
    return null
  }
}

async function zxingDetector(): Promise<Detector> {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
    await Promise.all([import('@zxing/browser'), import('@zxing/library')])
  const hints = new Map<number, unknown>([
    [
      DecodeHintType.POSSIBLE_FORMATS,
      [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A],
    ],
    // Slower per frame, but also finds barcodes held sideways or small
    [DecodeHintType.TRY_HARDER, true],
  ])
  const reader: BrowserMultiFormatReader = new BrowserMultiFormatReader(
    hints as never,
  )
  return {
    detect: async (source) => {
      try {
        return [
          {
            rawValue: reader
              .decodeFromCanvas(source as HTMLCanvasElement)
              .getText(),
          },
        ]
      } catch {
        // NotFoundException and friends: nothing readable in this frame
        return []
      }
    },
  }
}

/**
 * Reads book barcodes from the camera into `video`. Uses the browser's
 * BarcodeDetector where it exists (Android, macOS) and ZXing elsewhere
 * (Windows, Linux, Firefox). Frames alternate between the whole picture and
 * an enlarged band through the middle, where the barcode usually is.
 * Only valid ISBNs are reported, as ISBN-13s.
 */
export function useBarcodeScanner(
  video: Ref<HTMLVideoElement | undefined>,
  onIsbn: (isbn: string) => void,
) {
  const state = ref<ScannerState>('idle')
  // A barcode that was read but is not a book's (e.g. a UPC price code)
  const otherCode = ref<string | null>(null)
  // Scanning for a while without reading any barcode
  const struggling = ref(false)
  const torchSupported = ref(false)
  const torchOn = ref(false)
  const cameraCount = ref(0)

  let stream: MediaStream | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let strugglingTimer: ReturnType<typeof setTimeout> | undefined
  let deviceId: string | undefined
  let canvas: HTMLCanvasElement | null = null
  // Bumped on every start/stop, so a stale async step can tell it is stale
  let session = 0

  function onCode(code: string) {
    const isbn = parseIsbn(code)
    if (isbn) {
      stop()
      onIsbn(isbn)
      return
    }
    // A 978/979 code with a wrong check digit is a misread: keep trying
    if (!/^97[89]/.test(cleanIsbn(code))) otherCode.value = code
  }

  /** The frame to decode: the whole picture, or the band through the middle */
  function frame(element: HTMLVideoElement, band: boolean) {
    const width = element.videoWidth
    const height = element.videoHeight
    if (!width || !height) return null
    canvas ??= document.createElement('canvas')
    const sy = band ? height * 0.25 : 0
    const sh = band ? height * 0.5 : height
    // The band is enlarged (up to 2×) so a small barcode gets wider bars
    const scale = Math.min(MAX_DECODE_WIDTH / width, band ? 2 : 1)
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(sh * scale)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    context?.drawImage(
      element,
      0,
      sy,
      width,
      sh,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    return canvas
  }

  async function openCamera(): Promise<MediaStream> {
    const video: MediaTrackConstraints = {
      ...(deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: 'environment' } }),
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    }
    try {
      return await navigator.mediaDevices.getUserMedia({ video, audio: false })
    } catch (error) {
      // Some cameras reject the size hints: try again with no hints
      if ((error as DOMException)?.name !== 'OverconstrainedError') throw error
      return await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      })
    }
  }

  /** Continuous autofocus and the torch, where the camera supports them */
  async function tuneCamera(track: MediaStreamTrack) {
    const capabilities = (track.getCapabilities?.() ?? {}) as CameraCapabilities
    torchSupported.value = !!capabilities.torch
    torchOn.value = false
    if (capabilities.focusMode?.includes('continuous')) {
      await track
        .applyConstraints({ advanced: [{ focusMode: 'continuous' } as never] })
        .catch(() => {})
    }
  }

  async function start() {
    stop()
    const current = ++session
    otherCode.value = null
    struggling.value = false

    if (!window.isSecureContext) {
      state.value = 'insecure'
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      state.value = 'unavailable'
      return
    }

    state.value = 'starting'
    try {
      stream = await openCamera()
    } catch (error) {
      if (current !== session) return
      state.value = stateForError(error)
      return
    }

    const element = video.value
    if (current !== session || !element) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
      return
    }
    const [track] = stream.getVideoTracks()
    if (track) await tuneCamera(track)
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        cameraCount.value = devices.filter(
          ({ kind }) => kind === 'videoinput',
        ).length
      })
      .catch(() => {})

    element.srcObject = stream
    element.muted = true
    element.setAttribute('playsinline', '')
    await element.play().catch(() => {})
    if (current !== session) return

    let detector: Detector
    try {
      detector = (await nativeDetector()) ?? (await zxingDetector())
    } catch {
      if (current !== session) return
      stop()
      state.value = 'error'
      return
    }
    if (current !== session) return
    state.value = 'scanning'
    strugglingTimer = setTimeout(() => {
      if (current === session) struggling.value = true
    }, STRUGGLING_AFTER_MS)

    let band = false
    const tick = async () => {
      if (current !== session) return
      if (element.readyState >= element.HAVE_CURRENT_DATA) {
        const source = frame(element, band)
        band = !band
        try {
          const [code] = source ? await detector.detect(source) : []
          if (current !== session) return
          if (code?.rawValue) onCode(code.rawValue)
        } catch {
          // A frame that can't be read; try the next one
        }
      }
      if (current === session) timer = setTimeout(tick, DETECT_INTERVAL_MS)
    }
    tick()
  }

  async function toggleTorch() {
    const [track] = stream?.getVideoTracks() ?? []
    if (!track) return
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn.value } as never],
      })
      torchOn.value = !torchOn.value
    } catch {
      torchSupported.value = false
    }
  }

  /** Moves to the next camera, e.g. from a laptop's webcam to a USB one */
  async function switchCamera() {
    const cameras = (await navigator.mediaDevices.enumerateDevices()).filter(
      ({ kind }) => kind === 'videoinput',
    )
    if (cameras.length < 2) return
    const currentId = stream?.getVideoTracks()[0]?.getSettings().deviceId
    const index = cameras.findIndex((camera) => camera.deviceId === currentId)
    deviceId = cameras[(index + 1) % cameras.length]!.deviceId
    await start()
  }

  function stop() {
    session++
    clearTimeout(timer)
    clearTimeout(strugglingTimer)
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    torchOn.value = false
    if (video.value) video.value.srcObject = null
    if (state.value === 'starting' || state.value === 'scanning') {
      state.value = 'idle'
    }
  }

  onBeforeUnmount(stop)

  return {
    state,
    otherCode,
    struggling,
    torchSupported,
    torchOn,
    cameraCount,
    start,
    stop,
    toggleTorch,
    switchCamera,
  }
}
