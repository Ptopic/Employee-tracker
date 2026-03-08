import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { Alert, ScrollView, Share, View } from "react-native";
import { useExportWeeklyPdf, useWeeklyPreview } from "@/api/export/hooks";
import Text from "@/components/Text";
import Button from "@/components/Button";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PdfPreviewScreen() {
	const params = useLocalSearchParams<{ weekStart?: string }>();
	const weekStart = params.weekStart || "";
	const preview = useWeeklyPreview();
	const exporter = useExportWeeklyPdf();

	useEffect(() => {
		if (weekStart) preview.mutate(weekStart);
	}, [weekStart]);

	const handleShare = async () => {
		const file = await exporter.mutateAsync(weekStart);
		if (!file) {
			Alert.alert("Export failed", "Could not generate PDF. Please try again.");
			return;
		}

		await Share.share({
			title: file.fileName,
			message: `Weekly PDF export (${weekStart})\n\nData URI:\ndata:${file.mimeType};base64,${file.base64}`,
		});
	};

	return (
		<ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
			<Text className="text-2xl font-bold mb-2">PDF Preview</Text>
			<Text className="text-gray-600 mb-4">Week: {weekStart}</Text>

			{preview.isPending ? <Text className="mb-3">Loading preview…</Text> : null}
			{preview.data ? (
				<View className="rounded-xl bg-white p-4 border border-gray-200 mb-4">
					<Text className="font-semibold text-lg">{preview.data.companyName}</Text>
					<Text className="text-gray-600 mb-2">{preview.data.weekStart} - {preview.data.weekEnd}</Text>
					{preview.data.employees.map((employee) => (
						<View key={employee.employeeId} className="mb-4 border-t border-gray-100 pt-3">
							<Text className="font-semibold">{employee.employeeName}</Text>
							{DAY_KEYS.map((day) => (
								<Text key={`${employee.employeeId}-${day}`} className="text-gray-700 text-sm">
									{day}: {employee.dailyShifts[day]?.length ? employee.dailyShifts[day].join(", ") : "-"}
								</Text>
							))}
							<Text className="text-sm mt-1">Total: {employee.weeklyHours.toFixed(2)}h | Cost: ${employee.estimatedCost.toFixed(2)}</Text>
						</View>
					))}
					<Text className="font-semibold">Total hours: {preview.data.totalHours.toFixed(2)}</Text>
				</View>
			) : null}

			<Button text={exporter.isPending ? "Sharing..." : "Share PDF"} onPress={handleShare} />
			<View className="h-3" />
			<Button text="Back" onPress={() => router.back()} />
		</ScrollView>
	);
}
