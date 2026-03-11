import { SafeAreaView } from "react-native";
import { EmployeesScreen } from "@/modules/employees/screens/EmployeesScreen";

export default function EmployeesTabScreen() {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<EmployeesScreen />
		</SafeAreaView>
	);
}
