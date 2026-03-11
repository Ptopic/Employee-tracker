import { SafeAreaView } from "react-native";
import { SettingsScreen } from "@/modules/settings/screens/SettingsScreen";

export default function SettingsTabScreen() {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<SettingsScreen />
		</SafeAreaView>
	);
}
