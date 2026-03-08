import { Module } from "@nestjs/common";
import { EmployeesModule } from "./employees/employees.module";
import { ManagersModule } from "./managers/managers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ReportsModule } from "./reports/reports.module";
import { ShiftAssignmentsModule } from "./shift-assignments/shift-assignments.module";
import { ShiftsModule } from "./shifts/shifts.module";

@Module({
	imports: [
		PrismaModule,
		ManagersModule,
		EmployeesModule,
		ShiftsModule,
		ShiftAssignmentsModule,
		ReportsModule,
	],
})
export class AppModule {}
