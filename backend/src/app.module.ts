import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { EmployeesModule } from "./employees/employees.module";
import { ManagersModule } from "./managers/managers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ShiftAssignmentsModule } from "./shift-assignments/shift-assignments.module";
import { ShiftsModule } from "./shifts/shifts.module";

@Module({
	imports: [
		PrismaModule,
		AuthModule,
		ManagersModule,
		EmployeesModule,
		ShiftsModule,
		ShiftAssignmentsModule,
	],
})
export class AppModule {}
