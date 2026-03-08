import { EmployeeStatus, Prisma } from "@prisma/client";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  UpdateEmployeeDto,
  UpdateEmployeeStatusDto,
} from "./dtos/update-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const assignmentAgg = await this.prisma.shiftAssignment.aggregate({
      where: { employeeId },
      _count: { _all: true },
      _sum: { calculatedHours: true },
    });

    const totalHours = Number(assignmentAgg._sum.calculatedHours ?? 0);
    const hourlyRate = Number(employee.hourlyRate ?? 0);

    return {
      ...employee,
      stats: {
        assignedShifts: assignmentAgg._count._all,
        totalHours,
        totalPay: Number((totalHours * hourlyRate).toFixed(2)),
      },
    };
  }

  async updateProfile(employeeId: string, data: UpdateEmployeeDto) {
    await this.ensureEmployeeExists(employeeId);

    const updateData: Prisma.EmployeeUpdateInput = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
    });
  }

  async updateStatus(employeeId: string, data: UpdateEmployeeStatusDto) {
    await this.ensureEmployeeExists(employeeId);

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { status: data.status as EmployeeStatus },
    });
  }

  private async ensureEmployeeExists(employeeId: string) {
    const existing = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Employee not found");
    }
  }
}
