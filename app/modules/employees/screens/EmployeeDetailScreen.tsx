import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import {
	useDeactivateEmployee,
	useEmployeeDetail,
	useEmployeeStats,
	useUpdateEmployee,
} from "@/api/employees/hooks";
import Text from "@/components/Text";
import { EmployeeForm, type EmployeeFormValues } from "../components/EmployeeForm";
import { EmployeeStatsCard } from "../components/EmployeeStatsCard";

export function EmployeeDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const employeeId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

	const detailQuery = useEmployeeDetail(employeeId);
	const statsQuery = useEmployeeStats(employeeId);
	const updateMutation = useUpdateEmployee();
	const deactivateMutation = useDeactivateEmployee();

	const [initialValues, setInitialValues] = useState<EmployeeFormValues | null>(null);

	useEffect(() => {
		if (!detailQuery.data) return;
		setInitialValues({
			firstName: detailQuery.data.firstName,
			lastName: detailQuery.data.lastName,
			age: String(detailQuery.data.age),
			hourlyRate: String(detailQuery.data.hourlyRate),
			status: detailQuery.data.status,
		});
	}, [detailQuery.data]);

	return (
		<View className="flex-1 bg-gray-100">
			<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
				<Pressable onPress={() => router.back()} className="mb-2">
					<Text className="text-gray-600">← Back</Text>
				</Pressable>
				<Text className="text-2xl font-bold mb-4">Employee Detail</Text>

				{(detailQuery.isLoading || !initialValues) ? <Text className="text-gray-500">Loading...</Text> : null}
				{detailQuery.isError ? <Text className="text-red-600">Failed to load employee.</Text> : null}

				{statsQuery.data ? <EmployeeStatsCard stats={statsQuery.data} /> : null}

				{initialValues ? (
					<EmployeeForm
						initialValues={initialValues}
						onSubmit={(payload) =>
							updateMutation.mutate(
								{ employeeId: employeeId as string, payload },
								{ onSuccess: () => detailQuery.refetch() },
							)
						}
						submitLabel="Save Changes"
						loading={updateMutation.isPending}
					/>
				) : null}

				<Pressable
					className="rounded-lg bg-red-100 py-3 items-center mt-4"
					onPress={() =>
						deactivateMutation.mutate(employeeId as string, {
							onSuccess: () => router.back(),
						})
					}
				>
					<Text className="text-red-700 font-semibold">Deactivate Employee</Text>
				</Pressable>

				{updateMutation.isError ? <Text className="text-red-600 mt-2">Failed to save changes.</Text> : null}
				{deactivateMutation.isError ? <Text className="text-red-600 mt-2">Failed to deactivate employee.</Text> : null}
			</ScrollView>
		</View>
	);
}
