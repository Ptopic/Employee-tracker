import { SafeAreaView } from "react-native";
import { SettingsScreen } from "@/modules/settings/screens/SettingsScreen";

export default function SettingsTabScreen() {
	return (
		<SafeAreaView className="flex-1 bg-[#F8F9F8]">
			<SettingsScreen />
		</SafeAreaView>
	);
}
