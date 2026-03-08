import {
	Body,
	Controller,
	Delete,
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
	ListShiftsQueryDto,
	UpsertShiftDto,
	ValidateShiftDto,
} from "./dtos/shift.dto";
import { ShiftsService } from "./shifts.service";

@Controller("shifts")
export class ShiftsController {
	constructor(private readonly shiftsService: ShiftsService) {}

	@Get()
	@JwtAuth()
	list(@Req() req: Request, @Query() query: ListShiftsQueryDto) {
		return this.shiftsService.list(req.user.userId, query.startDate, query.endDate);
	}

	@Get("today")
	@JwtAuth()
	getToday(@Req() req: Request) {
		return this.shiftsService.getToday(req.user.userId);
	}

	@Post()
	@JwtAuth()
	create(@Req() req: Request, @Body() payload: UpsertShiftDto) {
		return this.shiftsService.create(req.user.userId, payload);
	}

	@Patch(":shiftId")
	@JwtAuth()
	update(
		@Req() req: Request,
		@Param("shiftId") shiftId: string,
		@Body() payload: UpsertShiftDto,
	) {
		return this.shiftsService.update(req.user.userId, shiftId, payload);
	}

	@Delete(":shiftId")
	@JwtAuth()
	delete(@Req() req: Request, @Param("shiftId") shiftId: string) {
		return this.shiftsService.delete(req.user.userId, shiftId);
	}

	@Post("validate-overlap")
	@JwtAuth()
	validateOverlap(@Req() req: Request, @Body() payload: ValidateShiftDto) {
		return this.shiftsService.validateOverlap(req.user.userId, payload);
	}

	@Post("validate-employees")
	@JwtAuth()
	validateEmployees(@Req() req: Request, @Body() payload: ValidateShiftDto) {
		return this.shiftsService.validateEmployees(req.user.userId, payload);
	}
}
