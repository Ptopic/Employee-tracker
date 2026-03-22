import { TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import Text from "@/components/Text";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function EmployeePickerField({ value, onPress }: { value: string; onPress: () => void }) {
	return (
		<TouchableOpacity onPress={onPress} className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
			<Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: value === "Odaberite zaposlenika" ? "#94A3B8" : "#0F172A" }}>{value}</Text>
			<ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
		</TouchableOpacity>
	);
}
