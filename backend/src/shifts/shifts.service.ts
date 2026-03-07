import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.shift.findMany({
      include: { assignments: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }
}
