import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ShiftAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.shiftAssignment.findMany({
      include: { shift: true, employee: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
