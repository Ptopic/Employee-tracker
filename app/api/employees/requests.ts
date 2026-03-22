import authenticatedRequest from "@/api/authenticatedRequest";
import { config } from "@/shared/config";
import type {
	EmployeeDetail,
	EmployeePayload,
	EmployeeStatsQuery,
	EmployeeStats,
	EmployeesListFilters,
	EmployeeListItem,
} from "./types";

const getEmployees = (filters: EmployeesListFilters) => {
	const query = new URLSearchParams();
	if (filters.search) query.append("search", filters.search);
	if (filters.status) query.append("status", filters.status);
	if (filters.sortBy) query.append("sortBy", filters.sortBy);
	if (filters.sortOrder) query.append("sortOrder", filters.sortOrder);

	const qs = query.toString();
	const url = `${config.apiUrl}/employees${qs ? `?${qs}` : ""}`;
	return authenticatedRequest(url, { method: "GET" }) as Promise<EmployeeListItem[] | null>;
};

const getEmployee = (employeeId: string) =>
	authenticatedRequest(`${config.apiUrl}/employees/${employeeId}`, {
		method: "GET",
	}) as Promise<EmployeeDetail | null>;

const getEmployeeStats = (employeeId: string, query?: EmployeeStatsQuery) => {
	const params = new URLSearchParams();
	if (query?.month != null) params.append("month", String(query.month));
	if (query?.year != null) params.append("year", String(query.year));
	if (query?.weekStart) params.append("weekStart", query.weekStart);
	const qs = params.toString();

	return authenticatedRequest(`${config.apiUrl}/employees/${employeeId}/stats${qs ? `?${qs}` : ""}`, {
		method: "GET",
	}) as Promise<EmployeeStats | null>;
};

const createEmployee = (payload: EmployeePayload) =>
	authenticatedRequest(`${config.apiUrl}/employees`, {
		method: "POST",
		body: JSON.stringify(payload),
	});

const updateEmployee = (employeeId: string, payload: EmployeePayload) =>
	authenticatedRequest(`${config.apiUrl}/employees/${employeeId}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});

const deactivateEmployee = (employeeId: string) =>
	authenticatedRequest(`${config.apiUrl}/employees/${employeeId}/deactivate`, {
		method: "PATCH",
	});

const deleteEmployee = (employeeId: string) =>
	authenticatedRequest(`${config.apiUrl}/employees/${employeeId}`, {
		method: "DELETE",
	});

export default {
	getEmployees,
	getEmployee,
	getEmployeeStats,
	createEmployee,
	updateEmployee,
	deactivateEmployee,
	deleteEmployee,
};
