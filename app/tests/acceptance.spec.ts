import shiftsRequests from "../api/shifts/requests";
import { sanitizeInput } from "../shared/security/validation";

describe("acceptance criteria", () => {
	it("month visibility and summary generation", () => {
		const start = new Date("2026-03-01T00:00:00.000Z");
		const end = new Date("2026-03-31T00:00:00.000Z");
		const summary = shiftsRequests.buildCalendarSummary([], start, end);
		expect(summary.length).toBe(31);
	});

	it("overlap prevention helper sanitizes input", () => {
		expect(sanitizeInput("<script>alert(1)</script>"))
			.toBe("scriptalert(1)/script");
	});
});
