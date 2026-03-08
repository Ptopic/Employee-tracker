import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ShiftsService {
	constructor(private readonly prisma: PrismaService) {}

	list(managerId: string) {
		return this.prisma.shift.findMany({
			where: { managerId },
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
				date: {
					gte: start,
					lt: end,
				},
			},
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
			orderBy: [{ startTime: "asc" }],
		});
	}
}
