import { BadRequestException, Injectable } from "@nestjs/common";
import { performance } from "node:perf_hooks";
import { PrismaService } from "src/prisma/prisma.service";

type EmployeeWeek = {
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  weeklyHours: number;
  estimatedCost: number;
  dailyShifts: Record<string, string[]>;
};

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyPreview(managerId: string, weekStart: string) {
    const startedAt = performance.now();
    const data = await this.getWeeklyData(managerId, weekStart);
    return {
      ...data,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    };
  }

  async exportWeeklyPdf(managerId: string, weekStart: string) {
    const startedAt = performance.now();
    const data = await this.getWeeklyData(managerId, weekStart);

    const lines = [
      `${data.companyName}`,
      data.logoUrl ? `Logo: ${data.logoUrl}` : "Logo: Not configured",
      `Weekly Schedule Export`,
      `Week: ${data.weekStart} - ${data.weekEnd}`,
      `Generated: ${data.generatedAt}`,
      "",
    ];

    for (const employee of data.employees) {
      lines.push(`${employee.employeeName} | Rate: $${employee.hourlyRate.toFixed(2)}/h`);
      lines.push("Day     Shifts");
      for (const day of DAY_KEYS) {
        const shifts = employee.dailyShifts[day];
        lines.push(`${day.padEnd(7, " ")}${(shifts?.length ? shifts.join(", ") : "-").slice(0, 95)}`);
      }
      lines.push(
        `Weekly total: ${employee.weeklyHours.toFixed(2)}h | Estimated cost: $${employee.estimatedCost.toFixed(2)}`,
      );
      lines.push("");
    }

    lines.push(`Total weekly hours: ${data.totalHours.toFixed(2)}`);
    lines.push(`Total estimated payroll: $${data.totalCost.toFixed(2)}`);

    return {
      buffer: buildSimplePdf(lines),
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      fileName: `weekly-${data.weekStart}.pdf`,
    };
  }

  private async getWeeklyData(managerId: string, weekStart: string) {
    const start = new Date(`${weekStart}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException("Invalid weekStart date. Expected YYYY-MM-DD");
    }

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);

    const [manager, assignments] = await Promise.all([
      this.prisma.manager.findUnique({
        where: { id: managerId },
        select: { companyName: true, companyLogoUrl: true },
      }),
      this.prisma.shiftAssignment.findMany({
        where: {
          shift: {
            managerId,
            date: { gte: start, lte: end },
          },
        },
        select: {
          calculatedHours: true,
          employeeId: true,
          employee: {
            select: {
              firstName: true,
              lastName: true,
              hourlyRate: true,
            },
          },
          shift: {
            select: {
              date: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: [{ shift: { date: "asc" } }, { shift: { startTime: "asc" } }],
      }),
    ]);

    const employees = new Map<string, EmployeeWeek>();

    for (const assignment of assignments) {
      const existing = employees.get(assignment.employeeId) ?? {
        employeeId: assignment.employeeId,
        employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
        hourlyRate: Number(assignment.employee.hourlyRate),
        weeklyHours: 0,
        estimatedCost: 0,
        dailyShifts: Object.fromEntries(DAY_KEYS.map((day) => [day, []])) as Record<string, string[]>,
      };

      const hours = Number(assignment.calculatedHours);
      existing.weeklyHours += hours;
      existing.estimatedCost += hours * existing.hourlyRate;

      const day = DAY_KEYS[(assignment.shift.date.getUTCDay() + 6) % 7];
      existing.dailyShifts[day].push(
        `${toHHmm(assignment.shift.startTime)}-${toHHmm(assignment.shift.endTime)}`,
      );

      employees.set(assignment.employeeId, existing);
    }

    const employeeRows = Array.from(employees.values()).sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName),
    );

    const totalHours = employeeRows.reduce((sum, item) => sum + item.weeklyHours, 0);
    const totalCost = employeeRows.reduce((sum, item) => sum + item.estimatedCost, 0);

    return {
      companyName: manager?.companyName || "Company",
      logoUrl: manager?.companyLogoUrl || "",
      weekStart,
      weekEnd: end.toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      employees: employeeRows,
      totalHours,
      totalCost,
    };
  }
}

function toHHmm(value: Date) {
  return value.toISOString().slice(11, 16);
}

function buildSimplePdf(lines: string[]): Buffer {
  const escapedLines = lines.map((line) => escapePdfText(line));
  const chunks: string[] = [];
  let y = 780;

  for (const line of escapedLines) {
    if (y < 40) break;
    chunks.push(`1 0 0 1 40 ${y} Tm (${line}) Tj`);
    y -= 14;
  }

  const stream = `BT\n/F1 10 Tf\n${chunks.join("\n")}\nET`;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  const header = "%PDF-1.4\n";
  const offsets: number[] = [0];
  let body = "";
  let currentOffset = Buffer.byteLength(header, "utf8");

  for (const object of objects) {
    offsets.push(currentOffset);
    body += object;
    currentOffset += Buffer.byteLength(object, "utf8");
  }

  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;
  return Buffer.from(header + body + xref + trailer, "utf8");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
