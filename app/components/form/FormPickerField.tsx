import type { ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function FormPickerField({
	value,
	placeholder,
	onPress,
	rightIcon,
	valueColor = "#0F172A",
}: {
	value: string;
	placeholder?: string;
	onPress: () => void;
	rightIcon?: ReactNode;
	valueColor?: string;
}) {
	const hasValue = Boolean(value);
	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-row items-center rounded-2xl bg-white px-4"
			style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}
		>
			<Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: hasValue ? valueColor : "#94A3B8" }}>
				{hasValue ? value : placeholder || "Select"}
			</Text>
			<View>{rightIcon}</View>
		</TouchableOpacity>
	);
}
