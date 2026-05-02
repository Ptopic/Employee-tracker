import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ShiftAssignmentsService {
	private readonly logger = new Logger(ShiftAssignmentsService.name);

	constructor(private readonly prisma: PrismaService) {}

	list() {
		this.logger.log("Listing all shift assignments");
		return this.prisma.shiftAssignment.findMany({
      include: { shift: true, employee: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
