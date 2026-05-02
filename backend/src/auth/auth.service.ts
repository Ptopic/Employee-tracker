import {
	BadRequestException,
	Injectable,
	Logger,
	UnauthorizedException,
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
	private readonly logger = new Logger(AuthService.name);

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
		this.logger.log("Verifying Google token");
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
				this.logger.warn("Google token audience mismatch");
				throw new UnauthorizedException("Google token audience mismatch");
			}

			if (!email || !sub || email_verified === "false") {
				this.logger.warn("Invalid Google token payload: missing email/sub or unverified");
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
			this.logger.error("Google token verification failed", error instanceof Error ? error.stack : String(error));
			throw new UnauthorizedException("Invalid Google access token");
		}
	}

	async refreshSession(refreshToken: string) {
		this.logger.log("Refreshing session");
		if (!refreshToken) {
			this.logger.warn("Refresh session attempted without refresh token");
			throw new BadRequestException("Refresh token is required");
		}

		let payload: { sub: string; type: string; tokenVersion: number };

		try {
			payload = await this.jwtService.verifyAsync(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
			});
		} catch {
			this.logger.warn("JWT refresh token verification failed");
			throw new UnauthorizedException("Invalid refresh token");
		}

		if (payload.type !== "refresh") {
			this.logger.warn(`Invalid refresh token type: ${payload.type}`);
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
			this.logger.warn(`Refresh token no longer valid for user ${payload.sub}`);
			throw new UnauthorizedException("Refresh token is no longer valid");
		}

		return this.issueSessionTokens({
			id: manager.id,
			email: manager.email,
			tokenVersion: manager.tokenVersion,
		});
	}

	async validateSession(userId: string) {
		this.logger.log(`Validating session for user ${userId}`);
		const manager = await this.managersService.findById(userId);
		if (!manager) {
			this.logger.warn(`Session invalid for user ${userId}`);
			throw new UnauthorizedException("Session is invalid");
		}

		return manager;
	}

	async logout(userId: string) {
		this.logger.log(`Logging out user ${userId}`);
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
		this.logger.log(`Getting current user ${userId}`);
		return this.validateSession(userId);
	}
}
