import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";

type SectionHeaderProps = {
	title: string;
	actionLabel?: string;
	onActionPress?: () => void;
};

export function SectionHeader({
	title,
	actionLabel,
	onActionPress,
}: SectionHeaderProps) {
	return (
		<View className="flex-row items-center justify-between mb-3">
			<Text className="text-[#151A1F]" style={{ fontSize: 17, fontWeight: "700", lineHeight: 22 }}>
				{title}
			</Text>
			{actionLabel ? (
				<TouchableOpacity onPress={onActionPress}>
					<Text className="text-[#6C817A]" style={{ fontSize: 13, fontWeight: "600", lineHeight: 18 }}>
						{actionLabel}
					</Text>
				</TouchableOpacity>
			) : null}
		</View>
	);
}
