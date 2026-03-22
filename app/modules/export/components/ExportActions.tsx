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
				className="rounded-lg bg-white border border-blue-400 py-3 items-center"
				onPress={onPreview}
				disabled={disabled || loading}
			>
				<Text className="text-blue-400 font-semibold">Pregled</Text>
			</Pressable>
			<Pressable className="rounded-lg bg-blue-100 border border-blue-400 py-3 items-center" onPress={onExport} disabled={disabled || loading}>
				<Text className="text-blue-400 font-semibold">{loading ? "Generiranje..." : "Generiraj i podijeli PDF"}</Text>
			</Pressable>
		</View>
	);
}
