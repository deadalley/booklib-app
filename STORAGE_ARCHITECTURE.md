# Storage Service Architecture

The StorageService has been updated to support multiple storage backends: Electron file-based storage, Node.js JSONFilePreset for local development, and web-based localStorage, providing a unified interface for database operations.

## Key Components

### 1. ElectronAdapter (`services/electron-adapter.ts`)

- Custom LowDB adapter that uses Electron's IPC to perform file operations
- Provides async read/write operations for JSON data storage
- Automatically handles directory creation and file management

### 2. DatabaseClient (`services/database-client.ts`)

- Unified interface that abstracts the differences between Electron, Node.js, and web storage
- Automatically detects the environment and uses the appropriate storage method
- Provides consistent async API for all platforms

### 3. Electron IPC Handlers (`electron/main.ts`)

- File operations: `file:read`, `file:write`, `file:exists`
- Directory operations: `dir:ensure`
- Database path: `db:getPath` (returns path in user data directory)

### 4. Electron Preload Script (`electron/preload.ts`)

- Exposes file system APIs to the renderer process via `window.electronAPI`
- Provides secure access to file operations through IPC

## Features

### Electron Environment

- Stores database file in the OS-specific user data directory
- Full file system access with proper error handling
- Automatic directory creation
- Persistent storage across app launches

### Node.js Environment (Local Development)

- Uses JSONFilePreset from LowDB for file-based storage
- Stores data in `./booklib-data.json` in the project directory
- Full async read/write operations
- Perfect for development and testing

### Web Environment

- Falls back to LocalStorage for browser compatibility
- Maintains the same API interface
- Works without Node.js or Electron dependencies

## Database File Location

**Electron apps:**

- **Windows**: `%APPDATA%/booklib-app/booklib-data.json`
- **macOS**: `~/Library/Application Support/booklib-app/booklib-data.json`
- **Linux**: `~/.config/booklib-app/booklib-data.json`

**Local Development (Node.js):**

- `./booklib-data.json` (in project root)

**Web Environment:**

- Browser LocalStorage

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
2. **Node.js**: Checks for `typeof window === 'undefined' && typeof process !== 'undefined'`
3. **Browser**: Falls back to LocalStorage

## Migration

The service maintains backward compatibility with existing localStorage data when running in web mode. When transitioning between environments, users may need to export/import their data, or the service could be extended to automatically migrate data between storage backends.
