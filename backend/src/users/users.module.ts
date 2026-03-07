import { Module } from "@nestjs/common";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	imports: [PrismaModule, CloudinaryModule],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
