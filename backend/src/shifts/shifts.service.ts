import { Injectable } from "@nestjs/common";
import { performance } from "node:perf_hooks";
import { PrismaService } from "../prisma/prisma.service";

type CalendarQuery = { from: Date; to: Date; managerId?: string };

const CALENDAR_CACHE_TTL_MS = 30000;

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly calendarCache = new Map<string, { expiresAt: number; response: unknown }>();

  list() {
    return this.prisma.shift.findMany({
      include: { assignments: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  async getCalendar({ from, to, managerId }: CalendarQuery) {
    const startedAt = performance.now();
    const key = `${from.toISOString()}|${to.toISOString()}|${managerId ?? "all"}`;

    const cached = this.calendarCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return { ...(cached.response as any), cached: true };
    }

    const shifts = await this.prisma.shift.findMany({
      where: { managerId, date: { gte: from, lte: to } },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        assignments: {
          select: {
            id: true,
            employeeId: true,
            employee: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const byDay = new Map<string, any[]>();
    for (const shift of shifts) {
      const date = shift.date.toISOString().slice(0, 10);
      const normalized = {
        id: shift.id,
        date,
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
        assignments: shift.assignments.map((assignment) => ({
          id: assignment.id,
          employeeId: assignment.employeeId,
          firstName: assignment.employee.firstName,
          lastName: assignment.employee.lastName,
        })),
      };
      const existing = byDay.get(date);
      if (existing) existing.push(normalized);
      else byDay.set(date, [normalized]);
    }

    const response = {
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      cached: false,
      totalShifts: shifts.length,
      days: Array.from(byDay.entries()).map(([date, dayShifts]) => ({ date, shifts: dayShifts })),
    };

    this.calendarCache.set(key, { expiresAt: Date.now() + CALENDAR_CACHE_TTL_MS, response });
    return response;
  }
}
