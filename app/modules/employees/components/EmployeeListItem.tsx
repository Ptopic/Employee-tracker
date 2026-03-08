import { Pressable, View } from "react-native";
import Text from "@/components/Text";
import type { EmployeeListItem as Employee } from "@/api/employees/types";

export function EmployeeListItem({
	employee,
	onPress,
}: {
	employee: Employee;
	onPress: () => void;
}) {
	return (
		<Pressable onPress={onPress} className="rounded-xl bg-white border border-gray-200 p-4 mb-3">
			<View className="flex-row items-center justify-between mb-1">
				<Text className="font-semibold text-base">
					{employee.firstName} {employee.lastName}
				</Text>
				<View
					className={`rounded-full px-3 py-1 ${employee.status === "ACTIVE" ? "bg-green-100" : "bg-gray-200"}`}
				>
					<Text
						className={`text-xs font-semibold ${employee.status === "ACTIVE" ? "text-green-700" : "text-gray-600"}`}
					>
						{employee.status === "ACTIVE" ? "Active" : "Inactive"}
					</Text>
				</View>
			</View>
			<Text className="text-gray-700">Hourly rate: ${employee.hourlyRate.toFixed(2)}</Text>
			<Text className="text-gray-700">Monthly hours: {employee.monthlyHours.toFixed(2)}h</Text>
		</Pressable>
	);
}
