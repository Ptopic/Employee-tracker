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
};

export function MetricTile({
	label,
	subLabel,
	value,
	unit,
	icon,
	muted,
}: MetricTileProps) {
	const iconBg = muted ? "#BFD0CB" : "#5D8A7D";
	const primary = muted ? "#9DA7A4" : "#1B2126";
	const secondary = muted ? "#C1C9C6" : "#98A4A0";

	return (
		<AppCard className={`p-4 flex-1 h-[146px] ${muted ? "bg-[#F6F7F7]" : ""}`}>
			<View className="flex-row items-start gap-2">
				<View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
					<Ionicons name={icon} size={14} color="#fff" />
				</View>
				<View className="flex-1">
					<Text className="heading text-[#1D2429] leading-6">{label}</Text>
					{subLabel ? <Text className="caption" style={{ color: secondary }}>{subLabel}</Text> : null}
				</View>
			</View>

			<View className="mt-auto flex-row items-end gap-2">
				<Text className="heading-large-bold" style={{ color: primary }}>
					{value}
				</Text>
				{unit ? <Text className="body" style={{ color: secondary }}>{unit}</Text> : null}
			</View>
		</AppCard>
	);
}
