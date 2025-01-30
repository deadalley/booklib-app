import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'

export default defineEventHandler<Promise<string | undefined>>(
  async (event) => {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient<Database>(event)

    if (!user?.id) {
      throw createError('Unauthenticated')
    } else {
      const { data, error } = await client.auth.admin.deleteUser(user.id)

      if (error) {
        throw createError(error.message)
      }

      if (data) {
        return data.user.id
      }
    }
  },
)
