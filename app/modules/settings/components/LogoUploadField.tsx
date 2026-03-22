import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

type Props = {
	logoUrl?: string;
	onPick: () => void;
	uploading?: boolean;
};

export function LogoUploadField({ logoUrl, onPick, uploading }: Props) {
	return (
		<View className="mb-3">
			<Text className="text-gray-700 mb-2">Logotip tvrtke</Text>
			<View className="flex-row items-center gap-3">
				<View className="h-16 w-16 rounded-lg border border-gray-300 bg-gray-50 overflow-hidden items-center justify-center">
					{logoUrl ? (
						<Image source={{ uri: logoUrl }} style={{ width: 64, height: 64 }} contentFit="cover" />
					) : (
						<Text className="text-xs text-gray-500">Nema logotipa</Text>
					)}
				</View>
				<Pressable
					onPress={onPick}
					className="rounded-lg bg-gray-200 px-4 py-2"
					disabled={uploading}
				>
					<Text>{uploading ? "Prijenos..." : "Prenesi logotip"}</Text>
				</Pressable>
			</View>
		</View>
	);
}
