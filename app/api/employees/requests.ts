import { config } from "@/shared/config";
import type {
	EmployeeStatus,
	IEmployee,
	IEmployeeDetails,
	IUpdateEmployeePayload,
} from "./types";

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...(options?.headers || {}),
		},
		...options,
	});

	if (!response.ok) {
		throw new Error("Request failed");
	}

	return response.json();
};

const list = () => request<IEmployee[]>(`${config.apiUrl}/employees`);

const getById = (employeeId: string) =>
	request<IEmployeeDetails>(`${config.apiUrl}/employees/${employeeId}`);

const update = (employeeId: string, data: IUpdateEmployeePayload) =>
	request<IEmployee>(`${config.apiUrl}/employees/${employeeId}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});

const updateStatus = (employeeId: string, status: EmployeeStatus) =>
	request<IEmployee>(`${config.apiUrl}/employees/${employeeId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});

export default {
	list,
	getById,
	update,
	updateStatus,
};
