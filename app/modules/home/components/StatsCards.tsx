import { View } from "react-native";
import { Calendar, Clock, User } from "lucide-react-native";
import Text from "@/components/Text";

type StatsCardsProps = {
	weeklyHours: number;
	todayEmployees: number;
	todayShifts: number;
	isLoading?: boolean;
};

function Card({
	title,
	value,
	icon,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
}) {
	return (
		<View className="flex-1 rounded-2xl p-4 bg-[#F8FBFF] border border-[#E5EDF6]">
			<View className="w-8 h-8 rounded-full items-center justify-center mb-2 bg-sky-600">
				{icon}
			</View>
			<Text className="text-slate-500 text-xs mb-1">{title}</Text>
			<Text className="text-[26px] leading-7 font-bold text-slate-900">{value}</Text>
		</View>
	);
}

export function StatsCards({
	weeklyHours,
	todayEmployees,
	todayShifts,
	isLoading,
}: StatsCardsProps) {
	return (
		<View className="mb-6">
			<Text className="text-[24px] font-semibold mb-3 text-slate-900">Attendance Summary</Text>
			<View className="flex-row gap-3">
				<Card
					title="Present"
					value={isLoading ? "..." : `${todayEmployees}`}
					icon={<User size={15} color="#fff" />}
				/>
				<Card
					title="Shifts"
					value={isLoading ? "..." : `${todayShifts}`}
					icon={<Calendar size={15} color="#fff" />}
				/>
				<Card
					title="Week Hours"
					value={isLoading ? "..." : `${weeklyHours.toFixed(1)}h`}
					icon={<Clock size={15} color="#fff" />}
				/>
			</View>
		</View>
	);
}
