import { SafeAreaView } from "react-native";
import { EmployeesScreen } from "@/modules/employees/screens/EmployeesScreen";

export default function EmployeesTabScreen() {
	return (
		<SafeAreaView className="flex-1 bg-[#F8F9F8]">
			<EmployeesScreen />
		</SafeAreaView>
	);
}
