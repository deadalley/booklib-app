import { describe, expect, it } from 'vitest'
import { parseBookFile } from './index'

const GOODREADS = `Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies
13651,The Dispossessed,Ursula K. Le Guin,"Le Guin, Ursula K.",,"=""0060512750""","=""9780060512750""",5,4.21,Harper Perennial,Paperback,387,2003,1974,2024/03/01,2023/12/01,favorites,favorites (#1),read,,,,1,1
29579,Kindred,Octavia E. Butler,"Butler, Octavia E.",,"=""""","=""""",0,4.28,Beacon Press,Kindle Edition,264,2003,1979,,2024/01/10,to-read,to-read (#3),to-read,,,,0,0
`

const STORYGRAPH = `Title,Authors,Contributors,ISBN/UID,Format,Read Status,Date Added,Last Date Read,Dates Read,Read Count,Moods,Pace,Character- or Plot-Driven?,Strong Character Development?,Loveable Characters?,Diverse Characters?,Flawed Characters?,Star Rating,Review,Content Warnings,Content Warning Description,Tags,Owned?
Piranesi,Susanna Clarke,,9781635575637,hardcover,read,2024/02/01,2024/02/20,2024/02/05-2024/02/20,1,mysterious,medium,,,,,,4.25,,,,,Yes
Circe,"Madeline Miller, Someone Else",,a1b2c3,audio,to-read,2024/03/01,,,0,,,,,,,,,,,,,No
The Goldfinch,Donna Tartt,,9780316055437,digital,did-not-finish,2024/01/01,,,0,,,,,,,,,,,,,No
`

describe('Goodreads export', () => {
  const result = parseBookFile(GOODREADS, 'csv')

  it('is recognised and read without errors', () => {
    expect(result.source).toBe('goodreads')
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([])
    expect(result.records).toHaveLength(2)
  })

  it('maps shelves, ratings, ISBNs, bindings and dates', () => {
    const [dispossessed, kindred] = result.records
    expect(dispossessed).toMatchObject({
      title: 'The Dispossessed',
      author: 'Ursula K. Le Guin',
      isbn: '9780060512750',
      rating: 5,
      format: 'paperback',
      pages: 387,
      year: 1974,
      propertyStatus: 'owned',
      progress: { status: 'read' },
    })
    expect(dispossessed!.progress.finishedAt).toMatch(/^2024-03-01/)
    expect(kindred).toMatchObject({
      isbn: null,
      rating: null,
      format: 'ebook',
      progress: { status: null },
    })
    expect(result.collections).toEqual([['favorite'], ['tbr']])
  })
})

describe('StoryGraph export', () => {
  const result = parseBookFile(STORYGRAPH, 'csv')

  it('is recognised and read without errors', () => {
    expect(result.source).toBe('storygraph')
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([])
    expect(result.records).toHaveLength(3)
  })

  it('maps statuses, reading dates, quarter stars and formats', () => {
    const [piranesi, circe, goldfinch] = result.records
    expect(piranesi).toMatchObject({
      author: 'Susanna Clarke',
      isbn: '9781635575637',
      // 4.25 rounds to BookLib's half stars
      rating: 4.5,
      format: 'hardcover',
      propertyStatus: 'owned',
      progress: { status: 'read' },
    })
    expect(piranesi!.progress.startedAt).toMatch(/^2024-02-05/)
    expect(piranesi!.progress.finishedAt).toMatch(/^2024-02-20/)
    // First author only; a StoryGraph id isn't an ISBN
    expect(circe).toMatchObject({
      author: 'Madeline Miller',
      isbn: null,
      format: 'audiobook',
    })
    expect(goldfinch!.progress.status).toBe('not-finished')
    expect(result.collections).toEqual([[], ['tbr'], []])
  })
})

describe('BookLib files', () => {
  it('pass through unchanged', () => {
    const result = parseBookFile(
      'TITLE,AUTHOR\nPiranesi,Susanna Clarke\n',
      'csv',
    )
    expect(result.source).toBe('booklib')
    expect(result.records[0]).toMatchObject({ title: 'Piranesi' })
    expect(result.collections).toEqual([[]])
  })
})
