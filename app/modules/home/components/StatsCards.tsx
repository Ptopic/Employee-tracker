import { View } from "react-native";
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
	accent,
}: {
	title: string;
	value: string;
	accent: string;
}) {
	return (
		<View className="flex-1 rounded-2xl p-4 bg-slate-50 border border-slate-200">
			<View className="w-8 h-8 rounded-full items-center justify-center mb-2" style={{ backgroundColor: accent }}>
				<Text className="text-white text-xs">●</Text>
			</View>
			<Text className="text-slate-500 text-xs mb-1">{title}</Text>
			<Text className="text-xl font-bold text-slate-900">{value}</Text>
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
		<View className="mb-5">
			<Text className="text-lg font-semibold mb-3 text-slate-900">Attendance Summary</Text>
			<View className="flex-row gap-3">
				<Card
					title="Present"
					value={isLoading ? "..." : `${todayEmployees}`}
					accent="#0284c7"
				/>
				<Card
					title="Shifts"
					value={isLoading ? "..." : `${todayShifts}`}
					accent="#059669"
				/>
				<Card
					title="Week Hours"
					value={isLoading ? "..." : `${weeklyHours.toFixed(1)}h`}
					accent="#7c3aed"
				/>
			</View>
		</View>
	);
}
