import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ScheduleService {
	constructor(private readonly prisma: PrismaService) {}

	async getDaySchedule(managerId: string, dateIso: string) {
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
