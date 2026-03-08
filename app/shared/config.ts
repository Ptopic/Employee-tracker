const apiUrl = process.env.EXPO_PUBLIC_API_URL!;

if (!__DEV__ && !apiUrl.startsWith("https://")) {
	throw new Error("EXPO_PUBLIC_API_URL must be HTTPS in production");
}

export const config = {
	apiUrl,
	clientUrl: process.env.EXPO_PUBLIC_CLIENT_URL!,
};
