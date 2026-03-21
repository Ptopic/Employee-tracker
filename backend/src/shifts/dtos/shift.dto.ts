import {
	ArrayUnique,
	IsBoolean,
	IsArray,
	IsDateString,
	IsOptional,
	IsString,
	Matches,
	ValidateIf,
} from "class-validator";

export class UpsertShiftDto {
	@IsDateString()
	date: string;

	@IsOptional()
	@IsBoolean()
	isDayOff?: boolean;

	@ValidateIf((o: UpsertShiftDto) => !o.isDayOff)
	@Matches(/^\d{2}:\d{2}$/)
	startTime?: string;

	@ValidateIf((o: UpsertShiftDto) => !o.isDayOff)
	@Matches(/^\d{2}:\d{2}$/)
	endTime?: string;

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
