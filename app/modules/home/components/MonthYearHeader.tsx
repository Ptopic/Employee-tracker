import { TouchableOpacity, View } from "react-native";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react-native";
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
		month: "short",
		year: "numeric",
	});

	return (
		<View className="flex-row items-center justify-between mb-5">
			<TouchableOpacity
				onPress={onPrevMonth}
				className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center border border-slate-200"
			>
				<ChevronLeft size={18} color="#334155" strokeWidth={2} />
			</TouchableOpacity>

			<View className="px-4 h-10 rounded-xl bg-white flex-row items-center gap-2 border border-slate-200">
				<CalendarIcon size={18} color="#0f172a" strokeWidth={2} />
				<Text className="text-[15px] font-semibold text-slate-900">{monthYear}</Text>
				<ChevronDown size={16} color="#334155" strokeWidth={2} />
			</View>

			<TouchableOpacity
				onPress={onNextMonth}
				className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center border border-slate-200"
			>
				<ChevronRight size={18} color="#334155" strokeWidth={2} />
			</TouchableOpacity>
		</View>
	);
}
