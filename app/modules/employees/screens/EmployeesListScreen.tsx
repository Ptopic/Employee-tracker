import { useMemo, useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ArrowDownUp, Plus, Search, X } from "lucide-react-native";
import { useEmployeesList } from "@/api/employees/hooks";
import type { EmployeeStatus } from "@/api/employees/types";
import Text from "@/components/Text";
import { Input } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { EmployeeListItem } from "../components/EmployeeListItem";

const BRAND = "#5B7B6C";
const BG = "#F8F9F8";
const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function EmployeesListScreen() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<EmployeeStatus | undefined>(undefined);
	const [sortBy, setSortBy] = useState<"name" | "hourlyRate" | "monthlyHours" | "status">("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const debouncedSearch = useDebounce(search, 300);

	const filters = useMemo(
		() => ({
			search: debouncedSearch.trim() || undefined,
			status,
			sortBy,
			sortOrder,
		}),
		[debouncedSearch, status, sortBy, sortOrder],
	);

	const employeesQuery = useEmployeesList(filters);
	const employees = employeesQuery.data ?? [];

	return (
		<View className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView bounces={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 110 }}>
				<View className="mb-6 flex-row items-center justify-between">
					<View>
						<Text style={{ fontSize: 24, fontWeight: "700", lineHeight: 30, color: "#0F172A" }}>Employees</Text>
						<Text style={{ fontSize: 12, lineHeight: 16, color: "#94A3B8", marginTop: 2 }}>Manage your employees</Text>
					</View>
					<Pressable
						onPress={() => router.push("/employees/add" as any)}
						className="flex-row items-center rounded-xl"
						style={{ backgroundColor: BRAND, paddingHorizontal: 14, paddingVertical: 10 }}
					>
						<Plus size={16} color="#FFFFFF" strokeWidth={2.6} />
						<Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700", marginLeft: 6 }}>Add Employee</Text>
					</Pressable>
				</View>

				<View style={{ marginTop: 6 }}>
					<Input
						value={search}
						onChangeText={setSearch}
						placeholder="Search by name"
						leftIcon={<Search size={18} color="#94A3B8" strokeWidth={2.2} />}
						rightIcon={search ? (
							<TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
								<X size={16} color="#94A3B8" strokeWidth={2.4} />
							</TouchableOpacity>
						) : undefined}
					/>
				</View>

				<View style={{ marginTop: 12 }}>
					<View className="flex-row" style={{ gap: 8 }}>
						{[
							{ label: "All", value: undefined },
							{ label: "Active", value: "ACTIVE" as EmployeeStatus },
							{ label: "Inactive", value: "INACTIVE" as EmployeeStatus },
						].map((item) => {
							const selected = status === item.value;
							return (
								<Pressable
									key={item.label}
									onPress={() => setStatus(item.value)}
									className="rounded-full"
									style={{
										paddingHorizontal: 12,
										paddingVertical: 8,
										backgroundColor: selected ? BRAND : "#FFFFFF",
										borderWidth: selected ? 0 : 1,
										borderColor: "#E2E8F0",
										...CARD_SHADOW,
									}}
								>
									<Text style={{ fontSize: 11, fontWeight: "700", color: selected ? "#FFFFFF" : "#64748B" }}>{item.label}</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View style={{ marginTop: 12 }}>
					<View className="flex-row items-center" style={{ gap: 8 }}>
						{[
							{ label: "Name", value: "name" as const },
							{ label: "Rate", value: "hourlyRate" as const },
							{ label: "Hours", value: "monthlyHours" as const },
						].map((option) => {
							const selected = sortBy === option.value;
							return (
								<Pressable
									key={option.value}
									onPress={() => setSortBy(option.value)}
									className="rounded-xl"
									style={{
										paddingHorizontal: 12,
										paddingVertical: 8,
										backgroundColor: selected ? "#FFFFFF" : "#EEF2F5",
										borderWidth: selected ? 1 : 0,
										borderColor: "#E2E8F0",
										...CARD_SHADOW,
									}}
								>
									<Text style={{ fontSize: 11, fontWeight: "700", color: selected ? "#0F172A" : "#64748B" }}>{option.label}</Text>
								</Pressable>
							);
						})}
						<Pressable
							onPress={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
							className="flex-row items-center rounded-xl"
							style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#EEF2F5" }}
						>
							<ArrowDownUp size={14} color="#64748B" strokeWidth={2.4} />
							<Text style={{ marginLeft: 6, fontSize: 11, fontWeight: "700", color: "#64748B" }}>{sortOrder === "asc" ? "ASC" : "DESC"}</Text>
						</Pressable>
					</View>
				</View>

				<View style={{ marginTop: 18 }}>
					{employeesQuery.isLoading ? <Text style={{ fontSize: 13, color: "#64748B" }}>Loading employees...</Text> : null}
					{employeesQuery.isError ? <Text style={{ fontSize: 13, color: "#DC2626" }}>Failed to load employees.</Text> : null}

					{employees.map((employee) => (
						<EmployeeListItem
							key={employee.id}
							employee={employee}
							onPress={() => router.push(`/employees/${employee.id}` as any)}
						/>
					))}

					{!employeesQuery.isLoading && !employees.length ? (
						<View className="rounded-2xl bg-white p-6" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
							<Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>No employees found.</Text>
						</View>
					) : null}
				</View>
			</ScrollView>
		</View>
	);
}
