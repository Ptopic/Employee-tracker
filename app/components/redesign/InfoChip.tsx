import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/components/Text";

type InfoChipProps = {
	label: string;
};

export function InfoChip({ label }: InfoChipProps) {
	return (
		<View className="h-9 rounded-full bg-[#5D8A7D] px-4 flex-row items-center gap-2 self-start">
			<Ionicons name="location" size={14} color="#fff" />
			<Text className="body-small text-white font-semibold">{label}</Text>
		</View>
	);
}
