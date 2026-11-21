import JSZip from 'jszip'

/* Small, valid ebooks for the reader tests, built in memory */

const PARAGRAPH =
  'The house was vast and the tides came in through the lower halls, and every morning the statues stood a little clearer in the light. '

function chapter(title: string, marker: string) {
  const text = Array.from({ length: 14 }, (_, i) =>
    i === 2 ? `<p>${marker} ${PARAGRAPH}</p>` : `<p>${PARAGRAPH.repeat(3)}</p>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${title}</title></head>
<body><h1>${title}</h1>
${text}
</body></html>`
}

/** An EPUB 3 with three chapters; chapter n contains "Marker n." */
export async function makeEpub(): Promise<Buffer> {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`,
  )
  const chapters = [1, 2, 3]
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="id">urn:uuid:booklib-test</dc:identifier>
    <dc:title>The Tidal House</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${chapters.map((n) => `<item id="c${n}" href="c${n}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine>${chapters.map((n) => `<itemref idref="c${n}"/>`).join('')}</spine>
</package>`,
  )
  zip.file(
    'OEBPS/nav.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title></head>
<body><nav epub:type="toc"><ol>
${chapters.map((n) => `<li><a href="c${n}.xhtml">Chapter ${n}</a></li>`).join('\n')}
</ol></nav></body></html>`,
  )
  for (const n of chapters) {
    zip.file(`OEBPS/c${n}.xhtml`, chapter(`Chapter ${n}`, `Marker ${n}.`))
  }
  return zip.generateAsync({
    type: 'nodebuffer',
    mimeType: 'application/epub+zip',
  })
}

/** A PDF with `pages` pages; page n says "Page n of the tidal house" */
export function makePdf(pages = 3): Buffer {
  const objects: string[] = []
  const add = (body: string) => objects.push(body) // object number = length
  add('<< /Type /Catalog /Pages 2 0 R >>')
  const kids = Array.from({ length: pages }, (_, i) => `${4 + i * 2} 0 R`)
  add(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages} >>`)
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  for (let n = 1; n <= pages; n++) {
    const pageObj = objects.length + 1
    add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 595] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageObj + 1} 0 R >>`,
    )
    const stream = `BT /F1 18 Tf 50 520 Td (Page ${n} of the tidal house) Tj 0 -30 Td (The statues stood in the light.) Tj ET`
    add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  }

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets
    .map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)
    .join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}
