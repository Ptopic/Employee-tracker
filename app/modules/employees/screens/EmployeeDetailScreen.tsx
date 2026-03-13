import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import {
	useEmployeeDetail,
	useEmployeeStats,
	useUpdateEmployee,
} from "@/api/employees/hooks";
import Text from "@/components/Text";
import { Button } from "@/components/ui";
import { EmployeeForm, type EmployeeFormValues } from "../components/EmployeeForm";
import { EmployeeStatsCard } from "../components/EmployeeStatsCard";

const BG = "#F8F9F8";

export function EmployeeDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const employeeId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

	const detailQuery = useEmployeeDetail(employeeId);
	const statsQuery = useEmployeeStats(employeeId);
	const updateMutation = useUpdateEmployee();

	const [initialValues, setInitialValues] = useState<EmployeeFormValues | null>(null);

	useEffect(() => {
		if (!detailQuery.data) return;
		setInitialValues({
			firstName: detailQuery.data.firstName,
			lastName: detailQuery.data.lastName,
			age: detailQuery.data.age == null ? "" : String(detailQuery.data.age),
			hourlyRate: String(detailQuery.data.hourlyRate),
			status: detailQuery.data.status,
		});
	}, [detailQuery.data]);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView bounces={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 4 }}>
				<View className="items-center pt-1 pb-1">
					<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
				</View>

				<View className="mb-6 mt-4 flex-row items-center justify-between">
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>Employee Details</Text>
					<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				{(detailQuery.isLoading || !initialValues) ? <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>Loading...</Text> : null}
				{detailQuery.isError ? <Text style={{ fontSize: 13, color: "#DC2626", marginBottom: 12 }}>Failed to load employee.</Text> : null}

				{statsQuery.data ? <EmployeeStatsCard stats={statsQuery.data} /> : null}

				{initialValues ? (
					<EmployeeForm
						initialValues={initialValues}
						onSubmit={(payload) =>
							updateMutation.mutate(
								{ employeeId: employeeId as string, payload },
								{ onSuccess: () => router.replace("/employees" as any) },
							)
						}
						submitLabel="Save Changes"
						loading={updateMutation.isPending}
					/>
				) : null}

				<View style={{ marginTop: 14 }}>
					<Button
						variant="secondary"
						text="Cancel"
						onPress={() => router.back()}
					/>
				</View>

				{updateMutation.isError ? <Text style={{ fontSize: 13, color: "#DC2626", marginTop: 10 }}>Failed to save changes.</Text> : null}
			</ScrollView>
		</SafeAreaView>
	);
}
