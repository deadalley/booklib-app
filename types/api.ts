import type { BookProgressStatus } from './book'

export type ApiResponseError = {
  name: string
  message: string
}

export type ApiResponseType<T> = Promise<{
  data: T | null
  error: ApiResponseError | null
  count: number | null
}>

export type GetBooksQuerySearchParams = {
  page?: number
  pageSize?: number
  bookProgress?: BookProgressStatus
  withBookCovers?: boolean
}
