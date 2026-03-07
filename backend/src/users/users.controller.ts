import { Body, Controller, Patch, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import { UpdateUserProfilePictureDto } from "./dtos/updateUserProfilePicture.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Patch("/profilePicture")
	@JwtAuth()
	updateUserProfilePicture(
		@Body() updateUserProfilePictureDto: UpdateUserProfilePictureDto,
		@Req() req: Request,
	) {
		return this.usersService.updateUserProfilePicture(
			req.user.userId,
			updateUserProfilePictureDto,
		);
	}

	@Patch("/")
	@JwtAuth()
	updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
		return this.usersService.updateUser(req.user.userId, updateUserDto);
	}
}
