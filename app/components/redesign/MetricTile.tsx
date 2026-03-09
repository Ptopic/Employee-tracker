import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/components/Text";
import { AppCard } from "./AppCard";

type MetricTileProps = {
	label: string;
	subLabel?: string;
	value: string;
	unit?: string;
	icon: keyof typeof Ionicons.glyphMap;
	muted?: boolean;
	valueVariant?: "time" | "metric";
};

export function MetricTile({
	label,
	subLabel,
	value,
	unit,
	icon,
	muted,
	valueVariant = "time",
}: MetricTileProps) {
	const iconBg = muted ? "#C8D3D0" : "#5D8A7D";
	const primary = muted ? "#BEC7C4" : "#111827";
	const secondary = muted ? "#C3CBCA" : "#97A29E";
	const valueSize = valueVariant === "time" ? 24 : 22;

	return (
		<AppCard className={`px-4 pt-3 pb-3 flex-1 h-[126px] ${muted ? "bg-[#F6F7F7]" : ""}`}>
			<View className="flex-row items-start gap-2">
				<View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
					<Ionicons name={icon} size={14} color="#fff" />
				</View>
				<View className="flex-1">
					<Text className="text-[#1D2429]" style={{ fontSize: 14, fontWeight: "600", lineHeight: 18 }}>
						{label}
					</Text>
					{subLabel ? (
						<Text className="text-[#9AA6A1]" style={{ fontSize: 11, fontWeight: "400", lineHeight: 14 }}>
							{subLabel}
						</Text>
					) : null}
				</View>
			</View>

			<View className="mt-auto flex-row items-end gap-1.5">
				<Text
					className="text-[#1B2126]"
					style={{ fontSize: valueSize, fontWeight: "700", lineHeight: valueVariant === "time" ? 30 : 28 }}
				>
					{value}
				</Text>
				{unit ? (
					<Text className="text-[#9AA6A1]" style={{ fontSize: 11, fontWeight: "400", lineHeight: 14 }}>
						{unit}
					</Text>
				) : null}
			</View>
		</AppCard>
	);
}
