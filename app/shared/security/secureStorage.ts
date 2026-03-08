import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const SECURE_PREFIX = "secure:";

const fallbackEncode = (value: string) => {
	const withPrefix = `${SECURE_PREFIX}${value}`;
	// @ts-ignore
	return globalThis.btoa ? globalThis.btoa(withPrefix) : withPrefix;
};

const fallbackDecode = (value: string | null) => {
	if (!value) return null;
	try {
		// @ts-ignore
		const decoded = globalThis.atob ? globalThis.atob(value) : value;
		return decoded.startsWith(SECURE_PREFIX)
			? decoded.slice(SECURE_PREFIX.length)
			: null;
	} catch {
		return null;
	}
};

const isSecureStoreAvailable = async () => SecureStore.isAvailableAsync();

export const secureSetItem = async (key: string, value: string) => {
	if (await isSecureStoreAvailable()) {
		await SecureStore.setItemAsync(key, value, {
			keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
			requireAuthentication: false,
		});
		return;
	}

	await AsyncStorage.setItem(key, fallbackEncode(value));
};

export const secureGetItem = async (key: string) => {
	if (await isSecureStoreAvailable()) {
		return SecureStore.getItemAsync(key);
	}
	return fallbackDecode(await AsyncStorage.getItem(key));
};

export const secureDeleteItem = async (key: string) => {
	if (await isSecureStoreAvailable()) {
		await SecureStore.deleteItemAsync(key);
	}
	await AsyncStorage.removeItem(key);
};
