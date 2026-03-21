import {
	IsDateString,
	IsEnum,
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { EmployeeStatus } from "@prisma/client";

export class CreateEmployeeDto {
	@IsString()
	@MinLength(1)
	firstName: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsInt()
	@Min(16)
	@Max(100)
	age?: number;

	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	hourlyRate: number;

	@IsOptional()
	@IsEnum(EmployeeStatus)
	status?: EmployeeStatus = EmployeeStatus.ACTIVE;
}

export class UpdateEmployeeDto {
	@IsOptional()
	@IsString()
	@MinLength(1)
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsInt()
	@Min(16)
	@Max(100)
	age?: number;

	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	hourlyRate?: number;

	@IsOptional()
	@IsEnum(EmployeeStatus)
	status?: EmployeeStatus;
}

export class ListEmployeesQueryDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsEnum(EmployeeStatus)
	status?: EmployeeStatus;

	@IsOptional()
	@IsIn(["name", "hourlyRate", "monthlyHours", "status"])
	sortBy?: "name" | "hourlyRate" | "monthlyHours" | "status" = "name";

	@IsOptional()
	@IsIn(["asc", "desc"])
	sortOrder?: "asc" | "desc" = "asc";
}

export class EmployeeStatsQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(12)
	month?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(2000)
	@Max(9999)
	year?: number;

	@IsOptional()
	@IsDateString()
	weekStart?: string;
}
