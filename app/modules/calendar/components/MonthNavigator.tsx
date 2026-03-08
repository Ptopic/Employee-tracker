import { Pressable, View } from "react-native";
import Text from "@/components/Text";

type Props = {
	monthDate: Date;
	onPrevMonth: () => void;
	onNextMonth: () => void;
};

export function MonthNavigator({ monthDate, onPrevMonth, onNextMonth }: Props) {
	return (
		<View className="flex-row items-center justify-between mb-4">
			<Pressable className="px-3 py-2 rounded-lg bg-gray-200" onPress={onPrevMonth}>
				<Text className="font-semibold">◀</Text>
			</Pressable>
			<Text className="text-xl font-bold">
				{monthDate.toLocaleDateString(undefined, {
					month: "long",
					year: "numeric",
				})}
			</Text>
			<Pressable className="px-3 py-2 rounded-lg bg-gray-200" onPress={onNextMonth}>
				<Text className="font-semibold">▶</Text>
			</Pressable>
		</View>
	);
}
