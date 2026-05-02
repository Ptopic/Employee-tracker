import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	async onModuleInit() {
		await this.$connect()
			.then(() => this.logger.log("Connected to DB"))
			.catch((err) => this.logger.error("Failed to connect to DB", err instanceof Error ? err.stack : String(err)));
	}
	async onModuleDestroy() {
		this.logger.log("Disconnecting from DB");
		await this.$disconnect();
	}
}
