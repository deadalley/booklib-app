import type {
  OpenLibraryAuthor,
  OpenLibraryApiOptions,
} from '~/types/open-library'

const url: string = 'https://openlibrary.org/search'

async function getByParams(
  route: string,
  queryParams: object,
): Promise<{ numFound: number; start: number; docs: OpenLibraryAuthor[] }> {
  return $fetch(`${url}/${route}`, {
    query: {
      ...queryParams,
    },
  })
}

export async function getAuthorByName(
  authorName: string,
  options?: OpenLibraryApiOptions,
): Promise<{ numFound: number; start: number; docs: OpenLibraryAuthor[] }> {
  return getByParams('authors.json', { q: authorName, ...options })
}
