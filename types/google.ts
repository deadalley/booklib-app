export type GoogleBook = {
  id: string
  volumeInfo: {
    title: string
    subtitle: string
    authors: string[]
    publisher: string
    publishedDate: string
    description: string
    pageCount: number
    printType: string
    categories: string[]
    maturityRating: string
    imageLinks: {
      smallThumbnail: string
      thumbnail: string
    }
    language: string
    previewLink: string
    infoLink: string
    canonicalVolumeLink: string
  }
}

export type GoogleApiOptions = {
  startIndex?: number
  maxResults?: number
  printType?: 'all' | 'books' | 'magazines'
}
