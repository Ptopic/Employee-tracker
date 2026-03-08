import { View } from "react-native";
import Text from "@/components/Text";

type StatsCardsProps = {
	weeklyHours: number;
	todayEmployees: number;
	isLoading?: boolean;
};

function Card({ title, value }: { title: string; value: string }) {
	return (
		<View className="flex-1 rounded-xl p-4 bg-white border border-gray-200">
			<Text className="text-gray-500 text-xs mb-1">{title}</Text>
			<Text className="text-2xl font-bold text-black">{value}</Text>
		</View>
	);
}

export function StatsCards({ weeklyHours, todayEmployees, isLoading }: StatsCardsProps) {
	return (
		<View className="flex-row gap-3 mb-5">
			<Card
				title="Total scheduled hours (week)"
				value={isLoading ? "..." : `${weeklyHours.toFixed(1)}h`}
			/>
			<Card
				title="Employees working today"
				value={isLoading ? "..." : `${todayEmployees}`}
			/>
		</View>
	);
}
