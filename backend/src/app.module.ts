import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CollectionsModule } from "./collections/collections.module";
import { ImportsModule } from "./imports/imports.module";
import { LocationsModule } from "./locations/locations.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		AuthModule,
		CollectionsModule,
		ImportsModule,
		CloudinaryModule,
		UsersModule,
		NotificationsModule,
		LocationsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
