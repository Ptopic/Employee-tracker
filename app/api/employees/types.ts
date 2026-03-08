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
};

export type EmployeeDetail = {
	id: string;
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: number;
	status: EmployeeStatus;
};

export type EmployeePayload = {
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: number;
	status: EmployeeStatus;
};

export type EmployeesListFilters = {
	search?: string;
	status?: EmployeeStatus;
	sortBy?: "name" | "hourlyRate" | "monthlyHours" | "status";
	sortOrder?: "asc" | "desc";
};
