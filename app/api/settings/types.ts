export type TimeFormat = "12h" | "24h";
export type FirstDayOfWeek = "Sunday" | "Monday";

export type CompanySettings = {
	companyName: string;
	logoUrl: string;
};

export type PreferencesSettings = {
	timeFormat: TimeFormat;
	firstDayOfWeek: FirstDayOfWeek;
};
