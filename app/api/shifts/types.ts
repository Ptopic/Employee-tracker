export type ShiftEmployee = {
	id: string;
	firstName: string;
	lastName: string;
};

export type ShiftAssignment = {
	id: string;
	employeeId: string;
	employee: ShiftEmployee;
};

export type Shift = {
	id: string;
	date: string;
	startTime: string | null;
	endTime: string | null;
	isDayOff: boolean;
	assignments: ShiftAssignment[];
};

export type DayScheduleResponse = {
	date: string;
	shifts: Shift[];
};

export type CalendarDaySummary = {
	date: string;
	shiftCount: number;
	employeeCount: number;
	staffingStatus: "full" | "partial" | "none";
};

export type ValidateOverlapResponse = {
	valid: boolean;
	conflicts: Array<{
		employeeId: string;
		shiftId: string;
	}>;
};

export type ValidateEmployeesResponse = {
	valid: boolean;
	conflictingEmployeeIds: string[];
};

export type ShiftPayload = {
	date: string;
	isDayOff?: boolean;
	startTime?: string;
	endTime?: string;
	employeeIds: string[];
};

export type EmployeeOption = {
	id: string;
	firstName: string;
	lastName: string;
};
