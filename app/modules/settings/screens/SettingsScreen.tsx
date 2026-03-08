import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import authRequests from "@/api/auth/requests";
import {
	useCompanySettings,
	usePreferencesSettings,
	useSaveCompanySettings,
	useSavePreferences,
	useUploadLogo,
} from "@/api/settings/hooks";
import Text from "@/components/Text";
import { ExportPanel } from "@/modules/export/components/ExportPanel";
import { clearSessionTokens } from "@/shared/auth";
import { usePreferencesState } from "@/shared/state/preferences-state";
import { LogoUploadField } from "../components/LogoUploadField";
import { OptionSelector } from "../components/OptionSelector";
import { SettingsSection } from "../components/SettingsSection";

export function SettingsScreen() {
	const queryClient = useQueryClient();
	const companyQuery = useCompanySettings();
	const preferencesQuery = usePreferencesSettings();
	const saveCompany = useSaveCompanySettings();
	const savePreferences = useSavePreferences();
	const uploadLogo = useUploadLogo();
	const { setPreferences } = usePreferencesState();

	const [companyName, setCompanyName] = useState("");
	const [logoUrl, setLogoUrl] = useState("");
	const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
	const [firstDayOfWeek, setFirstDayOfWeek] = useState<"Sunday" | "Monday">("Monday");
	const [errorText, setErrorText] = useState<string | null>(null);

	useEffect(() => {
		if (companyQuery.data) {
			setCompanyName(companyQuery.data.companyName ?? "");
			setLogoUrl(companyQuery.data.logoUrl ?? "");
		}
	}, [companyQuery.data]);

	useEffect(() => {
		if (preferencesQuery.data) {
			setTimeFormat(preferencesQuery.data.timeFormat);
			setFirstDayOfWeek(preferencesQuery.data.firstDayOfWeek);
			setPreferences(preferencesQuery.data);
		}
	}, [preferencesQuery.data, setPreferences]);

	const isBusy = useMemo(
		() => saveCompany.isPending || savePreferences.isPending || uploadLogo.isPending,
		[saveCompany.isPending, savePreferences.isPending, uploadLogo.isPending],
	);

	const handlePickLogo = async () => {
		setErrorText(null);
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			setErrorText("Photo library permission is required to upload a logo.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 0.8,
			base64: true,
		});

		if (result.canceled || !result.assets[0]?.base64 || !result.assets[0]?.mimeType) {
			return;
		}

		const dataUri = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
		const uploaded = await uploadLogo.mutateAsync(dataUri);
		if (!uploaded?.url) {
			setErrorText("Logo upload failed. Please try again.");
			return;
		}
		setLogoUrl(uploaded.url);
	};

	const handleSaveCompany = async () => {
		setErrorText(null);
		const saved = await saveCompany.mutateAsync({ companyName, logoUrl });
		if (!saved) setErrorText("Could not save company settings.");
	};

	const handleSavePreferences = async () => {
		setErrorText(null);
		const payload = { timeFormat, firstDayOfWeek };
		const saved = await savePreferences.mutateAsync(payload);
		if (!saved) {
			setErrorText("Could not save preferences.");
			return;
		}
		setPreferences(payload);
	};

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Logout",
				style: "destructive",
				onPress: async () => {
					await authRequests.logout();
					await clearSessionTokens();
					queryClient.clear();
					router.replace("/getStarted" as any);
				},
			},
		]);
	};

	const handleSaveAll = async () => {
		setErrorText(null);
		
		let successCount = 0;
		
		if (companyName || logoUrl) {
			const companySaved = await saveCompany.mutateAsync({ companyName, logoUrl });
			if (companySaved) {
				successCount++;
			}
		}
		
		const preferencesPayload = { timeFormat, firstDayOfWeek };
		const preferencesSaved = await savePreferences.mutateAsync(preferencesPayload);
		if (preferencesSaved) {
			successCount++;
		}
		
		if (successCount > 0) {
			setCompanyName(companyQuery.data?.companyName ?? "");
			setLogoUrl(companyQuery.data?.logoUrl ?? "");
			setPreferences(preferencesPayload);
			Alert.alert(
				"Settings Saved",
				"Company settings and preferences have been saved successfully.",
				[{ text: "OK" }]
			);
		} else {
			setErrorText("Could not save settings. Please try again.");
		}
	};

	return (
		<ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
			<View className="flex-row items-center justify-between mb-4">
				<Text className="text-2xl font-bold">Settings & Preferences</Text>
				<Pressable
					className="rounded-lg bg-black py-3 px-6 items-center"
					onPress={handleSaveAll}
					disabled={isBusy}
				>
					<Text className="text-white font-semibold">Save All</Text>
				</Pressable>
			</View>

			<SettingsSection title="Company Settings">
				<Text className="text-gray-700 mb-2">Company name</Text>
				<TextInput
					className="rounded-lg border border-gray-300 px-3 py-3 mb-3"
					placeholder="Enter company name"
					value={companyName}
					onChangeText={setCompanyName}
				/>
				<LogoUploadField logoUrl={logoUrl} onPick={handlePickLogo} uploading={uploadLogo.isPending} />
				<Pressable className="rounded-lg bg-black py-3 items-center" onPress={handleSaveCompany} disabled={isBusy}>
					<Text className="text-white font-semibold">Save Company Settings</Text>
				</Pressable>
			</SettingsSection>

			<SettingsSection title="Preferences">
				<OptionSelector
					label="Time format"
					value={timeFormat}
					onChange={setTimeFormat}
					options={[
						{ label: "12h", value: "12h" },
						{ label: "24h", value: "24h" },
					]}
				/>
				<OptionSelector
					label="First day of week"
					value={firstDayOfWeek}
					onChange={setFirstDayOfWeek}
					options={[
						{ label: "Sunday", value: "Sunday" },
						{ label: "Monday", value: "Monday" },
					]}
				/>
				<Pressable className="rounded-lg bg-black py-3 items-center" onPress={handleSavePreferences} disabled={isBusy}>
					<Text className="text-white font-semibold">Save Preferences</Text>
				</Pressable>
			</SettingsSection>

			<SettingsSection title="Exports">
				<ExportPanel />
			</SettingsSection>

			<SettingsSection title="Account">
				<View className="rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
					<Text className="text-red-700 text-sm">Logout clears local session tokens completely.</Text>
				</View>
				<Pressable className="rounded-lg bg-red-600 py-3 items-center" onPress={handleLogout}>
					<Text className="text-white font-semibold">Logout</Text>
				</Pressable>
			</SettingsSection>

			{errorText ? (
				<View className="rounded-lg bg-yellow-50 border border-yellow-300 p-3">
					<Text className="text-yellow-800">{errorText}</Text>
				</View>
			) : null}
		</ScrollView>
	);
}
