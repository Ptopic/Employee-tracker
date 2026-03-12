import type { ReactNode } from "react";
import { TextInput, View } from "react-native";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function Input({
	value,
	onChangeText,
	onBlur,
	placeholder,
	leftIcon,
	rightIcon,
	height = 56,
}: {
	value: string;
	onChangeText: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	height?: number;
}) {
	return (
		<View className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height, borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
			{leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
			<TextInput
				value={value}
				onChangeText={onChangeText}
				onBlur={onBlur}
				placeholder={placeholder}
				placeholderTextColor="#94A3B8"
				style={{ flex: 1, fontSize: 14, fontWeight: "500", color: "#0F172A" }}
			/>
			{rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}
		</View>
	);
}
