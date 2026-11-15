import type { IScannerControls } from '@zxing/browser'
import { parseIsbn } from '~/utils/isbn'

export type ScannerState =
  | 'idle'
  | 'starting'
  | 'scanning'
  // Camera access was refused
  | 'denied'
  // No camera, or the platform has no camera API
  | 'unavailable'

// The Shape Detection API is not in TypeScript's DOM types yet
type DetectedBarcode = { rawValue: string }
type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>
}
type BarcodeDetectorClass = {
  new (options: { formats: string[] }): BarcodeDetectorLike
  getSupportedFormats: () => Promise<string[]>
}

const DETECT_INTERVAL_MS = 150

async function nativeDetector(): Promise<BarcodeDetectorLike | null> {
  const Detector = (
    window as unknown as { BarcodeDetector?: BarcodeDetectorClass }
  ).BarcodeDetector
  if (!Detector) return null
  try {
    const formats = await Detector.getSupportedFormats()
    return formats.includes('ean_13')
      ? new Detector({ formats: ['ean_13'] })
      : null
  } catch {
    return null
  }
}

/**
 * Reads book barcodes from the camera into `video`. Uses the browser's
 * BarcodeDetector where it exists (Android, macOS) and ZXing elsewhere
 * (Windows and Linux). Only valid ISBNs are reported, as ISBN-13s.
 */
export function useBarcodeScanner(
  video: Ref<HTMLVideoElement | undefined>,
  onIsbn: (isbn: string) => void,
) {
  const state = ref<ScannerState>('idle')
  // A barcode was read but it is not a book's (e.g. a price code)
  const sawOtherBarcode = ref(false)

  let stream: MediaStream | null = null
  let zxingControls: IScannerControls | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  // Bumped on every start/stop, so a stale async step can tell it is stale
  let session = 0

  function onCode(code: string) {
    const isbn = parseIsbn(code)
    if (!isbn) {
      sawOtherBarcode.value = true
      return
    }
    stop()
    onIsbn(isbn)
  }

  async function start() {
    stop()
    const current = ++session
    sawOtherBarcode.value = false

    if (!navigator.mediaDevices?.getUserMedia) {
      state.value = 'unavailable'
      return
    }

    state.value = 'starting'
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
    } catch (error) {
      if (current !== session) return
      state.value =
        (error as DOMException)?.name === 'NotAllowedError'
          ? 'denied'
          : 'unavailable'
      return
    }

    const element = video.value
    if (current !== session || !element) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
      return
    }
    element.srcObject = stream
    element.muted = true
    element.setAttribute('playsinline', '')
    await element.play().catch(() => {})
    if (current !== session) return
    state.value = 'scanning'

    const detector = await nativeDetector()
    if (current !== session) return

    if (detector) {
      const tick = async () => {
        if (current !== session) return
        try {
          if (element.readyState >= element.HAVE_CURRENT_DATA) {
            const [code] = await detector.detect(element)
            if (current !== session) return
            if (code) onCode(code.rawValue)
          }
        } catch {
          // A frame that can't be read; try the next one
        }
        if (current === session) timer = setTimeout(tick, DETECT_INTERVAL_MS)
      }
      tick()
      return
    }

    const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
      await Promise.all([import('@zxing/browser'), import('@zxing/library')])
    if (current !== session) return
    const hints = new Map([
      [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
    ])
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: DETECT_INTERVAL_MS,
    })
    const controls = await reader.decodeFromVideoElement(element, (result) => {
      if (result && current === session) onCode(result.getText())
    })
    if (current !== session) controls.stop()
    else zxingControls = controls
  }

  function stop() {
    session++
    clearTimeout(timer)
    zxingControls?.stop()
    zxingControls = null
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    if (video.value) video.value.srcObject = null
    if (state.value === 'starting' || state.value === 'scanning') {
      state.value = 'idle'
    }
  }

  onBeforeUnmount(stop)

  return { state, sawOtherBarcode, start, stop }
}
