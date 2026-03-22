export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export type EmployeeListItem = {
	id: string;
	firstName: string;
	lastName: string;
	hourlyRate: number;
	monthlyHours: number;
	status: EmployeeStatus;
};

export type EmployeeStats = {
	weeklyHours: number;
	monthlyHours: number;
	estimatedMonthlyCost: number;
	selectedMonth: {
		month: number;
		year: number;
	};
	selectedWeek: {
		weekStart: string;
		weekEnd: string;
	};
	weeklyBreakdown: Array<{
		date: string;
		hours: number;
		isDayOff: boolean;
	}>;
};

export type EmployeeStatsQuery = {
	month?: number;
	year?: number;
	weekStart?: string;
};

export type EmployeeDetail = {
	id: string;
	firstName: string;
	lastName: string;
	age?: number | null;
	hourlyRate: number;
	status: EmployeeStatus;
};

export type EmployeePayload = {
	firstName: string;
	lastName: string;
	age?: number;
	hourlyRate: number;
	status: EmployeeStatus;
};

export type EmployeesListFilters = {
	search?: string;
	status?: EmployeeStatus;
	sortBy?: "name" | "hourlyRate" | "monthlyHours" | "status";
	sortOrder?: "asc" | "desc";
};
