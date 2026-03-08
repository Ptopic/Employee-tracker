import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const OFFLINE_CACHE_PREFIX = "offline-read-cache:";

type OfflineCacheEntry = {
	cachedAt: string;
	data: unknown;
};

export type AuthenticatedRequestOptions = RequestInit & {
	offlineSafe?: boolean;
	offlineCacheKey?: string;
};

const isGetRequest = (method?: string) => (method ?? "GET").toUpperCase() === "GET";

const buildOfflineCacheKey = (url: string, method?: string) => {
	const normalizedMethod = (method ?? "GET").toUpperCase();
	return `${OFFLINE_CACHE_PREFIX}${normalizedMethod}:${url}`;
};

const readOfflineCache = async (key: string) => {
	const cached = await AsyncStorage.getItem(key);
	if (!cached) {
		return null;
	}

	try {
		const parsed = JSON.parse(cached) as OfflineCacheEntry;
		return parsed.data;
	} catch {
		await AsyncStorage.removeItem(key);
		return null;
	}
};

const writeOfflineCache = async (key: string, data: unknown) => {
	const entry: OfflineCacheEntry = {
		cachedAt: new Date().toISOString(),
		data,
	};
	await AsyncStorage.setItem(key, JSON.stringify(entry));
};

const authenticatedRequest = async (
	url: string,
	options: AuthenticatedRequestOptions = {},
) => {
	const accessToken = await AsyncStorage.getItem("accessToken");
	const method = options.method ?? "GET";
	const offlineSafeRead = Boolean(options.offlineSafe && isGetRequest(method));
	const offlineCacheKey = offlineSafeRead
		? options.offlineCacheKey ?? buildOfflineCacheKey(url, method)
		: null;

	try {
		const response = await fetch(`${url}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {}),
				Authorization: `Bearer ${accessToken}`,
			},
			body: options.body,
		});

		if (response.status === 401) {
			router.navigate("/getStarted" as any);
			return null;
		}

		if (!response.ok) {
			if (offlineCacheKey) {
				return await readOfflineCache(offlineCacheKey);
			}
			return null;
		}

		const data = await response.json();

		if (offlineCacheKey) {
			await writeOfflineCache(offlineCacheKey, data);
		}

		return data;
	} catch (_error) {
		if (offlineCacheKey) {
			return await readOfflineCache(offlineCacheKey);
		}

		return null;
	}
};

export default authenticatedRequest;
