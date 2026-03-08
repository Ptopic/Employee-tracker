export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface IEmployee {
	id: string;
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: string;
	status: EmployeeStatus;
}

export interface IEmployeeDetails extends IEmployee {
	stats: {
		assignedShifts: number;
		totalHours: number;
		totalPay: number;
	};
}

export interface IUpdateEmployeePayload {
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: number;
}
