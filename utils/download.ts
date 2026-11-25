/** Saves text or a blob (e.g. an image) as a file. */
export function downloadFile(
  name: string,
  contents: string | Blob,
  type: string,
) {
  const blob =
    contents instanceof Blob ? contents : new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
