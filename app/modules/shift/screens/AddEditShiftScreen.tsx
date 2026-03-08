import { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useSaveShift, useShiftEmployees } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import Text from "@/components/Text";

const normalizeTime = (v?: string) => (v ? v.slice(0, 5) : "09:00");

export function AddEditShiftScreen() {
	const params = useLocalSearchParams<{
		date?: string;
		shiftId?: string;
		startTime?: string;
		endTime?: string;
		employeeIds?: string;
	}>();

	const [date] = useState(params.date || new Date().toISOString().slice(0, 10));
	const [startTime, setStartTime] = useState(normalizeTime(params.startTime));
	const [endTime, setEndTime] = useState(normalizeTime(params.endTime || "17:00"));
	const [search, setSearch] = useState("");
	const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
		params.employeeIds ? params.employeeIds.split(",").filter(Boolean) : [],
	);
	const [warning, setWarning] = useState<string | null>(null);

	const employeesQuery = useShiftEmployees();
	const saveShiftMutation = useSaveShift();

	const employees = useMemo(() => {
		const list = employeesQuery.data ?? [];
		if (!search.trim()) return list;
		const term = search.trim().toLowerCase();
		return list.filter((e) =>
			`${e.firstName} ${e.lastName}`.toLowerCase().includes(term),
		);
	}, [employeesQuery.data, search]);

	const payload = {
		date,
		startTime,
		endTime,
		employeeIds: selectedEmployeeIds,
	};

	const handleSave = async () => {
		if (startTime >= endTime) {
			setWarning("End time must be later than start time.");
			return;
		}

		if (!selectedEmployeeIds.length) {
			setWarning("Warning: Empty shift is allowed, but no employees are assigned.");
		}

		const overlap = await shiftsRequests.validateOverlap({
			...payload,
			shiftId: params.shiftId,
		});
		if (overlap && !overlap.valid) {
			setWarning("Overlapping assignment detected. Remove conflicting employees.");
			return;
		}

		await saveShiftMutation.mutateAsync({
			shiftId: params.shiftId,
			payload,
		});
		router.back();
	};

	return (
		<ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
			<Text className="text-2xl font-bold mb-1">
				{params.shiftId ? "Edit Shift" : "Add Shift"}
			</Text>
			<Text className="text-gray-600 mb-4">{date}</Text>

			<View className="rounded-xl bg-white border border-gray-200 p-4 mb-3">
				<Text className="font-semibold mb-2">Time</Text>
				<View className="flex-row gap-2">
					<TextInput
						className="flex-1 rounded-lg border border-gray-300 px-3 py-3"
						value={startTime}
						onChangeText={setStartTime}
						placeholder="09:00"
					/>
					<TextInput
						className="flex-1 rounded-lg border border-gray-300 px-3 py-3"
						value={endTime}
						onChangeText={setEndTime}
						placeholder="17:00"
					/>
				</View>
			</View>

			<View className="rounded-xl bg-white border border-gray-200 p-4 mb-3">
				<Text className="font-semibold mb-2">Employees</Text>
				<TextInput
					className="rounded-lg border border-gray-300 px-3 py-3 mb-3"
					placeholder="Search employee"
					value={search}
					onChangeText={setSearch}
				/>
				{employees.map((employee) => {
					const checked = selectedEmployeeIds.includes(employee.id);
					return (
						<Pressable
							key={employee.id}
							className="flex-row items-center py-2"
							onPress={() =>
								setSelectedEmployeeIds((current) =>
									checked
										? current.filter((id) => id !== employee.id)
										: [...current, employee.id],
								)
							}
						>
							<View
								className={`h-5 w-5 rounded border mr-3 ${checked ? "bg-black border-black" : "border-gray-400"}`}
							/>
							<Text>
								{employee.firstName} {employee.lastName}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{warning ? (
				<View className="rounded-lg bg-yellow-50 border border-yellow-300 p-3 mb-4">
					<Text className="text-yellow-800">{warning}</Text>
				</View>
			) : null}

			<View className="flex-row gap-2">
				<Pressable className="flex-1 rounded-lg bg-black py-3 items-center" onPress={handleSave}>
					<Text className="text-white font-semibold">Save</Text>
				</Pressable>
				<Pressable className="flex-1 rounded-lg bg-gray-200 py-3 items-center" onPress={() => router.back()}>
					<Text className="font-semibold">Cancel</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
