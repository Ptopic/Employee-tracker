import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	Alert,
	SafeAreaView,
	ScrollView,
	Switch,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import Text from "@/components/Text";

type CompanyProfile = {
	companyName: string;
	department: string;
	timezone: string;
};

type AppPreferences = {
	notificationsEnabled: boolean;
	weekStartsOnMonday: boolean;
	autoSyncEnabled: boolean;
};

const SETTINGS_KEY = "settings:profile-and-preferences";

const DEFAULT_PROFILE: CompanyProfile = {
	companyName: "",
	department: "Operations",
	timezone: "UTC",
};

const DEFAULT_PREFERENCES: AppPreferences = {
	notificationsEnabled: true,
	weekStartsOnMonday: true,
	autoSyncEnabled: true,
};

export default function SettingsScreen() {
	const queryClient = useQueryClient();
	const { data: user } = useGetUserInfo();
	const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
	const [preferences, setPreferences] =
		useState<AppPreferences>(DEFAULT_PREFERENCES);
	const [isSaving, setIsSaving] = useState(false);

	const suggestedCompanyName = useMemo(() => {
		if (!user?.email) return "";

		const domain = user.email.split("@")[1] || "";
		if (!domain) return "";

		const root = domain.split(".")[0] || "";
		return root.charAt(0).toUpperCase() + root.slice(1);
	}, [user?.email]);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const stored = await AsyncStorage.getItem(SETTINGS_KEY);
				if (!stored) {
					setProfile((prev) => ({
						...prev,
						companyName: prev.companyName || suggestedCompanyName,
					}));
					return;
				}

				const parsed = JSON.parse(stored) as {
					profile?: CompanyProfile;
					preferences?: AppPreferences;
				};

				setProfile({
					...DEFAULT_PROFILE,
					companyName:
						parsed.profile?.companyName || suggestedCompanyName || "",
					department: parsed.profile?.department || DEFAULT_PROFILE.department,
					timezone: parsed.profile?.timezone || DEFAULT_PROFILE.timezone,
				});

				setPreferences({
					...DEFAULT_PREFERENCES,
					...parsed.preferences,
				});
			} catch {
				setProfile((prev) => ({
					...prev,
					companyName: prev.companyName || suggestedCompanyName,
				}));
			}
		};

		loadSettings();
	}, [suggestedCompanyName]);

	const handleSave = async () => {
		setIsSaving(true);

		try {
			await AsyncStorage.setItem(
				SETTINGS_KEY,
				JSON.stringify({ profile, preferences }),
			);
			Alert.alert("Saved", "Your settings were updated successfully.");
		} catch {
			Alert.alert("Error", "Could not save your settings. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleLogout = () => {
		Alert.alert("Log out", "Are you sure you want to log out?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Log out",
				style: "destructive",
				onPress: async () => {
					await queryClient.clear();
					await AsyncStorage.removeItem("accessToken");
					router.replace("/getStarted");
				},
			},
		]);
	};

	return (
		<SafeAreaView className="flex-1 bg-gray25">
			<ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Text className="heading-medium">Settings</Text>

				<View className="bg-white rounded-xl p-4 border border-gray100 gap-3">
					<Text className="heading-xxsmall">Company profile</Text>
					<Text className="body-xsmall-regular text-gray500">
						Manage your organization details shown across the app.
					</Text>

					<View className="gap-1">
						<Text className="body-small-semibold">Company name</Text>
						<TextInput
							value={profile.companyName}
							onChangeText={(value) =>
								setProfile((prev) => ({ ...prev, companyName: value }))
							}
							placeholder="Enter company name"
							className="border border-gray200 rounded-lg px-3 py-3 body-medium-regular"
						/>
					</View>

					<View className="gap-1">
						<Text className="body-small-semibold">Department</Text>
						<TextInput
							value={profile.department}
							onChangeText={(value) =>
								setProfile((prev) => ({ ...prev, department: value }))
							}
							placeholder="Enter department"
							className="border border-gray200 rounded-lg px-3 py-3 body-medium-regular"
						/>
					</View>

					<View className="gap-1">
						<Text className="body-small-semibold">Timezone</Text>
						<TextInput
							value={profile.timezone}
							onChangeText={(value) =>
								setProfile((prev) => ({ ...prev, timezone: value }))
							}
							placeholder="e.g. UTC"
							className="border border-gray200 rounded-lg px-3 py-3 body-medium-regular"
						/>
					</View>

					{!!user && (
						<View className="bg-gray50 rounded-lg p-3 gap-1">
							<Text className="body-small-semibold">Admin account</Text>
							<Text className="body-xsmall-regular text-gray600">
								{user.fullName} • {user.email}
							</Text>
						</View>
					)}
				</View>

				<View className="bg-white rounded-xl p-4 border border-gray100 gap-3">
					<Text className="heading-xxsmall">App preferences</Text>

					<View className="flex-row items-center justify-between">
						<View className="flex-1 pr-3">
							<Text className="body-small-semibold">Notifications</Text>
							<Text className="body-xsmall-regular text-gray500">
								Receive reminders for upcoming shifts.
							</Text>
						</View>
						<Switch
							value={preferences.notificationsEnabled}
							onValueChange={(value) =>
								setPreferences((prev) => ({
									...prev,
									notificationsEnabled: value,
								}))
							}
						/>
					</View>

					<View className="flex-row items-center justify-between">
						<View className="flex-1 pr-3">
							<Text className="body-small-semibold">Week starts on Monday</Text>
							<Text className="body-xsmall-regular text-gray500">
								Use Monday as first day in calendar views.
							</Text>
						</View>
						<Switch
							value={preferences.weekStartsOnMonday}
							onValueChange={(value) =>
								setPreferences((prev) => ({
									...prev,
									weekStartsOnMonday: value,
								}))
							}
						/>
					</View>

					<View className="flex-row items-center justify-between">
						<View className="flex-1 pr-3">
							<Text className="body-small-semibold">Auto sync</Text>
							<Text className="body-xsmall-regular text-gray500">
								Sync shift updates when connectivity is available.
							</Text>
						</View>
						<Switch
							value={preferences.autoSyncEnabled}
							onValueChange={(value) =>
								setPreferences((prev) => ({
									...prev,
									autoSyncEnabled: value,
								}))
							}
						/>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleSave}
					disabled={isSaving}
					className="bg-black rounded-lg p-4 items-center"
				>
					<Text className="body-medium-bold text-white">
						{isSaving ? "Saving..." : "Save changes"}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleLogout}
					className="bg-red100 rounded-lg p-4 items-center"
				>
					<Text className="body-medium-bold text-red700">Log out</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}
