import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { EmployeesModule } from "./employees/employees.module";
import { ManagersModule } from "./managers/managers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { ShiftAssignmentsModule } from "./shift-assignments/shift-assignments.module";
import { ShiftsModule } from "./shifts/shifts.module";
import { StatsModule } from "./stats/stats.module";
import { UsersModule } from "./users/users.module";

@Module({
	controllers: [AppController],
	imports: [
		PrismaModule,
		AuthModule,
		UsersModule,
		ManagersModule,
		EmployeesModule,
		ShiftsModule,
		ShiftAssignmentsModule,
		StatsModule,
		ScheduleModule,
	],
})
export class AppModule {}
