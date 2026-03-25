import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppDateTimeModal, FieldLabel, Input } from "@/components/ui";
import { ChevronRight, CircleHelp, Lock, LogOut, MoonStar, Pencil, User, Bell, Languages } from "lucide-react-native";
import { useToast } from "react-native-toast-notifications";
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

const normalizeTime = (value: string | undefined, fallback: string) => {
	if (!value) return fallback;
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
	const isoMatch = value.match(/T(\d{2}:\d{2})/);
	if (isoMatch?.[1]) return isoMatch[1];
	return fallback;
};

const toTimeDate = (hhmm: string) => {
	const [hours, minutes] = hhmm.split(":").map(Number);
	const date = new Date();
	date.setHours(hours, minutes, 0, 0);
	return date;
};

const toTimeLabel = (date: Date) =>
	`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const toMinutes = (hhmm: string) => {
	const [hours, minutes] = hhmm.split(":").map(Number);
	return hours * 60 + minutes;
};

const isRangeValid = (start: string, end: string) => {
	const startMinutes = toMinutes(start);
	const endMinutes = toMinutes(end);
	if (startMinutes === endMinutes) return false;
	return true;
};

type ShiftPickerTarget =
	| "firstShiftStart"
	| "firstShiftEnd"
	| "secondShiftStart"
	| "secondShiftEnd";

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
	const toast = useToast();
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
	const [firstShiftStart, setFirstShiftStart] = useState("09:00");
	const [firstShiftEnd, setFirstShiftEnd] = useState("16:00");
	const [secondShiftStart, setSecondShiftStart] = useState("16:00");
	const [secondShiftEnd, setSecondShiftEnd] = useState("22:00");
	const [pickerTarget, setPickerTarget] = useState<ShiftPickerTarget | null>(null);
	const [iosTempTime, setIosTempTime] = useState(new Date());
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
			setFirstShiftStart(normalizeTime(preferencesQuery.data.firstShiftStart, "09:00"));
			setFirstShiftEnd(normalizeTime(preferencesQuery.data.firstShiftEnd, "16:00"));
			setSecondShiftStart(normalizeTime(preferencesQuery.data.secondShiftStart, "16:00"));
			setSecondShiftEnd(normalizeTime(preferencesQuery.data.secondShiftEnd, "22:00"));
			setPreferences(preferencesQuery.data);
		}
	}, [preferencesQuery.data, setPreferences]);

	const isBusy = useMemo(
		() => saveCompany.isPending || savePreferences.isPending || uploadLogo.isPending,
		[saveCompany.isPending, savePreferences.isPending, uploadLogo.isPending],
	);
	const profileImageUrl = userInfoQuery.data?.picture || logoUrl;

	const handlePickLogo = async () => {
		setErrorText(null);
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			setErrorText("Za prijenos logotipa potrebno je odobrenje za foto galeriju.");
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
			setErrorText("Prijenos logotipa nije uspio. Pokusajte ponovno.");
			return;
		}
		setLogoUrl(uploaded.url);
	};

	const handleSaveCompany = async () => {
		setErrorText(null);
		const saved = await saveCompany.mutateAsync({ companyName, logoUrl });
		if (!saved) setErrorText("Nije moguce spremiti postavke tvrtke.");
	};

	const handleSavePreferences = async () => {
		setErrorText(null);
		const payload = { timeFormat, firstDayOfWeek };
		const saved = await savePreferences.mutateAsync(payload);
		if (!saved) {
			setErrorText("Nije moguce spremiti postavke.");
			return;
		}
		setPreferences(payload);
	};

	const handleSaveDefaultShifts = async () => {
		setErrorText(null);
		if (!isRangeValid(firstShiftStart, firstShiftEnd)) {
			const message = "Pocetak i kraj prve smjene ne mogu biti isti.";
			setErrorText(message);
			toast.show(message, { type: "error" });
			return;
		}
		if (!isRangeValid(secondShiftStart, secondShiftEnd)) {
			const message = "Pocetak i kraj druge smjene ne mogu biti isti.";
			setErrorText(message);
			toast.show(message, { type: "error" });
			return;
		}

		try {
			const saved = await savePreferences.mutateAsync({
				firstShiftStart,
				firstShiftEnd,
				secondShiftStart,
				secondShiftEnd,
			});
			if (!saved) {
				const message = "Nije moguce spremiti zadane smjene.";
				setErrorText(message);
				toast.show(message, { type: "error" });
				return;
			}
			setFirstShiftStart(saved.firstShiftStart);
			setFirstShiftEnd(saved.firstShiftEnd);
			setSecondShiftStart(saved.secondShiftStart);
			setSecondShiftEnd(saved.secondShiftEnd);
			setPreferences(saved);
			toast.show("Zadane smjene su uspjesno spremljene.", { type: "success" });
		} catch {
			const message = "Nije moguce spremiti zadane smjene.";
			setErrorText(message);
			toast.show(message, { type: "error" });
		}
	};

	const pickerValue = useMemo(() => {
		switch (pickerTarget) {
			case "firstShiftStart":
				return toTimeDate(firstShiftStart);
			case "firstShiftEnd":
				return toTimeDate(firstShiftEnd);
			case "secondShiftStart":
				return toTimeDate(secondShiftStart);
			case "secondShiftEnd":
				return toTimeDate(secondShiftEnd);
			default:
				return new Date();
		}
	}, [pickerTarget, firstShiftStart, firstShiftEnd, secondShiftStart, secondShiftEnd]);

	useEffect(() => {
		if (pickerTarget) setIosTempTime(pickerValue);
	}, [pickerTarget, pickerValue]);

	const handleLogout = () => {
		Alert.alert("Odjava", "Jeste li sigurni da se zelite odjaviti?", [
			{ text: "Odustani", style: "cancel" },
			{
				text: "Odjava",
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
			<ScrollView bounces={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 42, paddingTop: 10 }}>
				<View className="mb-5 flex-row items-center justify-between">
					<Text style={{ fontSize: 28, fontWeight: "700", lineHeight: 34 }}>Postavke</Text>
				</View>

				<View className="items-center" style={{ marginBottom: 26 }}>
					<View style={{ position: "relative", marginBottom: 10 }}>
						<View className="items-center justify-center overflow-hidden rounded-full bg-white" style={[CARD_SHADOW, { width: 92, height: 92, borderWidth: 3, borderColor: "#FFFFFF" }]}>
							{profileImageUrl ? <Image source={{ uri: profileImageUrl }} style={{ width: 92, height: 92 }} contentFit="cover" /> : <User size={34} color="#94A3B8" strokeWidth={2.1} />}
						</View>
						<Pressable onPress={handlePickLogo} className="items-center justify-center rounded-full" style={{ position: "absolute", right: -2, bottom: -2, width: 28, height: 28, backgroundColor: BRAND, borderWidth: 2, borderColor: "#fff" }}>
							<Pencil size={14} color="#FFFFFF" strokeWidth={2.3} />
						</Pressable>
					</View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>{userInfoQuery.data?.fullName || "Vas profil"}</Text>
					<Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>{userInfoQuery.data?.email || ""}</Text>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Racun" />
					<Card>
						<NavRow icon={<User size={18} color={BRAND} strokeWidth={2.2} />} title="Osobni podaci" subtitle="Profil i identitet tvrtke" onPress={() => {}} />
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow icon={<Lock size={18} color={BRAND} strokeWidth={2.2} />} title="Sigurnost i privatnost" onPress={() => {}} />
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow
							icon={<Bell size={18} color={BRAND} strokeWidth={2.2} />}
							title="Obavijesti"
							right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: "#CBD5E1", true: BRAND }} />}
						/>
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Zadane smjene" />
					<Card>
						<FieldLabel label="Prva smjena" />
						<View className="flex-row" style={{ gap: 10, marginBottom: 12 }}>
							<View className="flex-1">
								<FieldLabel label="Pocetak" />
								<TouchableOpacity
									onPress={() => setPickerTarget("firstShiftStart")}
									className="items-center justify-center rounded-xl"
									style={{ height: 42, borderWidth: 1, borderColor: "#E2E8F0" }}
								>
									<Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{firstShiftStart}</Text>
								</TouchableOpacity>
							</View>
							<View className="flex-1">
								<FieldLabel label="Kraj" />
								<TouchableOpacity
									onPress={() => setPickerTarget("firstShiftEnd")}
									className="items-center justify-center rounded-xl"
									style={{ height: 42, borderWidth: 1, borderColor: "#E2E8F0" }}
								>
									<Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{firstShiftEnd}</Text>
								</TouchableOpacity>
							</View>
						</View>

						<FieldLabel label="Druga smjena" />
						<View className="flex-row" style={{ gap: 10, marginBottom: 12 }}>
							<View className="flex-1">
								<FieldLabel label="Pocetak" />
								<TouchableOpacity
									onPress={() => setPickerTarget("secondShiftStart")}
									className="items-center justify-center rounded-xl"
									style={{ height: 42, borderWidth: 1, borderColor: "#E2E8F0" }}
								>
									<Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{secondShiftStart}</Text>
								</TouchableOpacity>
							</View>
							<View className="flex-1">
								<FieldLabel label="Kraj" />
								<TouchableOpacity
									onPress={() => setPickerTarget("secondShiftEnd")}
									className="items-center justify-center rounded-xl"
									style={{ height: 42, borderWidth: 1, borderColor: "#E2E8F0" }}
								>
									<Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{secondShiftEnd}</Text>
								</TouchableOpacity>
							</View>
						</View>

						<TouchableOpacity
							onPress={handleSaveDefaultShifts}
							disabled={isBusy}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, backgroundColor: BRAND, opacity: isBusy ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
								{savePreferences.isPending ? "Spremanje..." : "Spremi zadane smjene"}
							</Text>
						</TouchableOpacity>
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Opcenito" />
					<Card>
						<NavRow icon={<Languages size={18} color={BRAND} strokeWidth={2.2} />} title="Jezik" subtitle="Hrvatski (HR)" onPress={() => {}} />
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow
							icon={<MoonStar size={18} color={BRAND} strokeWidth={2.2} />}
							title="Tamni nacin"
							right={<Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} trackColor={{ false: "#CBD5E1", true: BRAND }} />}
						/>
						<View style={{ height: 1, backgroundColor: "#F8FAFC", marginVertical: 2 }} />
						<NavRow icon={<CircleHelp size={18} color={BRAND} strokeWidth={2.2} />} title="Centar pomoci" onPress={() => {}} />
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Tvrtka" />
					<Card>
						<FieldLabel label="Naziv tvrtke" />
						<Input value={companyName} onChangeText={setCompanyName} placeholder="Unesite naziv tvrtke" />
						<View style={{ height: 10 }} />
						<TouchableOpacity
							onPress={handlePickLogo}
							disabled={uploadLogo.isPending}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "transparent", opacity: uploadLogo.isPending ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>{uploadLogo.isPending ? "Prijenos logotipa..." : "Prenesi logotip tvrtke"}</Text>
						</TouchableOpacity>
						<View style={{ height: 10 }} />
						<TouchableOpacity
							onPress={handleSaveCompany}
							disabled={isBusy}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, backgroundColor: BRAND, opacity: isBusy ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>{saveCompany.isPending ? "Spremanje..." : "Spremi postavke tvrtke"}</Text>
						</TouchableOpacity>
					</Card>
				</View>

				<View style={{ marginBottom: 20 }}>
					<SectionTitle text="Radne postavke" />
					<Card>
						<FieldLabel label="Format vremena" />
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
						<FieldLabel label="Prvi dan u tjednu" />
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
								<Text style={{ fontSize: 13, fontWeight: firstDayOfWeek === "Sunday" ? "700" : "600", color: firstDayOfWeek === "Sunday" ? "#FFFFFF" : "#64748B" }}>Nedjelja</Text>
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
								<Text style={{ fontSize: 13, fontWeight: firstDayOfWeek === "Monday" ? "700" : "600", color: firstDayOfWeek === "Monday" ? "#FFFFFF" : "#64748B" }}>Ponedjeljak</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							onPress={handleSavePreferences}
							disabled={isBusy}
							className="items-center justify-center rounded-xl"
							style={{ height: 46, backgroundColor: BRAND, opacity: isBusy ? 0.7 : 1 }}
						>
							<Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>{savePreferences.isPending ? "Spremanje..." : "Spremi postavke"}</Text>
						</TouchableOpacity>
					</Card>
				</View>

				<TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center rounded-2xl bg-white" style={[CARD_SHADOW, { borderWidth: 1, borderColor: "#FEE2E2", paddingVertical: 16 }]}>
					<LogOut size={18} color="#E11D48" strokeWidth={2.2} />
					<Text style={{ marginLeft: 8, fontSize: 15, fontWeight: "700", color: "#E11D48" }}>Odjava</Text>
				</TouchableOpacity>

				<Text style={{ textAlign: "center", fontSize: 10, color: "#94A3B8", marginTop: 20, fontWeight: "500" }}>Verzija 2.4.1 (Build 890)</Text>

				{errorText ? (
					<View className="rounded-xl border p-3" style={{ marginTop: 14, borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}>
						<Text style={{ color: "#92400E", fontSize: 13 }}>{errorText}</Text>
					</View>
				) : null}
			</ScrollView>
			{Platform.OS === "ios" ? (
				<AppDateTimeModal
					visible={Boolean(pickerTarget)}
					mode="time"
					date={iosTempTime}
					onConfirm={(selected) => {
						const label = toTimeLabel(selected);
						if (pickerTarget === "firstShiftStart") setFirstShiftStart(label);
						if (pickerTarget === "firstShiftEnd") setFirstShiftEnd(label);
						if (pickerTarget === "secondShiftStart") setSecondShiftStart(label);
						if (pickerTarget === "secondShiftEnd") setSecondShiftEnd(label);
					}}
					onCancel={() => setPickerTarget(null)}
				/>
			) : pickerTarget ? (
				<DateTimePicker
					value={pickerValue}
					mode="time"
					display="default"
					locale="hr-HR"
					onChange={(_, selected) => {
						if (selected) {
							const label = toTimeLabel(selected);
							if (pickerTarget === "firstShiftStart") setFirstShiftStart(label);
							if (pickerTarget === "firstShiftEnd") setFirstShiftEnd(label);
							if (pickerTarget === "secondShiftStart") setSecondShiftStart(label);
							if (pickerTarget === "secondShiftEnd") setSecondShiftEnd(label);
						}
						setPickerTarget(null);
					}}
				/>
			) : null}
		</SafeAreaView>
	);
}
