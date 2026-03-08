import { config } from "@/shared/config";
import { assertSafeUrl, isObject } from "./validation";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function secureFetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
	const enforcedUrl = assertSafeUrl(url);
	const maxAttempts = 3;

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		try {
			const response = await fetch(enforcedUrl, init);
			if (!response.ok) {
				if (response.status >= 500 && attempt < maxAttempts) {
					await sleep(100 * attempt);
					continue;
				}
				return null;
			}

			const json = (await response.json()) as unknown;
			if (!isObject(json) && !Array.isArray(json)) {
				return null;
			}
			return json as T;
		} catch {
			if (attempt === maxAttempts) return null;
			await sleep(100 * attempt);
		}
	}

	return null;
}

export const secureApiUrl = (path: string) => `${config.apiUrl}${path}`;
