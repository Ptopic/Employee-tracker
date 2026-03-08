import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { FirstDayOfWeek, TimeFormat } from "@/api/settings/types";

type PreferencesState = {
	timeFormat: TimeFormat;
	firstDayOfWeek: FirstDayOfWeek;
	setTimeFormat: (timeFormat: TimeFormat) => void;
	setFirstDayOfWeek: (firstDayOfWeek: FirstDayOfWeek) => void;
	setPreferences: (value: {
		timeFormat: TimeFormat;
		firstDayOfWeek: FirstDayOfWeek;
	}) => void;
};

const PreferencesContext = createContext<PreferencesState | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
	const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
	const [firstDayOfWeek, setFirstDayOfWeek] = useState<FirstDayOfWeek>("Monday");

	const value = useMemo(
		() => ({
			timeFormat,
			firstDayOfWeek,
			setTimeFormat,
			setFirstDayOfWeek,
			setPreferences: (next: {
				timeFormat: TimeFormat;
				firstDayOfWeek: FirstDayOfWeek;
			}) => {
				setTimeFormat(next.timeFormat);
				setFirstDayOfWeek(next.firstDayOfWeek);
			},
		}),
		[timeFormat, firstDayOfWeek],
	);

	return (
		<PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
	);
}

export function usePreferencesState() {
	const context = useContext(PreferencesContext);
	if (!context) {
		throw new Error("usePreferencesState must be used within PreferencesProvider");
	}
	return context;
}
