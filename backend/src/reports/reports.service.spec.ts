import { EmployeesService } from "../employees/employees.service";
import { ShiftAssignmentsService } from "../shift-assignments/shift-assignments.service";
import { ShiftsService } from "../shifts/shifts.service";

describe("Core PRD acceptance", () => {
  it("lists employees sorted by newest first", async () => {
    const prisma = {
      employee: { findMany: jest.fn().mockResolvedValue([{ id: "emp-1" }]) },
    } as any;

    const service = new EmployeesService(prisma);

    await expect(service.list()).resolves.toEqual([{ id: "emp-1" }]);
    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });

  it("lists shifts in calendar order with assignments included", async () => {
    const prisma = {
      shift: { findMany: jest.fn().mockResolvedValue([{ id: "shift-1" }]) },
    } as any;

    const service = new ShiftsService(prisma);

    await expect(service.list()).resolves.toEqual([{ id: "shift-1" }]);
    expect(prisma.shift.findMany).toHaveBeenCalledWith({
      include: { assignments: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  });

  it("lists shift assignments with employee and shift details", async () => {
    const prisma = {
      shiftAssignment: { findMany: jest.fn().mockResolvedValue([{ id: "sa-1" }]) },
    } as any;

    const service = new ShiftAssignmentsService(prisma);

    await expect(service.list()).resolves.toEqual([{ id: "sa-1" }]);
    expect(prisma.shiftAssignment.findMany).toHaveBeenCalledWith({
      include: { shift: true, employee: true },
      orderBy: { createdAt: "desc" },
    });
  });
});
