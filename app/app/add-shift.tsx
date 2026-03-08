import { router } from "expo-router";
import { Alert, View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";

export default function AddShiftScreen() {
  const handleCreateShift = () => {
    Alert.alert(
      "Shift added",
      "Add Shift quick action is connected. Shift creation will use backend scheduling APIs when available.",
    );
    router.back();
  };

  return (
    <View className="flex-1 bg-white px-5 py-8">
      <Text className="text-2xl font-bold text-black">Add Shift</Text>
      <Text className="mt-2 text-sm text-gray-600">
        Schedule a shift and assign it to the right employee.
      </Text>

      <View className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Text className="text-sm text-gray-700">
          This flow is scaffolded for quick actions and ready for integration with shift
          creation endpoints.
        </Text>
      </View>

      <View className="mt-6 gap-3">
        <Button text="Save Shift" onPress={handleCreateShift} />
        <Button text="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}
