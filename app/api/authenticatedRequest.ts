import { router } from "expo-router";
import { config } from "@/shared/config";
import {
	clearSessionTokens,
	getAccessToken,
	getRefreshToken,
	saveSessionTokens,
} from "@/shared/auth";

const refreshAccessToken = async () => {
	const refreshToken = await getRefreshToken();

	if (!refreshToken) {
		return null;
	}

	const refreshResponse = await fetch(`${config.apiUrl}/auth/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken }),
	});

	if (!refreshResponse.ok) {
		return null;
	}

	const refreshed = await refreshResponse.json();
	if (!refreshed?.accessToken || !refreshed?.refreshToken) {
		return null;
	}

	await saveSessionTokens(refreshed.accessToken, refreshed.refreshToken);
	return refreshed.accessToken as string;
};

const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
	let accessToken = await getAccessToken();

	const runRequest = async (token: string | null) =>
		fetch(url, {
			method: options.method || "GET",
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {}),
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: options.body,
		});

	try {
		let response = await runRequest(accessToken);

		if (response.status === 401) {
			accessToken = await refreshAccessToken();

			if (!accessToken) {
				await clearSessionTokens();
				router.replace("/getStarted" as any);
				return null;
			}

			response = await runRequest(accessToken);
		}

		if (!response.ok) {
			return null;
		}

		return response.json();
	} catch (_error) {
		return null;
	}
};

export default authenticatedRequest;
