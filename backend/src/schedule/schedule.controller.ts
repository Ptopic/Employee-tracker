import { Controller, Get, Param, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { ScheduleService } from "./schedule.service";

@Controller("schedule")
export class ScheduleController {
	constructor(private readonly scheduleService: ScheduleService) {}

	@Get("day/:date")
	@JwtAuth()
	getDay(@Req() req: Request, @Param("date") date: string) {
		return this.scheduleService.getDaySchedule(req.user.userId, date);
	}
}
