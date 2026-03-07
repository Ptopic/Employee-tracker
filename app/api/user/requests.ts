import { config } from "@/shared/config";
import authenticatedRequest from "../authenticatedRequest";
import type { IUpdateProfilePictureRequest, IUpdateUserRequest } from "./types";

const updateProfilePicture = async (data: IUpdateProfilePictureRequest) => {
	return await authenticatedRequest(`${config.apiUrl}/users/profilePicture`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
};

const updateUser = async (data: IUpdateUserRequest) => {
	return await authenticatedRequest(`${config.apiUrl}/users`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
};

export default {
	updateProfilePicture,
	updateUser,
};
