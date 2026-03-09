import { useEffect, useMemo } from "react";
import {
	RefreshControl,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import {
	useTodayEmployees,
	useTodayShifts,
	useWeeklyHours,
} from "@/api/home/hooks";
import type { TodayShift } from "@/api/home/types";
import Text from "@/components/Text";
import { HistoryRow, MetricTile, SectionHeader } from "@/components/redesign";
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
	if (!shifts.length) return { first: "--:--", last: "--:--" };
	const sorted = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
	const sortedEnd = [...shifts].sort((a, b) => b.endTime.localeCompare(a.endTime));
	return { first: sorted[0].startTime, last: sortedEnd[0].endTime };
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

	const weeklyHoursQuery = useWeeklyHours(managerId);
	const todayEmployeesQuery = useTodayEmployees(managerId);
	const todayShiftsQuery = useTodayShifts(managerId);

	const isLoading =
		userInfoQuery.isLoading ||
		weeklyHoursQuery.isLoading ||
		todayEmployeesQuery.isLoading ||
		todayShiftsQuery.isLoading;

	const hasError =
		Boolean(userInfoQuery.error) ||
		Boolean(weeklyHoursQuery.error) ||
		Boolean(todayEmployeesQuery.error) ||
		Boolean(todayShiftsQuery.error);

	const onRefresh = async () => {
		await Promise.all([
			userInfoQuery.refetch(),
			weeklyHoursQuery.refetch(),
			todayEmployeesQuery.refetch(),
			todayShiftsQuery.refetch(),
		]);
	};

	const firstName = useMemo(() => {
		const fullName = userInfoQuery.data?.fullName;
		return fullName ? fullName.split(" ")[0] : "Manager";
	}, [userInfoQuery.data?.fullName]);

	const shifts = todayShiftsQuery.data ?? [];
	const { first, last } = getRange(shifts);
	const todayEmployees = todayEmployeesQuery.data?.count ?? 0;
	const todayShifts = shifts.length;
	const absence = Math.max(todayEmployees - todayShifts, 0);

	const previewRows = useMemo(
		() => [
			{ id: "preview-1", dayNumber: "22", weekday: "Wed", checkIn: "07:57", checkOut: "17:00", totalHours: "08:03" },
			{ id: "preview-2", dayNumber: "21", weekday: "Tue", checkIn: "08:03", checkOut: "17:08", totalHours: "08:05" },
		],
		[],
	);

	return (
		<SafeAreaView className="flex-1 bg-[#EEF2F1]">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				<View className="flex-row items-start justify-between">
					<View>
						<Text className="text-[#7B8B86]" style={{ fontSize: 14, fontWeight: "400", lineHeight: 18 }}>
							Good Morning,
						</Text>
						<Text className="text-[#151A1F]" style={{ fontSize: 18, fontWeight: "700", lineHeight: 24, marginTop: 2 }}>
							{firstName}
						</Text>
					</View>
					<TouchableOpacity
						className="w-10 h-10 rounded-full bg-white items-center justify-center mt-1"
						style={{
							shadowColor: "#000",
							shadowOpacity: 0.06,
							shadowRadius: 8,
							shadowOffset: { width: 0, height: 2 },
							elevation: 2,
						}}
					>
						<Ionicons name="notifications-outline" size={18} color="#1F2937" />
					</TouchableOpacity>
				</View>

				<View className="mt-3">
					<Text className="text-[#27312E]" style={{ fontSize: 13, fontWeight: "400", lineHeight: 18 }}>
						{getTodayDateLabel()}
					</Text>
				</View>

				<View className="mt-3 gap-2">
					<View className="flex-row gap-2">
						<MetricTile
							label="Check In"
							subLabel="Early"
							value={isLoading ? "--:--" : first.slice(0, 5)}
							icon="arrow-down"
							valueVariant="time"
						/>
						<MetricTile
							label="Check Out"
							subLabel="Not yet"
							value={isLoading ? "--:--" : last.slice(0, 5)}
							icon="arrow-up"
							muted
							valueVariant="time"
						/>
					</View>
					<View className="flex-row gap-2">
						<MetricTile
							label="Absence"
							subLabel="November"
							value={isLoading ? ".." : String(absence)}
							unit="Day"
							icon="arrow-up"
							valueVariant="metric"
						/>
						<MetricTile
							label="Total Attended"
							subLabel="November"
							value={isLoading ? ".." : String(todayEmployees)}
							unit="Day"
							icon="refresh"
							valueVariant="metric"
						/>
					</View>
				</View>

				<View className="mt-5">
					<SectionHeader title="Attendance History" actionLabel="See More" />

					{hasError ? (
						<View className="rounded-2xl p-4 bg-red-50 border border-red-200">
							<Text className="body text-red-700">Unable to load dashboard data. Pull to refresh.</Text>
						</View>
					) : null}

					{shifts.map((shift: TodayShift) => {
						const date = new Date(shift.date);
						const dayNumber = String(date.getUTCDate());
						const weekday = date.toLocaleDateString("en-US", {
							weekday: "short",
							timeZone: "UTC",
						});

						return (
							<HistoryRow
								key={shift.id}
								dayNumber={dayNumber}
								weekday={weekday}
								checkIn={shift.startTime.slice(0, 5)}
								checkOut={shift.endTime.slice(0, 5)}
								totalHours={durationBetweenTimes(shift.startTime, shift.endTime)}
								location={LOCATION_LABEL}
								highlighted={false}
							/>
						);
					})}

					{!isLoading && shifts.length === 0 ? (
						<View>
							{previewRows.map((row) => (
								<HistoryRow
									key={row.id}
									dayNumber={row.dayNumber}
									weekday={row.weekday}
									checkIn={row.checkIn}
									checkOut={row.checkOut}
									totalHours={row.totalHours}
									location={LOCATION_LABEL}
									highlighted={false}
								/>
							))}
						</View>
					) : null}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
