import { useLocalSearchParams, router } from "expo-router";
import { Alert, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { CalendarDays, Plus } from "lucide-react-native";
import { useDeleteShift, useDaySchedule } from "@/api/shifts/hooks";
import Text from "@/components/Text";
import { Button } from "@/components/ui";
import { EmployeeCard } from "@/modules/home/components/EmployeeCard";
import { formatTime } from "@/utils/datetime";
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

function extractHHmm(value: string) {
	if (!value) return "00:00";
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
	const isoMatch = value.match(/T(\d{2}:\d{2})/);
	if (isoMatch?.[1]) return isoMatch[1];
	const looseMatch = value.match(/(\d{2}):(\d{2})/);
	if (looseMatch?.[1] && looseMatch?.[2]) return `${looseMatch[1]}:${looseMatch[2]}`;
	return "00:00";
}

function toDurationLabel(startTime: string, endTime: string) {
	const [startH, startM] = extractHHmm(startTime).split(":").map(Number);
	const [endH, endM] = extractHHmm(endTime).split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function formatDateLabel(dateString: string) {
	const date = new Date(`${dateString}T00:00:00`);
	return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function DayScheduleScreen() {
	const { date } = useLocalSearchParams<{ date: string }>();
	const day = date || new Date().toISOString().slice(0, 10);
	const dayScheduleQuery = useDaySchedule(day);
	const deleteShiftMutation = useDeleteShift();
	const { timeFormat } = usePreferencesState();

	const scheduleItems = (dayScheduleQuery.data?.shifts ?? []).flatMap((shift) =>
		shift.assignments.map((assignment) => ({
			id: assignment.id,
			shiftId: shift.id,
			employeeId: assignment.employeeId,
			name: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
			startTime: extractHHmm(shift.startTime),
			endTime: extractHHmm(shift.endTime),
			employeeIds: shift.assignments.map((a) => a.employeeId),
		})),
	);

	const confirmDelete = (shiftId: string) => {
		Alert.alert("Delete shift", "This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Delete", style: "destructive", onPress: () => deleteShiftMutation.mutate(shiftId) },
		]);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 10 }}
				refreshControl={<RefreshControl refreshing={dayScheduleQuery.isRefetching} onRefresh={() => dayScheduleQuery.refetch()} tintColor={BRAND} />}
			>
				<View className="mb-5">
					<Text style={{ fontSize: 28, fontWeight: "700", lineHeight: 34, marginBottom: 12 }}>Day Schedule</Text>
					<View className="flex-row items-center self-start rounded-xl bg-white px-3 py-2" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
						<CalendarDays size={18} color="#0F172A" strokeWidth={2} />
						<Text style={{ marginLeft: 8, fontSize: 13, fontWeight: "700" }}>{formatDateLabel(day)}</Text>
					</View>
				</View>

				<View style={{ gap: 12 }}>
					{dayScheduleQuery.isLoading
						? Array.from({ length: 3 }).map((_, idx) => (
								<View key={`schedule-skeleton-${idx}`} className="flex-row items-center justify-between rounded-2xl bg-white" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, padding: 16 }]}>
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
						: scheduleItems.map((item) => (
								<View key={item.id}>
									<EmployeeCard
										name={item.name}
										timeLabel={`${formatTime(item.startTime, timeFormat)}-${formatTime(item.endTime, timeFormat)}`}
										duration={toDurationLabel(item.startTime, item.endTime)}
										onPress={() =>
											router.push(
												`/shift/edit?shiftId=${item.shiftId}&date=${day}&startTime=${item.startTime}&endTime=${item.endTime}&employeeIds=${item.employeeIds.join(",")}` as any,
											)
										}
									/>
									<View className="mt-2 flex-row justify-end">
										<TouchableOpacity onPress={() => confirmDelete(item.shiftId)} className="rounded-lg px-3 py-2" style={{ backgroundColor: "#FEE2E2" }}>
											<Text style={{ fontSize: 12, fontWeight: "700", color: "#B91C1C" }}>Delete shift</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}

					{!dayScheduleQuery.isLoading && !scheduleItems.length ? (
						<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
							<Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>No shifts scheduled for this day.</Text>
						</View>
					) : null}
				</View>
			</ScrollView>

			<View style={{ position: "absolute", left: 24, right: 24, bottom: 30 }}>
				<Button
					variant="primary"
					text="Add Shift"
					onPress={() => router.push(`/shift/edit?date=${day}` as any)}
					leftIcon={<Plus size={20} color="#FFFFFF" strokeWidth={2.4} />}
				/>
			</View>
		</SafeAreaView>
	);
}
