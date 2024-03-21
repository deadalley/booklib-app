import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const book = await readBody(event)

  if (!user?.id) {
    throw new Error('Unauthenticated')
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { author, coverSrc, ...bookToSubmit } = book
    const { data, ...d } = await client
      .from('books')
      .upsert({ ...bookToSubmit, cover_src: coverSrc, user_id: user.id })
    console.log(d)
    return data
  }
})
