import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";

@Module({
  imports: [PrismaModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
