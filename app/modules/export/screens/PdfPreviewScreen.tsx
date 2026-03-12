import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Alert, SafeAreaView, ScrollView, Share, TouchableOpacity, View } from "react-native";
import { FileText, Share2, X } from "lucide-react-native";
import { useToast } from "react-native-toast-notifications";
import { useExportWeeklyPdf, useWeeklyPreview } from "@/api/export/hooks";
import Text from "@/components/Text";
import { Button, FieldLabel } from "@/components/ui";

const BG = "#F8F9F8";
const BRAND = "#5B7B6C";
const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function toCurrency(value: number) {
	return `$${value.toFixed(2)}`;
}

export function PdfPreviewScreen() {
	const params = useLocalSearchParams<{ weekStart?: string }>();
	const toast = useToast();
	const weekStart = params.weekStart || "";
	const preview = useWeeklyPreview();
	const exporter = useExportWeeklyPdf();

	useEffect(() => {
		if (weekStart) preview.mutate(weekStart);
	}, [weekStart]);

	const summary = useMemo(() => {
		if (!preview.data) return null;
		return {
			totalHours: preview.data.totalHours,
			totalCost: preview.data.totalCost,
			employees: preview.data.employees.length,
		};
	}, [preview.data]);

	const handleShare = async () => {
		try {
			const file = await exporter.mutateAsync(weekStart);
			if (!file) {
				Alert.alert("Export failed", "Could not generate PDF. Please try again.");
				return;
			}

			await Share.share({
				title: file.fileName,
				message: `Weekly PDF export (${weekStart})\n\nData URI:\ndata:${file.mimeType};base64,${file.base64}`,
			});
		} catch {
			toast.show("Failed to share PDF. Please try again.", { type: "error" });
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 4 }}>
				<View className="items-center pt-1 pb-1">
					<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
				</View>

				<View className="mb-6 mt-4 flex-row items-center justify-between">
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>Export PDF</Text>
					<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, marginBottom: 16 }]}> 
					<View className="flex-row items-center" style={{ marginBottom: 10 }}>
						<View className="rounded-xl items-center justify-center" style={{ width: 44, height: 44, backgroundColor: "rgba(91, 123, 108, 0.12)", marginRight: 12 }}>
							<FileText size={22} color={BRAND} strokeWidth={2.2} />
						</View>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>Weekly PDF Report</Text>
							<Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Week of {weekStart || "--"}</Text>
						</View>
					</View>
					<Text style={{ fontSize: 13, color: "#64748B" }}>
						Includes employee hours, daily shifts, and estimated costs.
					</Text>
				</View>

				{preview.isPending ? (
					<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, marginBottom: 16 }]}>
						<Text style={{ fontSize: 14, color: "#64748B", fontWeight: "600" }}>Loading preview...</Text>
					</View>
				) : null}

				{summary ? (
					<>
						<View style={{ marginBottom: 10 }}>
							<FieldLabel label="Preview Summary" />
						</View>
						<View className="flex-row" style={{ gap: 10, marginBottom: 16 }}>
							<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Employees</Text>
								<Text style={{ fontSize: 20, fontWeight: "700", color: "#0F172A" }}>{summary.employees}</Text>
							</View>
							<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Hours</Text>
								<Text style={{ fontSize: 20, fontWeight: "700", color: "#0F172A" }}>{summary.totalHours.toFixed(1)}</Text>
							</View>
							<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Cost</Text>
								<Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>{toCurrency(summary.totalCost)}</Text>
							</View>
						</View>

						<View style={{ marginBottom: 10 }}>
							<FieldLabel label="Employee Breakdown" />
						</View>
						<View style={{ gap: 10, marginBottom: 18 }}>
							{preview.data?.employees.map((employee) => (
								<View key={employee.employeeId} className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
									<View className="flex-row items-center justify-between" style={{ marginBottom: 6 }}>
										<Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{employee.employeeName}</Text>
										<Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>{employee.weeklyHours.toFixed(1)}h</Text>
									</View>
									<Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Est. cost {toCurrency(employee.estimatedCost)}</Text>
									{DAY_KEYS.map((day) => (
										<Text key={`${employee.employeeId}-${day}`} style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>
											{day}: {employee.dailyShifts[day]?.length ? employee.dailyShifts[day].join(", ") : "-"}
										</Text>
									))}
								</View>
							))}
						</View>
					</>
				) : null}

				<View style={{ gap: 12 }}>
					<Button
						variant="primary"
						text={exporter.isPending ? "Sharing..." : "Share PDF"}
						onPress={handleShare}
						disabled={exporter.isPending || !weekStart}
						leftIcon={<Share2 size={18} color="#FFFFFF" strokeWidth={2.2} />}
					/>
					<Button variant="secondary" text="Back" onPress={() => router.back()} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
