import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;
const bucket = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const key = req.ip || "unknown";
		const now = Date.now();
		const current = bucket.get(key);

		if (!current || current.resetAt <= now) {
			bucket.set(key, { count: 1, resetAt: now + WINDOW_MS });
			next();
			return;
		}

		if (current.count >= MAX_PER_WINDOW) {
			res.status(429).json({ message: "Too many requests" });
			return;
		}

		current.count += 1;
		bucket.set(key, current);
		next();
	}
}
