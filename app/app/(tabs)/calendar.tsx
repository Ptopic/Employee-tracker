import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

function getTodayIsoDate() {
	const now = new Date();
	const month = `${now.getMonth() + 1}`.padStart(2, "0");
	const day = `${now.getDate()}`.padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}`;
}

export default function CalendarScreen() {
	const openDaySchedule = () => {
		router.push({
			pathname: "/day-schedule",
			params: { date: getTodayIsoDate() },
		});
	};

	return (
		<View className="flex-1 bg-white px-5 py-8">
			<Text className="text-2xl font-bold text-black">Calendar</Text>
			<Text className="mt-2 text-sm text-gray-600">
				Open a single day schedule and quickly add shifts.
			</Text>

			<Pressable
				onPress={openDaySchedule}
				className="mt-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
			>
				<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-black/90">
					<FontAwesome name="calendar" size={16} color="white" />
				</View>
				<View className="flex-1">
					<Text className="text-base font-bold text-black">Today’s Day Schedule</Text>
					<Text className="mt-1 text-sm text-gray-600">
						View today and jump to Add Shift.
					</Text>
				</View>
				<FontAwesome name="angle-right" size={18} color="#6b7280" />
			</Pressable>
		</View>
	);
}
