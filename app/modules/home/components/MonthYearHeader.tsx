import { TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
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
	const monthYear = monthDate.toLocaleDateString("hr-HR", {
		month: "short",
		year: "numeric",
	});

	return (
		<View className="flex-row items-center justify-between mb-5">
			<TouchableOpacity
				onPress={onPrevMonth}
				className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center border border-slate-200"
			>
				<Ionicons name="chevron-back" size={18} color="#334155" />
			</TouchableOpacity>

			<View className="px-4 h-10 rounded-xl bg-white flex-row items-center gap-2 border border-slate-200">
				<Ionicons name="calendar-outline" size={18} color="#0f172a" />
				<Text className="text-[15px] font-semibold text-slate-900">{monthYear}</Text>
				<Ionicons name="chevron-down" size={16} color="#334155" />
			</View>

			<TouchableOpacity
				onPress={onNextMonth}
				className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center border border-slate-200"
			>
				<Ionicons name="chevron-forward" size={18} color="#334155" />
			</TouchableOpacity>
		</View>
	);
}
