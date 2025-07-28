import type { Database } from '~/types/api'
import type { Low } from 'lowdb'
import { LocalStoragePreset } from 'lowdb/browser'
import { JSONFilePreset } from 'lowdb/node'
import { Low as LowClass } from 'lowdb'
import { ElectronAdapter } from './electron-adapter'

export interface DatabaseClient {
  data: Database
  read(): Promise<void>
  write(): Promise<void>
}

class ElectronDatabaseClient implements DatabaseClient {
  private lowClient: Low<Database>
  private defaultData: Database

  constructor(filePath: string, defaultData: Database) {
    const adapter = new ElectronAdapter<Database>(filePath)
    this.lowClient = new LowClass(adapter, defaultData)
    this.defaultData = defaultData
  }

  get data(): Database {
    return this.lowClient.data!
  }

  set data(value: Database) {
    this.lowClient.data = value
  }

  async read(): Promise<void> {
    await this.lowClient.read()
    if (!this.lowClient.data) {
      // If no data exists, the adapter will return null, so we need to initialize
      this.lowClient.data = this.defaultData
    }
  }

  async write(): Promise<void> {
    await this.lowClient.write()
  }
}

class LocalStorageDatabaseClient implements DatabaseClient {
  private lowClient: ReturnType<typeof LocalStoragePreset<Database>>

  constructor(key: string, defaultData: Database) {
    this.lowClient = LocalStoragePreset<Database>(key, defaultData)
  }

  get data(): Database {
    return this.lowClient.data
  }

  set data(value: Database) {
    this.lowClient.data = value
  }

  async read(): Promise<void> {
    // LocalStoragePreset is synchronous, but we provide async interface for consistency
    this.lowClient.read()
  }

  async write(): Promise<void> {
    // LocalStoragePreset is synchronous, but we provide async interface for consistency
    this.lowClient.write()
  }
}

class JSONFileDatabaseClient implements DatabaseClient {
  private lowClient: Low<Database> | null = null
  private filePath: string
  private defaultData: Database

  constructor(filePath: string, defaultData: Database) {
    this.filePath = filePath
    this.defaultData = defaultData
  }

  get data(): Database {
    if (!this.lowClient) {
      throw new Error('Database not initialized. Call read() first.')
    }
    return this.lowClient.data!
  }

  set data(value: Database) {
    if (!this.lowClient) {
      throw new Error('Database not initialized. Call read() first.')
    }
    this.lowClient.data = value
  }

  async read(): Promise<void> {
    if (!this.lowClient) {
      this.lowClient = await JSONFilePreset<Database>(
        this.filePath,
        this.defaultData,
      )
    } else {
      await this.lowClient.read()
    }
  }

  async write(): Promise<void> {
    if (!this.lowClient) {
      throw new Error('Database not initialized. Call read() first.')
    }
    await this.lowClient.write()
  }
}

export async function createDatabaseClient(
  dbPath: string,
  defaultData: Database,
): Promise<DatabaseClient> {
  // Check if we're in Electron environment
  if (typeof window !== 'undefined' && 'electronAPI' in window) {
    console.log('Creating ElectronDatabaseClient with path:', dbPath)
    const client = new ElectronDatabaseClient(dbPath, defaultData)
    await client.read()
    return client
  }
  // Check if we're in Node.js environment (local development)
  else if (typeof window === 'undefined' && typeof process !== 'undefined') {
    console.log('Creating JSONFileDatabaseClient with path:', dbPath)
    const client = new JSONFileDatabaseClient(dbPath, defaultData)
    await client.read()
    return client
  }
  // Fallback to LocalStorage for browser environment
  else {
    console.log('Creating LocalStorageDatabaseClient with key:', dbPath)
    const client = new LocalStorageDatabaseClient('booklib-data', defaultData)
    await client.read()
    return client
  }
}
