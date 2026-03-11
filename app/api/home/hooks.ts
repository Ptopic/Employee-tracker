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

export const useWeeklyHours = (managerId?: string | null, date?: string) =>
	useQuery<WeeklyHoursResponse>({
		queryKey: [HOME_WEEKLY_HOURS, managerId, date],
		queryFn: () => homeRequests.getWeeklyHours(date),
		enabled: Boolean(managerId),
	});

export const useTodayEmployees = (managerId?: string | null, date?: string) =>
	useQuery<TodayEmployeesResponse>({
		queryKey: [HOME_TODAY_EMPLOYEES, managerId, date],
		queryFn: () => homeRequests.getTodayEmployees(date),
		enabled: Boolean(managerId),
	});

export const useTodayShifts = (managerId?: string | null, date?: string) =>
	useQuery<TodayShift[]>({
		queryKey: [HOME_TODAY_SHIFTS, managerId, date],
		queryFn: () => homeRequests.getTodayShifts(date),
		enabled: Boolean(managerId),
	});
