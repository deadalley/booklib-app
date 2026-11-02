import type { ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import { DEFAULT_COLLECTIONS } from '~/utils/constants'

export function sortBooksByOrder(booksToBeSorted: ViewBook[]) {
  return booksToBeSorted.concat().sort((book1, book2) => {
    if (book1.order !== undefined && book2.order !== undefined) {
      return book1.order - book2.order
    }
    return book1.title.localeCompare(book2.title, undefined, { numeric: true })
  })
}

export function sortBooksByAuthor(books: ViewBook[]) {
  return books.concat().sort((b1, b2) => {
    if (b1.authorName === b2.authorName) {
      return b1.title.localeCompare(b2.title, undefined, { numeric: true })
    }

    if (b1.authorName && !b2.authorName) {
      return -1
    }

    if (!b1.authorName && b2.authorName) {
      return 1
    }

    if (b1.authorName && b2.authorName) {
      return b1.authorName.localeCompare(b2.authorName, undefined, {
        numeric: true,
      })
    }

    return 0
  })
}

export function sortCollections(collections: Collection[]) {
  return collections.concat().sort((b1, b2) => {
    const isB1Favorite = DEFAULT_COLLECTIONS.includes(String(b1.id))
    const isB2Favorite = DEFAULT_COLLECTIONS.includes(String(b2.id))

    if (isB1Favorite && isB2Favorite) {
      return (
        DEFAULT_COLLECTIONS.indexOf(String(b1.id)) -
        DEFAULT_COLLECTIONS.indexOf(String(b2.id))
      )
    }

    if (isB1Favorite) {
      return -1
    }

    if (isB2Favorite) {
      return 1
    }

    return b1.name.localeCompare(b2.name, undefined, { numeric: true })
  })
}

export function sortGoals(goals: Goal[]) {
  const goalSortingOrder: Record<
    'tracking' | 'completed' | 'expired' | 'not-tracking',
    number
  > = {
    tracking: 0,
    completed: 1,
    expired: 2,
    'not-tracking': 3,
  }

  return goals.concat().sort((g1, g2) => {
    const status1 = getGoalStatus(g1)
    const status2 = getGoalStatus(g2)

    if (status1 === status2) {
      return new Date(g1.createdAt).getTime() - new Date(g2.createdAt).getTime()
    }
    return goalSortingOrder[status1] - goalSortingOrder[status2]
  })
}
