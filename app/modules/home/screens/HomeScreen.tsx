import { useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { ArrowUpCircle, Bell, CheckCircle2, MapPin, RefreshCw } from "lucide-react-native";
import type { ReactNode } from "react";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import { useTodayEmployees, useTodayShifts } from "@/api/home/hooks";
import type { TodayShift } from "@/api/home/types";
import Text from "@/components/Text";
import { useAppState } from "@/shared/state/app-state";

const LOCATION_LABEL = "Office, West Jakarta, Indonesia";

function getTodayDateLabel() {
	return new Date().toLocaleDateString("en-US", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function durationBetweenTimes(startTime: string, endTime: string) {
	const [startH, startM] = startTime.split(":").map(Number);
	const [endH, endM] = endTime.split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getRange(shifts: TodayShift[]) {
	if (!shifts.length) return { first: "07:58", last: "17:00" };
	const sorted = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
	const sortedEnd = [...shifts].sort((a, b) => b.endTime.localeCompare(a.endTime));
	return { first: sorted[0].startTime.slice(0, 5), last: sortedEnd[0].endTime.slice(0, 5) };
}

function StatTile({
	title,
	subtitle,
	value,
	unit,
	muted,
	icon,
}: {
	title: string;
	subtitle: string;
	value: string;
	unit?: string;
	muted?: boolean;
	icon: ReactNode;
}) {
	return (
		<View className="h-[102px] flex-1 rounded-2xl bg-[#F3F4F4] px-3 py-2.5">
			<View className="flex-row items-center gap-2">
				{icon}
				<View>
					<Text className={muted ? "text-[#CDD2D8]" : "text-[#121212]"} style={{ fontSize: 12, fontWeight: "600", lineHeight: 16 }}>
						{title}
					</Text>
					<Text className={muted ? "text-[#D8DCE1]" : "text-[#9CA3AF]"} style={{ fontSize: 11, fontWeight: "400", lineHeight: 14 }}>
						{subtitle}
					</Text>
				</View>
			</View>
			<View className="mt-2 flex-row items-end">
				<Text className={muted ? "text-[#CFD4DA]" : "text-[#111827]"} style={{ fontSize: 28, fontWeight: "700", lineHeight: 32 }}>
					{value}
				</Text>
				{unit ? (
					<Text className={muted ? "text-[#CFD4DA]" : "text-[#6B7280]"} style={{ fontSize: 12, fontWeight: "400", lineHeight: 16, marginLeft: 4, marginBottom: 2 }}>
						{unit}
					</Text>
				) : null}
			</View>
		</View>
	);
}

function HistoryMetric({ value, label }: { value: string; label: string }) {
	return (
		<View className="flex-1 pl-2 border-l border-[#EDEFF2]">
			<Text className="text-[#111827]" style={{ fontSize: 20, fontWeight: "600", lineHeight: 24 }}>
				{value}
			</Text>
			<Text className="text-[#9CA3AF]" style={{ fontSize: 11, fontWeight: "400", lineHeight: 14, marginTop: 2 }}>
				{label}
			</Text>
		</View>
	);
}

function HistoryRow({
	dayNumber,
	weekday,
	checkIn,
	checkOut,
	totalHours,
}: {
	dayNumber: string;
	weekday: string;
	checkIn: string;
	checkOut: string;
	totalHours: string;
}) {
	return (
		<View className="rounded-2xl bg-white px-3 py-3 mb-2.5">
			<View className="flex-row items-center">
				<View className="h-16 w-14 rounded-xl bg-[#5F857A] items-center justify-center">
					<Text className="text-white" style={{ fontSize: 20, fontWeight: "700", lineHeight: 24 }}>{dayNumber}</Text>
					<Text className="text-white" style={{ fontSize: 12, fontWeight: "400", lineHeight: 16 }}>{weekday}</Text>
				</View>
				<View className="ml-3 flex-1 flex-row">
					<HistoryMetric value={checkIn} label="Check In" />
					<HistoryMetric value={checkOut} label="Check Out" />
					<HistoryMetric value={totalHours} label="Total Hours" />
				</View>
			</View>
			<View className="mt-2.5 ml-[68px] flex-row items-center">
				<MapPin size={13} color="#5F857A" strokeWidth={2.2} />
				<Text className="text-[#6B7280]" style={{ fontSize: 12, fontWeight: "400", lineHeight: 16, marginLeft: 6 }}>
					{LOCATION_LABEL}
				</Text>
			</View>
		</View>
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

	const isLoading = userInfoQuery.isLoading || todayEmployeesQuery.isLoading || todayShiftsQuery.isLoading;
	const onRefresh = async () => {
		await Promise.all([userInfoQuery.refetch(), todayEmployeesQuery.refetch(), todayShiftsQuery.refetch()]);
	};

	const fullName = userInfoQuery.data?.fullName || "Akhmad Maariz";
	const shifts = todayShiftsQuery.data ?? [];
	const { first, last } = getRange(shifts);
	const todayEmployees = todayEmployeesQuery.data?.count ?? 15;
	const absence = Math.max(todayEmployees - shifts.length, 0);

	const previewRows = useMemo(
		() => [
			{ id: "preview-1", dayNumber: "22", weekday: "Wed", checkIn: "07:57", checkOut: "17:00", totalHours: "08:03" },
			{ id: "preview-2", dayNumber: "21", weekday: "Tue", checkIn: "08:03", checkOut: "17:08", totalHours: "08:05" },
			{ id: "preview-3", dayNumber: "20", weekday: "Mon", checkIn: "07:59", checkOut: "17:00", totalHours: "08:01" },
		],
		[],
	);

	return (
		<SafeAreaView className="flex-1 bg-[#F4F5F5]">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 112 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				<View className="px-5 pt-1">
					<View className="flex-row justify-between items-start">
						<View>
							<Text className="text-[#6B7280]" style={{ fontSize: 14, fontWeight: "400", lineHeight: 20 }}>Good Morning,</Text>
							<Text className="text-[#111827]" style={{ fontSize: 28, fontWeight: "700", lineHeight: 34, marginTop: 1 }}>{fullName}</Text>
						</View>
						<TouchableOpacity className="h-10 w-10 rounded-full bg-white items-center justify-center">
							<Bell size={20} color="#111827" strokeWidth={1.9} />
						</TouchableOpacity>
					</View>
					<Text className="mt-3 text-[#6B7280]" style={{ fontSize: 13, fontWeight: "400", lineHeight: 18 }}>{getTodayDateLabel()}</Text>
					<View className="mt-3 self-end flex-row items-center rounded-full bg-[#5F857A] px-3 py-2">
						<MapPin size={12} color="#FFFFFF" strokeWidth={2.4} />
						<Text className="ml-2 text-white" style={{ fontSize: 13, fontWeight: "500", lineHeight: 16 }}>West Jakarta, Indonesia</Text>
					</View>
				</View>

				<View className="mt-3 px-5">
					<View className="flex-row gap-2.5">
						<StatTile title="Check In" subtitle="Early" value={first} icon={<CheckCircle2 size={16} color="#5F857A" strokeWidth={2.4} />} />
						<StatTile title="Check Out" subtitle="Not Yet" value={last} muted icon={<ArrowUpCircle size={16} color="#D4D9DF" strokeWidth={2.4} />} />
					</View>
					<View className="mt-2.5 flex-row gap-2.5">
						<StatTile title="Absence" subtitle="November" value={String(absence)} unit="Day" icon={<ArrowUpCircle size={16} color="#5F857A" strokeWidth={2.4} />} />
						<StatTile title="Total Attended" subtitle="November" value={String(todayEmployees)} unit="Day" icon={<RefreshCw size={16} color="#5F857A" strokeWidth={2.4} />} />
					</View>
				</View>

				<View className="mt-4 px-5 flex-row items-center justify-between">
					<Text className="text-[#111827]" style={{ fontSize: 20, fontWeight: "700", lineHeight: 28 }}>Attendance History</Text>
					<Text className="text-[#6B7280]" style={{ fontSize: 14, fontWeight: "500", lineHeight: 20 }}>See More</Text>
				</View>

				<View className="mt-2.5 px-5">
					{shifts.length
						? shifts.map((shift: TodayShift) => {
								const date = new Date(shift.date);
								return (
									<HistoryRow
										key={shift.id}
										dayNumber={String(date.getUTCDate())}
										weekday={date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
										checkIn={shift.startTime.slice(0, 5)}
										checkOut={shift.endTime.slice(0, 5)}
										totalHours={durationBetweenTimes(shift.startTime, shift.endTime)}
									/>
								);
							})
						: previewRows.map((row) => (
								<HistoryRow
									key={row.id}
									dayNumber={row.dayNumber}
									weekday={row.weekday}
									checkIn={row.checkIn}
									checkOut={row.checkOut}
									totalHours={row.totalHours}
								/>
							))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
