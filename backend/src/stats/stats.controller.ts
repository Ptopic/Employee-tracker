import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@Get("weekly-hours")
	@JwtAuth()
	getWeeklyHours(@Req() req: Request) {
		return this.statsService.getWeeklyHours(req.user.userId);
	}

	@Get("today-employees")
	@JwtAuth()
	getTodayEmployees(@Req() req: Request) {
		return this.statsService.getTodayEmployees(req.user.userId);
	}
}
