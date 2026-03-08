import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Share, View } from "react-native";
import { useExportWeeklyPdf } from "@/api/export/hooks";
import Text from "@/components/Text";
import { ExportActions } from "./ExportActions";
import { WeekPickerField } from "./WeekPickerField";

const getDefaultWeekStart = () => {
	const now = new Date();
	const utcDay = (now.getUTCDay() + 6) % 7;
	const monday = new Date(now);
	monday.setUTCDate(now.getUTCDate() - utcDay);
	return monday.toISOString().slice(0, 10);
};

export function ExportPanel() {
	const [weekStart, setWeekStart] = useState(getDefaultWeekStart());
	const [errorText, setErrorText] = useState<string | null>(null);
	const exportWeeklyPdf = useExportWeeklyPdf();

	const valid = useMemo(() => /^\d{4}-\d{2}-\d{2}$/.test(weekStart), [weekStart]);

	const handleExport = async () => {
		if (!valid) {
			setErrorText("Week start must be YYYY-MM-DD.");
			return;
		}
		setErrorText(null);
		const file = await exportWeeklyPdf.mutateAsync(weekStart);
		if (!file) {
			setErrorText("Export failed. Please try again.");
			return;
		}

		await Share.share({
			title: file.fileName,
			message: `Weekly export ready (${weekStart})\n\nPDF data URI:\ndata:${file.mimeType};base64,${file.base64}`,
		});
	};

	const handlePreview = () => {
		if (!valid) {
			Alert.alert("Invalid date", "Week start must be in YYYY-MM-DD format.");
			return;
		}
		router.push({ pathname: "/export/preview", params: { weekStart } });
	};

	return (
		<View className="gap-3">
			<WeekPickerField value={weekStart} onChange={setWeekStart} />
			<ExportActions
				onPreview={handlePreview}
				onExport={handleExport}
				loading={exportWeeklyPdf.isPending}
				disabled={!valid}
			/>
			{errorText ? <Text className="text-yellow-700">{errorText}</Text> : null}
		</View>
	);
}
