import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
	const accessToken = await AsyncStorage.getItem("accessToken");

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
