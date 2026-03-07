import { Link } from "expo-router";
import type React from "react";
import { TouchableOpacity } from "react-native";
import Text from "@/components/Text";

const LinkComponent = ({
	href,
	children,
	onPress,
}: {
	href?: string;
	onPress?: () => void;
	children: React.ReactNode;
}) => {
	return (
		<>
			{onPress ? (
				<TouchableOpacity onPress={onPress}>
					<Text className="text-black underline">{children}</Text>
				</TouchableOpacity>
			) : (
				<Link href={href as any}>
					<Text className="text-black underline">{children}</Text>
				</Link>
			)}
		</>
	);
};

export default LinkComponent;
