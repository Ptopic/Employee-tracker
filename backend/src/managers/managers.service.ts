import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.manager.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
