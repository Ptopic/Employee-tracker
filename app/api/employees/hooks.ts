import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SHIFTS_DAY, SHIFTS_MONTH } from "@/api/shifts/hooks";
import employeesRequests from "./requests";
import type { EmployeePayload, EmployeeStatsQuery, EmployeesListFilters } from "./types";

export const EMPLOYEES_LIST = "employees-list";
export const EMPLOYEE_DETAIL = "employee-detail";
export const EMPLOYEE_STATS = "employee-stats";

export const useEmployeesList = (filters: EmployeesListFilters) =>
	useQuery({
		queryKey: [EMPLOYEES_LIST, filters],
		queryFn: () => employeesRequests.getEmployees(filters),
	});

export const useEmployeeDetail = (employeeId?: string) =>
	useQuery({
		queryKey: [EMPLOYEE_DETAIL, employeeId],
		queryFn: () => employeesRequests.getEmployee(employeeId as string),
		enabled: Boolean(employeeId),
	});

export const useEmployeeStats = (employeeId?: string, query?: EmployeeStatsQuery) =>
	useQuery({
		queryKey: [EMPLOYEE_STATS, employeeId, query],
		queryFn: () => employeesRequests.getEmployeeStats(employeeId as string, query),
		enabled: Boolean(employeeId),
	});

export const useCreateEmployee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: EmployeePayload) => employeesRequests.createEmployee(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEES_LIST] });
		},
	});
};

export const useUpdateEmployee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ employeeId, payload }: { employeeId: string; payload: EmployeePayload }) =>
			employeesRequests.updateEmployee(employeeId, payload),
		onSuccess: async (_, { employeeId }) => {
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEES_LIST] });
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DETAIL, employeeId] });
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEE_STATS, employeeId] });
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_MONTH] });
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_DAY] });
		},
	});
};

export const useDeactivateEmployee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (employeeId: string) => employeesRequests.deactivateEmployee(employeeId),
		onSuccess: async (_, employeeId) => {
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEES_LIST] });
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DETAIL, employeeId] });
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEE_STATS, employeeId] });
		},
	});
};

export const useDeleteEmployee = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (employeeId: string) => employeesRequests.deleteEmployee(employeeId),
		onSuccess: async (_, employeeId) => {
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEES_LIST] });
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DETAIL, employeeId] });
			await queryClient.invalidateQueries({ queryKey: [EMPLOYEE_STATS, employeeId] });
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_MONTH] });
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_DAY] });
		},
	});
};
