interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}


class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, expiresIn: number = 10 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  clear(key: string): void {
    this.cache.delete(key);
  }

  clearAll(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
