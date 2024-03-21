import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw new Error('No id provided')
  } else {
    const { data } = await client.from('books').select('*').eq('id', id)

    if (data) {
      const { cover_src, ...book } = data[0] as any

      return {
        ...book,
        coverSrc: cover_src,
      }
    }
  }
})
