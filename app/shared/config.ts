const parseApiUrl = (value: string | undefined) => {
	if (!value) {
		throw new Error("EXPO_PUBLIC_API_URL is required");
	}

	const parsed = new URL(value);

	if (parsed.protocol !== "https:") {
		throw new Error("EXPO_PUBLIC_API_URL must use HTTPS");
	}

	return parsed.toString().replace(/\/$/, "");
};

export const config = {
	apiUrl: parseApiUrl(process.env.EXPO_PUBLIC_API_URL),
	clientUrl: process.env.EXPO_PUBLIC_CLIENT_URL!,
};
