export declare class CacheService {
    private cache;
    set(key: string, value: any, ttlSeconds: number): void;
    get(key: string): any | null;
    delete(key: string): void;
    clearTenantCache(slug: string): void;
}
