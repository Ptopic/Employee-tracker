import { Module } from "@nestjs/common";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
	imports: [PrismaModule, CloudinaryModule],
	controllers: [SettingsController],
	providers: [SettingsService],
})
export class SettingsModule {}
