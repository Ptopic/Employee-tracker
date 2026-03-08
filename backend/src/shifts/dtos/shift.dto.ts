import {
	ArrayUnique,
	IsArray,
	IsDateString,
	IsOptional,
	IsString,
	Matches,
} from "class-validator";

export class UpsertShiftDto {
	@IsDateString()
	date: string;

	@Matches(/^\d{2}:\d{2}$/)
	startTime: string;

	@Matches(/^\d{2}:\d{2}$/)
	endTime: string;

	@IsArray()
	@ArrayUnique()
	@IsString({ each: true })
	@IsOptional()
	employeeIds?: string[] = [];
}

export class ValidateShiftDto extends UpsertShiftDto {
	@IsOptional()
	@IsString()
	shiftId?: string;
}

export class ListShiftsQueryDto {
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;
}
