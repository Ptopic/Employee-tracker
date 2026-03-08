import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

type QuickAction = {
  title: string;
  description: string;
  icon: ComponentProps<typeof FontAwesome>["name"];
  route: "/add-employee" | "/add-shift" | "/export-weekly-pdf";
};

const quickActions: QuickAction[] = [
  {
    title: "Add Employee",
    description: "Create a new employee profile.",
    icon: "user-plus",
    route: "/add-employee",
  },
  {
    title: "Add Shift",
    description: "Schedule a shift for your team.",
    icon: "calendar-plus-o",
    route: "/add-shift",
  },
  {
    title: "Export Weekly PDF",
    description: "Generate this week’s schedule PDF.",
    icon: "file-pdf-o",
    route: "/export-weekly-pdf",
  },
];

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white px-5 py-8">
      <Text className="text-2xl font-bold text-black">Home</Text>
      <Text className="mt-2 text-sm text-gray-600">
        Quick actions to speed up common manager tasks.
      </Text>

      <View className="mt-6 gap-3">
        {quickActions.map((action) => (
          <Pressable
            key={action.title}
            onPress={() => router.push(action.route)}
            className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-black/90">
              <FontAwesome name={action.icon} size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black">{action.title}</Text>
              <Text className="mt-1 text-sm text-gray-600">{action.description}</Text>
            </View>
            <FontAwesome name="angle-right" size={18} color="#6b7280" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
