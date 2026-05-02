import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ScheduleService {
	private readonly logger = new Logger(ScheduleService.name);

	constructor(private readonly prisma: PrismaService) {}

	async getDaySchedule(managerId: string, dateIso: string) {
		this.logger.log(`Getting day schedule for manager ${managerId}, date ${dateIso}`);
		const date = new Date(dateIso);
		date.setUTCHours(0, 0, 0, 0);

		const shifts = await this.prisma.shift.findMany({
			where: { managerId, date },
			include: {
				assignments: {
					include: {
						employee: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
					},
				},
			},
			orderBy: [{ isDayOff: "asc" }, { startTime: "asc" }],
		});

		return {
			date: dateIso,
			shifts,
		};
	}
}
