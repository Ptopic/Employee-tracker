import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const secureStoreAvailable = SecureStore.isAvailableAsync;

const setItem = async (key: string, value: string) => {
	const isAvailable = await secureStoreAvailable();

	if (isAvailable) {
		await SecureStore.setItemAsync(key, value, {
			keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
		});
		return;
	}

	await AsyncStorage.setItem(key, value);
};

const getItem = async (key: string) => {
	const isAvailable = await secureStoreAvailable();

	if (isAvailable) {
		return SecureStore.getItemAsync(key);
	}

	return AsyncStorage.getItem(key);
};

const removeItem = async (key: string) => {
	const isAvailable = await secureStoreAvailable();

	if (isAvailable) {
		await SecureStore.deleteItemAsync(key);
	}

	await AsyncStorage.removeItem(key);
};

export const saveSessionTokens = async (
	accessToken: string,
	refreshToken: string,
) => {
	await Promise.all([
		setItem(ACCESS_TOKEN_KEY, accessToken),
		setItem(REFRESH_TOKEN_KEY, refreshToken),
	]);
};

export const getAccessToken = async () => getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = async () => getItem(REFRESH_TOKEN_KEY);

export const clearSessionTokens = async () => {
	await Promise.all([
		removeItem(ACCESS_TOKEN_KEY),
		removeItem(REFRESH_TOKEN_KEY),
	]);
};
