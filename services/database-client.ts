import type { Database } from '~/types/api'
import type { Adapter, Low } from 'lowdb'
import { LocalStoragePreset } from 'lowdb/browser'
import { Low as LowClass } from 'lowdb'
import { ElectronAdapter } from './electron-adapter'
import { CapacitorAdapter } from './capacitor-adapter'
import { getAppPlatform } from '~/utils/platform'
import { snapshotOf, stampChanges, type Snapshot } from './sync/changes'

export interface DatabaseClient {
  data: Database
  read(): Promise<void>
  write(): Promise<void>
  /**
   * Writes `data` as it is, without stamping changes: for a library merged
   * by sync, whose records keep the times they were changed on.
   */
  writeSynced?(data: Database): Promise<void>
}

// Fired after a write that changed the library (not after a sync's own)
export const LIBRARY_CHANGED_EVENT = 'booklib:library-changed'

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

/**
 * Stamps every write with what changed since the last read or write
 * (updated_at, deletion markers), which folder sync merges by.
 */
class TrackingDatabaseClient implements DatabaseClient {
  private snapshot: Snapshot

  constructor(private readonly inner: DatabaseClient) {
    this.snapshot = snapshotOf(inner.data)
  }

  get data(): Database {
    return this.inner.data
  }

  set data(value: Database) {
    this.inner.data = value
  }

  async read(): Promise<void> {
    await this.inner.read()
    this.snapshot = snapshotOf(this.inner.data)
  }

  async write(): Promise<void> {
    const changed = stampChanges(
      this.snapshot,
      this.inner.data,
      new Date().toISOString(),
    )
    await this.inner.write()
    this.snapshot = snapshotOf(this.inner.data)
    if (changed && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(LIBRARY_CHANGED_EVENT))
    }
  }

  async writeSynced(data: Database): Promise<void> {
    this.inner.data = data
    await this.inner.write()
    this.snapshot = snapshotOf(this.inner.data)
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
    return new TrackingDatabaseClient(client)
  }
  // Fallback to LocalStorage for browser environment
  else {
    console.log('Creating LocalStorageDatabaseClient with key:', dbPath)
    const client = new LocalStorageDatabaseClient('booklib-data', defaultData)
    await client.read()
    return new TrackingDatabaseClient(client)
  }
}
