import type { Book } from '~/types/book'
import type { BulkBookChange } from '~/types/ui'
import { BOOK_FORMAT_MAP, PROGRESS_STATUS_MAP } from './constants'

/** What a bulk change will do, in plain words, before it is saved */
export type BulkChangePreview = {
  // e.g. "4 books" or "Fantasy on 3 books"
  from: string
  // e.g. "Read" or "+ Classics"
  to: string
  detail: string
  // The primary button, e.g. "Mark 4 books as Read"
  action: string
  // Toast after applying, e.g. "Marked as Read"
  done: string
}

export type BulkChangeContext = {
  authors: { id: string; name: string }[]
  // Every genre in the library
  genres: string[]
  collections?: { id: string; name: string }[]
}

export const pluralBooks = (count: number) =>
  `${count} ${count === 1 ? 'book' : 'books'}`

const has = (count: number) => (count === 1 ? 'has' : 'have')

export function formatStars(rating: number) {
  return `${rating} ${rating === 1 ? 'star' : 'stars'}`
}

/** "a, b and c" */
export function joinWithAnd(items: string[]) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

const sentences = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ')

export function statusLabel(status: Book['progress']['status']) {
  return status ? PROGRESS_STATUS_MAP[status].description : 'Not started'
}

/** The plain-words preview of `change` applied to `books` */
export function previewBulkChange(
  change: BulkBookChange,
  books: Book[],
  context: BulkChangeContext,
): BulkChangePreview {
  const total = books.length
  const all = pluralBooks(total)
  const count = (match: (book: Book) => boolean) => books.filter(match).length

  switch (change.field) {
    case 'status': {
      const label = statusLabel(change.status)
      const finishes =
        change.status === 'read' || change.status === 'not-finished'
      const undated = count((book) => !book.progress.finishedAt)
      let detail: string
      if (finishes) {
        detail =
          undated === 0
            ? 'Existing finish dates are kept.'
            : sentences(
                undated === total
                  ? `A finish date of today is recorded on ${total === 1 ? 'the book' : 'each book'}.`
                  : `A finish date of today is recorded on ${pluralBooks(undated)}.`,
                undated < total && 'Existing finish dates are kept.',
              )
      } else if (change.status === null) {
        detail = 'Reading progress and dates are reset.'
      } else if (change.status === 'paused') {
        detail = 'Your place is kept. Any finish date is cleared.'
      } else {
        detail = 'Any finish date is cleared.'
      }
      return {
        from: all,
        to: label,
        detail,
        action: `Mark ${all} as ${label}`,
        done: `Marked as ${label}`,
      }
    }

    case 'author': {
      const existing = context.authors.find(({ id }) => id === change.author)
      const name = existing?.name ?? change.author
      const action = `Set author for ${all}`
      const done = `Author set to ${name}`
      if (!existing) {
        return {
          from: all,
          to: `${name} (new)`,
          detail: `Creates the author “${name}” and assigns it to ${total === 1 ? 'the book' : `all ${total} books`}.`,
          action,
          done,
        }
      }
      const same = count((book) => book.author === existing.id)
      return {
        from: all,
        to: name,
        detail: sentences(
          same < total &&
            `Replaces the author on ${pluralBooks(total - same)}.`,
          same > 0 && `${pluralBooks(same)} already ${has(same)} this author.`,
        ),
        action,
        done,
      }
    }

    case 'genre': {
      const genre = change.genre
      const tagged = count((book) => !!book.genres?.includes(genre))
      if (change.mode === 'remove') {
        const untagged = total - tagged
        return {
          from: `${genre} on ${pluralBooks(tagged)}`,
          to: 'Removed',
          detail:
            untagged > 0
              ? `${pluralBooks(untagged)} ${untagged === 1 ? 'doesn’t' : 'don’t'} have ${genre} and ${untagged === 1 ? 'stays as it is' : 'stay as they are'}.`
              : `Every selected book loses ${genre}.`,
          action: `Remove ${genre} from ${pluralBooks(tagged)}`,
          done: `Removed ${genre}`,
        }
      }
      const isNew = !context.genres.includes(genre)
      return {
        from: all,
        to: `+ ${genre}`,
        detail: isNew
          ? `Creates the genre “${genre}” and adds it to ${total === 1 ? 'the book' : `all ${total} books`}.`
          : tagged > 0
            ? `${tagged} of the ${total} already ${has(tagged)} ${genre} and ${tagged === 1 ? 'stays as it is' : 'stay as they are'}.`
            : `Adds ${genre} to ${total === 1 ? 'the book' : `all ${total} books`}.`,
        action: `Add ${genre} to ${all}`,
        done: `Added ${genre}`,
      }
    }

    case 'format': {
      const label = BOOK_FORMAT_MAP[change.format].description
      const counts = new Map<string, number>()
      for (const book of books) {
        const key = book.format
          ? BOOK_FORMAT_MAP[book.format].description
          : 'no format'
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
      const current = [...counts].map(([key, value]) =>
        key === 'no format' ? `${value} with no format` : `${value} ${key}`,
      )
      return {
        from: all,
        to: label,
        detail:
          counts.size === 1 && counts.has(label)
            ? `All are already ${label}.`
            : `Currently ${joinWithAnd(current)}.`,
        action: `Set ${all} to ${label}`,
        done: `Set to ${label}`,
      }
    }

    case 'rating': {
      const rated = count((book) => book.rating != null)
      if (change.rating === null) {
        const unrated = total - rated
        return {
          from: all,
          to: 'No rating',
          detail: sentences(
            rated > 0 && `Clears the rating on ${pluralBooks(rated)}.`,
            unrated > 0 &&
              (rated > 0
                ? `${pluralBooks(unrated)} ${has(unrated)} none.`
                : 'None of them are rated.'),
          ),
          action: `Clear rating on ${pluralBooks(rated || total)}`,
          done: 'Rating cleared',
        }
      }
      const stars = formatStars(change.rating)
      const replaced = count(
        (book) => book.rating != null && book.rating !== change.rating,
      )
      return {
        from: all,
        to: stars,
        detail:
          replaced > 0
            ? `Replaces the existing rating on ${pluralBooks(replaced)}.`
            : `Rates ${total === 1 ? 'the book' : `all ${total} books`} ${stars}.`,
        action: `Rate ${all} ${stars}`,
        done: `Rated ${stars}`,
      }
    }

    case 'collection': {
      const name =
        context.collections?.find(({ id }) => id === change.collectionId)
          ?.name ?? 'the collection'
      const add = change.mode === 'add'
      return {
        from: all,
        to: add ? `+ ${name}` : `− ${name}`,
        detail: '',
        action: add ? `Add ${all} to ${name}` : `Remove ${all} from ${name}`,
        done: add ? `Added to ${name}` : `Removed from ${name}`,
      }
    }
  }
}
