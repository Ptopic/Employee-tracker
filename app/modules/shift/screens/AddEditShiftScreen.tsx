import { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Modal, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { CalendarDays, CheckCircle2, ChevronDown, Clock3, X } from "lucide-react-native";
import { useSaveShift, useShiftEmployees } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import Text from "@/components/Text";

const BRAND = "#5B7B6C";
const BG = "#F8F9F8";
const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

const normalizeTime = (v?: string) => (v ? v.slice(0, 5) : "09:00");
const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const toDateAtTime = (baseDate: Date, hhmm: string) => {
	const [h, m] = hhmm.split(":").map(Number);
	const next = new Date(baseDate);
	next.setHours(h, m, 0, 0);
	return next;
};
const toTimeLabel = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export function AddEditShiftScreen() {
	const params = useLocalSearchParams<{ date?: string; shiftId?: string; startTime?: string; endTime?: string; employeeIds?: string }>();

	const baseDate = params.date ? new Date(`${params.date}T00:00:00`) : new Date();
	const [date, setDate] = useState<Date>(baseDate);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [showEmployeePicker, setShowEmployeePicker] = useState(false);

	const [startTime, setStartTime] = useState(normalizeTime(params.startTime));
	const [endTime, setEndTime] = useState(normalizeTime(params.endTime || "17:00"));
	const [notes, setNotes] = useState("");
	const initialEmployeeIds = params.employeeIds ? params.employeeIds.split(",").filter(Boolean) : [];
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialEmployeeIds[0] ?? "");
	const [warning, setWarning] = useState<string | null>(null);

	const employeesQuery = useShiftEmployees();
	const saveShiftMutation = useSaveShift();
	const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
	const selectedEmployeeName = useMemo(() => {
		const selected = employees.find((e) => e.id === selectedEmployeeId);
		return selected ? `${selected.firstName} ${selected.lastName}` : "Select employee";
	}, [employees, selectedEmployeeId]);

	const selectedDateLabel = date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

	const handleSave = async () => {
		setWarning(null);
		const payload = { date: toIsoDate(date), startTime, endTime, employeeIds: selectedEmployeeId ? [selectedEmployeeId] : [] };
		if (startTime >= endTime) {
			setWarning("End time must be later than start time.");
			return;
		}
		if (!selectedEmployeeId) setWarning("Warning: Empty shift is allowed, but no employees are assigned.");

		const overlap = await shiftsRequests.validateOverlap({ ...payload, shiftId: params.shiftId });
		if (overlap && !overlap.valid) {
			setWarning("Overlapping assignment detected. Remove conflicting employees.");
			return;
		}

		await saveShiftMutation.mutateAsync({ shiftId: params.shiftId, payload });
		router.back();
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28, paddingTop: 4 }}>
				<View className="items-center pt-1 pb-1">
					<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
				</View>

				<View className="mb-6 mt-4 flex-row items-center justify-between">
					<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>{params.shiftId ? "Edit Shift" : "Add New Shift"}</Text>
					<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View style={{ gap: 16 }}>
					<View>
						<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Date</Text>
						<TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}>
							<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{selectedDateLabel}</Text>
							<CalendarDays size={20} color={BRAND} strokeWidth={2} />
						</TouchableOpacity>
					</View>

					<View>
						<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Employee</Text>
						<TouchableOpacity onPress={() => setShowEmployeePicker(true)} className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}>
							<Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: selectedEmployeeId ? "#0F172A" : "#94A3B8" }}>{selectedEmployeeName}</Text>
							<ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
						</TouchableOpacity>
					</View>

					<View className="flex-row" style={{ gap: 12 }}>
						<View className="flex-1">
							<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Start Time</Text>
							<TouchableOpacity onPress={() => setShowStartPicker(true)} className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{startTime}</Text>
								<Clock3 size={20} color={BRAND} strokeWidth={2} />
							</TouchableOpacity>
						</View>
						<View className="flex-1">
							<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>End Time</Text>
							<TouchableOpacity onPress={() => setShowEndPicker(true)} className="flex-row items-center rounded-2xl bg-white px-4" style={[CARD_SHADOW, { height: 56, borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{endTime}</Text>
								<Clock3 size={20} color={BRAND} strokeWidth={2} />
							</TouchableOpacity>
						</View>
					</View>

					<View>
						<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Notes / Description</Text>
						<TextInput
							multiline
							numberOfLines={3}
							value={notes}
							onChangeText={setNotes}
							placeholder="Add specific tasks or instructions..."
							placeholderTextColor="#94A3B8"
							className="rounded-2xl bg-white px-4 py-3"
							style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, fontSize: 14, color: "#0F172A", textAlignVertical: "top", minHeight: 96 }]}
						/>
					</View>
				</View>

				{warning ? (
					<View className="mt-4 rounded-xl p-3" style={{ backgroundColor: "#FEFCE8", borderWidth: 1, borderColor: "#FDE68A" }}>
						<Text style={{ color: "#92400E", fontSize: 13, fontWeight: "500" }}>{warning}</Text>
					</View>
				) : null}

				<View className="mt-6" style={{ gap: 12, paddingTop: 6 }}>
					<TouchableOpacity
						onPress={handleSave}
						disabled={saveShiftMutation.isPending}
						className="flex-row items-center justify-center rounded-2xl"
						style={{
							height: 56,
							backgroundColor: BRAND,
							opacity: saveShiftMutation.isPending ? 0.7 : 1,
							shadowColor: BRAND,
							shadowOpacity: 0.25,
							shadowOffset: { width: 0, height: 8 },
							shadowRadius: 12,
							elevation: 5,
						}}
					>
						<CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.2} />
						<Text style={{ marginLeft: 8, fontSize: 16, lineHeight: 20, fontWeight: "700", color: "#FFFFFF" }}>{saveShiftMutation.isPending ? "Saving..." : "Save Shift"}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => router.back()}
						className="items-center justify-center rounded-2xl border"
						style={{ height: 56, borderColor: "#E2E8F0", backgroundColor: "transparent" }}
					>
						<Text style={{ fontSize: 16, lineHeight: 20, fontWeight: "600", color: "#64748B" }}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<Modal visible={showEmployeePicker} transparent animationType="fade" onRequestClose={() => setShowEmployeePicker(false)}>
				<TouchableOpacity activeOpacity={1} onPress={() => setShowEmployeePicker(false)} style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.35)", justifyContent: "flex-end" }}>
					<View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: 360 }}>
						<Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>Select employee</Text>
						<ScrollView>
							{employees.map((employee) => (
								<TouchableOpacity
									key={employee.id}
									onPress={() => {
										setSelectedEmployeeId(employee.id);
										setShowEmployeePicker(false);
									}}
									style={{ paddingVertical: 12 }}
								>
									<Text style={{ fontSize: 16, fontWeight: selectedEmployeeId === employee.id ? "700" : "500", color: "#0F172A" }}>
										{employee.firstName} {employee.lastName}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</TouchableOpacity>
			</Modal>

			<DatePicker modal mode="date" open={showDatePicker} date={date} onConfirm={(selected) => { setDate(selected); setShowDatePicker(false); }} onCancel={() => setShowDatePicker(false)} />
			<DatePicker modal mode="time" open={showStartPicker} date={toDateAtTime(date, startTime)} onConfirm={(selected) => { setStartTime(toTimeLabel(selected)); setShowStartPicker(false); }} onCancel={() => setShowStartPicker(false)} />
			<DatePicker modal mode="time" open={showEndPicker} date={toDateAtTime(date, endTime)} onConfirm={(selected) => { setEndTime(toTimeLabel(selected)); setShowEndPicker(false); }} onCancel={() => setShowEndPicker(false)} />
		</SafeAreaView>
	);
}
