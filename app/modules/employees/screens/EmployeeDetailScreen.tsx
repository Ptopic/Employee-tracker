import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { format, startOfWeek } from "date-fns";
import type { EmployeeStats } from "@/api/employees/types";
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

const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd");

const buildFallbackStats = (weekDate: Date, monthDate: Date): EmployeeStats => {
	const monday = startOfWeek(weekDate, { weekStartsOn: 1 });
	const weekDates = Array.from({ length: 7 }, (_, index) => {
		const day = new Date(monday);
		day.setDate(monday.getDate() + index);
		return toIsoDate(day);
	});

	return {
		weeklyHours: 0,
		monthlyHours: 0,
		estimatedMonthlyCost: 0,
		selectedMonth: {
			month: monthDate.getMonth() + 1,
			year: monthDate.getFullYear(),
		},
		selectedWeek: {
			weekStart: weekDates[0],
			weekEnd: weekDates[6],
		},
		weeklyBreakdown: weekDates.map((date) => ({
			date,
			hours: 0,
			isDayOff: false,
		})),
	};
};

export function EmployeeDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const employeeId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

	const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
	const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());

	const detailQuery = useEmployeeDetail(employeeId);
	const statsQuery = useEmployeeStats(employeeId, {
		month: selectedMonthDate.getMonth() + 1,
		year: selectedMonthDate.getFullYear(),
		weekStart: toIsoDate(startOfWeek(selectedWeekDate, { weekStartsOn: 1 })),
	});
	const stats = useMemo(
		() => statsQuery.data ?? buildFallbackStats(selectedWeekDate, selectedMonthDate),
		[statsQuery.data, selectedWeekDate, selectedMonthDate],
	);
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
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>Detalji zaposlenika</Text>
					<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				{(detailQuery.isLoading || !initialValues) ? <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>Ucitavanje...</Text> : null}
				{detailQuery.isError ? <Text style={{ fontSize: 13, color: "#DC2626", marginBottom: 12 }}>Nije moguce ucitati zaposlenika.</Text> : null}

				<EmployeeStatsCard
					stats={stats}
					selectedMonthDate={selectedMonthDate}
					selectedWeekDate={selectedWeekDate}
					onMonthDateChange={setSelectedMonthDate}
					onWeekDateChange={setSelectedWeekDate}
				/>
				{statsQuery.isLoading ? <Text style={{ fontSize: 12, color: "#64748B", marginTop: -8, marginBottom: 12 }}>Ucitavanje statistike...</Text> : null}
				{statsQuery.isError || (!statsQuery.isLoading && statsQuery.data == null) ? (
					<Text style={{ fontSize: 12, color: "#B45309", marginTop: -8, marginBottom: 12 }}>
						Statistika je privremeno nedostupna. Prikazuju se prazne vrijednosti.
					</Text>
				) : null}

				{initialValues ? (
					<EmployeeForm
						initialValues={initialValues}
						onSubmit={(payload) =>
							updateMutation.mutate(
								{ employeeId: employeeId as string, payload },
								{ onSuccess: () => router.replace("/employees") },
							)
						}
						submitLabel="Spremi promjene"
						loading={updateMutation.isPending}
					/>
				) : null}

				<View style={{ marginTop: 14 }}>
					<Button
						variant="secondary"
						text="Odustani"
						onPress={() => router.back()}
					/>
				</View>

				{updateMutation.isError ? <Text style={{ fontSize: 13, color: "#DC2626", marginTop: 10 }}>Spremanje promjena nije uspjelo.</Text> : null}
			</ScrollView>
		</SafeAreaView>
	);
}
