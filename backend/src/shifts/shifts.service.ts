import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { calculateDeterministicHours, normalizeDateIso } from "src/common/deterministic-hours";
import { PrismaService } from "src/prisma/prisma.service";
import { UpsertShiftDto, ValidateShiftDto } from "./dtos/shift.dto";

@Injectable()
export class ShiftsService {
	private readonly logger = new Logger(ShiftsService.name);

	constructor(private readonly prisma: PrismaService) {}

	list(managerId: string, startDate?: string, endDate?: string) {
		this.logger.log(`Listing shifts for manager ${managerId}`);
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
			orderBy: [{ date: "asc" }, { isDayOff: "asc" }, { startTime: "asc" }],
		});
	}

	getToday(managerId: string) {
		this.logger.log(`Getting today's shifts for manager ${managerId}`);
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
			orderBy: [{ isDayOff: "asc" }, { startTime: "asc" }],
		});
	}

	async create(managerId: string, payload: UpsertShiftDto) {
		this.logger.log(`Creating shift for manager ${managerId}`);
		const normalizedPayload = this.normalizePayload(payload);
		await this.assertPayloadTimes(normalizedPayload);
		const validation = await this.validateOverlap(managerId, payload);
		if (!validation.valid) {
			this.logger.warn(`Shift overlap detected for manager ${managerId}`);
			throw new ConflictException("Employee overlap detected");
		}

		const calculatedHours = normalizedPayload.isDayOff
			? 0
			: calculateDeterministicHours(normalizedPayload.startTime, normalizedPayload.endTime);

		return this.prisma.shift.create({
			data: {
				managerId,
				date: normalizeDateIso(normalizedPayload.date),
				isDayOff: normalizedPayload.isDayOff,
				startTime: normalizedPayload.startTime ? this.toTime(normalizedPayload.startTime) : null,
				endTime: normalizedPayload.endTime ? this.toTime(normalizedPayload.endTime) : null,
				assignments: {
					create: (normalizedPayload.employeeIds || []).map((employeeId) => ({
						employeeId,
						calculatedHours: calculatedHours.toFixed(2),
					})),
				},
			},
			include: { assignments: true },
		});
	}

	async update(managerId: string, shiftId: string, payload: UpsertShiftDto) {
		this.logger.log(`Updating shift ${shiftId} for manager ${managerId}`);
		await this.assertShiftOwnedByManager(managerId, shiftId);
		const normalizedPayload = this.normalizePayload(payload);
		await this.assertPayloadTimes(normalizedPayload);
		const validation = await this.validateOverlap(managerId, { ...payload, shiftId });
		if (!validation.valid) {
			this.logger.warn(`Shift overlap detected on update for shift ${shiftId}`);
			throw new ConflictException("Employee overlap detected");
		}

		const calculatedHours = normalizedPayload.isDayOff
			? 0
			: calculateDeterministicHours(normalizedPayload.startTime, normalizedPayload.endTime);

		return this.prisma.shift.update({
			where: { id: shiftId },
			data: {
				date: normalizeDateIso(normalizedPayload.date),
				isDayOff: normalizedPayload.isDayOff,
				startTime: normalizedPayload.startTime ? this.toTime(normalizedPayload.startTime) : null,
				endTime: normalizedPayload.endTime ? this.toTime(normalizedPayload.endTime) : null,
				assignments: {
					deleteMany: {},
					create: (normalizedPayload.employeeIds || []).map((employeeId) => ({
						employeeId,
						calculatedHours: calculatedHours.toFixed(2),
					})),
				},
			},
			include: { assignments: true },
		});
	}

	async delete(managerId: string, shiftId: string) {
		this.logger.log(`Deleting shift ${shiftId} for manager ${managerId}`);
		await this.assertShiftOwnedByManager(managerId, shiftId);
		await this.prisma.shift.delete({ where: { id: shiftId } });
		return { ok: true };
	}

	async validateEmployees(managerId: string, payload: ValidateShiftDto) {
		const employeeIds = payload.employeeIds || [];
		this.logger.log(`Validating ${employeeIds.length} employees for manager ${managerId}`);
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
		const normalizedPayload = this.normalizePayload(payload);
		const employeeIds = normalizedPayload.employeeIds || [];
		this.logger.log(`Validating overlap for ${employeeIds.length} employees`);
		if (!employeeIds.length) {
			return { valid: true, conflicts: [] };
		}

		const shifts = await this.prisma.shift.findMany({
			where: {
				managerId,
				date: normalizeDateIso(normalizedPayload.date),
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
			if (normalizedPayload.isDayOff || shift.isDayOff) {
				for (const assignment of shift.assignments) {
					if (employeeIds.includes(assignment.employeeId)) {
						conflicts.push({ employeeId: assignment.employeeId, shiftId: shift.id });
					}
				}
				continue;
			}

			if (
				normalizedPayload.startTime &&
				normalizedPayload.endTime &&
				this.timeRangesOverlap(normalizedPayload.startTime, normalizedPayload.endTime, shift.startTime, shift.endTime)
			) {
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
			this.logger.warn(`Shift ${shiftId} not found for manager ${managerId}`);
			throw new NotFoundException("Shift not found");
		}
	}

	private async assertPayloadTimes(payload: UpsertShiftDto) {
		if (payload.isDayOff) {
			return;
		}

		const { startTime, endTime } = payload;
		if (!startTime || !endTime) {
			this.logger.warn(`Invalid shift times: ${startTime}/${endTime}`);
			throw new BadRequestException("Start and end time are required unless shift is a day off");
		}

		if (startTime === endTime) {
			this.logger.warn(`Invalid shift times: ${startTime}/${endTime}`);
			throw new BadRequestException("Start and end time cannot be the same");
		}
	}

	private normalizePayload(payload: UpsertShiftDto | ValidateShiftDto) {
		const isDayOff = Boolean(payload.isDayOff);
		return {
			...payload,
			isDayOff,
			startTime: isDayOff ? undefined : payload.startTime,
			endTime: isDayOff ? undefined : payload.endTime,
		};
	}

	private toTime(value: string) {
		return new Date(`1970-01-01T${value}:00.000Z`);
	}

	private timeRangesOverlap(
		startA: string,
		endA: string,
		startBDate: Date | null,
		endBDate: Date | null,
	) {
		if (!startBDate || !endBDate) {
			return false;
		}

		const startAMinutes = this.toMinutes(startA);
		const endAMinutes = this.resolveEndMinutes(startA, endA);
		const startB = startBDate.toISOString().slice(11, 16);
		const endB = endBDate.toISOString().slice(11, 16);
		const startBMinutes = this.toMinutes(startB);
		const endBMinutes = this.resolveEndMinutes(startB, endB);

		return startAMinutes < endBMinutes && endAMinutes > startBMinutes;
	}

	private toMinutes(value: string) {
		const [hours, minutes] = value.split(":").map(Number);
		return hours * 60 + minutes;
	}

	private resolveEndMinutes(start: string, end: string) {
		const startMinutes = this.toMinutes(start);
		const endMinutes = this.toMinutes(end);
		if (endMinutes <= startMinutes) {
			return endMinutes + 24 * 60;
		}
		return endMinutes;
	}

	// Deterministic hour calculation is centralized in src/common/deterministic-hours.ts
}
