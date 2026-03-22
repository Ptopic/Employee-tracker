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

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_LABELS: Record<(typeof DAY_KEYS)[number], string> = {
  Mon: "Ponedjeljak",
  Tue: "Utorak",
  Wed: "Srijeda",
  Thu: "Cetvrtak",
  Fri: "Petak",
  Sat: "Subota",
  Sun: "Nedjelja",
};

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

    return {
      buffer: buildLandscapeSchedulePdf(data),
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

    const [manager, assignments, employeesList] = await Promise.all([
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
          shift: {
            select: {
              date: true,
              isDayOff: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: [{ shift: { date: "asc" } }, { shift: { startTime: "asc" } }],
      }),
      this.prisma.employee.findMany({
        where: { managerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          hourlyRate: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

    const employees = new Map<string, EmployeeWeek>();

    for (const employee of employeesList) {
      employees.set(employee.id, {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
        hourlyRate: Number(employee.hourlyRate),
        weeklyHours: 0,
        estimatedCost: 0,
        dailyShifts: Object.fromEntries(DAY_KEYS.map((day) => [day, []])) as Record<string, string[]>,
      });
    }

    for (const assignment of assignments) {
      const existing = employees.get(assignment.employeeId);
      if (!existing) continue;

      const day = DAY_KEYS[(assignment.shift.date.getUTCDay() + 6) % 7];
      if (assignment.shift.isDayOff) {
        existing.dailyShifts[day].push("Slobodan dan");
        continue;
      }

      const hours = Number(assignment.calculatedHours);
      existing.weeklyHours += hours;
      existing.estimatedCost += hours * existing.hourlyRate;

      existing.dailyShifts[day].push(
        `${toHHmm(assignment.shift.startTime)}-${toHHmm(assignment.shift.endTime)}`,
      );
    }

    const employeeRows = Array.from(employees.values()).sort((a, b) =>
      a.employeeName.localeCompare(b.employeeName),
    );

    const totalHours = employeeRows.reduce((sum, item) => sum + item.weeklyHours, 0);
    const totalCost = employeeRows.reduce((sum, item) => sum + item.estimatedCost, 0);

    const weekDates = Object.fromEntries(
      DAY_KEYS.map((day, index) => {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + index);
        return [day, date.toISOString().slice(0, 10)];
      }),
    ) as Record<string, string>;

    return {
      companyName: manager?.companyName || "Tvrtka",
      logoUrl: manager?.companyLogoUrl || "",
      weekStart,
      weekEnd: end.toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      weekDates,
      employees: employeeRows,
      totalHours,
      totalCost,
    };
  }
}

function toHHmm(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(11, 16);
}

function buildLandscapeSchedulePdf(data: {
  companyName: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  weekDates: Record<string, string>;
  employees: EmployeeWeek[];
  totalHours: number;
  totalCost: number;
}) {
  const pageWidth = 842;
  const pageHeight = 595;
  const marginX = 24;
  const marginBottom = 24;
  const tableTopY = pageHeight - 110;
  const headerHeight = 36;
  const rowHeight = 22;
  const employeeColWidth = 170;
  const tableWidth = pageWidth - marginX * 2;
  const dayColWidth = (tableWidth - employeeColWidth) / 7;
  const maxRows = Math.max(1, Math.floor((tableTopY - marginBottom - headerHeight - 38) / rowHeight));
  const visibleEmployees = data.employees.slice(0, maxRows);

  const drawCommands: string[] = [];

  const pushText = (
    x: number,
    y: number,
    text: string,
    opts: { size?: number; bold?: boolean; align?: "left" | "center" } = {},
  ) => {
    const size = opts.size ?? 9;
    const font = opts.bold ? "F2" : "F1";
    const safe = escapePdfText(text);
    const widthApprox = text.length * size * 0.48;
    const tx = opts.align === "center" ? x - widthApprox / 2 : x;
    drawCommands.push(`BT 0 0 0 rg /${font} ${size} Tf 1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm (${safe}) Tj ET`);
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    opts: { fill?: string; stroke?: string; lineWidth?: number } = {},
  ) => {
    if (opts.fill) {
      drawCommands.push(`${opts.fill} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    }
    if (opts.stroke) {
      const lw = opts.lineWidth ?? 0.6;
      drawCommands.push(`${opts.stroke} RG ${lw} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
    }
  };

  pushText(marginX, pageHeight - 36, "Tjedni raspored", {
    size: 14,
    bold: true,
  });
  pushText(marginX, pageHeight - 54, `Tjedan: ${formatDateLabel(data.weekStart)} - ${formatDateLabel(data.weekEnd)}`, {
    size: 10,
  });
  pushText(marginX, pageHeight - 70, `Generirano: ${data.generatedAt.slice(0, 16).replace("T", " ")}`, {
    size: 8,
  });

  const tableBottomY = tableTopY - headerHeight - visibleEmployees.length * rowHeight;

  drawRect(marginX, tableTopY - headerHeight, tableWidth, headerHeight, {
    fill: "0.914 0.961 1",
    stroke: "0.82 0.82 0.82",
    lineWidth: 0.6,
  });

  drawRect(marginX, tableBottomY, tableWidth, visibleEmployees.length * rowHeight, {
    stroke: "0.82 0.82 0.82",
    lineWidth: 0.6,
  });

  for (let i = 0; i <= 8; i += 1) {
    const x = marginX + (i === 0 ? 0 : employeeColWidth + (i - 1) * dayColWidth);
    drawCommands.push(`0.82 0.82 0.82 RG 0.6 w ${x.toFixed(2)} ${tableBottomY.toFixed(2)} m ${x.toFixed(2)} ${tableTopY.toFixed(2)} l S`);
  }

  for (let i = 0; i <= visibleEmployees.length; i += 1) {
    const y = tableTopY - headerHeight - i * rowHeight;
    drawCommands.push(`0.86 0.86 0.86 RG 0.5 w ${marginX.toFixed(2)} ${y.toFixed(2)} m ${(marginX + tableWidth).toFixed(2)} ${y.toFixed(2)} l S`);
  }

  pushText(marginX + 8, tableTopY - 22, "Ime zaposlenika", { size: 9, bold: true });

  DAY_KEYS.forEach((day, index) => {
    const centerX = marginX + employeeColWidth + index * dayColWidth + dayColWidth / 2;
    pushText(centerX, tableTopY - 14, DAY_LABELS[day], {
      size: 8,
      bold: true,
      align: "center",
    });
    pushText(centerX, tableTopY - 27, formatDateLabel(data.weekDates[day]), {
      size: 7,
      align: "center",
    });
  });

  visibleEmployees.forEach((employee, rowIndex) => {
    const yBase = tableTopY - headerHeight - rowIndex * rowHeight;
    pushText(marginX + 8, yBase - 14, truncate(employee.employeeName, 28), { size: 8 });

    DAY_KEYS.forEach((day, dayIndex) => {
      const text = employee.dailyShifts[day]?.length
        ? employee.dailyShifts[day].join(", ")
        : "-";
      const x = marginX + employeeColWidth + dayIndex * dayColWidth + 4;
      pushText(x, yBase - 14, truncate(text, 22), { size: 7 });
    });
  });

  const footerY = tableBottomY - 20;
  if (data.employees.length > visibleEmployees.length) {
    pushText(marginX, footerY, `Prikazano ${visibleEmployees.length}/${data.employees.length} zaposlenika na jednoj stranici`, {
      size: 8,
    });
  }

  const stream = drawCommands.join("\n");
  return buildPdfWithSinglePage(stream, pageWidth, pageHeight);
}

function buildPdfWithSinglePage(stream: string, pageWidth: number, pageHeight: number): Buffer {
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    `6 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`,
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

function formatDateLabel(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}.${month}.${year}`;
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1))}…`;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
