import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type AppState = {
	selectedManagerId: string | null;
	setSelectedManagerId: (managerId: string | null) => void;
	selectedCalendarDate: string | null;
	setSelectedCalendarDate: (date: string | null) => void;
	selectedHomeDate: string | null;
	setSelectedHomeDate: (date: string | null) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
	const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
	const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
	const [selectedHomeDate, setSelectedHomeDate] = useState<string | null>(null);

	const value = useMemo(
		() => ({
			selectedManagerId,
			setSelectedManagerId,
			selectedCalendarDate,
			setSelectedCalendarDate,
			selectedHomeDate,
			setSelectedHomeDate,
		}),
		[selectedManagerId, selectedCalendarDate, selectedHomeDate],
	);

	return (
		<AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
	);
}

export function useAppState() {
	const context = useContext(AppStateContext);

	if (!context) {
		throw new Error("useAppState must be used within AppStateProvider");
	}

	return context;
}
