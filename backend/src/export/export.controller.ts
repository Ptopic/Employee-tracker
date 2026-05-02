import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Readable } from "node:stream";
import { JwtAuth } from "src/auth/decorators/jwt-auth.decorator";
import { ExportService } from "./export.service";

@Controller("exports")
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get("weekly-preview")
  @JwtAuth()
  getWeeklyPreview(@Req() req: Request, @Query("weekStart") weekStart: string) {
    return this.exportService.getWeeklyPreview(req.user.userId, weekStart);
  }

  @Get("weekly-pdf")
  @JwtAuth()
  async exportWeeklyPdf(
    @Req() req: Request,
    @Query("weekStart") weekStart: string,
    @Res() response: Response,
  ) {
    const result = await this.exportService.exportWeeklyPdf(req.user.userId, weekStart);
    const safeFileName = result.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("X-Export-Duration-Ms", String(result.durationMs));
    response.setHeader("Content-Disposition", `attachment; filename="${safeFileName}"`);
    Readable.from(result.buffer).pipe(response);
  }
}
