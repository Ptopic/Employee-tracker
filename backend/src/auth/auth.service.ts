import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { createHash } from "crypto";
import { ManagersService } from "src/managers/managers.service";
import { PrismaService } from "src/prisma/prisma.service";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private managersService: ManagersService,
	) {}

	private hashToken(token: string) {
		return createHash("sha256").update(token).digest("hex");
	}

	private async issueSessionTokens(manager: {
		id: string;
		email: string;
		tokenVersion: number;
	}) {
		const accessToken = await this.jwtService.signAsync(
			{
				sub: manager.id,
				email: manager.email,
				type: "access",
				tokenVersion: manager.tokenVersion,
			},
			{ expiresIn: ACCESS_TOKEN_TTL_SECONDS },
		);

		const refreshToken = await this.jwtService.signAsync(
			{
				sub: manager.id,
				email: manager.email,
				type: "refresh",
				tokenVersion: manager.tokenVersion,
			},
			{
				secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
				expiresIn: REFRESH_TOKEN_TTL_SECONDS,
			},
		);

		await this.prisma.manager.update({
			where: { id: manager.id },
			data: {
				refreshTokenHash: this.hashToken(refreshToken),
				refreshTokenExpiresAt: new Date(
					Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
				),
			},
		});

		return { accessToken, refreshToken };
	}

	async verifyGoogleToken(accessToken: string) {
		try {
			const tokenInfoResponse = await axios.get(
				`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
			);
			const userInfoResponse = await axios.get(
				`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
			);

			const { email, sub, aud, email_verified } = tokenInfoResponse.data;
			const clientId = process.env.GOOGLE_CLIENT_ID;

			if (clientId && aud !== clientId) {
				throw new UnauthorizedException("Google token audience mismatch");
			}

			if (!email || !sub || email_verified === "false") {
				throw new UnauthorizedException("Invalid Google token payload");
			}

			const { name, picture } = userInfoResponse.data;

			const { manager, isFirstLogin } =
				await this.managersService.bootstrapFromGoogleProfile({
					googleAuthId: sub,
					email,
					fullName: name || email,
					picture,
				});

			const tokens = await this.issueSessionTokens({
				id: manager.id,
				email: manager.email,
				tokenVersion: manager.tokenVersion,
			});

			return {
				...tokens,
				isFirstLogin,
				manager,
			};
		} catch (error) {
			console.error("Google token verification failed:", error);
			throw new UnauthorizedException("Invalid Google access token");
		}
	}

	async refreshSession(refreshToken: string) {
		if (!refreshToken) {
			throw new BadRequestException("Refresh token is required");
		}

		let payload: { sub: string; type: string; tokenVersion: number };

		try {
			payload = await this.jwtService.verifyAsync(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
			});
		} catch {
			throw new UnauthorizedException("Invalid refresh token");
		}

		if (payload.type !== "refresh") {
			throw new UnauthorizedException("Invalid refresh token type");
		}

		const manager = await this.prisma.manager.findUnique({
			where: { id: payload.sub },
		});

		if (
			!manager ||
			!manager.refreshTokenHash ||
			!manager.refreshTokenExpiresAt ||
			manager.refreshTokenExpiresAt.getTime() < Date.now() ||
			manager.tokenVersion !== payload.tokenVersion ||
			manager.refreshTokenHash !== this.hashToken(refreshToken)
		) {
			throw new UnauthorizedException("Refresh token is no longer valid");
		}

		return this.issueSessionTokens({
			id: manager.id,
			email: manager.email,
			tokenVersion: manager.tokenVersion,
		});
	}

	async validateSession(userId: string) {
		const manager = await this.managersService.findById(userId);
		if (!manager) {
			throw new UnauthorizedException("Session is invalid");
		}

		return manager;
	}

	async logout(userId: string) {
		await this.prisma.manager.update({
			where: { id: userId },
			data: {
				refreshTokenHash: null,
				refreshTokenExpiresAt: null,
				tokenVersion: { increment: 1 },
			},
		});

		return { success: true };
	}

	async me(userId: string) {
		return this.validateSession(userId);
	}
}
