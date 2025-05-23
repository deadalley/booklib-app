import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  return db.getLatestBooks(event).then((books) =>
    books.map((book) => ({
      ...book,
      coverSrc: book.cover_src,
    })),
  )
})
