import type { ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";

const BRAND = "#5B7B6C";

export function FormActionButton({
	variant,
	text,
	onPress,
	disabled,
	leftIcon,
	rightIcon,
}: {
	variant: "primary" | "secondary";
	text: string;
	onPress: () => void;
	disabled?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
}) {
	const isPrimary = variant === "primary";

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			className="flex-row items-center justify-center rounded-2xl"
			style={{
				height: 56,
				borderWidth: isPrimary ? 0 : 1,
				borderColor: isPrimary ? "transparent" : "#E2E8F0",
				backgroundColor: isPrimary ? BRAND : "transparent",
				opacity: disabled ? 0.7 : 1,
				...(isPrimary
					? {
							shadowColor: BRAND,
							shadowOpacity: 0.25,
							shadowOffset: { width: 0, height: 8 },
							shadowRadius: 12,
							elevation: 5,
						}
					: {}),
			}}
		>
			{leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
			<Text style={{ fontSize: 16, lineHeight: 20, fontWeight: isPrimary ? "700" : "600", color: isPrimary ? "#FFFFFF" : "#64748B" }}>{text}</Text>
			{rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}
		</TouchableOpacity>
	);
}
