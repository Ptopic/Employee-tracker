import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/components/Text";
import { AppCard } from "./AppCard";

type HistoryRowProps = {
	dayNumber: string;
	weekday: string;
	checkIn: string;
	checkOut: string;
	totalHours: string;
	location: string;
	highlighted?: boolean;
};

function Column({ value, label }: { value: string; label: string }) {
	return (
		<View className="flex-1 items-center">
			<Text className="heading-large-bold text-[#1B2126]">{value}</Text>
			<Text className="caption text-[#8A9692] mt-1">{label}</Text>
		</View>
	);
}

export function HistoryRow({
	dayNumber,
	weekday,
	checkIn,
	checkOut,
	totalHours,
	location,
	highlighted,
}: HistoryRowProps) {
	return (
		<AppCard className={`p-3 mb-3 ${highlighted ? "bg-[#5D8A7D] border-[#5D8A7D]" : ""}`}>
			<View className="flex-row items-center gap-3">
				<View className={`w-[72px] h-[84px] rounded-xl items-center justify-center ${highlighted ? "bg-white" : "bg-[#5D8A7D]"}`}>
					<Text className={`display-bold ${highlighted ? "text-[#5D8A7D]" : "text-white"}`}>
						{dayNumber}
					</Text>
					<Text className={`body-small ${highlighted ? "text-[#7A8D86]" : "text-white"}`}>{weekday}</Text>
				</View>
				<Column value={checkIn} label="Check In" />
				<Column value={checkOut} label="Check Out" />
				<Column value={totalHours} label="Total Hours" />
			</View>
			<View className="flex-row items-center mt-3 ml-[86px]">
				<Ionicons name="location" size={14} color={highlighted ? "#DDEAE5" : "#7B8B86"} />
				<Text className={`ml-1 caption ${highlighted ? "text-[#DDEAE5]" : "text-[#7B8B86]"}`}>
					{location}
				</Text>
			</View>
		</AppCard>
	);
}
