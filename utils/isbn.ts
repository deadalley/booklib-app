/*
 * ISBN helpers. Book barcodes are EAN-13 codes that start with 978 or 979,
 * which are also the book's ISBN-13. Older books may carry an ISBN-10.
 */

/** Removes spaces and hyphens, and upper-cases a trailing x */
export function cleanIsbn(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase()
}

export function isValidIsbn13(isbn: string): boolean {
  if (!/^97[89]\d{10}$/.test(isbn)) return false
  const sum = [...isbn]
    .slice(0, 12)
    .reduce((total, digit, index) => total + +digit * (index % 2 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === +isbn[12]!
}

export function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false
  const sum = [...isbn].reduce(
    (total, char, index) => total + (char === 'X' ? 10 : +char) * (10 - index),
    0,
  )
  return sum % 11 === 0
}

/** The ISBN-13 for an ISBN-10 */
export function isbn10To13(isbn10: string): string {
  const base = `978${isbn10.slice(0, 9)}`
  const sum = [...base].reduce(
    (total, digit, index) => total + +digit * (index % 2 ? 3 : 1),
    0,
  )
  return `${base}${(10 - (sum % 10)) % 10}`
}

/**
 * A valid ISBN as an ISBN-13, or null. Accepts ISBN-10 and ISBN-13, with or
 * without hyphens and spaces.
 */
export function parseIsbn(raw: string | null | undefined): string | null {
  if (!raw) return null
  const isbn = cleanIsbn(raw)
  if (isValidIsbn13(isbn)) return isbn
  if (isValidIsbn10(isbn)) return isbn10To13(isbn)
  return null
}
