import { Pressable, View } from "react-native";
import Text from "@/components/Text";

type Props = {
	onPreview: () => void;
	onExport: () => void;
	disabled?: boolean;
	loading?: boolean;
};

export function ExportActions({ onPreview, onExport, disabled, loading }: Props) {
	return (
		<View className="gap-3">
			<Pressable
				className="rounded-lg bg-white border border-black py-3 items-center"
				onPress={onPreview}
				disabled={disabled || loading}
			>
				<Text className="text-black font-semibold">Preview</Text>
			</Pressable>
			<Pressable className="rounded-lg bg-black py-3 items-center" onPress={onExport} disabled={disabled || loading}>
				<Text className="text-white font-semibold">{loading ? "Exporting..." : "Export & Share PDF"}</Text>
			</Pressable>
		</View>
	);
}
