import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
	imports: [PrismaModule],
	controllers: [StatsController],
	providers: [StatsService],
	exports: [StatsService],
})
export class StatsModule {}
