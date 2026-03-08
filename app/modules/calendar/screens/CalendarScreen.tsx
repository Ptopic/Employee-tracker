import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useMonthShifts } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import Text from "@/components/Text";
import { CalendarGrid } from "../components/CalendarGrid";
import { MonthNavigator } from "../components/MonthNavigator";

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

export function CalendarScreen() {
	const [monthDate, setMonthDate] = useState(new Date());
	const [quickAddDate, setQuickAddDate] = useState<string | null>(null);

	const monthStart = useMemo(
		() => new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
		[monthDate],
	);
	const monthEnd = useMemo(
		() => new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
		[monthDate],
	);

	const monthShiftsQuery = useMonthShifts(toIsoDate(monthStart), toIsoDate(monthEnd));
	const summary = useMemo(
		() =>
			shiftsRequests.buildCalendarSummary(
				monthShiftsQuery.data ?? [],
				monthStart,
				monthEnd,
			),
		[monthShiftsQuery.data, monthStart, monthEnd],
	);

	return (
		<ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
			<MonthNavigator
				monthDate={monthDate}
				onPrevMonth={() =>
					setMonthDate((current) =>
						new Date(current.getFullYear(), current.getMonth() - 1, 1),
					)
				}
				onNextMonth={() =>
					setMonthDate((current) =>
						new Date(current.getFullYear(), current.getMonth() + 1, 1),
					)
				}
			/>

			{monthShiftsQuery.isLoading ? (
				<Text className="text-gray-500 mb-3">Loading calendar...</Text>
			) : null}

			<CalendarGrid
				monthDate={monthDate}
				summary={summary}
				onPressDay={(dayIso) => router.push(`/schedule/day/${dayIso}` as any)}
				onLongPressDay={(dayIso) => setQuickAddDate(dayIso)}
			/>

			{quickAddDate ? (
				<View className="mt-4 rounded-xl bg-white border border-gray-200 p-4">
					<Text className="font-semibold mb-3">Quick add shift for {quickAddDate}</Text>
					<View className="flex-row gap-2">
						<Pressable
							className="flex-1 items-center rounded-lg bg-black py-3"
							onPress={() => {
								router.push(`/shift/edit?date=${quickAddDate}` as any);
								setQuickAddDate(null);
							}}
						>
							<Text className="text-white font-semibold">Add Shift</Text>
						</Pressable>
						<Pressable
							className="flex-1 items-center rounded-lg bg-gray-200 py-3"
							onPress={() => setQuickAddDate(null)}
						>
							<Text className="font-semibold">Cancel</Text>
						</Pressable>
					</View>
				</View>
			) : null}
		</ScrollView>
	);
}
