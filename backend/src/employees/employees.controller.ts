import { Controller, Get, Query } from "@nestjs/common";
import { EmployeesService } from "./employees.service";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list() {
    return this.employeesService.list();
  }

  @Get("hours-totals")
  hoursTotals(@Query("date") date?: string) {
    return this.employeesService.getDeterministicHoursTotals(date);
  }
}
