import type { Database } from '~/types/api'
import type { Adapter, Low } from 'lowdb'
import { LocalStoragePreset } from 'lowdb/browser'
import { Low as LowClass } from 'lowdb'
import { ElectronAdapter } from './electron-adapter'
import { CapacitorAdapter } from './capacitor-adapter'
import { getAppPlatform } from '~/utils/platform'

export interface DatabaseClient {
  data: Database
  read(): Promise<void>
  write(): Promise<void>
}

// File-backed client used by the desktop (Electron) and Android (Capacitor)
// apps; only the adapter that does the file I/O differs.
class FileDatabaseClient implements DatabaseClient {
  private lowClient: Low<Database>
  private defaultData: Database

  constructor(adapter: Adapter<Database>, defaultData: Database) {
    this.lowClient = new LowClass(adapter, defaultData)
    this.defaultData = defaultData
  }

  get data(): Database {
    // After read() is called, data is guaranteed to exist (either from file or defaultData)
    // If data is null, return defaultData as fallback
    return this.lowClient.data ?? this.defaultData
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

export async function createDatabaseClient(
  dbPath: string,
  defaultData: Database,
): Promise<DatabaseClient> {
  const platform = getAppPlatform()
  if (platform === 'electron' || platform === 'android') {
    console.log(`Creating ${platform} database client with path:`, dbPath)
    const adapter =
      platform === 'electron'
        ? new ElectronAdapter<Database>(dbPath)
        : new CapacitorAdapter<Database>(dbPath)
    const client = new FileDatabaseClient(adapter, defaultData)
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
