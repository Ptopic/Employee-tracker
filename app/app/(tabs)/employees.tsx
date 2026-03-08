import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import Text from "@/components/Text";
import { useEmployees } from "@/api/employees/hooks";

export default function EmployeesScreen() {
	const { data, isLoading, isError } = useEmployees();

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator />
			</View>
		);
	}

	if (isError) {
		return (
			<View className="flex-1 items-center justify-center p-5">
				<Text className="text-red-500">Failed to load employees.</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-white p-4" contentContainerStyle={{ gap: 12 }}>
			<Text className="text-2xl font-bold">Employees</Text>
			{data?.map((employee) => (
				<Pressable
					key={employee.id}
					onPress={() => router.push(`/employees/${employee.id}` as any)}
					className="rounded-xl border border-zinc-200 p-4"
				>
					<Text className="text-lg font-semibold">
						{employee.firstName} {employee.lastName}
					</Text>
					<Text className="text-zinc-600">Age: {employee.age}</Text>
					<Text className="text-zinc-600">Hourly rate: ${employee.hourlyRate}</Text>
					<Text className="text-zinc-600">Status: {employee.status}</Text>
				</Pressable>
			))}
		</ScrollView>
	);
}
