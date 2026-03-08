import { ReportsService } from "./reports.service";

describe("ReportsService performance", () => {
  it("exports PDF under 2 seconds", async () => {
    const assignments = Array.from({ length: 2500 }).map((_, index) => ({
      calculatedHours: (index % 8) + 1,
      employee: {
        firstName: "John",
        lastName: `Smith-${index % 200}`,
        hourlyRate: 25,
      },
    }));

    const service = new ReportsService({
      shiftAssignment: { findMany: jest.fn().mockResolvedValue(assignments) },
    } as any);

    const result = await service.exportPayrollPdf({
      from: new Date("2026-03-01T00:00:00.000Z"),
      to: new Date("2026-03-31T23:59:59.999Z"),
      managerId: "manager-1",
    });

    expect(result.durationMs).toBeLessThan(2000);
    expect(result.buffer.length).toBeGreaterThan(100);
  });
});
