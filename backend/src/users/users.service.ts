import { Injectable, Logger } from "@nestjs/common";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import { UpdateUserProfilePictureDto } from "./dtos/updateUserProfilePicture.dto";

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);

	constructor(
		private prisma: PrismaService,
		private cloudinaryService: CloudinaryService,
	) {}

	async updateUserProfilePicture(
		id: string,
		updateUserProfilePictureDto: UpdateUserProfilePictureDto,
	) {
		this.logger.log(`Updating profile picture for user ${id}`);
		const uploadedImage = await this.cloudinaryService.uploadImage(
			updateUserProfilePictureDto.picture,
		);

		return this.prisma.manager.update({
			where: { id },
			data: { picture: uploadedImage.url },
		});
	}

	async updateUser(id: string, updateUserDto: UpdateUserDto) {
		this.logger.log(`Updating user ${id}`);
		return this.prisma.manager.update({
			where: { id },
			data: {
				fullName: updateUserDto.fullName,
			},
		});
	}
}
