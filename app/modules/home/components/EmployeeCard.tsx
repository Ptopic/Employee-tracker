import { TouchableOpacity, View } from "react-native";
import { ChevronRight, User } from "lucide-react-native";
import Text from "@/components/Text";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function EmployeeCard({
	name,
	timeLabel,
	duration,
	onPress,
	rounded = true,
}: {
	name: string;
	timeLabel: string;
	duration: string;
	onPress: () => void;
	rounded?: boolean;
}) {
	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={onPress}
			className={`flex-row items-center justify-between bg-white ${rounded ? "rounded-2xl" : ""}`}
			style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, padding: 16 }]}
		>
			<View className="flex-row items-center">
				<View
					className="items-center justify-center rounded-full border"
					style={{ width: 40, height: 40, minWidth: 40, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", marginRight: 12 }}
				>
					<User size={20} color="#94A3B8" strokeWidth={2} />
				</View>
				<View>
					<Text style={{ fontSize: 14, fontWeight: "700", lineHeight: 18 }}>{name}</Text>
					<Text style={{ fontSize: 10, lineHeight: 14, color: "#64748B", fontWeight: "500", marginTop: 1 }}>{timeLabel}</Text>
				</View>
			</View>
			<View className="flex-row items-center">
				<Text style={{ fontSize: 14, lineHeight: 18, fontWeight: "700", color: "#334155", marginRight: 6 }}>{duration}</Text>
				<ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
			</View>
		</TouchableOpacity>
	);
}
