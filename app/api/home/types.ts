export type WeeklyHoursResponse = {
	totalHours: number;
	weekStart: string;
	weekEnd: string;
};

export type TodayEmployeesResponse = {
	count: number;
	date: string;
};

export type ShiftEmployee = {
	id: string;
	firstName: string;
	lastName: string;
};

export type ShiftAssignment = {
	id: string;
	employeeId: string;
	calculatedHours: string;
	employee: ShiftEmployee;
};

export type TodayShift = {
	id: string;
	date: string;
	startTime: string | null;
	endTime: string | null;
	isDayOff: boolean;
	assignments: ShiftAssignment[];
};
