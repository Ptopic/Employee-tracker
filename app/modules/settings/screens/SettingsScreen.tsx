import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, CircleHelp, Lock, LogOut, MoonStar, Pencil, User, Bell, Languages } from "lucide-react-native";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import authRequests from "@/api/auth/requests";
import {
	useCompanySettings,
	usePreferencesSettings,
	useSaveCompanySettings,
	useSavePreferences,
	useUploadLogo,
} from "@/api/settings/hooks";
import Text from "@/components/Text";
import { Button, FieldLabel, Input } from "@/components/ui";
import { clearSessionTokens } from "@/shared/auth";
import { usePreferencesState } from "@/shared/state/preferences-state";

const BRAND = "#5B7B6C";
const BG = "#F8F9F8";
const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

function SectionTitle({ text }: { text: string }) {
	return <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, paddingHorizontal: 4 }}>{text}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
	return (
		<View className="rounded-2xl bg-white" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, padding: 14 }]}> 
			{children}
		</View>
	);
}

function IconBubble({ icon }: { icon: React.ReactNode }) {
	return (
		<View className="items-center justify-center rounded-xl" style={{ width: 36, height: 36, backgroundColor: "rgba(91, 123, 108, 0.1)" }}>
			{icon}
		</View>
	);
}

function NavRow({
	icon,
	title,
	subtitle,
	onPress,
	right,
}: {
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	onPress?: () => void;
	right?: React.ReactNode;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={!onPress}
			activeOpacity={onPress ? 0.8 : 1}
			className="flex-row items-center justify-between"
			style={{ paddingVertical: 8 }}
		>
			<View className="flex-row items-center" style={{ flex: 1 }}>
				<IconBubble icon={icon} />
				<View style={{ marginLeft: 12, flex: 1 }}>
					<Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>{title}</Text>
					{subtitle ? <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{subtitle}</Text> : null}
				</View>
			</View>
			{right ?? (onPress ? <ChevronRight size={18} color="#CBD5E1" strokeWidth={2.4} /> : null)}
		</TouchableOpacity>
	);
}

export function SettingsScreen() {
	const queryClient = useQueryClient();
	const userInfoQuery = useGetUserInfo();
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
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [darkModeEnabled, setDarkModeEnabled] = useState(false);
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

		if (result.canceled || !result.assets[0]?.base64 || !result.assets[0]?.mimeType) return;

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

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 42, paddingTop: 10 }}>
				<View className="mb-5 flex-row items-center justify-between">
					<Text style={{ fontSize: 28, fontWeight: "700", lineHeight: 34 }}>Settings</Text>
				</View>

				<View className="items-center" style={{ marginBottom: 26 }}>
					<View style={{ position: "relative", marginBottom: 10 }}>
						<View className="items-center justify-center overflow-hidden rounded-full bg-white" style={[CARD_SHADOW, { width: 92, height: 92, borderWidth: 3, borderColor: "#FFFFFF" }]}>
							{logoUrl ? <Image source={{ uri: logoUrl }} style={{ width: 92, height: 92 }} contentFit="cover" /> : <User size={34} color="#94A3B8" strokeWidth={2.1} />}
						</View>
						<Pressable onPress={handlePickLogo} className="items-center justify-center rounded-full" style={{ position: "absolute", right: -2, bottom: -2, width: 28, height: 28, backgroundColor: BRAND, borderWidth: 2, borderColor: "#fff" }}>
							<Pencil size={14} color="#FFFFFF" strokeWidth={2.3} />
						</Pressable>
					</View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>{userInfoQuery.data?.fullName || "Your Profile"}</Text>
					<Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>{userInfoQuery.data?.email || ""}</Text>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Account" />
					<Card>
						<NavRow icon={<User size={18} color={BRAND} strokeWidth={2.2} />} title="Personal Information" subtitle="Company profile and identity" onPress={() => {}} />
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow icon={<Lock size={18} color={BRAND} strokeWidth={2.2} />} title="Security & Privacy" onPress={() => {}} />
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow
							icon={<Bell size={18} color={BRAND} strokeWidth={2.2} />}
							title="Notifications"
							right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: "#CBD5E1", true: BRAND }} />}
						/>
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="General" />
					<Card>
						<NavRow icon={<Languages size={18} color={BRAND} strokeWidth={2.2} />} title="Language" subtitle="English (US)" onPress={() => {}} />
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow
							icon={<MoonStar size={18} color={BRAND} strokeWidth={2.2} />}
							title="Dark Mode"
							right={<Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} trackColor={{ false: "#CBD5E1", true: BRAND }} />}
						/>
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow icon={<CircleHelp size={18} color={BRAND} strokeWidth={2.2} />} title="Help Center" onPress={() => {}} />
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Company" />
					<Card>
						<FieldLabel label="Company Name" />
						<Input value={companyName} onChangeText={setCompanyName} placeholder="Enter company name" />
						<View style={{ height: 10 }} />
						<TouchableOpacity
							onPress={handlePickLogo}
							disabled={uploadLogo.isPending}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "transparent", opacity: uploadLogo.isPending ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>{uploadLogo.isPending ? "Uploading logo..." : "Upload Company Logo"}</Text>
						</TouchableOpacity>
						<View style={{ height: 10 }} />
						<TouchableOpacity
							onPress={handleSaveCompany}
							disabled={isBusy}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, backgroundColor: BRAND, opacity: isBusy ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>{saveCompany.isPending ? "Saving..." : "Save Company Settings"}</Text>
						</TouchableOpacity>
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Work Preferences" />
					<Card>
						<FieldLabel label="Time Format" />
						<View className="flex-row" style={{ gap: 10, marginBottom: 12 }}>
							<TouchableOpacity
								onPress={() => setTimeFormat("12h")}
								className="flex-1 items-center justify-center rounded-xl"
								style={{
									height: 42,
									backgroundColor: timeFormat === "12h" ? BRAND : "transparent",
									borderWidth: timeFormat === "12h" ? 0 : 1,
									borderColor: "#E2E8F0",
								}}
							>
								<Text style={{ fontSize: 13, fontWeight: timeFormat === "12h" ? "700" : "600", color: timeFormat === "12h" ? "#FFFFFF" : "#64748B" }}>12h</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => setTimeFormat("24h")}
								className="flex-1 items-center justify-center rounded-xl"
								style={{
									height: 42,
									backgroundColor: timeFormat === "24h" ? BRAND : "transparent",
									borderWidth: timeFormat === "24h" ? 0 : 1,
									borderColor: "#E2E8F0",
								}}
							>
								<Text style={{ fontSize: 13, fontWeight: timeFormat === "24h" ? "700" : "600", color: timeFormat === "24h" ? "#FFFFFF" : "#64748B" }}>24h</Text>
							</TouchableOpacity>
						</View>
						<FieldLabel label="First Day of Week" />
						<View className="flex-row" style={{ gap: 10, marginBottom: 12 }}>
							<TouchableOpacity
								onPress={() => setFirstDayOfWeek("Sunday")}
								className="flex-1 items-center justify-center rounded-xl"
								style={{
									height: 42,
									backgroundColor: firstDayOfWeek === "Sunday" ? BRAND : "transparent",
									borderWidth: firstDayOfWeek === "Sunday" ? 0 : 1,
									borderColor: "#E2E8F0",
								}}
							>
								<Text style={{ fontSize: 13, fontWeight: firstDayOfWeek === "Sunday" ? "700" : "600", color: firstDayOfWeek === "Sunday" ? "#FFFFFF" : "#64748B" }}>Sunday</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => setFirstDayOfWeek("Monday")}
								className="flex-1 items-center justify-center rounded-xl"
								style={{
									height: 42,
									backgroundColor: firstDayOfWeek === "Monday" ? BRAND : "transparent",
									borderWidth: firstDayOfWeek === "Monday" ? 0 : 1,
									borderColor: "#E2E8F0",
								}}
							>
								<Text style={{ fontSize: 13, fontWeight: firstDayOfWeek === "Monday" ? "700" : "600", color: firstDayOfWeek === "Monday" ? "#FFFFFF" : "#64748B" }}>Monday</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							onPress={handleSavePreferences}
							disabled={isBusy}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, backgroundColor: BRAND, opacity: isBusy ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>{savePreferences.isPending ? "Saving..." : "Save Preferences"}</Text>
						</TouchableOpacity>
					</Card>
				</View>

				<TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center rounded-2xl bg-white" style={[CARD_SHADOW, { borderWidth: 1, borderColor: "#FEE2E2", paddingVertical: 16 }]}>
					<LogOut size={18} color="#E11D48" strokeWidth={2.2} />
					<Text style={{ marginLeft: 8, fontSize: 15, fontWeight: "700", color: "#E11D48" }}>Logout</Text>
				</TouchableOpacity>

				<Text style={{ textAlign: "center", fontSize: 10, color: "#94A3B8", marginTop: 20, fontWeight: "500" }}>Version 2.4.1 (Build 890)</Text>

				{errorText ? (
					<View className="rounded-xl border p-3" style={{ marginTop: 14, borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}>
						<Text style={{ color: "#92400E", fontSize: 13 }}>{errorText}</Text>
					</View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
}
