import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getDeterministicHoursTotals(date?: string) {
    const referenceDate = this.normalizeReferenceDate(date);
    const week = this.getUtcWeekRange(referenceDate);
    const month = this.getUtcMonthRange(referenceDate);

    const [employees, assignments] = await Promise.all([
      this.prisma.employee.findMany({
        select: { id: true, firstName: true, lastName: true, status: true },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { id: "asc" }],
      }),
      this.prisma.shiftAssignment.findMany({
        where: {
          shift: {
            date: {
              gte: week.startsOn < month.startsOn ? week.startsOn : month.startsOn,
              lte: week.endsOn > month.endsOn ? week.endsOn : month.endsOn,
            },
          },
        },
        select: {
          employeeId: true,
          calculatedHours: true,
          shift: { select: { date: true } },
        },
      }),
    ]);

    const weeklyByEmployee = new Map<string, bigint>();
    const monthlyByEmployee = new Map<string, bigint>();

    for (const assignment of assignments) {
      const shiftDate = assignment.shift.date;
      const cents = this.hoursStringToCents(assignment.calculatedHours.toString());

      if (shiftDate >= week.startsOn && shiftDate <= week.endsOn) {
        weeklyByEmployee.set(
          assignment.employeeId,
          (weeklyByEmployee.get(assignment.employeeId) ?? 0n) + cents,
        );
      }

      if (shiftDate >= month.startsOn && shiftDate <= month.endsOn) {
        monthlyByEmployee.set(
          assignment.employeeId,
          (monthlyByEmployee.get(assignment.employeeId) ?? 0n) + cents,
        );
      }
    }

    const employeesHours = employees.map((employee) => ({
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      status: employee.status,
      weeklyHours: this.centsToHoursString(weeklyByEmployee.get(employee.id) ?? 0n),
      monthlyHours: this.centsToHoursString(monthlyByEmployee.get(employee.id) ?? 0n),
    }));

    const totalWeekly = employeesHours.reduce(
      (sum, e) => sum + this.hoursStringToCents(e.weeklyHours),
      0n,
    );
    const totalMonthly = employeesHours.reduce(
      (sum, e) => sum + this.hoursStringToCents(e.monthlyHours),
      0n,
    );

    return {
      referenceDate: this.toDateOnlyIso(referenceDate),
      week: {
        startsOn: this.toDateOnlyIso(week.startsOn),
        endsOn: this.toDateOnlyIso(week.endsOn),
      },
      month: {
        startsOn: this.toDateOnlyIso(month.startsOn),
        endsOn: this.toDateOnlyIso(month.endsOn),
      },
      totals: {
        weeklyHours: this.centsToHoursString(totalWeekly),
        monthlyHours: this.centsToHoursString(totalMonthly),
      },
      employees: employeesHours,
    };
  }

  private normalizeReferenceDate(date?: string): Date {
    if (!date) return this.toUtcDateOnly(new Date());
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return this.toUtcDateOnly(new Date());
    return this.toUtcDateOnly(parsed);
  }

  private toUtcDateOnly(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  private getUtcWeekRange(referenceDate: Date): { startsOn: Date; endsOn: Date } {
    const day = referenceDate.getUTCDay();
    const distanceFromMonday = (day + 6) % 7;
    const startsOn = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate() - distanceFromMonday,
      ),
    );
    const endsOn = new Date(
      Date.UTC(
        startsOn.getUTCFullYear(),
        startsOn.getUTCMonth(),
        startsOn.getUTCDate() + 6,
      ),
    );
    return { startsOn, endsOn };
  }

  private getUtcMonthRange(referenceDate: Date): { startsOn: Date; endsOn: Date } {
    const startsOn = new Date(
      Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1),
    );
    const endsOn = new Date(
      Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 0),
    );
    return { startsOn, endsOn };
  }

  private hoursStringToCents(hours: string): bigint {
    const normalized = hours.trim();
    const negative = normalized.startsWith("-");
    const unsigned = negative ? normalized.slice(1) : normalized;
    const [intPart, decPart = ""] = unsigned.split(".");
    const cents = `${intPart || "0"}${(decPart + "00").slice(0, 2)}`;
    const parsed = BigInt(cents);
    return negative ? -parsed : parsed;
  }

  private centsToHoursString(cents: bigint): string {
    const negative = cents < 0;
    const absolute = negative ? -cents : cents;
    const intPart = absolute / 100n;
    const decPart = (absolute % 100n).toString().padStart(2, "0");
    return `${negative ? "-" : ""}${intPart.toString()}.${decPart}`;
  }

  private toDateOnlyIso(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
