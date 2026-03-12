import { TextInput, View } from "react-native";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function FormTextArea({
	value,
	onChangeText,
	onBlur,
	placeholder,
}: {
	value: string;
	onChangeText: (value: string) => void;
	onBlur: () => void;
	placeholder: string;
}) {
	return (
		<View style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, borderRadius: 16, backgroundColor: "#FFFFFF" }]}>
			<TextInput
				multiline
				numberOfLines={3}
				value={value}
				onChangeText={onChangeText}
				onBlur={onBlur}
				placeholder={placeholder}
				placeholderTextColor="#94A3B8"
				style={{ minHeight: 96, textAlignVertical: "top", padding: 16, fontSize: 13, color: "#0F172A" }}
			/>
		</View>
	);
}
