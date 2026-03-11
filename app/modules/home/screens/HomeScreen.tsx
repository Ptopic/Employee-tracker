import { useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import { useTodayEmployees, useTodayShifts } from "@/api/home/hooks";
import Text from "@/components/Text";
import { useAppState } from "@/shared/state/app-state";

function Icon({ path, size = 20, stroke = "#475569", strokeWidth = 2 }: { path: string; size?: number; stroke?: string; strokeWidth?: number }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path d={path} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	);
}

function ScannerIcon() {
	return (
		<Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
			<Path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
			<Circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth={2} />
		</Svg>
	);
}

const iconPaths = {
	bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
	clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
	team: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
	addEmployee: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
	addShift: "M12 4v16m8-8H4",
	exportPdf: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
};

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

function Card({ title, subtitle, value, unit, iconPath }: { title: string; subtitle: string; value: string; unit: string; iconPath: string }) {
	return (
		<View className="flex-1 rounded-2xl border border-slate-50 bg-white p-4" style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}>
			<View className="mb-1 flex-row items-center">
				<View className="mr-2 rounded-full bg-[#5B7B6C]/10 p-2"><Icon path={iconPath} size={16} stroke="#5B7B6C" strokeWidth={2.5} /></View>
				<View>
					<Text style={{ fontSize: 14, fontWeight: "700" }}> {title}</Text>
					<Text style={{ fontSize: 10, color: "#94A3B8" }}>{subtitle}</Text>
				</View>
			</View>
			<Text style={{ fontSize: 24, fontWeight: "700", marginTop: 8 }}>{value}<Text style={{ fontSize: 14, color: "#94A3B8", fontWeight: "500" }}> {unit}</Text></Text>
		</View>
	);
}

function Action({ label, iconPath, strokeWidth = 2 }: { label: string; iconPath: string; strokeWidth?: number }) {
	return (
		<TouchableOpacity className="flex-1 items-center rounded-2xl border border-slate-50 bg-white p-3" style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}>
			<View className="rounded-lg bg-[#5B7B6C] p-2"><Icon path={iconPath} size={20} stroke="#FFF" strokeWidth={strokeWidth} /></View>
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
		const rows = shifts.flatMap((s) => s.assignments.map((a) => ({ id: a.id, name: `${a.employee.firstName} ${a.employee.lastName}`, startTime: s.startTime.slice(0, 5), endTime: s.endTime.slice(0, 5) })));
		return rows.length ? rows.slice(0, 3) : [
			{ id: "1", name: "Bagus Fikri", startTime: "09:00", endTime: "17:56" },
			{ id: "2", name: "Susi", startTime: "08:00", endTime: "16:00" },
			{ id: "3", name: "Budi", startTime: "08:00", endTime: "16:00" },
		];
	}, [shifts]);

	return (
		<SafeAreaView className="flex-1 bg-[#F8F9F8]">
			<ScrollView contentContainerStyle={{ paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={userInfoQuery.isLoading || todayEmployeesQuery.isLoading || todayShiftsQuery.isLoading} onRefresh={onRefresh} tintColor="#5B7B6C" />}>
				<View className="p-6 pb-4">
					<View className="flex-row items-start justify-between">
						<View>
							<Text style={{ color: "#94A3B8", fontSize: 14, fontWeight: "500" }}>Good Morning,</Text>
							<Text style={{ fontSize: 24, fontWeight: "700" }}>{userInfoQuery.data?.fullName || "Akhmad Maariz"}</Text>
						</View>
						<TouchableOpacity className="rounded-full bg-white p-2" style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}>
							<Icon path={iconPaths.bell} size={24} stroke="#475569" strokeWidth={2} />
						</TouchableOpacity>
					</View>
					<View className="mt-8 flex-row">
						<View className="flex-row items-center rounded-lg border border-slate-100 bg-white px-3 py-2" style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}>
							<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={20} stroke="#0F172A" />
							<Text style={{ marginHorizontal: 8, fontSize: 14, fontWeight: "700" }}>{getTodayDateLabel()}</Text>
							<Icon path="m6 9 6 6 6-6" size={20} stroke="#0F172A" />
						</View>
					</View>
				</View>

				<View className="space-y-6 px-6">
					<View className="flex-row gap-4">
						<Card title="Scheduled" subtitle="Current Week" value={String(Math.round(scheduledHours / 60) || 164)} unit="Hrs" iconPath={iconPaths.clock} />
						<Card title="Working Today" subtitle="All Teams" value={String(todayEmployeesQuery.data?.count ?? 12)} unit="People" iconPath={iconPaths.team} />
					</View>
					<View className="flex-row gap-3">
						<Action label="Add Employee" iconPath={iconPaths.addEmployee} />
						<Action label="Add Shift" iconPath={iconPaths.addShift} strokeWidth={2.5} />
						<Action label="Export PDF" iconPath={iconPaths.exportPdf} />
					</View>
					<View className="mt-1">
						<View className="mb-4 flex-row items-center justify-between">
							<Text style={{ fontSize: 20, fontWeight: "700" }}>Today's Schedule</Text>
							<Text style={{ fontSize: 12, fontWeight: "600", color: "#5B7B6C" }}>View Full</Text>
						</View>
						<View className="space-y-3">
							{scheduleItems.map((item) => (
								<View key={item.id} className="flex-row items-center justify-between rounded-2xl border border-slate-50 bg-white p-4" style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}>
									<View className="flex-row items-center">
										<View className="h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-slate-100"><Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B" }}>{item.name.charAt(0)}</Text></View>
										<View className="ml-3">
											<Text style={{ fontSize: 14, fontWeight: "700" }}>{item.name}</Text>
											<Text style={{ fontSize: 10, color: "#64748B", fontWeight: "500" }}>In {formatTimeTo12h(item.startTime)}, Out {formatTimeTo12h(item.endTime)}</Text>
										</View>
									</View>
									<View className="flex-row items-center"><Text style={{ fontSize: 14, fontWeight: "700", color: "#334155", marginRight: 6 }}>{toDurationLabel(item.startTime, item.endTime)}</Text><Icon path="m9 18 6-6-6-6" size={20} stroke="#CBD5E1" /></View>
								</View>
							))}
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export { ScannerIcon };
