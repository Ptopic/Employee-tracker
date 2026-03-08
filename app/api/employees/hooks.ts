import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import employeesRequests from "./requests";
import type {
	EmployeeStatus,
	IEmployeeDetails,
	IUpdateEmployeePayload,
} from "./types";

export const employeeKeys = {
	all: ["employees"] as const,
	detail: (employeeId: string) => ["employees", employeeId] as const,
};

export const useEmployees = () => {
	return useQuery({
		queryKey: employeeKeys.all,
		queryFn: employeesRequests.list,
	});
};

export const useEmployee = (employeeId: string) => {
	return useQuery({
		queryKey: employeeKeys.detail(employeeId),
		queryFn: () => employeesRequests.getById(employeeId),
		enabled: !!employeeId,
	});
};

export const useUpdateEmployee = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: IUpdateEmployeePayload) =>
			employeesRequests.update(employeeId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) });
		},
	});
};

export const useUpdateEmployeeStatus = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (status: EmployeeStatus) =>
			employeesRequests.updateStatus(employeeId, status),
		onSuccess: (_, status) => {
			queryClient.setQueryData<IEmployeeDetails | undefined>(
				employeeKeys.detail(employeeId),
				(current) =>
					current
						? {
								...current,
								status,
						  }
						: current,
			);
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};
