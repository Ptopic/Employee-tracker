import { config } from "@/shared/config";
import { clearSessionTokens } from "@/shared/auth";
import authenticatedRequest from "../authenticatedRequest";

const me = async () => {
	return await authenticatedRequest(`${config.apiUrl}/auth/me`, {
		method: "GET",
	});
};

const logout = async () => {
	await authenticatedRequest(`${config.apiUrl}/auth/logout`, {
		method: "POST",
	});

	await clearSessionTokens();
};

export default { me, logout };
