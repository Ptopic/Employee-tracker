import { router } from "expo-router";
import { SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import { useToast } from "react-native-toast-notifications";
import { useCreateEmployee } from "@/api/employees/hooks";
import Text from "@/components/Text";
import { EmployeeForm } from "../components/EmployeeForm";

const BG = "#F8F9F8";

export function AddEmployeeScreen() {
	const createMutation = useCreateEmployee();
	const toast = useToast();

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView bounces={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 4 }}>
				<View className="items-center pt-1 pb-1">
					<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
				</View>

				<View className="mb-6 mt-4 flex-row items-center justify-between">
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>Add Employee</Text>
					<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

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
							onSuccess: () => {
								toast.show("Employee created successfully", { type: "success" });
								router.back();
							},
							onError: () => {
								toast.show("Could not create employee. Please try again.", { type: "error" });
							},
						})
					}
					onCancel={() => router.back()}
					submitLabel="Save Changes"
					loading={createMutation.isPending}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}
