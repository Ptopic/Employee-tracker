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
	return (
		<AppCard className={`p-4 flex-1 ${muted ? "opacity-50" : ""}`}>
			<View className="w-7 h-7 rounded-full bg-[#5D8A7D] items-center justify-center mb-2">
				<Ionicons name={icon} size={14} color="#fff" />
			</View>
			<Text className="text-[28px] leading-8 font-bold text-[#151A1F]">{value}</Text>
			{unit ? <Text className="text-[#9AA6A1]">{unit}</Text> : null}
			<Text className="text-[22px] leading-7 font-semibold text-[#1D2429] mt-1">{label}</Text>
			{subLabel ? <Text className="text-[#9AA6A1]">{subLabel}</Text> : null}
		</AppCard>
	);
}
