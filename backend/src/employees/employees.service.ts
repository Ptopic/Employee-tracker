import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
