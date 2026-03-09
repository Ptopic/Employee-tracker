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

function TimeColumn({
	value,
	label,
	highlighted,
}: {
	value: string;
	label: string;
	highlighted?: boolean;
}) {
	return (
		<View className="flex-1 items-center border-l border-[#E8ECEB]">
			<Text
				className={highlighted ? "text-white" : "text-[#1B2126]"}
				style={{ fontSize: 15, fontWeight: "600", lineHeight: 20 }}
			>
				{value}
			</Text>
			<Text
				className={highlighted ? "text-[#DCEAE5]" : "text-[#8A9692]"}
				style={{ fontSize: 11, fontWeight: "400", lineHeight: 14, marginTop: 2 }}
			>
				{label}
			</Text>
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
		<AppCard className={`p-3 mb-2 ${highlighted ? "bg-[#5D8A7D] border-[#5D8A7D]" : ""}`}>
			<View className="flex-row items-center gap-3">
				<View
					className={`w-[72px] h-[84px] rounded-xl items-center justify-center ${highlighted ? "bg-white" : "bg-[#5D8A7D]"}`}
				>
					<Text
						className={highlighted ? "text-[#5D8A7D]" : "text-white"}
						style={{ fontSize: 24, fontWeight: "700", lineHeight: 28 }}
					>
						{dayNumber}
					</Text>
					<Text
						className={highlighted ? "text-[#7A8D86]" : "text-white"}
						style={{ fontSize: 14, fontWeight: "500", lineHeight: 18 }}
					>
						{weekday}
					</Text>
				</View>

				<TimeColumn value={checkIn} label="Check In" highlighted={highlighted} />
				<TimeColumn value={checkOut} label="Check Out" highlighted={highlighted} />
				<TimeColumn value={totalHours} label="Total Hours" highlighted={highlighted} />
			</View>

			<View className="flex-row items-center mt-3 ml-[86px]">
				<Ionicons name="location" size={13} color={highlighted ? "#DDEAE5" : "#7B8B86"} />
				<Text
					className={`ml-1 ${highlighted ? "text-[#DDEAE5]" : "text-[#7B8B86]"}`}
					style={{ fontSize: 12, fontWeight: "400", lineHeight: 16 }}
				>
					{location}
				</Text>
			</View>
		</AppCard>
	);
}
