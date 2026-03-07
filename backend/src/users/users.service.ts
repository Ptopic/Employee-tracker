import { Injectable } from "@nestjs/common";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDto } from "./dtos/updateUser.dto";
import { UpdateUserProfilePictureDto } from "./dtos/updateUserProfilePicture.dto";

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private cloudinaryService: CloudinaryService,
	) {}

	async updateUserProfilePicture(
		id: string,
		updateUserProfilePictureDto: UpdateUserProfilePictureDto,
	) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (user.picture && user.pictureId) {
			await this.cloudinaryService.deleteImage(user.pictureId);
		}

		const uploadedImage = await this.cloudinaryService.uploadImage(
			updateUserProfilePictureDto.picture,
		);

		return this.prisma.user.update({
			where: { id },
			data: { picture: uploadedImage.url, pictureId: uploadedImage.public_id },
		});
	}

	async updateUser(id: string, updateUserDto: UpdateUserDto) {
		return this.prisma.user.update({
			where: { id },
			data: updateUserDto,
		});
	}
}
