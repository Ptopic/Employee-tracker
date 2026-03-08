import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import {
	CreateEmployeeDto,
	ListEmployeesQueryDto,
	UpdateEmployeeDto,
} from "./dtos/employee.dto";
import { EmployeesService } from "./employees.service";

@Controller("employees")
export class EmployeesController {
	constructor(private readonly employeesService: EmployeesService) {}

	@Get()
	@JwtAuth()
	list(@Req() req: Request, @Query() query: ListEmployeesQueryDto) {
		return this.employeesService.list(req.user.userId, query);
	}

	@Get("monthly-hours")
	@JwtAuth()
	monthlyHours(@Req() req: Request) {
		return this.employeesService.listMonthlyHours(req.user.userId);
	}

	@Get(":employeeId")
	@JwtAuth()
	getOne(@Req() req: Request, @Param("employeeId") employeeId: string) {
		return this.employeesService.getById(req.user.userId, employeeId);
	}

	@Get(":employeeId/stats")
	@JwtAuth()
	stats(@Req() req: Request, @Param("employeeId") employeeId: string) {
		return this.employeesService.getStats(req.user.userId, employeeId);
	}

	@Post()
	@JwtAuth()
	create(@Req() req: Request, @Body() payload: CreateEmployeeDto) {
		return this.employeesService.create(req.user.userId, payload);
	}

	@Patch(":employeeId")
	@JwtAuth()
	update(
		@Req() req: Request,
		@Param("employeeId") employeeId: string,
		@Body() payload: UpdateEmployeeDto,
	) {
		return this.employeesService.update(req.user.userId, employeeId, payload);
	}

	@Patch(":employeeId/deactivate")
	@JwtAuth()
	deactivate(@Req() req: Request, @Param("employeeId") employeeId: string) {
		return this.employeesService.deactivate(req.user.userId, employeeId);
	}
}
