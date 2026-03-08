import { router } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";

const mockPages = [
	"Week overview",
	"Shift totals",
	"Daily assignment breakdown",
	"Employee summary",
];

export default function ExportWeeklyPdfScreen() {
	const handleExport = () => {
		Alert.alert(
			"Weekly PDF export queued",
			"This is a V1.1 preview flow. PDF generation will be connected once export APIs are available.",
		);
		router.back();
	};

	return (
		<ScrollView
			className="flex-1 bg-white"
			contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40 }}
		>
			<Text className="text-2xl font-bold text-black">PDF Preview</Text>
			<Text className="mt-2 text-sm text-gray-600">
				Review what will be exported before generating your weekly schedule PDF.
			</Text>

			<View className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
				<View className="rounded-xl border border-gray-300 bg-white p-4">
					<Text className="text-xs uppercase tracking-wide text-gray-500">
						Weekly Schedule Report
					</Text>
					<Text className="mt-1 text-lg font-semibold text-black">Mar 02 – Mar 08</Text>

					<View className="mt-4 gap-2">
						{mockPages.map((page, index) => (
							<View
								key={page}
								className="flex-row items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
							>
								<Text className="text-sm text-gray-700">Page {index + 1}</Text>
								<Text className="text-sm font-medium text-black">{page}</Text>
							</View>
						))}
					</View>
				</View>

				<View className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
					<Text className="text-xs text-blue-700">
						Optional V1.1 preview: final typography, branding, and downloadable file support
						will be finalized when backend export endpoints are ready.
					</Text>
				</View>
			</View>

			<View className="mt-6 gap-3">
				<Button text="Export PDF" onPress={handleExport} />
				<Button text="Back" onPress={() => router.back()} />
			</View>
		</ScrollView>
	);
}
