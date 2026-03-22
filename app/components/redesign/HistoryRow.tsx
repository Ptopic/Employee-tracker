import { View } from "react-native";
import { MapPin } from "lucide-react-native";
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
		<AppCard className={`px-3 py-2.5 mb-2 ${highlighted ? "bg-[#5D8A7D] border-[#5D8A7D]" : ""}`}>
			<View className="flex-row items-center gap-2.5">
				<View
					className={`w-[60px] h-[72px] rounded-xl items-center justify-center ${highlighted ? "bg-white" : "bg-[#5D8A7D]"}`}
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

				<TimeColumn value={checkIn} label="Dolazak" highlighted={highlighted} />
				<TimeColumn value={checkOut} label="Odlazak" highlighted={highlighted} />
				<TimeColumn value={totalHours} label="Ukupno sati" highlighted={highlighted} />
			</View>

			<View className="flex-row items-center mt-2 ml-[72px]">
				<MapPin size={13} color={highlighted ? "#DDEAE5" : "#7B8B86"} strokeWidth={2.4} />
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
