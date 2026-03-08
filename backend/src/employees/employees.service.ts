import { Prisma } from "@prisma/client";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(payload: {
    firstName: string;
    lastName: string;
    age: number;
    hourlyRate: number;
  }) {
    const manager = await this.prisma.manager.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (!manager) {
      throw new BadRequestException("Cannot create employee without manager");
    }

    return this.prisma.employee.create({
      data: {
        managerId: manager.id,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        age: payload.age,
        hourlyRate: new Prisma.Decimal(payload.hourlyRate),
      },
    });
  }
}
