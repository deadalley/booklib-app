import type { ServerFile } from 'nuxt-file-storage'

export class FileStorageService {
  private directory: string

  constructor(directory: string) {
    this.directory = directory
  }

  async getAllFileNames(): Promise<string[]> {
    return getFilesLocally(this.directory)
  }

  async getFile(fileName: string): Promise<string> {
    return getFileLocally(fileName, this.directory)
  }

  async saveFile(fileName: string, file: ServerFile): Promise<string> {
    return storeFileLocally(file, fileName, this.directory)
  }

  async deleteFile(fileName: string): Promise<void> {
    return deleteFile(fileName, this.directory)
  }
}
