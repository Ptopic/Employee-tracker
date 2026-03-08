import { ShiftsService } from "./shifts.service";

describe("ShiftsService performance", () => {
  it("builds calendar response under 300ms", async () => {
    const shifts = Array.from({ length: 1200 }).map((_, index) => ({
      id: `shift-${index}`,
      date: new Date(`2026-03-${String((index % 28) + 1).padStart(2, "0")}T00:00:00.000Z`),
      startTime: new Date("1970-01-01T09:00:00.000Z"),
      endTime: new Date("1970-01-01T17:00:00.000Z"),
      assignments: [
        {
          id: `assignment-${index}`,
          employeeId: `employee-${index % 100}`,
          employee: { firstName: "Jane", lastName: `Doe-${index % 100}` },
        },
      ],
    }));

    const service = new ShiftsService({
      shift: { findMany: jest.fn().mockResolvedValue(shifts) },
    } as any);

    const response = await service.getCalendar({
      from: new Date("2026-03-01T00:00:00.000Z"),
      to: new Date("2026-03-31T23:59:59.999Z"),
      managerId: "manager-1",
    });

    expect(response.durationMs).toBeLessThan(300);
    expect(response.totalShifts).toBe(1200);
  });
});
