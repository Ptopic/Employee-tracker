import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

type GoogleProfile = {
	googleAuthId: string;
	email: string;
	fullName: string;
	picture?: string | null;
};

@Injectable()
export class ManagersService {
	private readonly logger = new Logger(ManagersService.name);

	constructor(private readonly prisma: PrismaService) {}

	list() {
		this.logger.log("Listing all managers");
		return this.prisma.manager.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	findById(id: string) {
		this.logger.log(`Finding manager by id ${id}`);
		return this.prisma.manager.findUnique({
			where: { id },
		});
	}

	async bootstrapFromGoogleProfile(profile: GoogleProfile) {
		this.logger.log(`Bootstrapping manager from Google profile: ${profile.email}`);
		const existingByGoogleAuthId = await this.prisma.manager.findUnique({
			where: { googleAuthId: profile.googleAuthId },
		});

		if (existingByGoogleAuthId) {
			const updatedManager = await this.prisma.manager.update({
				where: { id: existingByGoogleAuthId.id },
				data: {
					email: profile.email,
					fullName: profile.fullName,
					picture: profile.picture ?? undefined,
				},
			});

			return { manager: updatedManager, isFirstLogin: false };
		}

		const existingByEmail = await this.prisma.manager.findUnique({
			where: { email: profile.email },
		});

		if (existingByEmail) {
			const linkedManager = await this.prisma.manager.update({
				where: { id: existingByEmail.id },
				data: {
					googleAuthId: profile.googleAuthId,
					fullName: profile.fullName,
					picture: profile.picture ?? undefined,
				},
			});

			return { manager: linkedManager, isFirstLogin: false };
		}

		const newManager = await this.prisma.manager.create({
			data: {
				googleAuthId: profile.googleAuthId,
				email: profile.email,
				fullName: profile.fullName,
				picture: profile.picture ?? undefined,
			},
		});

		return { manager: newManager, isFirstLogin: true };
	}
}
