/**
 * Storage abstraction layer to handle various browser storage restrictions
 * Supports localStorage, sessionStorage, and in-memory fallbacks
 */

interface StorageInterface {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

class StorageManager implements StorageInterface {
  private storage: Storage | null = null
  private fallbackData: Map<string, string> = new Map()
  private storageType: 'localStorage' | 'sessionStorage' | 'memory' = 'memory'

  constructor() {
    this.initializeStorage()
  }

  private initializeStorage(): void {
    // Try localStorage first
    if (this.testStorage(window.localStorage)) {
      this.storage = window.localStorage
      this.storageType = 'localStorage'
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Using localStorage for data persistence')
      }
      return
    }

    // Fallback to sessionStorage
    if (this.testStorage(window.sessionStorage)) {
      this.storage = window.sessionStorage
      this.storageType = 'sessionStorage'
      console.warn('⚠️ localStorage not available, using sessionStorage')
      return
    }

    // Final fallback to in-memory storage
    this.storage = null
    this.storageType = 'memory'
    console.warn('⚠️ No persistent storage available, using memory fallback')
  }

  private testStorage(storage: Storage): boolean {
    try {
      const testKey = '__storage_test__'
      storage.setItem(testKey, 'test')
      storage.getItem(testKey)
      storage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.storage) {
        return this.storage.getItem(key)
      }
      return this.fallbackData.get(key) || null
    } catch (error) {
      console.warn('Storage getItem failed, using memory fallback:', error)
      return this.fallbackData.get(key) || null
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.storage) {
        this.storage.setItem(key, value)
        // Also store in memory as backup
        this.fallbackData.set(key, value)
      } else {
        this.fallbackData.set(key, value)
      }
    } catch (error) {
      console.warn('Storage setItem failed, using memory fallback:', error)
      this.fallbackData.set(key, value)
    }
  }

  removeItem(key: string): void {
    try {
      if (this.storage) {
        this.storage.removeItem(key)
      }
      this.fallbackData.delete(key)
    } catch (error) {
      console.warn('Storage removeItem failed:', error)
      this.fallbackData.delete(key)
    }
  }

  clear(): void {
    try {
      if (this.storage) {
        this.storage.clear()
      }
      this.fallbackData.clear()
    } catch (error) {
      console.warn('Storage clear failed:', error)
      this.fallbackData.clear()
    }
  }

  // Additional utility methods
  getStorageType(): string {
    return this.storageType
  }

  isPersistent(): boolean {
    return this.storageType !== 'memory'
  }

  getStorageInfo(): { type: string; persistent: boolean; available: boolean } {
    return {
      type: this.storageType,
      persistent: this.isPersistent(),
      available: this.storage !== null
    }
  }
}

// Create and export singleton instance
export const storage = new StorageManager()

// Export for testing
export { StorageManager }

// Hook for React components to get storage info
export const useStorageInfo = () => {
  return storage.getStorageInfo()
}