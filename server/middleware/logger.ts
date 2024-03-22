import { logger } from '~/utils'

export default defineEventHandler(async (event) => {
  logger.info(
    `${getResponseStatus(event)}: ${getRequestURL(event)}`,
    isMethod(event, 'POST')
      ? {
          body: await readBody(event),
        }
      : undefined,
  )
})
