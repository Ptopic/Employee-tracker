import { Controller, Get, Header, Query, Req, Res } from "@nestjs/common";
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
  @Header("Content-Type", "application/pdf")
  async exportWeeklyPdf(
    @Req() req: Request,
    @Query("weekStart") weekStart: string,
    @Res() response: Response,
  ) {
    const result = await this.exportService.exportWeeklyPdf(req.user.userId, weekStart);
    response.setHeader("X-Export-Duration-Ms", String(result.durationMs));
    response.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    Readable.from(result.buffer).pipe(response);
  }
}
