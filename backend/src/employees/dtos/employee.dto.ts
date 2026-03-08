import {
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
import { EmployeeStatus } from "@prisma/client";

export class CreateEmployeeDto {
	@IsString()
	@MinLength(1)
	firstName: string;

	@IsString()
	@MinLength(1)
	lastName: string;

	@IsInt()
	@Min(16)
	@Max(100)
	age: number;

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
	@MinLength(1)
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
