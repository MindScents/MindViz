// In-memory session store shared between API routes.
// In dev mode hot-reloads may clear this; for production use a persistent store.

const globalForSessions = globalThis as unknown as {
  __sessions?: Map<string, { filename: string }>;
};

if (!globalForSessions.__sessions) {
  globalForSessions.__sessions = new Map();
}

export const sessions = globalForSessions.__sessions;
