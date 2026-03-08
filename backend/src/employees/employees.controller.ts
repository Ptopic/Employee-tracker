import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import {
  UpdateEmployeeDto,
  UpdateEmployeeStatusDto,
} from "./dtos/update-employee.dto";
import { EmployeesService } from "./employees.service";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list() {
    return this.employeesService.list();
  }

  @Get(":employeeId")
  getById(@Param("employeeId") employeeId: string) {
    return this.employeesService.getById(employeeId);
  }

  @Patch(":employeeId")
  updateProfile(
    @Param("employeeId") employeeId: string,
    @Body() data: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateProfile(employeeId, data);
  }

  @Patch(":employeeId/status")
  updateStatus(
    @Param("employeeId") employeeId: string,
    @Body() data: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(employeeId, data);
  }
}
