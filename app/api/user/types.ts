export interface IUser {
	id: string;
	fullName: string;
	email: string;
	country: string;
	picture: string;
}

export interface ICreateUserRequest {
	fullName: string;
	email: string;
	country: string;
}

export type IUpdateProfilePictureRequest = {
	picture: string;
};

export type IUpdateUserRequest = {
	fullName: string;
	country?: string;
};
