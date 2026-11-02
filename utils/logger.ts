import pino from 'pino'

// `pino-pretty` runs as a worker-thread transport that is resolved from
// node_modules at runtime. Packaged Electron apps don't ship node_modules
// (the main process is bundled), so only use it in development.
const usePrettyTransport =
  typeof window === 'undefined' && process.env.NODE_ENV === 'development'

export const logger = pino(
  usePrettyTransport ? { transport: { target: 'pino-pretty' } } : {},
)
