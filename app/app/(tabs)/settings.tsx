import Button from "@/components/Button";
import Text from "@/components/Text";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo, useState } from "react";
import {
	Alert,
	Modal,
	Pressable,
	ScrollView,
	Share,
	TouchableOpacity,
	View,
} from "react-native";

type WeekOption = {
	id: string;
	start: Date;
	end: Date;
};

const DAY = 24 * 60 * 60 * 1000;

const getMonday = (date: Date) => {
	const copy = new Date(date);
	const day = copy.getDay();
	const diffToMonday = day === 0 ? -6 : 1 - day;
	copy.setHours(0, 0, 0, 0);
	copy.setDate(copy.getDate() + diffToMonday);
	return copy;
};

const addDays = (date: Date, days: number) => {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
};

const formatDate = (date: Date) =>
	date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

const getWeekLabel = (start: Date, end: Date) => `${formatDate(start)} - ${formatDate(end)}`;

const buildWeekOptions = (anchorWeekStart: Date, count = 16): WeekOption[] => {
	const options: WeekOption[] = [];

	for (let i = 0; i < count; i += 1) {
		const start = addDays(anchorWeekStart, -i * 7);
		const end = addDays(start, 6);
		options.push({
			id: `${start.getTime()}`,
			start,
			end,
		});
	}

	return options;
};

export default function SettingsScreen() {
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const [selectedWeekStart, setSelectedWeekStart] = useState(() => getMonday(new Date()));
	const [pdfFileName, setPdfFileName] = useState<string | null>(null);

	const selectedWeekEnd = useMemo(() => addDays(selectedWeekStart, 6), [selectedWeekStart]);

	const weekOptions = useMemo(
		() => buildWeekOptions(getMonday(new Date())),
		[],
	);

	const onPreviousWeek = () => {
		setSelectedWeekStart((prev) => addDays(prev, -7));
		setPdfFileName(null);
	};

	const onNextWeek = () => {
		setSelectedWeekStart((prev) => addDays(prev, 7));
		setPdfFileName(null);
	};

	const onGeneratePdf = async () => {
		setIsGenerating(true);

		// Placeholder for PTO-250 backend integration.
		await new Promise((resolve) => setTimeout(resolve, 700));

		const fileName = `timesheet-${selectedWeekStart.toISOString().slice(0, 10)}.pdf`;
		setPdfFileName(fileName);
		setIsGenerating(false);
	};

	const onSharePdf = async () => {
		if (!pdfFileName) {
			Alert.alert("Generate PDF first", "Please generate the PDF before sharing.");
			return;
		}

		await Share.share({
			title: "Weekly timesheet PDF",
			message: `Weekly timesheet (${getWeekLabel(selectedWeekStart, selectedWeekEnd)}) is ready: ${pdfFileName}`,
		});
	};

	const onSelectWeek = (weekStart: Date) => {
		setSelectedWeekStart(weekStart);
		setPdfFileName(null);
		setIsPickerOpen(false);
	};

	return (
		<ScrollView className="flex-1 bg-white">
			<View className="p-5 gap-5">
				<Text className="text-2xl font-bold">Settings</Text>

				<View className="rounded-2xl border border-zinc-200 p-4 gap-4">
				<View className="gap-1">
					<Text className="text-lg font-semibold">PDF export</Text>
					<Text className="text-zinc-600">
						Select a work week, generate the report, then share it.
					</Text>
				</View>

				<View className="flex-row items-center justify-between">
					<TouchableOpacity
						onPress={onPreviousWeek}
						className="h-10 w-10 items-center justify-center rounded-full border border-zinc-200"
					>
						<FontAwesome name="chevron-left" size={14} color="#18181b" />
					</TouchableOpacity>

					<Pressable
						onPress={() => setIsPickerOpen(true)}
						className="flex-1 mx-3 rounded-xl bg-zinc-100 px-3 py-2"
					>
						<Text className="text-center font-semibold">
							{getWeekLabel(selectedWeekStart, selectedWeekEnd)}
						</Text>
						<Text className="text-center text-xs text-zinc-500">Tap to pick a week</Text>
					</Pressable>

					<TouchableOpacity
						onPress={onNextWeek}
						className="h-10 w-10 items-center justify-center rounded-full border border-zinc-200"
					>
						<FontAwesome name="chevron-right" size={14} color="#18181b" />
					</TouchableOpacity>
				</View>

				<Button
					onPress={onGeneratePdf}
					text="Generate PDF"
					isSubmitting={isGenerating}
					submittingText="Generating..."
					disabled={isGenerating}
				/>

				<Button
					onPress={onSharePdf}
					text="Share PDF"
					disabled={!pdfFileName || isGenerating}
				/>

				{pdfFileName ? (
					<View className="rounded-lg bg-zinc-100 p-3">
						<Text className="font-medium">Ready to share</Text>
						<Text className="text-zinc-600">{pdfFileName}</Text>
					</View>
				) : null}
			</View>

			<Modal visible={isPickerOpen} animationType="slide" transparent>
				<View className="flex-1 justify-end bg-black/40">
					<View className="bg-white rounded-t-3xl p-5 max-h-[75%]">
						<View className="flex-row items-center justify-between mb-4">
							<Text className="text-lg font-semibold">Pick week</Text>
							<Pressable onPress={() => setIsPickerOpen(false)}>
								<Text className="font-semibold text-blue-600">Done</Text>
							</Pressable>
						</View>

						<ScrollView>
							{weekOptions.map((week) => {
								const isSelected = week.start.getTime() === selectedWeekStart.getTime();

								return (
									<Pressable
										key={week.id}
										onPress={() => onSelectWeek(week.start)}
										className={`mb-2 rounded-xl border p-3 ${
											isSelected
												? "border-black bg-zinc-100"
												: "border-zinc-200"
										}`}
									>
										<Text className="font-medium">
											{getWeekLabel(week.start, week.end)}
										</Text>
										<Text className="text-xs text-zinc-500">
											Week of {formatDate(week.start)}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				</View>
			</Modal>
			</View>
		</ScrollView>
	);
}
