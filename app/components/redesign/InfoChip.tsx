import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/components/Text";

type InfoChipProps = {
	label: string;
};

export function InfoChip({ label }: InfoChipProps) {
	return (
		<View className="h-9 max-w-[58%] rounded-full bg-[#5D8A7D] px-3 flex-row items-center gap-1.5 self-start">
			<Ionicons name="location" size={13} color="#fff" />
			<Text
				className="text-white"
				style={{ fontSize: 13, fontWeight: "500", lineHeight: 16 }}
				numberOfLines={1}
			>
				{label}
			</Text>
		</View>
	);
}
