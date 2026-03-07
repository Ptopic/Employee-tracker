import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ShiftAssignmentsController } from "./shift-assignments.controller";
import { ShiftAssignmentsService } from "./shift-assignments.service";

@Module({
  imports: [PrismaModule],
  controllers: [ShiftAssignmentsController],
  providers: [ShiftAssignmentsService],
  exports: [ShiftAssignmentsService],
})
export class ShiftAssignmentsModule {}
