import { useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import {
	useTodayEmployees,
	useTodayShifts,
	useWeeklyHours,
} from "@/api/home/hooks";
import type { TodayShift } from "@/api/home/types";
import Text from "@/components/Text";
import {
	HistoryRow,
	InfoChip,
	MetricTile,
	SectionHeader,
} from "@/components/redesign";
import { usePreferencesState } from "@/shared/state/preferences-state";
import { useAppState } from "@/shared/state/app-state";
import { formatTime } from "@/utils/datetime";

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
	const { timeFormat } = usePreferencesState();

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
	const previewRows = useMemo(() => {
		const today = new Date();
		return [0, 1].map((offset) => {
			const d = new Date(today);
			d.setDate(today.getDate() - offset);
			return {
				id: `preview-${offset}`,
				dayNumber: String(d.getDate()),
				weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
			};
		});
	}, []);
	const todayEmployees = todayEmployeesQuery.data?.count ?? 0;
	const todayShifts = shifts.length;
	const absence = Math.max(todayEmployees - todayShifts, 0);

	return (
		<SafeAreaView className="flex-1 bg-[#EEF2F1]">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				<View className="flex-row items-start justify-between">
					<View>
						<Text className="body-large text-[#7B8B86]">Good Morning,</Text>
						<Text className="heading-large-bold text-[#151A1F] mt-1">{firstName}</Text>
					</View>
					<TouchableOpacity className="w-11 h-11 rounded-full border border-[#DDE4E2] bg-white items-center justify-center mt-1">
						<Ionicons name="notifications-outline" size={20} color="#1B2126" />
					</TouchableOpacity>
				</View>

				<View className="mt-4 flex-row items-center justify-between">
					<Text className="body text-[#667873]">{getTodayDateLabel()}</Text>
					<InfoChip label="West Jakarta, Indonesia" />
				</View>

				<View className="mt-4 gap-3">
					<View className="flex-row gap-3">
						<MetricTile
							label="Check In"
							subLabel="Early"
							value={isLoading ? "--:--" : first.slice(0, 5)}
							icon="arrow-down"
						/>
						<MetricTile
							label="Check Out"
							subLabel="Not yet"
							value={isLoading ? "--:--" : last.slice(0, 5)}
							icon="arrow-up"
							muted
						/>
					</View>
					<View className="flex-row gap-3">
						<MetricTile
							label="Absence"
							subLabel="This month"
							value={isLoading ? ".." : String(absence)}
							unit="Day"
							icon="remove"
						/>
						<MetricTile
							label="Total Attended"
							subLabel="This month"
							value={isLoading ? ".." : String(todayEmployees)}
							unit="Day"
							icon="refresh"
						/>
					</View>
				</View>

				<View className="mt-6">
					<SectionHeader title="Attendance History" actionLabel="See More" />

					{hasError ? (
						<View className="rounded-2xl p-4 bg-red-50 border border-red-200">
							<Text className="body text-red-700">Unable to load dashboard data. Pull to refresh.</Text>
						</View>
					) : null}

					{shifts.map((shift: TodayShift, index: number) => {
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
								checkIn={formatTime(shift.startTime, timeFormat)}
								checkOut={formatTime(shift.endTime, timeFormat)}
								totalHours={durationBetweenTimes(shift.startTime, shift.endTime)}
								location={LOCATION_LABEL}
								highlighted={index === 0}
							/>
						);
					})}

					{!isLoading && shifts.length === 0 ? (
						<View>
							{previewRows.map((row, index) => (
								<HistoryRow
									key={row.id}
									dayNumber={row.dayNumber}
									weekday={row.weekday}
									checkIn="--:--"
									checkOut="--:--"
									totalHours="--:--"
									location={LOCATION_LABEL}
									highlighted={index === 0}
								/>
							))}
						</View>
					) : null}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
