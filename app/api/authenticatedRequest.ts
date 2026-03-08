import { router } from "expo-router";
import { secureStorage } from "@/shared/secureStorage";

const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
	const accessToken = await secureStorage.getAccessToken();

	try {
		const response = await fetch(`${url}`, {
			method: options.method || "GET",
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

		const data = await response.json();

		return data;
	} catch (_error) {
		return null;
	}
};

export default authenticatedRequest;
