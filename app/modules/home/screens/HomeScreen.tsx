import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Bell, CalendarDays, Clock3, FileText, Plus, Trash2, UserPlus, Users } from "lucide-react-native";
import Svg, { Circle, Path } from "react-native-svg";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import { useDaySchedule, useDeleteShift } from "@/api/shifts/hooks";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Text from "@/components/Text";
import { EmployeeCard } from "@/modules/home/components/EmployeeCard";
import { useAppState } from "@/shared/state/app-state";

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

function ScannerIcon({ size = 28 }: { size?: number }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
			<Circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth={2} />
		</Svg>
	);
}

function toIsoDate(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function formatDateLabel(date: Date) {
	return date.toLocaleDateString("hr-HR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function extractHHmm(value?: string | null) {
	if (!value) return "";
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
	const isoMatch = value.match(/T(\d{2}:\d{2})/);
	if (isoMatch?.[1]) return isoMatch[1];
	const looseMatch = value.match(/(\d{2}):(\d{2})/);
	if (looseMatch?.[1] && looseMatch?.[2]) return `${looseMatch[1]}:${looseMatch[2]}`;
	return "";
}

function toDurationLabel(startTime: string, endTime: string) {
	const [startH, startM] = extractHHmm(startTime).split(":").map(Number);
	const [endH, endM] = extractHHmm(endTime).split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function Card({ title, subtitle, value, unit, icon }: { title: string; subtitle: string; value: string; unit: string; icon: React.ReactNode }) {
	return (
		<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
			<View className="mb-1 flex-row items-center">
				<View className="rounded-full p-2" style={{ backgroundColor: "rgba(91, 123, 108, 0.1)", marginRight: 10 }}>
					{icon}
				</View>
				<View>
					<Text style={{ fontSize: 14, fontWeight: "700", lineHeight: 18 }}>{title}</Text>
					<Text style={{ fontSize: 10, color: "#94A3B8", lineHeight: 14, marginTop: 1 }}>{subtitle}</Text>
				</View>
			</View>
			<Text style={{ fontSize: 24, fontWeight: "700", lineHeight: 32, marginTop: 8, paddingBottom: 2 }}>
				{value}
				<Text style={{ fontSize: 14, lineHeight: 20, color: "#94A3B8", fontWeight: "500" }}> {unit}</Text>
			</Text>
		</View>
	);
}

function StatsCardSkeleton() {
	return (
		<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
			<View className="mb-2 flex-row items-center">
				<View className="rounded-full" style={{ width: 32, height: 32, backgroundColor: "#E2E8F0", marginRight: 10 }} />
				<View>
					<View style={{ width: 84, height: 12, borderRadius: 6, backgroundColor: "#E2E8F0", marginBottom: 4 }} />
					<View style={{ width: 64, height: 10, borderRadius: 6, backgroundColor: "#F1F5F9" }} />
				</View>
			</View>
			<View style={{ width: 90, height: 28, borderRadius: 8, backgroundColor: "#E2E8F0", marginTop: 8 }} />
		</View>
	);
}

function Action({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
	return (
		<TouchableOpacity onPress={onPress} className="flex-1 items-center justify-center rounded-2xl bg-white" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, padding: 12 }]}>
			<View className="rounded-lg p-2" style={{ backgroundColor: BRAND, marginBottom: 8 }}>
				{icon}
			</View>
			<Text style={{ fontSize: 10, lineHeight: 14, fontWeight: "700", textAlign: "center" }}>{label}</Text>
		</TouchableOpacity>
	);
}

export function HomeScreen() {
	const userInfoQuery = useGetUserInfo();
	const { setSelectedHomeDate } = useAppState();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const selectedDateIso = useMemo(() => toIsoDate(selectedDate), [selectedDate]);

	useEffect(() => {
		setSelectedHomeDate(selectedDateIso);
	}, [selectedDateIso, setSelectedHomeDate]);
	const todayIso = toIsoDate(new Date());
	const showNowButton = selectedDateIso !== todayIso;
	const dayScheduleQuery = useDaySchedule(selectedDateIso);
	const deleteShiftMutation = useDeleteShift();
	const shifts = dayScheduleQuery.data?.shifts ?? [];

	const onRefresh = async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([userInfoQuery.refetch(), dayScheduleQuery.refetch()]);
		} finally {
			setIsRefreshing(false);
		}
	};

	const confirmDeleteShift = (shiftId: string) => {
		Alert.alert("Obrisi smjenu", "Ovu radnju nije moguce ponistiti.", [
			{ text: "Odustani", style: "cancel" },
			{
				text: "Obrisi",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteShiftMutation.mutateAsync(shiftId);
					} catch {
						// no-op; existing query state will reflect failure on next interaction
					}
				},
			},
		]);
	};

	const scheduledHours = useMemo(() => {
		let minutes = 0;
		for (const shift of shifts) {
			if (shift.isDayOff || !shift.startTime || !shift.endTime) {
				continue;
			}
			const [startH, startM] = extractHHmm(shift.startTime).split(":").map(Number);
			const [endH, endM] = extractHHmm(shift.endTime).split(":").map(Number);
			let diff = endH * 60 + endM - (startH * 60 + startM);
			if (diff < 0) diff += 24 * 60;
			minutes += diff;
		}
		return minutes / 60;
	}, [shifts]);
	const workingPeopleCount = useMemo(() => new Set(shifts.flatMap((shift) => shift.assignments.map((a) => a.employeeId))).size, [shifts]);
	const isStatsLoading = dayScheduleQuery.isLoading;
	const isScheduleLoading = dayScheduleQuery.isLoading;

	const scheduleItems = useMemo(
		() =>
			shifts
				.flatMap((s) =>
					s.assignments.map((a) => ({
						id: a.id,
						employeeId: a.employeeId,
						name: `${a.employee.firstName} ${a.employee.lastName}`,
						startTime: extractHHmm(s.startTime),
						endTime: extractHHmm(s.endTime),
						isDayOff: s.isDayOff,
						shiftId: s.id,
						date: s.date,
						employeeIds: s.assignments.map((assignment) => assignment.employeeId),
					})),
				)
				.slice(0, 3),
		[shifts],
	);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView
				alwaysBounceVertical
				contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={BRAND} />}
			>
				<View className="w-full self-center" style={{ maxWidth: 960 }}>
					<View className="p-6 pb-4">
						<View className="flex-row items-start justify-between" style={{ marginBottom: 32 }}>
							<View style={{ paddingTop: 2 }}>
								<Text style={{ color: "#94A3B8", fontSize: 14, fontWeight: "500", marginBottom: 2 }}>Dobro jutro,</Text>
								<Text style={{ fontSize: 24, fontWeight: "700", lineHeight: 30 }}>{userInfoQuery.data?.fullName || "Akhmad Maariz"}</Text>
							</View>
							<TouchableOpacity className="rounded-full bg-white p-2" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<Bell size={24} color="#475569" strokeWidth={2} />
							</TouchableOpacity>
						</View>
						<View className="flex-row items-center" style={{ gap: 8 }}>
							<TouchableOpacity
								onPress={() => setShowDatePicker(true)}
								className="flex-row items-center rounded-lg bg-white px-3 py-2"
								style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}
							>
								<CalendarDays size={20} color="#0F172A" strokeWidth={2} />
								<Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "700" }}>{formatDateLabel(selectedDate)}</Text>
							</TouchableOpacity>
							{showNowButton ? (
								<TouchableOpacity
									onPress={() => setSelectedDate(new Date())}
									className="rounded-lg px-3 py-2"
									style={{ backgroundColor: BRAND }}
								>
									<Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>Sada</Text>
								</TouchableOpacity>
							) : null}
						</View>
					</View>

					<View className="px-6" style={{ gap: 24 }}>
						<View className="flex-row" style={{ gap: 16 }}>
							{isStatsLoading ? (
								<>
									<StatsCardSkeleton />
									<StatsCardSkeleton />
								</>
							) : (
								<>
									<Card title="Rasporedjeno" subtitle="Odabrani datum" value={String(Number.isInteger(scheduledHours) ? scheduledHours : Number(scheduledHours.toFixed(1)))} unit="Sati" icon={<Clock3 size={16} color={BRAND} strokeWidth={2.5} />} />
									<Card title="Radi danas" subtitle="Odabrani datum" value={String(workingPeopleCount)} unit="Ljudi" icon={<Users size={16} color={BRAND} strokeWidth={2.25} />} />
								</>
							)}
						</View>
						<View className="flex-row" style={{ gap: 12 }}>
							<Action label="Dodaj zaposlenika" onPress={() => router.push("/employees/add")} icon={<UserPlus size={20} color="#FFFFFF" strokeWidth={2} />} />
							<Action label="Dodaj smjenu" onPress={() => router.push({ pathname: "/shift/edit", params: { date: selectedDateIso } })} icon={<Plus size={20} color="#FFFFFF" strokeWidth={2.5} />} />
				<Action label="Generiraj PDF" onPress={() => router.push("/export/preview")} icon={<FileText size={20} color="#FFFFFF" strokeWidth={2} />} />
						</View>
						<View className="mt-1">
							<View className="mb-4 flex-row items-center justify-between">
								<Text style={{ fontSize: 20, fontWeight: "700" }}>Danasnji raspored</Text>
								<TouchableOpacity onPress={() => router.push({ pathname: "/schedule/day/[date]", params: { date: selectedDateIso } })}>
									<Text style={{ fontSize: 12, fontWeight: "600", color: BRAND }}>Pogledaj sve</Text>
								</TouchableOpacity>
							</View>
							<View style={{ gap: 12 }}>
								{isScheduleLoading ? (
									["a", "b", "c"].map((key) => (
										<View key={`schedule-skeleton-${key}`} className="flex-row items-center justify-between rounded-2xl bg-white" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, padding: 16 }]}> 
											<View className="flex-row items-center">
												<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E2E8F0", marginRight: 12 }} />
												<View>
													<View style={{ width: 96, height: 12, borderRadius: 6, backgroundColor: "#E2E8F0", marginBottom: 6 }} />
													<View style={{ width: 140, height: 10, borderRadius: 6, backgroundColor: "#F1F5F9" }} />
												</View>
											</View>
											<View style={{ width: 72, height: 16, borderRadius: 8, backgroundColor: "#E2E8F0" }} />
										</View>
									))
								) : scheduleItems.length ? (
									scheduleItems.map((item) => (
										<View key={item.id} style={{ borderRadius: 16, overflow: "hidden" }}>
											<Swipeable
												friction={1.15}
												rightThreshold={36}
												dragOffsetFromRightEdge={12}
												overshootFriction={8}
												overshootRight={false}
												renderRightActions={() => (
													<TouchableOpacity
														activeOpacity={1}
														onPress={() => confirmDeleteShift(item.shiftId)}
														className="items-center justify-center"
														style={{
															width: 92,
															backgroundColor: "#EF4444",
														}}
													>
														<Trash2 size={18} color="#FFFFFF" strokeWidth={2.25} />
														<Text style={{ marginTop: 4, fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>Obrisi</Text>
													</TouchableOpacity>
												)}
											>
												<EmployeeCard
													rounded={false}
													name={item.name}
													timeLabel={item.isDayOff ? "Slobodan dan" : `${item.startTime}-${item.endTime}`}
											duration={item.isDayOff ? "Slobodan dan" : toDurationLabel(item.startTime, item.endTime)}
													onPress={() =>
														router.push({
															pathname: "/shift/edit",
															params: {
																shiftId: item.shiftId,
																date: item.date.slice(0, 10),
																startTime: item.startTime,
																endTime: item.endTime,
																isDayOff: item.isDayOff ? "true" : "false",
																employeeIds: item.employeeIds.join(","),
															},
														})
													}
												/>
											</Swipeable>
										</View>
									))
								) : (
									<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
										<Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>Nema rasporedjenih smjena za odabrani datum.</Text>
									</View>
								)}
							</View>
						</View>
					</View>
				</View>
			</ScrollView>

			{showDatePicker ? (
				<DateTimePicker
					value={selectedDate}
					mode="date"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					locale="hr-HR"
					onChange={(_, date) => {
						setShowDatePicker(false);
						if (date) setSelectedDate(date);
					}}
				/>
			) : null}
		</SafeAreaView>
	);
}

export { ScannerIcon };
