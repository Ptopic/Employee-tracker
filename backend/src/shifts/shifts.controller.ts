import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ShiftsService } from "./shifts.service";

@Controller("shifts")
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  list() {
    return this.shiftsService.list();
  }

  @Get("calendar")
  calendar(@Query("from") from: string, @Query("to") to: string, @Query("managerId") managerId?: string) {
    if (!from || !to) {
      throw new BadRequestException("Both 'from' and 'to' query parameters are required");
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException("Invalid date range. Use ISO-8601 date values.");
    }

    if (fromDate > toDate) {
      throw new BadRequestException("'from' date must be <= 'to' date");
    }

    return this.shiftsService.getCalendar({ from: fromDate, to: toDate, managerId });
  }
}
