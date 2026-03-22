import { useMemo, useState } from "react";
import { Modal, NativeModules, Platform, TouchableOpacity, UIManager, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "react-native-date-picker";
import { CalendarDays } from "lucide-react-native";
import { endOfWeek, startOfWeek } from "date-fns";
import Text from "@/components/Text";
import type { EmployeeStats } from "@/api/employees/types";
import { Button, FieldLabel } from "@/components/ui";

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

const BG = "#F8F9F8";
const BRAND = "#5B7B6C";

type PickerMode = "month" | "week";

const toSafeDate = (value: string | Date) => {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	const parsed = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};


export function EmployeeStatsCard({
	stats,
	selectedMonthDate,
	selectedWeekDate,
	onMonthDateChange,
	onWeekDateChange,
}: {
	stats: EmployeeStats;
	selectedMonthDate: Date;
	selectedWeekDate: Date;
	onMonthDateChange: (next: Date) => void;
	onWeekDateChange: (next: Date) => void;
}) {
	const [showPicker, setShowPicker] = useState(false);
	const [pickerMode, setPickerMode] = useState<PickerMode>("week");
	const [iosTempDate, setIosTempDate] = useState(new Date());

	const hasNativeDateTimePicker = useMemo(() => {
		try {
			const hasViewManager = Boolean(UIManager.getViewManagerConfig?.("RNDateTimePicker"));
			const hasNativeModule = Boolean((NativeModules as { RNDateTimePicker?: unknown }).RNDateTimePicker);
			return hasViewManager || hasNativeModule;
		} catch {
			return false;
		}
	}, []);

	const weekStart = useMemo(() => startOfWeek(selectedWeekDate, { weekStartsOn: 1 }), [selectedWeekDate]);
	const weekEnd = useMemo(() => endOfWeek(selectedWeekDate, { weekStartsOn: 1 }), [selectedWeekDate]);
	const normalizedWeeklyHours = Number.isFinite(stats.weeklyHours) ? stats.weeklyHours : 0;
	const normalizedMonthlyHours = Number.isFinite(stats.monthlyHours) ? stats.monthlyHours : 0;
	const normalizedEstimatedMonthlyCost = Number.isFinite(stats.estimatedMonthlyCost) ? stats.estimatedMonthlyCost : 0;
	const normalizedWeeklyBreakdown = Array.isArray(stats.weeklyBreakdown) ? stats.weeklyBreakdown : [];

	const monthLabel = useMemo(
		() => selectedMonthDate.toLocaleDateString("hr-HR", { month: "long", year: "numeric" }),
		[selectedMonthDate],
	);
	const weekLabel = useMemo(
		() =>
			`${weekStart.toLocaleDateString("hr-HR", { day: "2-digit", month: "long" })} - ${weekEnd.toLocaleDateString("hr-HR", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			})}`,
		[weekEnd, weekStart],
	);

	const openPicker = (mode: PickerMode) => {
		setPickerMode(mode);
		setIosTempDate(mode === "month" ? selectedMonthDate : selectedWeekDate);
		setShowPicker(true);
	};

	const applyDate = (nextDate: Date) => {
		if (pickerMode === "month") {
			onMonthDateChange(nextDate);
		} else {
			onWeekDateChange(nextDate);
		}
	};

	return (
		<View style={{ gap: 12, marginBottom: 18 }}>
			<Text style={{ fontSize: 14, fontWeight: "700", color: "#334155" }}>Trenutna statistika</Text>

			<View style={{ gap: 10 }}>
				<View>
					<FieldLabel label="Mjesec" />
					<TouchableOpacity
						onPress={() => openPicker("month")}
						activeOpacity={0.9}
						className="flex-row items-center rounded-2xl bg-white px-4"
						style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}
					>
						<Text style={{ flex: 1, fontSize: 13, fontWeight: "500", color: "#0F172A" }}>{monthLabel}</Text>
						<CalendarDays size={18} color={BRAND} strokeWidth={2.2} />
					</TouchableOpacity>
				</View>

				<View>
					<FieldLabel label="Tjedan" />
					<TouchableOpacity
						onPress={() => openPicker("week")}
						activeOpacity={0.9}
						className="flex-row items-center rounded-2xl bg-white px-4"
						style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}
					>
						<Text style={{ flex: 1, fontSize: 13, fontWeight: "500", color: "#0F172A" }}>{weekLabel}</Text>
						<CalendarDays size={18} color={BRAND} strokeWidth={2.2} />
					</TouchableOpacity>
				</View>
			</View>

			<View className="flex-row" style={{ gap: 12 }}>
				<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
					<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Tjedan</Text>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
						{normalizedWeeklyHours.toFixed(2)} <Text style={{ fontSize: 10, color: "#94A3B8" }}>sati</Text>
					</Text>
				</View>

				<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
					<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Mjesecno</Text>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
						{normalizedMonthlyHours.toFixed(2)} <Text style={{ fontSize: 10, color: "#94A3B8" }}>sati</Text>
					</Text>
				</View>

				<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
					<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Trosak</Text>
					<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
						€{Math.round(normalizedEstimatedMonthlyCost)}
					</Text>
				</View>
			</View>

			<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
				<Text style={{ fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 10 }}>Tjedna razrada</Text>
				<View style={{ gap: 8 }}>
					{normalizedWeeklyBreakdown.map((day) => {
						const dayDate = toSafeDate(day.date);
						const dayLabel = dayDate
							? dayDate.toLocaleDateString("hr-HR", { weekday: "short", month: "short", day: "2-digit" })
							: day.date;

						return (
						<View key={day.date} className="flex-row items-center justify-between rounded-xl" style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#F8FAFC" }}>
							<Text style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}>{dayLabel}</Text>
							{day.isDayOff ? (
								<Text style={{ fontSize: 12, fontWeight: "700", color: "#0E7490" }}>Slobodan dan</Text>
							) : (
								<Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>{day.hours.toFixed(2)} sati</Text>
							)}
						</View>
						);
					})}
					{normalizedWeeklyBreakdown.length === 0 ? (
						<Text style={{ fontSize: 12, color: "#64748B" }}>Nema podataka za odabrani tjedan.</Text>
					) : null}
				</View>
			</View>

			{Platform.OS === "ios" ? (
				<Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
					<View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.35)" }}>
						<View style={{ backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 }}>
							<View className="items-center pb-3">
								<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
							</View>
							<Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
								{pickerMode === "month" ? "Odaberite bilo koji datum u mjesecu" : "Odaberite bilo koji datum u tjednu"}
							</Text>
							{hasNativeDateTimePicker ? (
								<View style={{ width: "100%", alignItems: "center" }}>
									<DateTimePicker
										value={iosTempDate}
										mode="date"
										display="inline"
										themeVariant="light"
										locale="hr-HR"
										style={{ height: 380, width: "100%", maxWidth: 520 }}
										onChange={(_, date) => {
											if (date) setIosTempDate(date);
										}}
									/>
								</View>
							) : (
							<DatePicker modal={false} mode="date" locale="hr-HR" date={iosTempDate} onDateChange={setIosTempDate} />
							)}
							<View style={{ gap: 10, marginTop: 10 }}>
								<Button
									variant="primary"
									text={pickerMode === "month" ? "Primijeni mjesec" : "Primijeni tjedan"}
									onPress={() => {
										applyDate(iosTempDate);
										setShowPicker(false);
									}}
								/>
								<Button variant="secondary" text="Odustani" onPress={() => setShowPicker(false)} />
							</View>
						</View>
					</View>
				</Modal>
			) : (
				<DatePicker
					modal
					mode="date"
					locale="hr-HR"
					open={showPicker}
					date={pickerMode === "month" ? selectedMonthDate : selectedWeekDate}
					onConfirm={(selected) => {
						applyDate(selected);
						setShowPicker(false);
					}}
					onCancel={() => setShowPicker(false)}
				/>
			)}
		</View>
	);
}
