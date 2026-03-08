import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EmployeesService {
	constructor(private readonly prisma: PrismaService) {}

	list(managerId: string) {
		return this.prisma.employee.findMany({
			where: { managerId },
			orderBy: { firstName: "asc" },
			select: {
				id: true,
				firstName: true,
				lastName: true,
			},
		});
	}
}
