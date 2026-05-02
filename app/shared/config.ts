const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
const clientUrl = process.env.EXPO_PUBLIC_CLIENT_URL?.trim() ?? "";

export const isApiUrlConfigured = apiUrl.length > 0;
export const isApiUrlValidForProduction =
	!isApiUrlConfigured || apiUrl.startsWith("https://");
export const canUseApiAtStartup =
	isApiUrlConfigured && (__DEV__ || isApiUrlValidForProduction);

export const config = {
	apiUrl,
	clientUrl,
};
