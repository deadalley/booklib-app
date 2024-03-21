import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data } = await client.from('books').select('*')

  return data?.map((b: any) => ({ ...b, coverSrc: b.cover_src }))
})
