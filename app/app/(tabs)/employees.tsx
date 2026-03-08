import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "@/shared/config";
import authenticatedRequest from "@/api/authenticatedRequest";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Text from "@/components/Text";

type Employee = {
	id: string;
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: number | string;
	status: "ACTIVE" | "INACTIVE";
};

const listEmployees = async (): Promise<Employee[]> => {
	const response = await authenticatedRequest(`${config.apiUrl}/employees`, {
		method: "GET",
	});

	return response ?? [];
};

const createEmployee = async (payload: {
	firstName: string;
	lastName: string;
	age: number;
	hourlyRate: number;
}) => {
	return authenticatedRequest(`${config.apiUrl}/employees`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
};

function EmployeeCard({ employee }: { employee: Employee }) {
	return (
		<View className="border border-gray-300 rounded-lg p-3 mb-2">
			<Text className="font-semibold text-base">
				{employee.firstName} {employee.lastName}
			</Text>
			<Text className="text-gray-600">Age: {employee.age}</Text>
			<Text className="text-gray-600">Hourly rate: ${employee.hourlyRate}</Text>
			<Text className="text-gray-600">Status: {employee.status}</Text>
		</View>
	);
}

export default function EmployeesScreen() {
	const queryClient = useQueryClient();
	const [showAddForm, setShowAddForm] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [age, setAge] = useState("");
	const [hourlyRate, setHourlyRate] = useState("");
	const [submitError, setSubmitError] = useState("");

	const { data: employees = [], isLoading, isRefetching } = useQuery({
		queryKey: ["employees"],
		queryFn: listEmployees,
	});

	const createEmployeeMutation = useMutation({
		mutationFn: createEmployee,
		onSuccess: () => {
			setFirstName("");
			setLastName("");
			setAge("");
			setHourlyRate("");
			setSubmitError("");
			setShowAddForm(false);
			queryClient.invalidateQueries({ queryKey: ["employees"] });
		},
		onError: (error) => {
			setSubmitError(error.message || "Failed to add employee");
		},
	});

	const isFormValid = useMemo(() => {
		const ageNumber = Number(age);
		const rateNumber = Number(hourlyRate);
		return (
			firstName.trim().length > 0 &&
			lastName.trim().length > 0 &&
			Number.isFinite(ageNumber) &&
			ageNumber >= 14 &&
			Number.isFinite(rateNumber) &&
			rateNumber > 0
		);
	}, [firstName, lastName, age, hourlyRate]);

	const onSubmit = () => {
		setSubmitError("");
		if (!isFormValid) {
			setSubmitError("Please fill valid first name, last name, age, and hourly rate.");
			return;
		}

		createEmployeeMutation.mutate({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			age: Number(age),
			hourlyRate: Number(hourlyRate),
		});
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View className="flex-1 px-4 pt-5">
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-2xl font-semibold">Employees</Text>
					<TouchableOpacity onPress={() => setShowAddForm((prev) => !prev)}>
						<Text className="text-base font-semibold">
							{showAddForm ? "Close" : "+ Add"}
						</Text>
					</TouchableOpacity>
				</View>

				{showAddForm && (
					<View className="border border-gray-300 rounded-lg p-3 mb-4 gap-3">
						<Input
							name="firstName"
							placeholder="First name"
							value={firstName}
							onChangeText={setFirstName}
							onBlur={() => {}}
						/>
						<Input
							name="lastName"
							placeholder="Last name"
							value={lastName}
							onChangeText={setLastName}
							onBlur={() => {}}
						/>
						<Input
							name="age"
							placeholder="Age"
							value={age}
							onChangeText={setAge}
							onBlur={() => {}}
						/>
						<Input
							name="hourlyRate"
							placeholder="Hourly rate"
							value={hourlyRate}
							onChangeText={setHourlyRate}
							onBlur={() => {}}
						/>
						{submitError ? <Text className="text-red-500">{submitError}</Text> : null}
						<Button
							onPress={onSubmit}
							text="Add employee"
							disabled={createEmployeeMutation.isPending}
							isSubmitting={createEmployeeMutation.isPending}
							submittingText="Adding..."
						/>
					</View>
				)}

				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator />
					</View>
				) : (
					<FlatList
						data={employees}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <EmployeeCard employee={item} />}
						contentContainerStyle={{ paddingBottom: 24 }}
						ListEmptyComponent={
							<View className="items-center mt-8">
								<Text className="text-gray-500">No employees yet.</Text>
							</View>
						}
						ListHeaderComponent={
							isRefetching ? (
								<View className="mb-2">
									<ActivityIndicator size="small" />
								</View>
							) : null
						}
					/>
				)}
			</View>
		</KeyboardAvoidingView>
	);
}
