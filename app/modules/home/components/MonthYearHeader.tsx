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
			<TouchableOpacity
				onPress={onPrevMonth}
				className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
			>
				<Text className="text-lg text-slate-700">←</Text>
			</TouchableOpacity>

			<View className="px-4 py-2 rounded-xl bg-slate-100 flex-row items-center gap-2">
				<Text className="text-slate-700">📅</Text>
				<Text className="text-base font-semibold text-slate-900">{monthYear}</Text>
			</View>

			<TouchableOpacity
				onPress={onNextMonth}
				className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
			>
				<Text className="text-lg text-slate-700">→</Text>
			</TouchableOpacity>
		</View>
	);
}
