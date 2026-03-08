import { BadRequestException, Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("weekly-schedule/pdf")
  async exportWeeklyScheduleByEmployeePdf(
    @Query("managerId") managerId: string,
    @Query("weekStart") weekStart: string,
    @Res() res: Response,
  ) {
    if (!managerId) {
      throw new BadRequestException("managerId is required");
    }

    const parsedWeekStart = this.parseWeekStart(weekStart);

    const { buffer, filename } = await this.reportsService.exportWeeklyScheduleByEmployeePdf({
      managerId,
      weekStart: parsedWeekStart,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Content-Length": buffer.length.toString(),
    });

    return res.send(buffer);
  }

  private parseWeekStart(weekStart?: string): Date {
    if (!weekStart) {
      return this.startOfWeekUtc(new Date());
    }

    const parsed = new Date(weekStart);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("weekStart must be a valid date (YYYY-MM-DD)");
    }

    return this.startOfWeekUtc(parsed);
  }

  private startOfWeekUtc(date: Date): Date {
    const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = normalized.getUTCDay();
    const offsetToMonday = day === 0 ? -6 : 1 - day;

    normalized.setUTCDate(normalized.getUTCDate() + offsetToMonday);

    return normalized;
  }
}
