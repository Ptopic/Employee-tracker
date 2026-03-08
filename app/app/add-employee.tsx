import { router } from "expo-router";
import { Alert, View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";

export default function AddEmployeeScreen() {
  const handleCreateEmployee = () => {
    Alert.alert(
      "Employee added",
      "New employee quick action is connected. Full form fields will be wired with backend create APIs.",
    );
    router.back();
  };

  return (
    <View className="flex-1 bg-white px-5 py-8">
      <Text className="text-2xl font-bold text-black">Add Employee</Text>
      <Text className="mt-2 text-sm text-gray-600">
        Create an employee and include their role and default work details.
      </Text>

      <View className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Text className="text-sm text-gray-700">
          This screen is scaffolded for the Home quick action flow and will be connected to
          create-employee APIs in a follow-up integration task.
        </Text>
      </View>

      <View className="mt-6 gap-3">
        <Button text="Save Employee" onPress={handleCreateEmployee} />
        <Button text="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}
