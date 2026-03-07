import { Controller, Get } from "@nestjs/common";
import { ShiftAssignmentsService } from "./shift-assignments.service";

@Controller("shift-assignments")
export class ShiftAssignmentsController {
  constructor(
    private readonly shiftAssignmentsService: ShiftAssignmentsService,
  ) {}

  @Get()
  list() {
    return this.shiftAssignmentsService.list();
  }
}
