import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { PrismaService } from "src/prisma/prisma.service";

type ExportWeeklyScheduleInput = {
  managerId: string;
  weekStart: Date;
};

type EmployeeShiftLine = {
  dateLabel: string;
  shiftLabel: string;
  hours: number;
};

type EmployeeSchedule = {
  employeeName: string;
  totalHours: number;
  shifts: EmployeeShiftLine[];
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportWeeklyScheduleByEmployeePdf({ managerId, weekStart }: ExportWeeklyScheduleInput) {
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    const employees = await this.prisma.employee.findMany({
      where: { managerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    const shifts = await this.prisma.shift.findMany({
      where: {
        managerId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const scheduleByEmployee = new Map<string, EmployeeSchedule>();

    for (const employee of employees) {
      scheduleByEmployee.set(employee.id, {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        totalHours: 0,
        shifts: [],
      });
    }

    for (const shift of shifts) {
      for (const assignment of shift.assignments) {
        const current = scheduleByEmployee.get(assignment.employee.id);
        if (!current) {
          continue;
        }

        const hours = Number(assignment.calculatedHours);
        current.totalHours += Number.isFinite(hours) ? hours : 0;
        current.shifts.push({
          dateLabel: this.formatDate(shift.date),
          shiftLabel: `${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}`,
          hours,
        });
      }
    }

    const employeeSchedules = Array.from(scheduleByEmployee.values());
    const filename = `weekly-schedule-by-employee-${this.formatFileDate(weekStart)}.pdf`;

    const buffer = await this.renderWeeklySchedulePdf({
      weekStart,
      weekEnd,
      employeeSchedules,
    });

    return { buffer, filename };
  }

  private async renderWeeklySchedulePdf({
    weekStart,
    weekEnd,
    employeeSchedules,
  }: {
    weekStart: Date;
    weekEnd: Date;
    employeeSchedules: EmployeeSchedule[];
  }) {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(18).text("Weekly Schedule by Employee", { align: "left" });
    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#555")
      .text(`${this.formatDate(weekStart)} - ${this.formatDate(new Date(weekEnd.getTime() - 1))}`)
      .fillColor("#000");

    doc.moveDown();

    for (const schedule of employeeSchedules) {
      this.ensurePageSpace(doc, 90);
      doc.fontSize(13).text(schedule.employeeName, { underline: true });
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(`Total hours: ${schedule.totalHours.toFixed(2)}`)
        .fillColor("#000");

      if (!schedule.shifts.length) {
        doc.fontSize(10).text("No assigned shifts this week.");
        doc.moveDown();
        continue;
      }

      doc.moveDown(0.2);

      for (const shift of schedule.shifts) {
        this.ensurePageSpace(doc, 30);
        doc
          .fontSize(10)
          .text(`• ${shift.dateLabel} | ${shift.shiftLabel} | ${shift.hours.toFixed(2)}h`);
      }

      doc.moveDown();
    }

    if (!employeeSchedules.length) {
      doc.fontSize(11).text("No employees found for this manager.");
    }

    doc.end();

    return finished;
  }

  private ensurePageSpace(doc: PDFKit.PDFDocument, minRemainingHeight: number) {
    if (doc.page.height - doc.y <= minRemainingHeight) {
      doc.addPage();
    }
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date);
  }

  private formatFileDate(date: Date) {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

  private formatTime(time: Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(time);
  }
}
