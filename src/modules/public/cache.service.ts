import { Injectable } from '@nestjs/common';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry>();

  set(key: string, value: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cached responses for a specific tenant organization slug (CQRS write invalidation)
  clearTenantCache(slug: string): void {
    console.log(`🧹 CQRS Invalidation: Clearing cached reads for tenant slug: "${slug}"`);
    for (const key of this.cache.keys()) {
      if (key.includes(`:${slug}`)) {
        this.cache.delete(key);
      }
    }
  }
}
