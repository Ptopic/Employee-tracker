import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { ShiftsService } from "./shifts.service";

@Controller("shifts")
export class ShiftsController {
	constructor(private readonly shiftsService: ShiftsService) {}

	@Get()
	@JwtAuth()
	list(@Req() req: Request) {
		return this.shiftsService.list(req.user.userId);
	}

	@Get("today")
	@JwtAuth()
	getToday(@Req() req: Request) {
		return this.shiftsService.getToday(req.user.userId);
	}
}
