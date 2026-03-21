import { IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class UpdateCompanySettingsDto {
	@IsOptional()
	@IsString()
	@MaxLength(120)
	companyName?: string;

	@IsOptional()
	@IsString()
	logoUrl?: string;
}

export class UploadLogoDto {
	@IsString()
	logo!: string;
}

export class UpdatePreferencesDto {
	@IsOptional()
	@IsIn(["12h", "24h"])
	timeFormat?: "12h" | "24h";

	@IsOptional()
	@IsIn(["Sunday", "Monday"])
	firstDayOfWeek?: "Sunday" | "Monday";

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "firstShiftStart must be HH:mm" })
	firstShiftStart?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "firstShiftEnd must be HH:mm" })
	firstShiftEnd?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "secondShiftStart must be HH:mm" })
	secondShiftStart?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "secondShiftEnd must be HH:mm" })
	secondShiftEnd?: string;
}
