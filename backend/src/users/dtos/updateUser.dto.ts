import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
	@IsString()
	fullName: string;

	@IsString()
	@IsOptional()
	country: string;
}
