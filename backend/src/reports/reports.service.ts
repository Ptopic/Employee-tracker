import { Injectable } from "@nestjs/common";
import { performance } from "node:perf_hooks";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportPayrollPdf({ from, to, managerId }: { from: Date; to: Date; managerId: string }) {
    const startedAt = performance.now();
    const assignments = await this.prisma.shiftAssignment.findMany({
      where: { shift: { managerId, date: { gte: from, lte: to } } },
      select: {
        calculatedHours: true,
        employee: { select: { firstName: true, lastName: true, hourlyRate: true } },
      },
    });

    const totals = new Map<string, { name: string; hours: number; amount: number }>();
    for (const assignment of assignments) {
      const name = `${assignment.employee.firstName} ${assignment.employee.lastName}`;
      const key = name.toLowerCase();
      const hours = Number(assignment.calculatedHours);
      const rate = Number(assignment.employee.hourlyRate);
      const current = totals.get(key);
      if (current) {
        current.hours += hours;
        current.amount += hours * rate;
      } else {
        totals.set(key, { name, hours, amount: hours * rate });
      }
    }

    const rows = Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
    const totalHours = rows.reduce((sum, row) => sum + row.hours, 0);
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

    const lines = [
      "Employee Tracker - Payroll Report",
      `Range: ${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`,
      "",
      ...rows.map((row) => `${row.name}: ${row.hours.toFixed(2)}h - $${row.amount.toFixed(2)}`),
      "",
      `Total hours: ${totalHours.toFixed(2)}`,
      `Total payroll: $${totalAmount.toFixed(2)}`,
    ];

    return {
      buffer: buildSimplePdf(lines),
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      fileName: `payroll-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.pdf`,
    };
  }
}

function buildSimplePdf(lines: string[]): Buffer {
  const escapedLines = lines.map((line) => escapePdfText(line));
  const textBody = escapedLines
    .map((line, index) => `1 0 0 1 50 ${770 - index * 16} Tm (${line}) Tj`)
    .join("\n");
  const stream = `BT\n/F1 12 Tf\n${textBody}\nET`;

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
