import { useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { Bell, CalendarDays, ChevronDown, ChevronRight, Clock3, FileText, Plus, UserPlus, Users } from "lucide-react-native";
import Svg, { Circle, Path } from "react-native-svg";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import { useTodayEmployees, useTodayShifts } from "@/api/home/hooks";
import Text from "@/components/Text";
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

function ScannerIcon() {
	return (
		<Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
			<Path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
			<Circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth={2} />
		</Svg>
	);
}

function getTodayDateLabel() {
	return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTimeTo12h(time: string) {
	const [hours, minutes] = time.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const normalized = hours % 12 || 12;
	return `${String(normalized).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function toDurationLabel(startTime: string, endTime: string) {
	const [startH, startM] = startTime.split(":").map(Number);
	const [endH, endM] = endTime.split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function Card({ title, subtitle, value, unit, icon }: { title: string; subtitle: string; value: string; unit: string; icon: React.ReactNode }) {
	return (
		<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
			<View className="mb-1 flex-row items-center">
				<View className="mr-2 rounded-full p-2" style={{ backgroundColor: "rgba(91, 123, 108, 0.1)" }}>
					{icon}
				</View>
				<View>
					<Text style={{ fontSize: 14, fontWeight: "700" }}>{title}</Text>
					<Text style={{ fontSize: 10, color: "#94A3B8" }}>{subtitle}</Text>
				</View>
			</View>
			<Text style={{ fontSize: 24, fontWeight: "700", marginTop: 8 }}>
				{value}
				<Text style={{ fontSize: 14, color: "#94A3B8", fontWeight: "500" }}> {unit}</Text>
			</Text>
		</View>
	);
}

function Action({ label, icon }: { label: string; icon: React.ReactNode }) {
	return (
		<TouchableOpacity className="flex-1 items-center rounded-2xl bg-white p-3" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
			<View className="rounded-lg p-2" style={{ backgroundColor: BRAND }}>
				{icon}
			</View>
			<Text style={{ fontSize: 10, fontWeight: "700", marginTop: 8, textAlign: "center" }}>{label}</Text>
		</TouchableOpacity>
	);
}

export function HomeScreen() {
	const { selectedManagerId, setSelectedManagerId } = useAppState();
	const userInfoQuery = useGetUserInfo();

	useEffect(() => {
		if (!selectedManagerId && userInfoQuery.data?.id) setSelectedManagerId(userInfoQuery.data.id);
	}, [selectedManagerId, setSelectedManagerId, userInfoQuery.data?.id]);

	const managerId = selectedManagerId || userInfoQuery.data?.id;
	const todayEmployeesQuery = useTodayEmployees(managerId);
	const todayShiftsQuery = useTodayShifts(managerId);
	const shifts = todayShiftsQuery.data ?? [];

	const onRefresh = async () => Promise.all([userInfoQuery.refetch(), todayEmployeesQuery.refetch(), todayShiftsQuery.refetch()]);

	const scheduledHours = shifts.reduce((acc, shift) => {
		const [sh, sm] = shift.startTime.split(":").map(Number);
		const [eh, em] = shift.endTime.split(":").map(Number);
		let mins = eh * 60 + em - (sh * 60 + sm);
		if (mins < 0) mins += 24 * 60;
		return acc + mins;
	}, 0);

	const scheduleItems = useMemo(() => {
		const rows = shifts.flatMap((s) =>
			s.assignments.map((a) => ({
				id: a.id,
				name: `${a.employee.firstName} ${a.employee.lastName}`,
				startTime: s.startTime.slice(0, 5),
				endTime: s.endTime.slice(0, 5),
			})),
		);
		return rows.length
			? rows.slice(0, 3)
			: [
					{ id: "1", name: "Bagus Fikri", startTime: "09:00", endTime: "17:56" },
					{ id: "2", name: "Susi", startTime: "08:00", endTime: "16:00" },
					{ id: "3", name: "Budi", startTime: "08:00", endTime: "16:00" },
				];
	}, [shifts]);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={userInfoQuery.isLoading || todayEmployeesQuery.isLoading || todayShiftsQuery.isLoading} onRefresh={onRefresh} tintColor={BRAND} />}>
				<View className="w-full self-center" style={{ maxWidth: 960 }}>
					<View className="p-6 pb-4">
						<View className="flex-row items-start justify-between">
							<View>
								<Text style={{ color: "#94A3B8", fontSize: 14, fontWeight: "500" }}>Good Morning,</Text>
								<Text style={{ fontSize: 24, fontWeight: "700" }}>{userInfoQuery.data?.fullName || "Akhmad Maariz"}</Text>
							</View>
							<TouchableOpacity className="rounded-full bg-white p-2" style={CARD_SHADOW}>
								<Bell size={24} color="#475569" strokeWidth={2} />
							</TouchableOpacity>
						</View>
						<View className="mt-8 flex-row">
							<View className="flex-row items-center rounded-lg bg-white px-3 py-2" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<CalendarDays size={20} color="#0F172A" strokeWidth={2} />
								<Text style={{ marginHorizontal: 8, fontSize: 14, fontWeight: "700" }}>{getTodayDateLabel()}</Text>
								<ChevronDown size={20} color="#0F172A" strokeWidth={2} />
							</View>
						</View>
					</View>

					<View className="px-6" style={{ gap: 24 }}>
						<View className="flex-row" style={{ gap: 16 }}>
							<Card title="Scheduled" subtitle="Current Week" value={String(Math.round(scheduledHours / 60) || 164)} unit="Hrs" icon={<Clock3 size={16} color={BRAND} strokeWidth={2.5} />} />
							<Card title="Working Today" subtitle="All Teams" value={String(todayEmployeesQuery.data?.count ?? 12)} unit="People" icon={<Users size={16} color={BRAND} strokeWidth={2.25} />} />
						</View>
						<View className="flex-row" style={{ gap: 12 }}>
							<Action label="Add Employee" icon={<UserPlus size={20} color="#FFFFFF" strokeWidth={2} />} />
							<Action label="Add Shift" icon={<Plus size={20} color="#FFFFFF" strokeWidth={2.5} />} />
							<Action label="Export PDF" icon={<FileText size={20} color="#FFFFFF" strokeWidth={2} />} />
						</View>
						<View className="mt-1">
							<View className="mb-4 flex-row items-center justify-between">
								<Text style={{ fontSize: 20, fontWeight: "700" }}>Today's Schedule</Text>
								<Text style={{ fontSize: 12, fontWeight: "600", color: BRAND }}>View Full</Text>
							</View>
							<View style={{ gap: 12 }}>
								{scheduleItems.map((item) => (
									<View key={item.id} className="flex-row items-center justify-between rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
										<View className="flex-row items-center">
											<View className="h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-slate-100">
												<Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>{item.name.charAt(0)}</Text>
											</View>
											<View className="ml-3">
												<Text style={{ fontSize: 14, fontWeight: "700" }}>{item.name}</Text>
												<Text style={{ fontSize: 10, color: "#64748B", fontWeight: "500" }}>
													In {formatTimeTo12h(item.startTime)}, Out {formatTimeTo12h(item.endTime)}
												</Text>
											</View>
										</View>
										<View className="flex-row items-center">
											<Text style={{ fontSize: 14, fontWeight: "700", color: "#334155", marginRight: 6 }}>{toDurationLabel(item.startTime, item.endTime)}</Text>
											<ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
										</View>
									</View>
								))}
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export { ScannerIcon };
