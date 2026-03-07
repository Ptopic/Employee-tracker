import { Link } from "expo-router";
import type React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Text from "@/components/Text";
import { getTailwindHexColor } from "@/utils/getTailwindColor";

interface IProps {
	title: string;
	icon?: React.ReactNode;
	iconName?: string;
	bgColor: string;
	textColor: string;
	url: string;
}

const ExtractCard = ({
	title,
	icon,
	iconName,
	bgColor,
	textColor,
	url,
}: IProps) => {
	const bgColorHex = getTailwindHexColor(bgColor);
	const textColorHex = getTailwindHexColor(textColor);

	return (
		<Link href={url as any}>
			<View
				className="flex-row gap-[5] items-center text-center p-[10] rounded-lg"
				style={{ backgroundColor: bgColorHex }}
			>
				{icon}
				{iconName && (
					<Icon name={iconName} size={20} color={`${textColorHex}`} />
				)}
				<Text className="text-xl font-bold" style={{ color: textColorHex }}>
					{title}
				</Text>
			</View>
		</Link>
	);
};

export default ExtractCard;
