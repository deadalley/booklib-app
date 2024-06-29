export type Book = {
  id: number
  title: string
  coverSrc: string | null
  createdAt: string
  isbn: string | null
  language: string | null
  originalTitle: string | null
  originalLanguage: string | null
  pages: number | null
  publisher: string | null
  rating: number | null
  summary: string | null
  year: number | null
  genres: string[] | null
}
