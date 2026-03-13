import { View } from "react-native";
import Text from "@/components/Text";
import type { EmployeeStats } from "@/api/employees/types";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function EmployeeStatsCard({ stats }: { stats: EmployeeStats }) {
	return (
		<View style={{ gap: 12, marginBottom: 18 }}>
			<Text style={{ fontSize: 14, fontWeight: "700", color: "#334155" }}>Current Stats</Text>
			<View className="flex-row" style={{ gap: 12 }}>
				<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
					<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Weekly</Text>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
						{stats.weeklyHours.toFixed(2)} <Text style={{ fontSize: 10, color: "#94A3B8" }}>hrs</Text>
					</Text>
				</View>

				<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
					<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Monthly</Text>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
						{stats.monthlyHours.toFixed(2)} <Text style={{ fontSize: 10, color: "#94A3B8" }}>hrs</Text>
					</Text>
				</View>

				<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
					<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Cost</Text>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
						${Math.round(stats.estimatedMonthlyCost)}
					</Text>
				</View>
			</View>
		</View>
	);
}
