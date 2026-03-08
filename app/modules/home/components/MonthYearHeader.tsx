import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";

type MonthYearHeaderProps = {
	monthDate: Date;
	onPrevMonth: () => void;
	onNextMonth: () => void;
};

export function MonthYearHeader({
	monthDate,
	onPrevMonth,
	onNextMonth,
}: MonthYearHeaderProps) {
	const monthYear = monthDate.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<View className="flex-row items-center justify-between mb-4">
			<TouchableOpacity onPress={onPrevMonth} className="px-3 py-2 rounded-lg bg-white">
				<Text className="text-lg">←</Text>
			</TouchableOpacity>
			<Text className="text-2xl font-bold text-black">{monthYear}</Text>
			<TouchableOpacity onPress={onNextMonth} className="px-3 py-2 rounded-lg bg-white">
				<Text className="text-lg">→</Text>
			</TouchableOpacity>
		</View>
	);
}
