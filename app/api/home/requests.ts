import { config } from "@/shared/config";
import authenticatedRequest from "@/api/authenticatedRequest";

const getWeeklyHours = async () => {
	return authenticatedRequest(`${config.apiUrl}/stats/weekly-hours`, {
		method: "GET",
	});
};

const getTodayEmployees = async () => {
	return authenticatedRequest(`${config.apiUrl}/stats/today-employees`, {
		method: "GET",
	});
};

const getTodayShifts = async () => {
	return authenticatedRequest(`${config.apiUrl}/shifts/today`, {
		method: "GET",
	});
};

export default {
	getWeeklyHours,
	getTodayEmployees,
	getTodayShifts,
};
