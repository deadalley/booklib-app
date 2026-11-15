import { describe, expect, it } from 'vitest'
import { isbn10To13, isValidIsbn10, isValidIsbn13, parseIsbn } from './isbn'

describe('isbn', () => {
  it('validates ISBN-13 check digits', () => {
    expect(isValidIsbn13('9780060512756')).toBe(false)
    expect(isValidIsbn13('9780060512750')).toBe(true)
    // An EAN-13 that is not a book
    expect(isValidIsbn13('4006381333931')).toBe(false)
  })

  it('validates ISBN-10 check digits, including X', () => {
    expect(isValidIsbn10('006051275X')).toBe(true)
    expect(isValidIsbn10('080442957X')).toBe(true)
    expect(isValidIsbn10('0060512756')).toBe(false)
  })

  it('converts ISBN-10 to ISBN-13', () => {
    expect(isbn10To13('006051275X')).toBe('9780060512750')
    expect(isbn10To13('080442957X')).toBe('9780804429573')
  })

  it('parses typed ISBNs with hyphens and spaces', () => {
    expect(parseIsbn('978-0-06-051275-0')).toBe('9780060512750')
    expect(parseIsbn(' 0-8044-2957-x ')).toBe('9780804429573')
    expect(parseIsbn('12345')).toBeNull()
    expect(parseIsbn('')).toBeNull()
    expect(parseIsbn(null)).toBeNull()
  })
})
