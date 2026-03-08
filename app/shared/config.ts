import Constants from "expo-constants";

export const config = {
	apiUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "",
	clientUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_CLIENT_URL || "",
};
