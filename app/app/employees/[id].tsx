import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Switch,
	TextInput,
	View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Button from "@/components/Button";
import Text from "@/components/Text";
import {
	useEmployee,
	useUpdateEmployee,
	useUpdateEmployeeStatus,
} from "@/api/employees/hooks";

export default function EmployeeDetailsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const employeeId = useMemo(() => id ?? "", [id]);
	const { data, isLoading, isError } = useEmployee(employeeId);
	const updateEmployee = useUpdateEmployee(employeeId);
	const updateStatus = useUpdateEmployeeStatus(employeeId);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [age, setAge] = useState("");
	const [hourlyRate, setHourlyRate] = useState("");

	useEffect(() => {
		if (!data) return;

		setFirstName(data.firstName ?? "");
		setLastName(data.lastName ?? "");
		setAge(String(data.age ?? ""));
		setHourlyRate(String(data.hourlyRate ?? ""));
	}, [data]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator />
			</View>
		);
	}

	if (isError || !data) {
		return (
			<View className="flex-1 items-center justify-center p-5">
				<Text className="text-red-500">Failed to load employee details.</Text>
			</View>
		);
	}

	const isActive = data.status === "ACTIVE";

	return (
		<KeyboardAvoidingView
			className="flex-1"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView className="flex-1 bg-white p-4" contentContainerStyle={{ gap: 16 }}>
				<Text className="text-2xl font-bold">
					{data.firstName} {data.lastName}
				</Text>

				<View className="rounded-xl border border-zinc-200 p-4" style={{ gap: 8 }}>
					<Text className="font-semibold">Employment status</Text>
					<View className="flex-row items-center justify-between">
						<Text>{isActive ? "Active" : "Inactive"}</Text>
						<Switch
							value={isActive}
							onValueChange={(value) =>
								updateStatus.mutate(value ? "ACTIVE" : "INACTIVE")
							}
						/>
					</View>
				</View>

				<View className="rounded-xl border border-zinc-200 p-4" style={{ gap: 10 }}>
					<Text className="font-semibold">Stats</Text>
					<Text>Assigned shifts: {data.stats.assignedShifts}</Text>
					<Text>Total hours: {data.stats.totalHours}</Text>
					<Text>Total pay: ${data.stats.totalPay}</Text>
				</View>

				<View className="rounded-xl border border-zinc-200 p-4" style={{ gap: 10 }}>
					<Text className="font-semibold">Edit profile</Text>
					<TextInput
						value={firstName}
						onChangeText={setFirstName}
						placeholder="First name"
						className="rounded-lg border border-zinc-300 p-3"
					/>
					<TextInput
						value={lastName}
						onChangeText={setLastName}
						placeholder="Last name"
						className="rounded-lg border border-zinc-300 p-3"
					/>
					<TextInput
						value={age}
						onChangeText={setAge}
						placeholder="Age"
						keyboardType="number-pad"
						className="rounded-lg border border-zinc-300 p-3"
					/>
					<TextInput
						value={hourlyRate}
						onChangeText={setHourlyRate}
						placeholder="Hourly rate"
						keyboardType="decimal-pad"
						className="rounded-lg border border-zinc-300 p-3"
					/>
					<Button
						text="Save profile"
						submittingText="Saving..."
						isSubmitting={updateEmployee.isPending}
						onPress={() =>
							updateEmployee.mutate({
								firstName,
								lastName,
								age: Number(age),
								hourlyRate: Number(hourlyRate),
							})
						}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
