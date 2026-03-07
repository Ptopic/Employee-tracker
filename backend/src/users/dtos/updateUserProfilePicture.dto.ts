import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserProfilePictureDto {
	@IsString()
	@IsNotEmpty()
	picture: string;
}
