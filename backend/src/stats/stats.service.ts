import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class StatsService {
	private readonly logger = new Logger(StatsService.name);

	constructor(private readonly prisma: PrismaService) {}

	private getTodayRange() {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		return { start, end };
	}

	private getCurrentWeekRange() {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const dayOfWeek = start.getDay();
		const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		start.setDate(start.getDate() + mondayOffset);

		const end = new Date(start);
		end.setDate(end.getDate() + 7);

		return { start, end };
	}

	async getWeeklyHours(managerId: string) {
		this.logger.log(`Getting weekly hours for manager ${managerId}`);
		const { start, end } = this.getCurrentWeekRange();

		const shifts = await this.prisma.shift.findMany({
			where: {
				managerId,
				date: {
					gte: start,
					lt: end,
				},
			},
			select: {
				assignments: {
					select: {
						calculatedHours: true,
					},
				},
			},
		});

		const totalHours = shifts.reduce((sum, shift) => {
			const shiftHours = shift.assignments.reduce(
				(acc, assignment) => acc + Number(assignment.calculatedHours),
				0,
			);
			return sum + shiftHours;
		}, 0);

		return {
			totalHours,
			weekStart: start,
			weekEnd: end,
		};
	}

	async getTodayEmployees(managerId: string) {
		this.logger.log(`Getting today's employee count for manager ${managerId}`);
		const { start, end } = this.getTodayRange();

		const assignments = await this.prisma.shiftAssignment.findMany({
			where: {
				shift: {
					managerId,
					date: {
						gte: start,
						lt: end,
					},
				},
			},
			select: {
				employeeId: true,
			},
			distinct: ["employeeId"],
		});

		return {
			count: assignments.length,
			date: start,
		};
	}
}
