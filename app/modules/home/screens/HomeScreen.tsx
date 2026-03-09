import { type ReactNode, useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { ArrowUpCircle, Bell, CheckCircle2, MapPin, RefreshCw } from "lucide-react-native";
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
		<View className="h-28 flex-1 rounded-2xl bg-[#F3F4F4] px-3.5 py-3">
			<View className="flex-row items-center">
				{icon}
				<View className="ml-2">
					<Text className={muted ? "text-[#C6CCD4]" : "text-[#111827]"} style={{ fontSize: 14, fontWeight: "600", lineHeight: 20 }}>
						{title}
					</Text>
					<Text className={muted ? "text-[#D5D9DF]" : "text-[#9CA3AF]"} style={{ fontSize: 12, fontWeight: "400", lineHeight: 16 }}>
						{subtitle}
					</Text>
				</View>
			</View>
			<View className="mt-3 flex-row items-end">
				<Text
					className={muted ? "text-[#CFD4DA]" : "text-[#111827]"}
					style={{ fontSize: 46, fontWeight: "700", lineHeight: 48, letterSpacing: -0.5 }}
				>
					{value}
				</Text>
				{unit ? (
					<Text className={muted ? "text-[#CFD4DA]" : "text-[#111827]"} style={{ fontSize: 16, fontWeight: "400", lineHeight: 20, marginBottom: 6, marginLeft: 4 }}>
						{unit}
					</Text>
				) : null}
			</View>
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
		<View className="rounded-2xl bg-white px-3 py-3 mb-3">
			<View className="flex-row">
				<View className="h-[68px] w-[68px] items-center justify-center rounded-xl bg-[#5F857A]">
					<Text className="text-white" style={{ fontSize: 34, fontWeight: "700", lineHeight: 36 }}>
						{dayNumber}
					</Text>
					<Text className="text-white" style={{ fontSize: 16, fontWeight: "400", lineHeight: 20, marginTop: -2 }}>
						{weekday}
					</Text>
				</View>

				<View className="ml-4 flex-1 flex-row justify-between pt-0.5">
					{[
						{ label: "Check In", value: checkIn },
						{ label: "Check Out", value: checkOut },
						{ label: "Total Hours", value: totalHours },
					].map((item) => (
						<View key={item.label}>
							<Text className="text-[#111827]" style={{ fontSize: 34, fontWeight: "700", lineHeight: 36 }}>
								{item.value}
							</Text>
							<Text className="text-[#9CA3AF]" style={{ fontSize: 12, fontWeight: "400", lineHeight: 16, marginTop: 2 }}>
								{item.label}
							</Text>
						</View>
					))}
				</View>
			</View>

			<View className="mt-3 flex-row items-center pl-[84px]">
				<MapPin size={14} color="#5F857A" strokeWidth={2.2} />
				<Text className="text-[#6B7280]" style={{ fontSize: 14, fontWeight: "400", lineHeight: 20, marginLeft: 8 }}>
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
		if (!selectedManagerId && userInfoQuery.data?.id) {
			setSelectedManagerId(userInfoQuery.data.id);
		}
	}, [selectedManagerId, setSelectedManagerId, userInfoQuery.data?.id]);

	const managerId = selectedManagerId || userInfoQuery.data?.id;
	const todayEmployeesQuery = useTodayEmployees(managerId);
	const todayShiftsQuery = useTodayShifts(managerId);

	const isLoading =
		userInfoQuery.isLoading ||
		todayEmployeesQuery.isLoading ||
		todayShiftsQuery.isLoading;

	const onRefresh = async () => {
		await Promise.all([
			userInfoQuery.refetch(),
			todayEmployeesQuery.refetch(),
			todayShiftsQuery.refetch(),
		]);
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
		<SafeAreaView className="flex-1 bg-[#EEF2F1]">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 110 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				<View className="px-6 pt-2">
					<View className="flex-row items-start justify-between">
						<View>
							<Text className="text-[#6B7280]" style={{ fontSize: 28, fontWeight: "400", lineHeight: 34 }}>
								Good Morning,
							</Text>
							<Text className="text-[#111827]" style={{ fontSize: 32, fontWeight: "700", lineHeight: 38, marginTop: -2 }}>
								{fullName}
							</Text>
						</View>
						<TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-[#EEF2F1]">
							<Bell size={22} color="#111827" strokeWidth={1.9} />
						</TouchableOpacity>
					</View>

					<Text className="mt-4 text-[#6B7280]" style={{ fontSize: 14, fontWeight: "400", lineHeight: 20 }}>
						{getTodayDateLabel()}
					</Text>

					<View className="mt-3 self-end flex-row items-center rounded-xl bg-[#5F857A] px-3 py-2">
						<MapPin size={14} color="#FFFFFF" strokeWidth={2.2} />
						<Text className="ml-2 text-white" style={{ fontSize: 14, fontWeight: "500", lineHeight: 20 }}>
							West Jakarta, Indonesia
						</Text>
					</View>
				</View>

				<View className="mt-4 px-6">
					<View className="flex-row gap-3">
						<StatTile
							title="Check In"
							subtitle="Early"
							value={first}
							icon={<CheckCircle2 size={18} color="#5F857A" strokeWidth={2.2} />}
						/>
						<StatTile
							title="Check Out"
							subtitle="Not Yet"
							value={last}
							muted
							icon={<ArrowUpCircle size={18} color="#D4D9DF" strokeWidth={2.2} />}
						/>
					</View>

					<View className="mt-3 flex-row gap-3">
						<StatTile
							title="Absence"
							subtitle="November"
							value={String(absence)}
							unit="Day"
							icon={<ArrowUpCircle size={18} color="#5F857A" strokeWidth={2.2} />}
						/>
						<StatTile
							title="Total Attended"
							subtitle="November"
							value={String(todayEmployees)}
							unit="Day"
							icon={<RefreshCw size={18} color="#5F857A" strokeWidth={2.2} />}
						/>
					</View>
				</View>

				<View className="mt-5 flex-row items-center justify-between px-6">
					<Text className="text-[#111827]" style={{ fontSize: 32, fontWeight: "700", lineHeight: 38 }}>
						Attendance History
					</Text>
					<Text className="text-[#6B7280]" style={{ fontSize: 16, fontWeight: "500", lineHeight: 22 }}>
						See More
					</Text>
				</View>

				<View className="mt-3 px-6">
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
