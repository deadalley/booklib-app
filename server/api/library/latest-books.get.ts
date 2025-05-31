import { db } from '~/services/db.service'

export default defineEventHandler(async () => {
  return db.getLatestBooks().then((books) =>
    books.map((book) => ({
      ...book,
      coverSrc: book.cover_src,
    })),
  )
})
