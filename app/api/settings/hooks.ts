import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import requests from "./requests";
import type { CompanySettings, PreferencesSettings } from "./types";

export const SETTINGS_COMPANY = "settings-company";
export const SETTINGS_PREFERENCES = "settings-preferences";

export const useCompanySettings = () =>
	useQuery({
		queryKey: [SETTINGS_COMPANY],
		queryFn: () => requests.getCompanySettings(),
	});

export const usePreferencesSettings = () =>
	useQuery({
		queryKey: [SETTINGS_PREFERENCES],
		queryFn: () => requests.getPreferences(),
	});

export const useSaveCompanySettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CompanySettings) => requests.updateCompanySettings(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: [SETTINGS_COMPANY] });
		},
	});
};

export const useSavePreferences = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: PreferencesSettings) => requests.updatePreferences(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: [SETTINGS_PREFERENCES] });
		},
	});
};

export const useUploadLogo = () =>
	useMutation({
		mutationFn: (base64DataUri: string) => requests.uploadLogo(base64DataUri),
	});
