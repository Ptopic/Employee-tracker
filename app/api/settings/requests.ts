import { config } from "@/shared/config";
import authenticatedRequest from "../authenticatedRequest";
import type { CompanySettings, PreferencesSettings } from "./types";

const getCompanySettings = () =>
	authenticatedRequest(`${config.apiUrl}/settings/company`, {
		method: "GET",
	}) as Promise<CompanySettings | null>;

const updateCompanySettings = (payload: CompanySettings) =>
	authenticatedRequest(`${config.apiUrl}/settings/company`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	}) as Promise<CompanySettings | null>;

const getPreferences = () =>
	authenticatedRequest(`${config.apiUrl}/settings/preferences`, {
		method: "GET",
	}) as Promise<PreferencesSettings | null>;

const updatePreferences = (payload: PreferencesSettings) =>
	authenticatedRequest(`${config.apiUrl}/settings/preferences`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	}) as Promise<PreferencesSettings | null>;

const uploadLogo = (base64DataUri: string) =>
	authenticatedRequest(`${config.apiUrl}/settings/logo-upload`, {
		method: "POST",
		body: JSON.stringify({ logo: base64DataUri }),
	}) as Promise<{ url: string } | null>;

export default {
	getCompanySettings,
	updateCompanySettings,
	getPreferences,
	updatePreferences,
	uploadLogo,
};
