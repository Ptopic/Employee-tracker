import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Platform, SafeAreaView, ScrollView, Share, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { endOfWeek, format, startOfWeek } from "date-fns";
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

function toIsoDate(date: Date) {
	return format(date, "yyyy-MM-dd");
}

export function PdfPreviewScreen() {
	const params = useLocalSearchParams<{ weekStart?: string }>();
	const toast = useToast();
	const preview = useWeeklyPreview();
	const exporter = useExportWeeklyPdf();
	const initialDate = params.weekStart ? new Date(`${params.weekStart}T00:00:00`) : new Date();
	const [selectedDate, setSelectedDate] = useState(initialDate);
	const [showWeekPicker, setShowWeekPicker] = useState(false);
	const [iosTempDate, setIosTempDate] = useState(initialDate);

	const selectedWeekStartDate = useMemo(
		() => startOfWeek(selectedDate, { weekStartsOn: 1 }),
		[selectedDate],
	);
	const selectedWeekEndDate = useMemo(
		() => endOfWeek(selectedDate, { weekStartsOn: 1 }),
		[selectedDate],
	);
	const selectedWeekStart = useMemo(() => toIsoDate(selectedWeekStartDate), [selectedWeekStartDate]);

	useEffect(() => {
		if (selectedWeekStart) preview.mutate(selectedWeekStart);
	}, [selectedWeekStart]);

	const weekRangeLabel = useMemo(
		() => `${format(selectedWeekStartDate, "MMMM dd")} - ${format(selectedWeekEndDate, "MMMM dd, yyyy")}`,
		[selectedWeekEndDate, selectedWeekStartDate],
	);

	const handleExport = async () => {
		try {
			const file = await exporter.mutateAsync(selectedWeekStart);
			if (!file) {
				Alert.alert("Export failed", "Could not generate PDF. Please try again.");
				return;
			}
			await Share.share({
				title: file.fileName,
				message: `Weekly PDF export (${selectedWeekStart})\n\nData URI:\ndata:${file.mimeType};base64,${file.base64}`,
			});
		} catch {
			toast.show("Failed to export PDF. Please try again.", { type: "error" });
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 6 }}>
				<View className="items-center pt-1 pb-1">
					<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
				</View>

				<View className="mb-8 mt-4 flex-row items-center justify-between">
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26, letterSpacing: -0.2 }}>Export Weekly PDF</Text>
					<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View className="items-center" style={{ marginBottom: 34 }}>
					<View className="items-center justify-center rounded-full" style={{ width: 66, height: 66, backgroundColor: "rgba(91, 123, 108, 0.1)", marginBottom: 16 }}>
						<FileText size={30} color={BRAND} strokeWidth={2.2} />
					</View>
					<Text style={{ fontSize: 14, lineHeight: 20, color: "#64748B", textAlign: "center", maxWidth: 240 }}>
						Download your activity summary for the selected period
					</Text>
				</View>

				<View style={{ gap: 22 }}>
					<View>
						<FieldLabel label="Week Range" />
						<TouchableOpacity
							onPress={() => {
								setIosTempDate(selectedDate);
								setShowWeekPicker(true);
							}}
							activeOpacity={0.9}
							className="flex-row items-center rounded-2xl bg-white px-4"
							style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}
						>
							<Text style={{ flex: 1, fontSize: 13, fontWeight: "500", color: "#0F172A" }}>{weekRangeLabel}</Text>
							<CalendarDays size={18} color={BRAND} strokeWidth={2.2} />
						</TouchableOpacity>
					</View>

					<View style={{ gap: 12, paddingTop: 8 }}>
						<Button
							variant="primary"
							text={exporter.isPending ? "Exporting..." : "Export PDF"}
							onPress={handleExport}
							disabled={exporter.isPending || !selectedWeekStart}
							leftIcon={<Download size={20} color="#FFFFFF" strokeWidth={2.2} />}
						/>
						<Button variant="secondary" text="Cancel" onPress={() => router.back()} />
					</View>
				</View>
			</ScrollView>

			{Platform.OS === "ios" ? (
				<Modal visible={showWeekPicker} transparent animationType="fade" onRequestClose={() => setShowWeekPicker(false)}>
					<View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.35)" }}>
						<View style={{ backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 }}>
							<View className="items-center pb-3">
								<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
							</View>
							<Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>Select any date</Text>
							<DateTimePicker
								value={iosTempDate}
								mode="date"
								display="inline"
								onChange={(_, date) => {
									if (date) setIosTempDate(date);
								}}
							/>
							<View style={{ gap: 10, marginTop: 14 }}>
								<Button
									variant="primary"
									text="Apply Week"
									onPress={() => {
										setSelectedDate(iosTempDate);
										setShowWeekPicker(false);
									}}
								/>
								<Button variant="secondary" text="Cancel" onPress={() => setShowWeekPicker(false)} />
							</View>
						</View>
					</View>
				</Modal>
			) : (
				<DatePicker
					modal
					mode="date"
					open={showWeekPicker}
					date={selectedDate}
					onConfirm={(date) => {
						setSelectedDate(date);
						setShowWeekPicker(false);
					}}
					onCancel={() => setShowWeekPicker(false)}
				/>
			)}
		</SafeAreaView>
	);
}
