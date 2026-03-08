import {
	Body,
	Controller,
	Get,
	Header,
	Patch,
	Post,
	Query,
	Req,
	Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import {
	UpdateCompanySettingsDto,
	UpdatePreferencesDto,
	UploadLogoDto,
} from "./dtos/settings.dto";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	@Get("company")
	@JwtAuth()
	getCompany(@Req() req: Request) {
		return this.settingsService.getCompany(req.user.userId);
	}

	@Patch("company")
	@JwtAuth()
	updateCompany(@Req() req: Request, @Body() body: UpdateCompanySettingsDto) {
		return this.settingsService.updateCompany(req.user.userId, body);
	}

	@Get("preferences")
	@JwtAuth()
	getPreferences(@Req() req: Request) {
		return this.settingsService.getPreferences(req.user.userId);
	}

	@Patch("preferences")
	@JwtAuth()
	updatePreferences(@Req() req: Request, @Body() body: UpdatePreferencesDto) {
		return this.settingsService.updatePreferences(req.user.userId, body);
	}

	@Post("logo-upload")
	@JwtAuth()
	uploadLogo(@Body() body: UploadLogoDto) {
		return this.settingsService.uploadLogo(body.logo);
	}

	@Get("exports/weekly-pdf")
	@JwtAuth()
	@Header("Content-Type", "application/pdf")
	async exportWeeklyPdf(
		@Req() req: Request,
		@Query("weekStart") weekStart: string,
		@Res() response: Response,
	) {
		const result = await this.settingsService.exportWeeklyPdf(
			req.user.userId,
			weekStart,
		);
		response.setHeader("X-Export-Duration-Ms", String(result.durationMs));
		response.setHeader(
			"Content-Disposition",
			`attachment; filename="${result.fileName}"`,
		);
		response.send(result.buffer);
	}
}
