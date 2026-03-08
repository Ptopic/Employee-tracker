import { config } from "@/shared/config";
import authenticatedRequest from "../authenticatedRequest";

// const signin = async (email: string, password: string) => {
// 	const response = await fetch(`${config.apiUrl}/auth/login`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 		body: JSON.stringify({ email, password }),
// 	});
// 	return response.json();
// };

// const signup = async (email: string, password: string) => {
// 	const response = await fetch(`${config.apiUrl}/auth/register`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 		body: JSON.stringify({ email, password }),
// 	});
// 	return response.json();
// };

const me = async () => {
	return await authenticatedRequest(`${config.apiUrl}/auth/me`, {
		method: "GET",
		offlineSafe: true,
		offlineCacheKey: "auth-me",
	});
};

export default { me };
