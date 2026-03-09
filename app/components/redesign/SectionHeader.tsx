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
			<Text className="heading-large-bold text-[#151A1F]">{title}</Text>
			{actionLabel ? (
				<TouchableOpacity onPress={onActionPress}>
					<Text className="body-small text-[#6C817A] font-semibold">{actionLabel}</Text>
				</TouchableOpacity>
			) : null}
		</View>
	);
}
