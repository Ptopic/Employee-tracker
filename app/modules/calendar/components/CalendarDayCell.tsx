import { Pressable, View } from "react-native";
import Text from "@/components/Text";
import type { CalendarDaySummary } from "@/api/shifts/types";

type Props = {
	date: Date;
	isCurrentMonth: boolean;
	summary?: CalendarDaySummary;
	onPress: () => void;
	onLongPress: () => void;
};

const statusClassMap = {
	full: "bg-green-500",
	partial: "bg-yellow-500",
	none: "bg-red-500",
} as const;

export function CalendarDayCell({
	date,
	isCurrentMonth,
	summary,
	onPress,
	onLongPress,
}: Props) {
	const status = summary?.staffingStatus ?? "none";

	return (
		<Pressable
			onPress={onPress}
			onLongPress={onLongPress}
			className={`flex-1 min-h-[72px] rounded-lg border p-2 m-[2px] ${isCurrentMonth ? "bg-white border-gray-200" : "bg-gray-100 border-gray-100"}`}
		>
			<View className="flex-row items-center justify-between">
				<Text className={`text-xs font-semibold ${isCurrentMonth ? "text-black" : "text-gray-400"}`}>
					{date.getDate()}
				</Text>
				<View className={`h-2.5 w-2.5 rounded-full ${statusClassMap[status]}`} />
			</View>
			{summary ? (
				<View className="mt-auto self-start rounded-full bg-gray-100 px-2 py-1">
					<Text className="text-[11px] text-gray-700">{summary.employeeCount} 👤</Text>
				</View>
			) : null}
		</Pressable>
	);
}
