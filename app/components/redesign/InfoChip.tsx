import { View } from "react-native";
import { MapPin } from "lucide-react-native";
import Text from "@/components/Text";

type InfoChipProps = {
	label: string;
};

export function InfoChip({ label }: InfoChipProps) {
	return (
		<View className="h-8 max-w-[56%] rounded-full bg-[#5D8A7D] px-3 flex-row items-center gap-1.5 self-start">
			<MapPin size={13} color="#FFFFFF" strokeWidth={2.3} />
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
