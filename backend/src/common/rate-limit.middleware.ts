import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const AUTH_MAX = 20;
const DATA_MAX = 300;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function getBucket(prefix: string, ip: string): Bucket {
	const key = `${prefix}:${ip}`;
	const now = Date.now();
	const existing = buckets.get(key);
	if (!existing || existing.resetAt <= now) {
		const fresh: Bucket = { count: 1, resetAt: now + WINDOW_MS };
		buckets.set(key, fresh);
		return fresh;
	}
	return existing;
}

function checkLimit(bucket: Bucket, max: number, res: Response): boolean {
	if (bucket.count >= max) {
		return false;
	}
	bucket.count += 1;
	return true;
}

@Injectable()
export class RateLimitMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const ip = req.ip || "unknown";
		const path = req.route?.path || req.path || "";

		if (path.startsWith("/auth/")) {
			const bucket = getBucket("auth", ip);
			if (!checkLimit(bucket, AUTH_MAX, res)) {
				res.status(429).json({ message: "Too many authentication attempts" });
				return;
			}
		} else if (path.startsWith("/performance")) {
			next();
			return;
		} else {
			const bucket = getBucket("data", ip);
			if (!checkLimit(bucket, DATA_MAX, res)) {
				res.status(429).json({ message: "Too many requests" });
				return;
			}
		}

		next();
	}
}
