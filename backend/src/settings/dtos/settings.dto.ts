import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

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
	@IsIn(["12h", "24h"])
	timeFormat!: "12h" | "24h";

	@IsIn(["Sunday", "Monday"])
	firstDayOfWeek!: "Sunday" | "Monday";
}
