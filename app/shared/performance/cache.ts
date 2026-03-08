type CacheEntry<T> = {
	value: T;
	expiresAt: number;
};

const inMemoryCache = new Map<string, CacheEntry<unknown>>();

export const setCache = <T>(key: string, value: T, ttlMs: number) => {
	inMemoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const getCache = <T>(key: string): T | null => {
	const entry = inMemoryCache.get(key);
	if (!entry) return null;
	if (entry.expiresAt <= Date.now()) {
		inMemoryCache.delete(key);
		return null;
	}
	return entry.value as T;
};
