import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { PrismaService } from "src/prisma/prisma.service";
import type {
	UpdateCompanySettingsDto,
	UpdatePreferencesDto,
} from "./dtos/settings.dto";

const DEFAULT_PREFERENCES: UpdatePreferencesDto = {
	timeFormat: "24h",
	firstDayOfWeek: "Monday",
	firstShiftStart: "09:00",
	firstShiftEnd: "16:00",
	secondShiftStart: "16:00",
	secondShiftEnd: "22:00",
};

const isValidTime = (value: unknown): value is string =>
	typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

@Injectable()
export class SettingsService {
	private readonly logger = new Logger(SettingsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	async getCompany(managerId: string) {
		this.logger.log(`Getting company settings for manager ${managerId}`);
		const manager = await this.prisma.manager.findUnique({ where: { id: managerId } });
		return {
			companyName: manager?.companyName ?? "",
			logoUrl: manager?.companyLogoUrl ?? "",
		};
	}

	async updateCompany(managerId: string, payload: UpdateCompanySettingsDto) {
		this.logger.log(`Updating company settings for manager ${managerId}`);
		const updated = await this.prisma.manager.update({
			where: { id: managerId },
			data: {
				companyName: payload.companyName,
				companyLogoUrl: payload.logoUrl,
			},
		});

		return {
			companyName: updated.companyName ?? "",
			logoUrl: updated.companyLogoUrl ?? "",
		};
	}

	async uploadLogo(logo: string) {
		this.logger.log("Uploading company logo");
		try {
			const uploaded = await this.cloudinaryService.uploadImage(logo);
			return { url: uploaded.url };
		} catch (error) {
			this.logger.error("Logo upload failed", error instanceof Error ? error.stack : String(error));
			throw new BadRequestException("Logo upload failed. Please try another image.");
		}
	}

	async getPreferences(managerId: string): Promise<UpdatePreferencesDto> {
		this.logger.log(`Getting preferences for manager ${managerId}`);
		const manager = await this.prisma.manager.findUnique({ where: { id: managerId } });
		const current = (manager?.preferences ?? {}) as Partial<UpdatePreferencesDto>;

		return {
			timeFormat:
				current.timeFormat === "12h" || current.timeFormat === "24h"
					? current.timeFormat
					: DEFAULT_PREFERENCES.timeFormat,
			firstDayOfWeek:
				current.firstDayOfWeek === "Sunday" || current.firstDayOfWeek === "Monday"
					? current.firstDayOfWeek
					: DEFAULT_PREFERENCES.firstDayOfWeek,
			firstShiftStart: isValidTime(current.firstShiftStart)
				? current.firstShiftStart
				: DEFAULT_PREFERENCES.firstShiftStart,
			firstShiftEnd: isValidTime(current.firstShiftEnd)
				? current.firstShiftEnd
				: DEFAULT_PREFERENCES.firstShiftEnd,
			secondShiftStart: isValidTime(current.secondShiftStart)
				? current.secondShiftStart
				: DEFAULT_PREFERENCES.secondShiftStart,
			secondShiftEnd: isValidTime(current.secondShiftEnd)
				? current.secondShiftEnd
				: DEFAULT_PREFERENCES.secondShiftEnd,
		};
	}

	async updatePreferences(managerId: string, payload: UpdatePreferencesDto) {
		this.logger.log(`Updating preferences for manager ${managerId}`);
		const existing = await this.getPreferences(managerId);
		const merged = { ...existing, ...payload };

		await this.prisma.manager.update({
			where: { id: managerId },
			data: {
				preferences: merged as unknown as Prisma.InputJsonValue,
			},
		});

		return merged;
	}
}
