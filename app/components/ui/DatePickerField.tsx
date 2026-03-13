import { TouchableOpacity } from "react-native";
import { CalendarDays } from "lucide-react-native";
import Text from "@/components/Text";

const BRAND = "#5B7B6C";
const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function DatePickerField({ value, onPress }: { value: string; onPress: () => void }) {
	return (
		<TouchableOpacity onPress={onPress} className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}>
			<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{value}</Text>
			<CalendarDays size={20} color={BRAND} strokeWidth={2} />
		</TouchableOpacity>
	);
}
