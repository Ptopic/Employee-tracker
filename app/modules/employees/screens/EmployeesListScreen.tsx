import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useEmployeesList } from "@/api/employees/hooks";
import type { EmployeeStatus } from "@/api/employees/types";
import Text from "@/components/Text";
import { EmployeeListItem } from "../components/EmployeeListItem";

export function EmployeesListScreen() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<EmployeeStatus | undefined>(undefined);
	const [sortBy, setSortBy] = useState<"name" | "hourlyRate" | "monthlyHours" | "status">("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	const filters = useMemo(
		() => ({
			search: search.trim() || undefined,
			status,
			sortBy,
			sortOrder,
		}),
		[search, status, sortBy, sortOrder],
	);

	const employeesQuery = useEmployeesList(filters);

	return (
		<View className="flex-1 bg-gray-100">
			<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
				<View className="flex-row items-center justify-between mb-4">
					<View>
						<Text className="text-2xl font-bold">Employees</Text>
						<Text className="text-gray-500">Manage your roster</Text>
					</View>
					<Pressable
						onPress={() => router.push("/employees/add" as any)}
						className="rounded-lg bg-black px-4 py-2"
					>
						<Text className="text-white font-semibold">➕ Add Employee</Text>
					</Pressable>
				</View>

				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Search by name"
					className="rounded-lg border border-gray-300 bg-white px-3 py-3 mb-3"
				/>

				<View className="flex-row gap-2 mb-4">
					{[
						{ label: "All", value: undefined },
						{ label: "Active", value: "ACTIVE" as EmployeeStatus },
						{ label: "Inactive", value: "INACTIVE" as EmployeeStatus },
					].map((item) => (
						<Pressable
							key={item.label}
							onPress={() => setStatus(item.value)}
							className={`rounded-full px-3 py-2 ${status === item.value ? "bg-black" : "bg-white border border-gray-300"}`}
						>
							<Text className={status === item.value ? "text-white" : "text-gray-700"}>{item.label}</Text>
						</Pressable>
					))}
				</View>

				<View className="flex-row gap-2 mb-4">
					{[
						{ label: "Name", value: "name" as const },
						{ label: "Rate", value: "hourlyRate" as const },
						{ label: "Hours", value: "monthlyHours" as const },
					].map((option) => (
						<Pressable
							key={option.value}
							onPress={() => setSortBy(option.value)}
							className={`rounded-lg px-3 py-2 ${sortBy === option.value ? "bg-black" : "bg-gray-200"}`}
						>
							<Text className={sortBy === option.value ? "text-white" : "text-gray-700"}>{option.label}</Text>
						</Pressable>
					))}
					<Pressable
						onPress={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
						className="rounded-lg bg-gray-200 px-3 py-2"
					>
						<Text>{sortOrder === "asc" ? "↑" : "↓"}</Text>
					</Pressable>
				</View>

				{employeesQuery.isLoading ? <Text className="text-gray-500">Loading employees...</Text> : null}
				{employeesQuery.isError ? <Text className="text-red-600">Failed to load employees.</Text> : null}

				{(employeesQuery.data ?? []).map((employee) => (
					<EmployeeListItem
						key={employee.id}
						employee={employee}
						onPress={() => router.push(`/employees/${employee.id}` as any)}
					/>
				))}

				{!employeesQuery.isLoading && !(employeesQuery.data ?? []).length ? (
					<View className="rounded-xl bg-white border border-gray-200 p-6">
						<Text className="text-gray-500">No employees found.</Text>
					</View>
				) : null}
			</ScrollView>
		</View>
	);
}
