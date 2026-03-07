import { View } from "react-native";
import { InstagramIcon, TiktokIcon } from "@/shared/svgs";
import { getTailwindHexColor } from "@/utils/getTailwindColor";
import Text from "./Text";

interface IProps {
	socialMediaType: string;
	displayText?: boolean;
	iconSize?: number;
	color?: string;
}

const SocialMediaIcon = ({
	socialMediaType,
	displayText = true,
	iconSize = 14,
	color = getTailwindHexColor("gray500"),
}: IProps) => {
	return (
		<View className="flex-row gap-1 items-center">
			{socialMediaType === "tiktok" && (
				<TiktokIcon width={iconSize} height={iconSize} color={color} />
			)}
			{socialMediaType === "instagram" && (
				<InstagramIcon width={iconSize} height={iconSize} color={color} />
			)}
			{displayText && (
				<Text className="body-small-regular" style={{ color }}>
					{socialMediaType === "tiktok"
						? "Tiktok"
						: socialMediaType === "instagram"
							? "Instagram"
							: ""}
				</Text>
			)}
		</View>
	);
};

export default SocialMediaIcon;
