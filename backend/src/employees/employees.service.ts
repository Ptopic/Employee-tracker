import {
	EmployeeStatus,
	Prisma,
	type Employee,
} from "@prisma/client";
import {
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
	type CreateEmployeeDto,
	type ListEmployeesQueryDto,
	type UpdateEmployeeDto,
} from "./dtos/employee.dto";

@Injectable()
export class EmployeesService {
	constructor(private readonly prisma: PrismaService) {}

	async list(managerId: string, query: ListEmployeesQueryDto = {}) {
		const employees = await this.prisma.employee.findMany({
			where: {
				managerId,
				status: query.status,
				OR: query.search
					? [
						{ firstName: { contains: query.search, mode: "insensitive" } },
						{ lastName: { contains: query.search, mode: "insensitive" } },
					]
					: undefined,
			},
			orderBy: { firstName: "asc" },
		});

		const monthlyHoursMap = await this.getMonthlyHoursMap(managerId);
		const data = employees.map((employee) =>
			this.toEmployeeListItem(employee, monthlyHoursMap.get(employee.id) ?? 0),
		);

		return this.sortEmployees(
			data,
			query.sortBy ?? "name",
			query.sortOrder ?? "asc",
		);
	}

	async listMonthlyHours(managerId: string) {
		const employees = await this.prisma.employee.findMany({
			where: { managerId },
			orderBy: { firstName: "asc" },
		});
		const monthlyHoursMap = await this.getMonthlyHoursMap(managerId);
		return employees.map((employee) => ({
			employeeId: employee.id,
			name: `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
			monthlyHours: monthlyHoursMap.get(employee.id) ?? 0,
		}));
	}

	async getById(managerId: string, employeeId: string) {
		const employee = await this.getOwnedEmployee(managerId, employeeId);
		return {
			id: employee.id,
			firstName: employee.firstName,
			lastName: employee.lastName,
			age: employee.age,
			hourlyRate: Number(employee.hourlyRate),
			status: employee.status,
		};
	}

	async getStats(managerId: string, employeeId: string) {
		const employee = await this.getOwnedEmployee(managerId, employeeId);
		const [monthStart, monthEnd] = this.getCurrentMonthRange();
		const [weekStart, weekEnd] = this.getCurrentWeekRange();

		const [weeklyHours, monthlyHours] = await Promise.all([
			this.getHoursSum(employee.id, managerId, weekStart, weekEnd),
			this.getHoursSum(employee.id, managerId, monthStart, monthEnd),
		]);

		const hourlyRate = Number(employee.hourlyRate);
		return {
			weeklyHours,
			monthlyHours,
			estimatedMonthlyCost: Number((monthlyHours * hourlyRate).toFixed(2)),
		};
	}

	create(managerId: string, payload: CreateEmployeeDto) {
		return this.prisma.employee.create({
			data: {
				managerId,
				firstName: payload.firstName.trim(),
				lastName: (payload.lastName ?? "").trim(),
				age: payload.age ?? null,
				hourlyRate: new Prisma.Decimal(payload.hourlyRate),
				status: payload.status ?? EmployeeStatus.ACTIVE,
			},
			select: { id: true },
		});
	}

	async update(managerId: string, employeeId: string, payload: UpdateEmployeeDto) {
		await this.getOwnedEmployee(managerId, employeeId);
		return this.prisma.employee.update({
			where: { id: employeeId },
			data: {
				firstName: payload.firstName?.trim(),
				lastName: payload.lastName?.trim(),
				age: payload.age,
				hourlyRate:
					typeof payload.hourlyRate === "number"
						? new Prisma.Decimal(payload.hourlyRate)
						: undefined,
				status: payload.status,
			},
			select: { id: true },
		});
	}

	async deactivate(managerId: string, employeeId: string) {
		await this.getOwnedEmployee(managerId, employeeId);
		return this.prisma.employee.update({
			where: { id: employeeId },
			data: { status: EmployeeStatus.INACTIVE },
			select: { id: true, status: true },
		});
	}

	async remove(managerId: string, employeeId: string) {
		await this.getOwnedEmployee(managerId, employeeId);

		return this.prisma.$transaction(async (tx) => {
			await tx.shiftAssignment.deleteMany({
				where: {
					employeeId,
					employee: { managerId },
				},
			});

			await tx.shift.deleteMany({
				where: {
					managerId,
					assignments: {
						none: {},
					},
				},
			});

			await tx.employee.delete({
				where: { id: employeeId },
			});

			return { id: employeeId, deleted: true };
		});
	}

	private async getOwnedEmployee(managerId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, managerId },
		});
		if (!employee) {
			throw new NotFoundException("Employee not found");
		}
		return employee;
	}

	private async getMonthlyHoursMap(managerId: string) {
		const [start, end] = this.getCurrentMonthRange();
		const rows = await this.prisma.shiftAssignment.groupBy({
			by: ["employeeId"],
			where: {
				employee: { managerId },
				shift: { date: { gte: start, lte: end } },
			},
			_sum: { calculatedHours: true },
		});

		return new Map(
			rows.map((row) => [
				row.employeeId,
				Number(row._sum.calculatedHours ?? 0),
			]),
		);
	}

	private async getHoursSum(
		employeeId: string,
		managerId: string,
		start: Date,
		end: Date,
	) {
		const sum = await this.prisma.shiftAssignment.aggregate({
			where: {
				employeeId,
				employee: { managerId },
				shift: { date: { gte: start, lte: end } },
			},
			_sum: { calculatedHours: true },
		});
		return Number(sum._sum.calculatedHours ?? 0);
	}

	private getCurrentMonthRange(): [Date, Date] {
		const now = new Date();
		const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
		const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
		return [start, end];
	}

	private getCurrentWeekRange(): [Date, Date] {
		const now = new Date();
		const day = now.getUTCDay() || 7;
		const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day + 1));
		const end = new Date(start);
		end.setUTCDate(start.getUTCDate() + 6);
		return [start, end];
	}

	private toEmployeeListItem(employee: Employee, monthlyHours: number) {
		return {
			id: employee.id,
			firstName: employee.firstName,
			lastName: employee.lastName,
			hourlyRate: Number(employee.hourlyRate),
			monthlyHours: Number(monthlyHours.toFixed(2)),
			status: employee.status,
		};
	}

	private sortEmployees(
		employees: Array<{
			firstName: string;
			lastName: string;
			hourlyRate: number;
			monthlyHours: number;
			status: EmployeeStatus;
		}>,
		sortBy: "name" | "hourlyRate" | "monthlyHours" | "status",
		sortOrder: "asc" | "desc",
	) {
		const factor = sortOrder === "asc" ? 1 : -1;
		return employees.sort((a, b) => {
			switch (sortBy) {
				case "hourlyRate":
					return (a.hourlyRate - b.hourlyRate) * factor;
				case "monthlyHours":
					return (a.monthlyHours - b.monthlyHours) * factor;
				case "status":
					return a.status.localeCompare(b.status) * factor;
				default:
					return `${a.firstName} ${a.lastName ?? ""}`.trim().localeCompare(
						`${b.firstName} ${b.lastName ?? ""}`.trim(),
					) * factor;
			}
		});
	}
}
