export type OpenLibraryAuthor = {
  key: string
  text: string[]
  name: string
  alternate_names: string[]
  birth_date: string
  top_work: string
  work_count: number
}

export type OpenLibraryApiOptions = {
  lang?: string
  limit?: number
}
