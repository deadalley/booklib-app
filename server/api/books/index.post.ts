import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/db.generate'
import { bookToDbBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const book = await readBody(event)

  console.log({ user })
  if (!user?.id) {
    throw new Error('Unauthenticated')
  } else {
    const { data, ...d } = await client
      .from('books')
      .upsert(bookToDbBook(book, user.id))
    console.log(d)
    return data
  }
})
