import { calculateDeterministicHours, normalizeDateIso, roundHours } from "./deterministic-hours";

describe("deterministic-hours", () => {
	it("calculates deterministic hours with fixed rounding", () => {
		expect(calculateDeterministicHours("09:00", "17:30")).toBe(8.5);
		expect(roundHours(1.005)).toBe(1);
	});

	it("normalizes date in UTC", () => {
		const date = normalizeDateIso("2026-03-08");
		expect(date.toISOString()).toBe("2026-03-08T00:00:00.000Z");
	});

	it("throws for invalid ranges", () => {
		expect(() => calculateDeterministicHours("10:00", "10:00")).toThrow();
	});
});
