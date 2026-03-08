import { EmployeeStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(14)
  @Max(99)
  age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

export class UpdateEmployeeStatusDto {
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}
