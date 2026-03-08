export type ISODateString = string;
export type ISODateTimeString = string;

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface ManagerModel {
	id: string;
	googleAuthId: string;
	email: string;
	fullName: string;
	companyName: string | null;
	preferencesJson: string | null;
	createdAt: ISODateTimeString;
	updatedAt: ISODateTimeString;
}

export interface EmployeeModel {
	id: string;
	managerId: string;
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: number;
	status: EmployeeStatus;
	createdAt: ISODateTimeString;
	updatedAt: ISODateTimeString;
}

export interface ShiftModel {
	id: string;
	managerId: string;
	date: ISODateString;
	startTime: string;
	endTime: string;
	createdAt: ISODateTimeString;
	updatedAt: ISODateTimeString;
}

export interface ShiftAssignmentModel {
	id: string;
	shiftId: string;
	employeeId: string;
	calculatedHours: number;
	createdAt: ISODateTimeString;
	updatedAt: ISODateTimeString;
}

export interface LocalSyncCheckpointModel {
	id: number;
	entityType: "manager" | "employee" | "shift" | "shift_assignment";
	lastSyncedAt: ISODateTimeString | null;
	updatedAt: ISODateTimeString;
}

export interface LocalOutboxEventModel {
	id: string;
	entityType: "manager" | "employee" | "shift" | "shift_assignment";
	entityId: string;
	actionType: "create" | "update" | "delete";
	payloadJson: string;
	retryCount: number;
	createdAt: ISODateTimeString;
	updatedAt: ISODateTimeString;
}
