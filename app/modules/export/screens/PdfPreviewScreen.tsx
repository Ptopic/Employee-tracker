import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Alert, SafeAreaView, ScrollView, Share, TouchableOpacity, View } from "react-native";
import { CalendarDays, Download, FileText, X } from "lucide-react-native";
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

function formatWeekRange(weekStart: string, weekEnd?: string) {
	if (!weekStart) return "--";
	const start = new Date(`${weekStart}T00:00:00`);
	const end = weekEnd ? new Date(`${weekEnd}T00:00:00`) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);

	const startMonth = start.toLocaleDateString("en-US", { month: "long" });
	const startDay = start.toLocaleDateString("en-US", { day: "2-digit" });
	const endMonth = end.toLocaleDateString("en-US", { month: "long" });
	const endDay = end.toLocaleDateString("en-US", { day: "2-digit" });
	const year = end.toLocaleDateString("en-US", { year: "numeric" });
	return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
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

	const weekRangeLabel = useMemo(() => formatWeekRange(weekStart, preview.data?.weekEnd), [preview.data?.weekEnd, weekStart]);

	const handleExport = async () => {
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
			toast.show("Failed to export PDF. Please try again.", { type: "error" });
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 4 }}>
				<View className="items-center pt-1 pb-1">
					<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
				</View>

				<View className="mb-8 mt-4 flex-row items-center justify-between">
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26, letterSpacing: -0.2 }}>Export Weekly PDF</Text>
					<TouchableOpacity
						className="items-center justify-center rounded-full"
						style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }}
						onPress={() => router.back()}
					>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View className="items-center" style={{ marginBottom: 30 }}>
					<View className="items-center justify-center rounded-full" style={{ width: 64, height: 64, backgroundColor: "rgba(91, 123, 108, 0.1)", marginBottom: 14 }}>
						<FileText size={30} color={BRAND} strokeWidth={2.2} />
					</View>
					<Text style={{ fontSize: 14, lineHeight: 20, color: "#64748B", textAlign: "center", maxWidth: 240 }}>
						Download your activity summary for the selected period
					</Text>
				</View>

				<View style={{ gap: 20 }}>
					<View>
						<FieldLabel label="Week Range" />
						<View className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}>
							<Text style={{ flex: 1, fontSize: 13, fontWeight: "500", color: "#0F172A" }}>{weekRangeLabel}</Text>
							<CalendarDays size={18} color={BRAND} strokeWidth={2.2} />
						</View>
					</View>

					<View style={{ gap: 12, paddingTop: 4 }}>
						<Button
							variant="primary"
							text={exporter.isPending ? "Exporting..." : "Export PDF"}
							onPress={handleExport}
							disabled={exporter.isPending || !weekStart}
							leftIcon={<Download size={20} color="#FFFFFF" strokeWidth={2.2} />}
						/>
						<Button variant="secondary" text="Cancel" onPress={() => router.back()} />
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
