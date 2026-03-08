import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { EmployeesModule } from "./employees/employees.module";
import { ExportModule } from "./export/export.module";
import { ManagersModule } from "./managers/managers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { ShiftAssignmentsModule } from "./shift-assignments/shift-assignments.module";
import { ShiftsModule } from "./shifts/shifts.module";
import { StatsModule } from "./stats/stats.module";
import { SettingsModule } from "./settings/settings.module";
import { RateLimitMiddleware } from "./common/rate-limit.middleware";
import { SecurityHeadersMiddleware } from "./common/security.middleware";
import { PerformanceController } from "./common/performance.controller";

@Module({
	imports: [
		PrismaModule,
		AuthModule,
		ManagersModule,
		EmployeesModule,
		ExportModule,
		ShiftsModule,
		ShiftAssignmentsModule,
		StatsModule,
		ScheduleModule,
		SettingsModule,
	],
	controllers: [PerformanceController],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(SecurityHeadersMiddleware, RateLimitMiddleware).forRoutes("*");
	}
}
