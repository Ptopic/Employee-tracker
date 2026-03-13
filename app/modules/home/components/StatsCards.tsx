import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/components/Text";

type StatsCardsProps = {
	weeklyHours: number;
	todayEmployees: number;
	todayShifts: number;
	isLoading?: boolean;
};

function Card({
	title,
	value,
	icon,
}: {
	title: string;
	value: string;
	icon: keyof typeof Ionicons.glyphMap;
}) {
	return (
		<View className="flex-1 rounded-2xl p-4 bg-[#F8FBFF] border border-[#E5EDF6]">
			<View className="w-8 h-8 rounded-full items-center justify-center mb-2 bg-sky-600">
				<Ionicons name={icon} size={15} color="#fff" />
			</View>
			<Text className="text-slate-500 text-xs mb-1">{title}</Text>
			<Text className="text-[26px] leading-7 font-bold text-slate-900">{value}</Text>
		</View>
	);
}

export function StatsCards({
	weeklyHours,
	todayEmployees,
	todayShifts,
	isLoading,
}: StatsCardsProps) {
	return (
		<View className="mb-6">
			<Text className="text-[24px] font-semibold mb-3 text-slate-900">Attendance Summary</Text>
			<View className="flex-row gap-3">
				<Card
					title="Present"
					value={isLoading ? "..." : `${todayEmployees}`}
					icon="person"
				/>
				<Card
					title="Shifts"
					value={isLoading ? "..." : `${todayShifts}`}
					icon="calendar"
				/>
				<Card
					title="Week Hours"
					value={isLoading ? "..." : `${weeklyHours.toFixed(1)}h`}
					icon="time"
				/>
			</View>
		</View>
	);
}
