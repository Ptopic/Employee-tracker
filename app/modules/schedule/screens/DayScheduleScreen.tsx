import { useLocalSearchParams, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useDaySchedule, useDeleteShift } from "@/api/shifts/hooks";
import Text from "@/components/Text";
import { usePreferencesState } from "@/shared/state/preferences-state";
import { formatTime } from "@/utils/datetime";

export function DayScheduleScreen() {
	const { date } = useLocalSearchParams<{ date: string }>();
	const day = date || new Date().toISOString().slice(0, 10);
	const dayScheduleQuery = useDaySchedule(day);
	const deleteShiftMutation = useDeleteShift();
	const { timeFormat } = usePreferencesState();

	return (
		<View className="flex-1 bg-gray-100">
			<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
				<Text className="text-2xl font-bold mb-1">Day Schedule</Text>
				<Text className="text-gray-600 mb-4">{day}</Text>

				{(dayScheduleQuery.data?.shifts ?? []).map((shift) => (
					<View key={shift.id} className="rounded-xl bg-white border border-gray-200 p-4 mb-3">
						<Text className="font-semibold mb-2">
							{formatTime(shift.startTime, timeFormat)}–{formatTime(shift.endTime, timeFormat)}
						</Text>

						<View className="flex-row flex-wrap gap-2 mb-3">
							{shift.assignments.length ? (
								shift.assignments.map((assignment) => (
									<View key={assignment.id} className="rounded-full bg-gray-100 px-3 py-1">
										<Text className="text-xs">
											{assignment.employee.firstName} {assignment.employee.lastName}
										</Text>
									</View>
								))
							) : (
								<Text className="text-orange-600 text-sm">No employees assigned</Text>
							)}
						</View>

						<View className="flex-row gap-2">
							<Pressable
								className="flex-1 rounded-lg bg-gray-900 py-2 items-center"
								onPress={() =>
									router.push(
										`/shift/edit?shiftId=${shift.id}&date=${day}&startTime=${shift.startTime}&endTime=${shift.endTime}&employeeIds=${shift.assignments
											.map((a) => a.employeeId)
											.join(",")}` as any,
									)
								}
							>
								<Text className="text-white">Edit</Text>
							</Pressable>
							<Pressable
								className="flex-1 rounded-lg bg-red-100 py-2 items-center"
								onPress={() => deleteShiftMutation.mutate(shift.id)}
							>
								<Text className="text-red-700">Delete</Text>
							</Pressable>
						</View>
					</View>
				))}

				{!dayScheduleQuery.data?.shifts?.length ? (
					<View className="rounded-xl bg-white border border-gray-200 p-6">
						<Text className="text-gray-500">No shifts for this day.</Text>
					</View>
				) : null}
			</ScrollView>

			<Pressable
				className="absolute bottom-6 left-4 right-4 rounded-xl bg-black py-4 items-center"
				onPress={() => router.push(`/shift/edit?date=${day}` as any)}
			>
				<Text className="text-white font-semibold">➕ Add Shift</Text>
			</Pressable>
		</View>
	);
}
