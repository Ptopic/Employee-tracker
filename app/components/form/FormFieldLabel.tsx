import { View } from "react-native";
import Text from "@/components/Text";

export function FormFieldLabel({ label }: { label: string }) {
	return (
		<View style={{ marginBottom: 6 }}>
			<Text
				style={{
					fontSize: 11,
					fontWeight: "600",
					color: "#94A3B8",
					textTransform: "uppercase",
					letterSpacing: 0.6,
				}}
			>
				{label}
			</Text>
		</View>
	);
}
