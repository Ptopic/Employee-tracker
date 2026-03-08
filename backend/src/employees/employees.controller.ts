import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { EmployeesService } from "./employees.service";

@Controller("employees")
export class EmployeesController {
	constructor(private readonly employeesService: EmployeesService) {}

	@Get()
	@JwtAuth()
	list(@Req() req: Request) {
		return this.employeesService.list(req.user.userId);
	}
}
