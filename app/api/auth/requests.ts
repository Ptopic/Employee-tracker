import { config } from "@/shared/config";
import authenticatedRequest from "../authenticatedRequest";

const googleLogin = async (token: string) => {
	const response = await fetch(`${config.apiUrl}/auth/google`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ token }),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data?.message || "Google authentication failed");
	}

	return data as { token: string };
};

const me = async () => {
	return await authenticatedRequest(`${config.apiUrl}/auth/me`, {
		method: "GET",
	});
};

export default { me, googleLogin };
