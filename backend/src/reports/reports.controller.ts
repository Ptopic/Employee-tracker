import { BadRequestException, Controller, Get, Header, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("payroll.pdf")
  @Header("Content-Type", "application/pdf")
  async exportPayrollPdf(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("managerId") managerId: string,
    @Res() response: Response,
  ) {
    if (!from || !to || !managerId) {
      throw new BadRequestException("'from', 'to', and 'managerId' are required query parameters");
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException("Invalid date range. Use ISO-8601 date values.");
    }

    if (fromDate > toDate) {
      throw new BadRequestException("'from' date must be <= 'to' date");
    }

    const result = await this.reportsService.exportPayrollPdf({ from: fromDate, to: toDate, managerId });

    response.setHeader("X-Export-Duration-Ms", String(result.durationMs));
    response.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    response.send(result.buffer);
  }
}
