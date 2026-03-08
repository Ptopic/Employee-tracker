import { useEffect } from "react";
import { usePreferencesSettings } from "@/api/settings/hooks";
import { usePreferencesState } from "./preferences-state";

export function PreferencesBootstrap() {
	const { setPreferences } = usePreferencesState();
	const preferencesQuery = usePreferencesSettings();

	useEffect(() => {
		if (preferencesQuery.data) {
			setPreferences(preferencesQuery.data);
		}
	}, [preferencesQuery.data, setPreferences]);

	return null;
}
