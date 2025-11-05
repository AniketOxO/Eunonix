export interface StorageLike {
  length: number
  clear: () => void
  getItem: (key: string) => string | null
  key: (index: number) => string | null
  removeItem: (key: string) => void
  setItem: (key: string, value: string) => void
}

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear: () => {
      store.clear()
    },
    getItem: (key: string) => {
      return store.has(key) ? store.get(key)! : null
    },
    key: (index: number) => {
      const keys = Array.from(store.keys())
      return keys[index] ?? null
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

const resolveStorage = (): StorageLike => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return createMemoryStorage()
  }

  try {
    const testKey = '__eunonix-storage-test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch (error) {
    console.warn('[Eunonix] Local storage unavailable, using in-memory fallback.', error)
    return createMemoryStorage()
  }
}

export const safeStorage: StorageLike = resolveStorage()

export const readJSON = <T>(key: string, fallback: T): T => {
  try {
    const raw = safeStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`[Eunonix] Failed to read storage key "${key}".`, error)
    return fallback
  }
}

export const writeJSON = (key: string, value: unknown) => {
  try {
    safeStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[Eunonix] Failed to persist storage key "${key}".`, error)
  }
}

export const removeItem = (key: string) => {
  try {
    safeStorage.removeItem(key)
  } catch (error) {
    console.warn(`[Eunonix] Failed to remove storage key "${key}".`, error)
  }
}
