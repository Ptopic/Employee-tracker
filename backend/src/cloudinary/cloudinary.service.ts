import { BadRequestException, Injectable } from "@nestjs/common";
import toStream from "buffer-to-stream";
import {
	type UploadApiErrorResponse,
	type UploadApiResponse,
	v2,
} from "cloudinary";

@Injectable()
export class CloudinaryService {
	private readonly allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

	private readonly maxImageSizeMB = 20;
	private readonly maxImageSize = this.maxImageSizeMB * 1024 * 1024;

	async uploadImage(
		file: Express.Multer.File | string,
	): Promise<UploadApiResponse | UploadApiErrorResponse> {
		if (typeof file === "string") {
			const sizeInBytes = Buffer.from(file.split(",")[1], "base64").length;

			if (sizeInBytes > this.maxImageSize) {
				throw new Error("Image size exceeds 20MB limit");
			}
			return new Promise((resolve, reject) => {
				v2.uploader.upload(file, (error, result) => {
					if (error) return reject(error);
					resolve(result);
				});
			});
		}

		if (!this.allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException("Invalid file type.");
		}

		const sizeInBytes = Buffer.from(file.buffer).length;

		if (sizeInBytes > this.maxImageSize) {
			throw new Error("Image size exceeds 20MB limit");
		}

		return new Promise((resolve) => {
			const upload = v2.uploader.upload_stream((error, result) => {
				if (error) throw new Error("Failed to upload image");
				resolve(result);
			});

			toStream(file.buffer).pipe(upload);
		});
	}

	async deleteImage(id: string) {
		try {
			return v2.uploader.destroy(id);
		} catch (_error) {
			throw new Error("Failed to delete image");
		}
	}
}
