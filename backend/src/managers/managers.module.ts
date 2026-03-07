import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ManagersController } from "./managers.controller";
import { ManagersService } from "./managers.service";

@Module({
  imports: [PrismaModule],
  controllers: [ManagersController],
  providers: [ManagersService],
  exports: [ManagersService],
})
export class ManagersModule {}
