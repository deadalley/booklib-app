import { useBookLibService } from '~/services/data-management'

export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const service = useBookLibService()
    try {
      await service.initialize()
    } catch (error) {
      console.error('Failed to initialize BookLib service:', error)
    }
  }
})
