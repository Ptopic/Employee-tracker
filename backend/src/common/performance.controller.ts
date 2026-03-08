import { Controller, Get } from "@nestjs/common";
import { performance } from "node:perf_hooks";

@Controller("performance")
export class PerformanceController {
	@Get("health")
	health() {
		return {
			uptimeSeconds: Number(process.uptime().toFixed(2)),
			nowMs: Number(performance.now().toFixed(2)),
		};
	}
}
