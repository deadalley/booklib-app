import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)

  const bookId = (formData.get('bookId') as File).name

  return db.updateBookCover(event, bookId, formData)
})
