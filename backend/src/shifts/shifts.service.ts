import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpsertShiftDto, ValidateShiftDto } from "./dtos/shift.dto";

@Injectable()
export class ShiftsService {
	constructor(private readonly prisma: PrismaService) {}

	list(managerId: string, startDate?: string, endDate?: string) {
		return this.prisma.shift.findMany({
			where: {
				managerId,
				date:
					startDate || endDate
						? {
							...(startDate ? { gte: new Date(startDate) } : {}),
							...(endDate ? { lte: new Date(endDate) } : {}),
						}
						: undefined,
			},
			include: {
				assignments: {
					include: {
						employee: true,
					},
				},
			},
			orderBy: [{ date: "asc" }, { startTime: "asc" }],
		});
	}

	getToday(managerId: string) {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		return this.prisma.shift.findMany({
			where: {
				managerId,
				date: { gte: start, lt: end },
			},
			include: {
				assignments: {
					include: {
						employee: {
							select: { id: true, firstName: true, lastName: true },
						},
					},
				},
			},
			orderBy: [{ startTime: "asc" }],
		});
	}

	async create(managerId: string, payload: UpsertShiftDto) {
		await this.assertValidTime(payload.startTime, payload.endTime);
		const validation = await this.validateOverlap(managerId, payload);
		if (!validation.valid) {
			throw new ConflictException("Employee overlap detected");
		}

		return this.prisma.shift.create({
			data: {
				managerId,
				date: new Date(payload.date),
				startTime: this.toTime(payload.startTime),
				endTime: this.toTime(payload.endTime),
				assignments: {
					create: (payload.employeeIds || []).map((employeeId) => ({
						employeeId,
						calculatedHours: this.diffHours(payload.startTime, payload.endTime),
					})),
				},
			},
			include: { assignments: true },
		});
	}

	async update(managerId: string, shiftId: string, payload: UpsertShiftDto) {
		await this.assertShiftOwnedByManager(managerId, shiftId);
		await this.assertValidTime(payload.startTime, payload.endTime);
		const validation = await this.validateOverlap(managerId, { ...payload, shiftId });
		if (!validation.valid) {
			throw new ConflictException("Employee overlap detected");
		}

		return this.prisma.shift.update({
			where: { id: shiftId },
			data: {
				date: new Date(payload.date),
				startTime: this.toTime(payload.startTime),
				endTime: this.toTime(payload.endTime),
				assignments: {
					deleteMany: {},
					create: (payload.employeeIds || []).map((employeeId) => ({
						employeeId,
						calculatedHours: this.diffHours(payload.startTime, payload.endTime),
					})),
				},
			},
			include: { assignments: true },
		});
	}

	async delete(managerId: string, shiftId: string) {
		await this.assertShiftOwnedByManager(managerId, shiftId);
		await this.prisma.shift.delete({ where: { id: shiftId } });
		return { ok: true };
	}

	async validateEmployees(managerId: string, payload: ValidateShiftDto) {
		const employeeIds = payload.employeeIds || [];
		if (!employeeIds.length) {
			return { valid: true, conflictingEmployeeIds: [] };
		}

		const existing = await this.prisma.employee.findMany({
			where: { managerId, id: { in: employeeIds } },
			select: { id: true },
		});

		const existingIds = new Set(existing.map((e) => e.id));
		const missing = employeeIds.filter((id) => !existingIds.has(id));
		return { valid: missing.length === 0, conflictingEmployeeIds: missing };
	}

	async validateOverlap(managerId: string, payload: ValidateShiftDto) {
		const employeeIds = payload.employeeIds || [];
		if (!employeeIds.length) {
			return { valid: true, conflicts: [] };
		}

		const shifts = await this.prisma.shift.findMany({
			where: {
				managerId,
				date: new Date(payload.date),
				id: payload.shiftId ? { not: payload.shiftId } : undefined,
				assignments: {
					some: {
						employeeId: { in: employeeIds },
					},
				},
			},
			include: {
				assignments: true,
			},
		});

		const conflicts: Array<{ employeeId: string; shiftId: string }> = [];
		for (const shift of shifts) {
			if (this.timeRangesOverlap(payload.startTime, payload.endTime, shift.startTime, shift.endTime)) {
				for (const assignment of shift.assignments) {
					if (employeeIds.includes(assignment.employeeId)) {
						conflicts.push({ employeeId: assignment.employeeId, shiftId: shift.id });
					}
				}
			}
		}

		return { valid: conflicts.length === 0, conflicts };
	}

	private async assertShiftOwnedByManager(managerId: string, shiftId: string) {
		const shift = await this.prisma.shift.findFirst({
			where: { id: shiftId, managerId },
			select: { id: true },
		});

		if (!shift) {
			throw new NotFoundException("Shift not found");
		}
	}

	private async assertValidTime(start: string, end: string) {
		if (start >= end) {
			throw new BadRequestException("Start time must be before end time");
		}
	}

	private toTime(value: string) {
		return new Date(`1970-01-01T${value}:00.000Z`);
	}

	private timeRangesOverlap(
		startA: string,
		endA: string,
		startBDate: Date,
		endBDate: Date,
	) {
		const startB = startBDate.toISOString().slice(11, 16);
		const endB = endBDate.toISOString().slice(11, 16);
		return startA < endB && endA > startB;
	}

	private diffHours(start: string, end: string) {
		const [sh, sm] = start.split(":").map(Number);
		const [eh, em] = end.split(":").map(Number);
		return (eh + em / 60 - (sh + sm / 60)).toFixed(2);
	}
}
