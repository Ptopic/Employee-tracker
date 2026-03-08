import { View } from "react-native";
import Text from "@/components/Text";
import type { TodayShift } from "@/api/home/types";

type TodayScheduleListProps = {
	shifts: TodayShift[];
	isLoading?: boolean;
};

const formatTimeRange = (startTime: string, endTime: string) => {
	const start = new Date(startTime);
	const end = new Date(endTime);

	const formatter = new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

	return `${formatter.format(start)} - ${formatter.format(end)}`;
};

const formatEmployeeNames = (shift: TodayShift) => {
	const names = shift.assignments.map(
		(assignment) => `${assignment.employee.firstName} ${assignment.employee.lastName}`,
	);

	if (names.length <= 2) {
		return names;
	}

	return [names[0], `${names[1]} +${names.length - 2} more`];
};

export function TodayScheduleList({ shifts, isLoading }: TodayScheduleListProps) {
	return (
		<View className="mb-5">
			<Text className="text-lg font-semibold mb-3">Today's Schedule</Text>

			{isLoading ? (
				<View className="rounded-xl bg-white border border-gray-200 p-4">
					<Text className="text-gray-500">Loading shifts...</Text>
				</View>
			) : shifts.length === 0 ? (
				<View className="rounded-xl bg-white border border-gray-200 p-4">
					<Text className="text-gray-500">No shifts scheduled for today.</Text>
				</View>
			) : (
				<View className="gap-3">
					{shifts.map((shift) => {
						const names = formatEmployeeNames(shift);

						return (
							<View
								key={shift.id}
								className="rounded-xl bg-white border border-gray-200 p-4"
							>
								<Text className="font-semibold text-black mb-2">
									{formatTimeRange(shift.startTime, shift.endTime)}
								</Text>
								<View className="gap-1">
									{names.map((name) => (
										<Text key={name} className="text-gray-700">
											{name}
										</Text>
									))}
								</View>
							</View>
						);
					})}
				</View>
			)}
		</View>
	);
}
