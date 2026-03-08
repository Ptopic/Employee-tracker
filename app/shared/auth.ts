import {
	secureDeleteItem,
	secureGetItem,
	secureSetItem,
} from "@/shared/security/secureStorage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const setItem = secureSetItem;
const getItem = secureGetItem;
const removeItem = secureDeleteItem;

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
