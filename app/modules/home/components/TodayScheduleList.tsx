import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/Text";
import type { TodayShift } from "@/api/home/types";
import { usePreferencesState } from "@/shared/state/preferences-state";
import { formatTime } from "@/utils/datetime";

type TodayScheduleListProps = {
	shifts: TodayShift[];
	isLoading?: boolean;
};

const formatTimeRange = (
	startTime: string,
	endTime: string,
	timeFormat: "12h" | "24h",
) => `${formatTime(startTime, timeFormat)} - ${formatTime(endTime, timeFormat)}`;

const durationBetweenTimes = (startTime: string, endTime: string) => {
	const [startH, startM] = startTime.split(":").map(Number);
	const [endH, endM] = endTime.split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
};

const initialsForShift = (shift: TodayShift) => {
	const first = shift.assignments[0]?.employee;
	if (!first) return "--";
	return `${first.firstName[0] ?? ""}${first.lastName[0] ?? ""}`.toUpperCase();
};

const shiftTitle = (shift: TodayShift) => {
	const first = shift.assignments[0]?.employee;
	if (!first) return "Unassigned shift";
	const base = `${first.firstName} ${first.lastName}`;
	if (shift.assignments.length <= 1) return base;
	return `${base} +${shift.assignments.length - 1}`;
};

export function TodayScheduleList({ shifts, isLoading }: TodayScheduleListProps) {
	const { timeFormat } = usePreferencesState();

	return (
		<View className="mb-6">
			<View className="flex-row mb-5 gap-2">
				<View className="flex-1 h-12 rounded-xl border border-slate-200 px-3 flex-row items-center bg-white">
					<Ionicons name="search" size={18} color="#94a3b8" />
					<TextInput
						placeholder="Search"
						editable={false}
						className="text-slate-400 ml-2 flex-1"
					/>
				</View>
				<TouchableOpacity className="w-12 h-12 rounded-xl border border-slate-200 items-center justify-center bg-white">
					<Ionicons name="options-outline" size={18} color="#64748b" />
				</TouchableOpacity>
			</View>

			<Text className="text-[24px] font-semibold mb-3 text-slate-900">Attendance</Text>

			{isLoading ? (
				<View className="rounded-2xl bg-white border border-slate-200 p-4">
					<Text className="text-slate-500">Loading shifts...</Text>
				</View>
			) : shifts.length === 0 ? (
				<View className="rounded-2xl bg-white border border-slate-200 p-4">
					<Text className="text-slate-500">No shifts scheduled for today.</Text>
				</View>
			) : (
				<View className="rounded-2xl border border-slate-200 overflow-hidden mb-1 bg-white">
					{shifts.map((shift, index) => (
						<View
							key={shift.id}
							className={`px-4 py-4 flex-row items-center ${index < shifts.length - 1 ? "border-b border-slate-100" : ""}`}
						>
							<View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center mr-3 border border-cyan-200">
								<Text className="text-cyan-700 text-xs font-semibold">{initialsForShift(shift)}</Text>
							</View>
							<View className="flex-1 pr-2">
								<Text className="text-slate-900 font-semibold text-[19px]">
									{shiftTitle(shift)}
								</Text>
								<Text className="text-slate-500 mt-0.5 text-[16px]">
									In {formatTime(shift.startTime, timeFormat)}, Out {formatTime(shift.endTime, timeFormat)}
								</Text>
							</View>
							<View className="items-end">
								<Text className="text-slate-900 font-semibold text-[17px]">
									{durationBetweenTimes(shift.startTime, shift.endTime)}
								</Text>
								<Ionicons name="chevron-forward" size={16} color="#94a3b8" />
							</View>
						</View>
					))}
				</View>
			)}
		</View>
	);
}
