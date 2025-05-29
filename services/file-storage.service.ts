export class FileStorageService {
  private directory: string

  constructor(directory: string) {
    this.directory = directory
  }

  async getAllFileNames(): Promise<string[]> {
    return getFilesLocally('/bookCovers')
  }
}
