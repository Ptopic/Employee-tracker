import { SafeAreaView } from "react-native";
import { CalendarScreen } from "@/modules/calendar/screens/CalendarScreen";

export default function CalendarTabScreen() {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<CalendarScreen />
		</SafeAreaView>
	);
}
