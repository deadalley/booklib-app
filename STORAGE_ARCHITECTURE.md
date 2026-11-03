# Storage Service Architecture

The StorageService supports multiple storage backends: Electron file-based storage, Android (Capacitor) file-based storage, and web-based localStorage, providing a unified interface for database operations.

## Key Components

### 1. ElectronAdapter (`services/electron-adapter.ts`)

- Custom LowDB adapter that uses Electron's IPC to perform file operations
- Provides async read/write operations for JSON data storage
- Automatically handles directory creation and file management

### 2. CapacitorAdapter (`services/capacitor-adapter.ts`)

- LowDB adapter for the Android app, built on `@capacitor/filesystem`
- Stores `booklib-data.json` in the app's private data directory (`Directory.Data`)
- Saves are crash-safe: the data is written to `booklib-data.json.tmp` first, then to the file itself. If the file is missing or unreadable on start, the temp copy is used

### 3. DatabaseClient (`services/database-client.ts`)

- Unified interface that abstracts the differences between Electron, Node.js, and web storage
- Automatically detects the environment and uses the appropriate storage method
- Provides consistent async API for all platforms

### 4. Electron IPC Handlers (`electron/main.ts`)

- File operations: `file:read`, `file:write`, `file:exists`
- `file:write` is atomic (`electron/fs-utils.ts`): it writes `<file>.tmp`, flushes it to disk and renames it over the target, so a crash mid-save leaves the previous file intact
- Book covers: `cover:save`, `cover:delete`, `cover:rename` (see [Book Covers](#book-covers))
- Directory operations: `dir:ensure`
- Database path: `db:getPath` (returns path in user data directory)

### 5. Electron Preload Script (`electron/preload.ts`)

- Exposes file system APIs to the renderer process via `window.electronAPI`
- Provides secure access to file operations through IPC

## Features

### Electron Environment

- Stores database file in the OS-specific user data directory
- Full file system access with proper error handling
- Automatic directory creation
- Persistent storage across app launches

### Web Environment

- Falls back to LocalStorage for browser compatibility
- Maintains the same API interface
- Works without Node.js or Electron dependencies

## Database File Location

**Electron apps:**

- **Windows**: `%APPDATA%/booklib/booklib-data.json`
- **macOS**: `~/Library/Application Support/booklib/booklib-data.json`
- **Linux**: `~/.config/booklib/booklib-data.json`

**Android app:**

- `/data/data/com.booklib.app/files/booklib-data.json` (private to the app; removed when the app is uninstalled)

**Web Environment & Local Development:**

- Browser LocalStorage

## Book Covers

Covers are only supported in the Electron app; the web demo and the Android app keep the upload button disabled.

- Image files live in `<userData>/covers/<bookId>.<ext>` (jpg, png, webp or gif, up to 10 MB), managed by `CoverStore` in `electron/covers.ts`.
- The main process serves them through the `booklib-cover://` protocol. `cover_src` stores a URL such as `booklib-cover://<bookId>.png?v=<timestamp>`; the `?v=` changes on every upload so a replaced image is not served from the cache. Covers with an `http(s)` URL (for example from an import) are shown as they are.
- A cover uploaded while creating a book is saved under the form's `temp-<uuid>` id and moved to the real book id by `createBook`. Temp covers from forms that were never saved are removed after 24 hours, on app start.
- `updateBookCover` / `deleteBookCover` own `cover_src`; `updateBook` never changes it. Deleting a book deletes its cover file.
- Library export/import (`services/transfer`) keeps `coverSrc` URLs but does not include the image files, so local covers do not move to another machine.

## Usage

The StorageService automatically detects the environment and uses the appropriate storage method:

```typescript
const storageService = useBookLibService()
await storageService.initialize()

// All operations work the same regardless of storage backend
const books = await storageService.getBooks({})
```

## Environment Detection

The service detects the environment in this order:

1. **Electron**: Checks for `window.electronAPI`
2. **Android**: `Capacitor.isNativePlatform()`
3. **Browser**: Falls back to LocalStorage

`getAppPlatform()` in `utils/platform.ts` does this detection for the rest of the app.

## Schema Versioning

The database has a `version` field. On startup `runMigrations` (`utils/migrations.ts`) runs every migration newer than the stored version, then saves. Files saved before versioning have no `version` and run all migrations, which are idempotent. A file with a version newer than the app supports is refused instead of being rewritten. To change the data shape, append a migration to `MIGRATIONS`.

## Migration

The service maintains backward compatibility with existing localStorage data when running in web mode. When transitioning between environments, users may need to export/import their data, or the service could be extended to automatically migrate data between storage backends.
