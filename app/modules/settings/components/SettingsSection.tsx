import { View } from "react-native";
import Text from "@/components/Text";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	title: string;
}>;

export function SettingsSection({ title, children }: Props) {
	return (
		<View className="rounded-xl bg-white border border-gray-200 p-4 mb-3">
			<Text className="text-lg font-semibold mb-3">{title}</Text>
			{children}
		</View>
	);
}
