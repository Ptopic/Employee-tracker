export type EmployeePreview = {
	employeeId: string;
	employeeName: string;
	hourlyRate: number;
	weeklyHours: number;
	estimatedCost: number;
	dailyShifts: Record<string, string[]>;
};

export type WeeklyExportPreview = {
	companyName: string;
	logoUrl: string;
	weekStart: string;
	weekEnd: string;
	generatedAt: string;
	employees: EmployeePreview[];
	totalHours: number;
	totalCost: number;
	durationMs: number;
};

export type WeeklyExportFile = {
	fileName: string;
	mimeType: string;
	base64: string;
	fileSize: number;
	durationMs?: number;
};
