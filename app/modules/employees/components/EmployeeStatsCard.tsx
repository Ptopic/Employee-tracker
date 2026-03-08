import { View } from "react-native";
import Text from "@/components/Text";
import type { EmployeeStats } from "@/api/employees/types";

export function EmployeeStatsCard({ stats }: { stats: EmployeeStats }) {
	return (
		<View className="rounded-xl bg-white border border-gray-200 p-4 mb-4">
			<Text className="font-semibold mb-3">Stats</Text>
			<Text className="text-gray-700">Weekly hours: {stats.weeklyHours.toFixed(2)}h</Text>
			<Text className="text-gray-700">Monthly hours: {stats.monthlyHours.toFixed(2)}h</Text>
			<Text className="text-gray-700">
				Estimated monthly cost: ${stats.estimatedMonthlyCost.toFixed(2)}
			</Text>
		</View>
	);
}
