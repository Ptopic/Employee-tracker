import { config } from "@/shared/config";
import authenticatedRequest from "@/api/authenticatedRequest";

const getWeeklyHours = async (date?: string) => {
	const query = date ? `?date=${encodeURIComponent(date)}` : "";
	return authenticatedRequest(`${config.apiUrl}/stats/weekly-hours${query}`, {
		method: "GET",
	});
};

const getTodayEmployees = async (date?: string) => {
	const query = date ? `?date=${encodeURIComponent(date)}` : "";
	return authenticatedRequest(`${config.apiUrl}/stats/today-employees${query}`, {
		method: "GET",
	});
};

const getTodayShifts = async (date?: string) => {
	const query = date ? `?date=${encodeURIComponent(date)}` : "";
	return authenticatedRequest(`${config.apiUrl}/shifts/today${query}`, {
		method: "GET",
	});
};

export default {
	getWeeklyHours,
	getTodayEmployees,
	getTodayShifts,
};
