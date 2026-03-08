import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type AppState = {
	selectedManagerId: string | null;
	setSelectedManagerId: (managerId: string | null) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
	const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

	const value = useMemo(
		() => ({
			selectedManagerId,
			setSelectedManagerId,
		}),
		[selectedManagerId],
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
