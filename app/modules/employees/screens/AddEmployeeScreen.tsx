import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useCreateEmployee } from "@/api/employees/hooks";
import Text from "@/components/Text";
import { EmployeeForm } from "../components/EmployeeForm";

export function AddEmployeeScreen() {
	const createMutation = useCreateEmployee();

	return (
		<View className="flex-1 bg-gray-100">
			<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
				<Text className="text-2xl font-bold mb-1">Add Employee</Text>
				<Text className="text-gray-600 mb-4">Create a new employee profile</Text>

				<EmployeeForm
					initialValues={{
						firstName: "",
						lastName: "",
						age: "",
						hourlyRate: "",
						status: "ACTIVE",
					}}
					onSubmit={(payload) =>
						createMutation.mutate(payload, {
							onSuccess: () => router.back(),
						})
					}
					onCancel={() => router.back()}
					submitLabel="Save"
					loading={createMutation.isPending}
				/>

				{createMutation.isError ? (
					<Text className="text-red-600 mt-3">Could not create employee. Please try again.</Text>
				) : null}
			</ScrollView>
		</View>
	);
}
