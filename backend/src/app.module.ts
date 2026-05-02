import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { PerformanceController } from "./common/performance.controller";
import { SecurityHeadersMiddleware } from "./common/security.middleware";
import { EmployeesModule } from "./employees/employees.module";
import { ExportModule } from "./export/export.module";
import { ManagersModule } from "./managers/managers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { SettingsModule } from "./settings/settings.module";
import { ShiftAssignmentsModule } from "./shift-assignments/shift-assignments.module";
import { ShiftsModule } from "./shifts/shifts.module";
import { StatsModule } from "./stats/stats.module";
import { UsersModule } from "./users/users.module";

@Module({
	controllers: [AppController, PerformanceController],
	imports: [
		PrismaModule,
		AuthModule,
		UsersModule,
		ManagersModule,
		EmployeesModule,
		ExportModule,
		ShiftsModule,
		ShiftAssignmentsModule,
		StatsModule,
		ScheduleModule,
		SettingsModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(SecurityHeadersMiddleware)
			.forRoutes("*");
	}
}
