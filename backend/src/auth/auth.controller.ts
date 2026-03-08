import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Req,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuth } from "./decorators/jwt-auth.decorator";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("google")
	async googleLogin(@Body() body: { token?: string }) {
		if (!body.token) {
			throw new BadRequestException("Google access token is required");
		}

		return this.authService.verifyGoogleToken(body.token);
	}

	@Post("refresh")
	async refresh(@Body() body: { refreshToken?: string }) {
		if (!body.refreshToken) {
			throw new BadRequestException("Refresh token is required");
		}

		return this.authService.refreshSession(body.refreshToken);
	}

	@Post("logout")
	@JwtAuth()
	logout(@Req() req: Request) {
		return this.authService.logout(req.user.userId);
	}

	@Get("session")
	@JwtAuth()
	session(@Req() req: Request) {
		return this.authService.validateSession(req.user.userId);
	}

	@Get("me")
	@JwtAuth()
	me(@Req() req: Request) {
		return this.authService.me(req.user.userId);
	}
}
