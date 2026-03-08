import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
		res.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'");
		res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

		if (process.env.NODE_ENV === "production") {
			const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
			if (proto !== "https") {
				res.status(400).json({ message: "HTTPS is required" });
				return;
			}
		}

		next();
	}
}
