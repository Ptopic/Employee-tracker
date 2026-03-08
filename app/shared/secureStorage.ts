import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";

export const secureStorage = {
	async getAccessToken(): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
		} catch {
			return null;
		}
	},

	async setAccessToken(token: string): Promise<void> {
		await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
			keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
		});
	},

	async clearAccessToken(): Promise<void> {
		await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
	},
};
