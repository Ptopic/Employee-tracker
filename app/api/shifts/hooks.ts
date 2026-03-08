import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import shiftsRequests from "./requests";
import type { ShiftPayload } from "./types";

export const SHIFTS_MONTH = "shifts-month";
export const SHIFTS_DAY = "shifts-day";
export const SHIFTS_EMPLOYEES = "shifts-employees";

export const useMonthShifts = (startDate: string, endDate: string) =>
	useQuery({
		queryKey: [SHIFTS_MONTH, startDate, endDate],
		queryFn: () => shiftsRequests.getMonthSummary(startDate, endDate),
	});

export const useDaySchedule = (date: string) =>
	useQuery({
		queryKey: [SHIFTS_DAY, date],
		queryFn: () => shiftsRequests.getDaySchedule(date),
		enabled: Boolean(date),
	});

export const useShiftEmployees = () =>
	useQuery({
		queryKey: [SHIFTS_EMPLOYEES],
		queryFn: () => shiftsRequests.getEmployees(),
	});

export const useSaveShift = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ shiftId, payload }: { shiftId?: string; payload: ShiftPayload }) =>
			shiftId
				? shiftsRequests.updateShift(shiftId, payload)
				: shiftsRequests.createShift(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_MONTH] });
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_DAY] });
		},
	});
};

export const useDeleteShift = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (shiftId: string) => shiftsRequests.deleteShift(shiftId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_MONTH] });
			await queryClient.invalidateQueries({ queryKey: [SHIFTS_DAY] });
		},
	});
};
