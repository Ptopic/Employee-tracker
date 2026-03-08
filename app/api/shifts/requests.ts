import authenticatedRequest from "@/api/authenticatedRequest";
import { config } from "@/shared/config";
import type {
	CalendarDaySummary,
	DayScheduleResponse,
	EmployeeOption,
	Shift,
	ShiftPayload,
	ValidateEmployeesResponse,
	ValidateOverlapResponse,
} from "./types";

const getMonthSummary = (startDate: string, endDate: string) =>
	authenticatedRequest(
		`${config.apiUrl}/shifts?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
		{ method: "GET" },
	) as Promise<Shift[]>;

const getDaySchedule = (date: string) =>
	authenticatedRequest(`${config.apiUrl}/schedule/day/${date}`, {
		method: "GET",
	}) as Promise<DayScheduleResponse | null>;

const getEmployees = () =>
	authenticatedRequest(`${config.apiUrl}/employees`, {
		method: "GET",
	}) as Promise<EmployeeOption[] | null>;

const createShift = (payload: ShiftPayload) =>
	authenticatedRequest(`${config.apiUrl}/shifts`, {
		method: "POST",
		body: JSON.stringify(payload),
	});

const updateShift = (shiftId: string, payload: ShiftPayload) =>
	authenticatedRequest(`${config.apiUrl}/shifts/${shiftId}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});

const deleteShift = (shiftId: string) =>
	authenticatedRequest(`${config.apiUrl}/shifts/${shiftId}`, {
		method: "DELETE",
	});

const validateOverlap = (payload: ShiftPayload & { shiftId?: string }) =>
	authenticatedRequest(`${config.apiUrl}/shifts/validate-overlap`, {
		method: "POST",
		body: JSON.stringify(payload),
	}) as Promise<ValidateOverlapResponse | null>;

const validateEmployees = (payload: ShiftPayload & { shiftId?: string }) =>
	authenticatedRequest(`${config.apiUrl}/shifts/validate-employees`, {
		method: "POST",
		body: JSON.stringify(payload),
	}) as Promise<ValidateEmployeesResponse | null>;

const buildCalendarSummary = (
	shifts: Shift[] | null,
	monthStart: Date,
	monthEnd: Date,
): CalendarDaySummary[] => {
	const byDate = new Map<string, Shift[]>();
	(shifts || []).forEach((shift) => {
		const key = shift.date.slice(0, 10);
		const list = byDate.get(key) ?? [];
		list.push(shift);
		byDate.set(key, list);
	});

	const result: CalendarDaySummary[] = [];
	for (
		let d = new Date(monthStart);
		d <= monthEnd;
		d.setDate(d.getDate() + 1)
	) {
		const key = d.toISOString().slice(0, 10);
		const dayShifts = byDate.get(key) ?? [];
		const employeeIds = new Set<string>();
		let allAssigned = dayShifts.length > 0;

		for (const shift of dayShifts) {
			if (!shift.assignments.length) {
				allAssigned = false;
			}
			for (const assignment of shift.assignments) {
				employeeIds.add(assignment.employeeId);
			}
		}

		const staffingStatus: CalendarDaySummary["staffingStatus"] =
			dayShifts.length === 0
				? "none"
				: allAssigned
					? "full"
					: "partial";

		result.push({
			date: key,
			shiftCount: dayShifts.length,
			employeeCount: employeeIds.size,
			staffingStatus,
		});
	}

	return result;
};

export default {
	getMonthSummary,
	getDaySchedule,
	getEmployees,
	createShift,
	updateShift,
	deleteShift,
	validateOverlap,
	validateEmployees,
	buildCalendarSummary,
};
