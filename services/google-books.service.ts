import type { Book } from '~/types/book'
import type { GoogleApiOptions, GoogleBook } from '~/types/google'

const url: string = 'https://www.googleapis.com/books/v1'

async function getByParams(
  route: string,
  queryParams: object,
): Promise<{ kind: string; totalItems: number; items: GoogleBook[] }> {
  return $fetch(`${url}/${route}`, {
    query: {
      printType: 'books',
      // langRestrict: 'en', // TODO: properly pass language
      ...queryParams,
    },
  })
}

export async function getByTitle(
  title: Book['title'],
  options?: GoogleApiOptions,
): Promise<{ kind: string; totalItems: number; items: GoogleBook[] }> {
  return getByParams('volumes', { q: `${title}+intitle:${title}`, ...options })
}
