import { useQuery } from "@tanstack/react-query";
import type {
	TodayEmployeesResponse,
	TodayShift,
	WeeklyHoursResponse,
} from "./types";
import homeRequests from "./requests";

export const HOME_WEEKLY_HOURS = "home-weekly-hours";
export const HOME_TODAY_EMPLOYEES = "home-today-employees";
export const HOME_TODAY_SHIFTS = "home-today-shifts";

export const useWeeklyHours = (managerId?: string | null) =>
	useQuery<WeeklyHoursResponse>({
		queryKey: [HOME_WEEKLY_HOURS, managerId],
		queryFn: () => homeRequests.getWeeklyHours(),
		enabled: Boolean(managerId),
	});

export const useTodayEmployees = (managerId?: string | null) =>
	useQuery<TodayEmployeesResponse>({
		queryKey: [HOME_TODAY_EMPLOYEES, managerId],
		queryFn: () => homeRequests.getTodayEmployees(),
		enabled: Boolean(managerId),
	});

export const useTodayShifts = (managerId?: string | null) =>
	useQuery<TodayShift[]>({
		queryKey: [HOME_TODAY_SHIFTS, managerId],
		queryFn: () => homeRequests.getTodayShifts(),
		enabled: Boolean(managerId),
	});
