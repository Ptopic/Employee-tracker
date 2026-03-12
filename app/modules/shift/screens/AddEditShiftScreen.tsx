import { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Modal, Pressable, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { CalendarDays, CheckCircle2, Clock3, Search, X } from "lucide-react-native";
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

const toIsoDate = (date: Date) => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

const toDateAtTime = (baseDate: Date, hhmm: string) => {
	const [h, m] = hhmm.split(":").map(Number);
	const next = new Date(baseDate);
	next.setHours(h, m, 0, 0);
	return next;
};

const toTimeLabel = (date: Date) =>
	`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export function AddEditShiftScreen() {
	const params = useLocalSearchParams<{
		date?: string;
		shiftId?: string;
		startTime?: string;
		endTime?: string;
		employeeIds?: string;
	}>();

	const baseDate = params.date ? new Date(`${params.date}T00:00:00`) : new Date();
	const [date, setDate] = useState<Date>(baseDate);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);

	const [startTime, setStartTime] = useState(normalizeTime(params.startTime));
	const [endTime, setEndTime] = useState(normalizeTime(params.endTime || "17:00"));
	const [search, setSearch] = useState("");
	const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
		params.employeeIds ? params.employeeIds.split(",").filter(Boolean) : [],
	);
	const [warning, setWarning] = useState<string | null>(null);

	const employeesQuery = useShiftEmployees();
	const saveShiftMutation = useSaveShift();

	const employees = useMemo(() => {
		const list = employeesQuery.data ?? [];
		if (!search.trim()) return list;
		const term = search.trim().toLowerCase();
		return list.filter((e) => `${e.firstName} ${e.lastName}`.toLowerCase().includes(term));
	}, [employeesQuery.data, search]);

	const selectedDateLabel = date.toLocaleDateString("en-US", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const payload = {
		date: toIsoDate(date),
		startTime,
		endTime,
		employeeIds: selectedEmployeeIds,
	};

	const toggleEmployee = (employeeId: string) => {
		setSelectedEmployeeIds((current) =>
			current.includes(employeeId)
				? current.filter((id) => id !== employeeId)
				: [...current, employeeId],
		);
	};

	const handleSave = async () => {
		setWarning(null);
		if (startTime >= endTime) {
			setWarning("End time must be later than start time.");
			return;
		}

		if (!selectedEmployeeIds.length) {
			setWarning("Warning: Empty shift is allowed, but no employees are assigned.");
		}

		const overlap = await shiftsRequests.validateOverlap({ ...payload, shiftId: params.shiftId });
		if (overlap && !overlap.valid) {
			setWarning("Overlapping assignment detected. Remove conflicting employees.");
			return;
		}

		await saveShiftMutation.mutateAsync({ shiftId: params.shiftId, payload });
		router.back();
	};

	return (
		<View className="flex-1" style={{ backgroundColor: BG }}>
			<ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 36 }}>
				<View className="mb-6 flex-row items-center justify-between">
					<Text style={{ fontSize: 24, fontWeight: "700", lineHeight: 30 }}>{params.shiftId ? "Edit Shift" : "Add New Shift"}</Text>
					<TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
						<X size={20} color="#64748B" strokeWidth={2} />
					</TouchableOpacity>
				</View>

				<View className="rounded-3xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
					<View style={{ gap: 16 }}>
						<View>
							<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase" }}>Date</Text>
							<TouchableOpacity
								onPress={() => setShowDatePicker(true)}
								className="h-14 flex-row items-center rounded-2xl bg-white px-4"
								style={{ borderWidth: 1, borderColor: SURFACE_BORDER }}
							>
								<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{selectedDateLabel}</Text>
								<CalendarDays size={20} color={BRAND} strokeWidth={2} />
							</TouchableOpacity>
						</View>

						<View>
							<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase" }}>Employee</Text>
							<View className="h-14 flex-row items-center rounded-2xl bg-white px-4" style={{ borderWidth: 1, borderColor: SURFACE_BORDER }}>
								<Search size={18} color="#94A3B8" strokeWidth={2} />
								<TextInput
									className="ml-2 flex-1"
									style={{ fontSize: 14, fontWeight: "500", color: "#0F172A" }}
									placeholder="Search employee"
									placeholderTextColor="#94A3B8"
									value={search}
									onChangeText={setSearch}
								/>
							</View>
						</View>

						<View className="flex-row" style={{ gap: 12 }}>
							<View className="flex-1">
								<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase" }}>Start Time</Text>
								<TouchableOpacity
									onPress={() => setShowStartPicker(true)}
									className="h-14 flex-row items-center rounded-2xl bg-white px-4"
									style={{ borderWidth: 1, borderColor: SURFACE_BORDER }}
								>
									<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{startTime}</Text>
									<Clock3 size={20} color={BRAND} strokeWidth={2} />
								</TouchableOpacity>
							</View>
							<View className="flex-1">
								<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 6, textTransform: "uppercase" }}>End Time</Text>
								<TouchableOpacity
									onPress={() => setShowEndPicker(true)}
									className="h-14 flex-row items-center rounded-2xl bg-white px-4"
									style={{ borderWidth: 1, borderColor: SURFACE_BORDER }}
								>
									<Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" }}>{endTime}</Text>
									<Clock3 size={20} color={BRAND} strokeWidth={2} />
								</TouchableOpacity>
							</View>
						</View>

						<View>
							<Text style={{ fontSize: 11, fontWeight: "600", color: "#94A3B8", marginBottom: 8, textTransform: "uppercase" }}>Employees</Text>
							<View className="rounded-2xl bg-white p-2" style={{ borderWidth: 1, borderColor: SURFACE_BORDER, maxHeight: 240 }}>
								<ScrollView>
									{employees.map((employee) => {
										const checked = selectedEmployeeIds.includes(employee.id);
										return (
											<TouchableOpacity
												key={employee.id}
												onPress={() => toggleEmployee(employee.id)}
												className="flex-row items-center rounded-xl px-2 py-2"
												style={{ backgroundColor: checked ? "rgba(91, 123, 108, 0.1)" : "transparent" }}
											>
												<View
													className="mr-3 h-5 w-5 items-center justify-center rounded-md"
													style={{ borderWidth: 1.5, borderColor: checked ? BRAND : "#94A3B8", backgroundColor: checked ? BRAND : "transparent" }}
												>
													{checked ? <CheckCircle2 size={12} color="#FFFFFF" strokeWidth={2.5} /> : null}
												</View>
												<Text style={{ fontSize: 14, fontWeight: "600", color: "#0F172A" }}>
													{employee.firstName} {employee.lastName}
												</Text>
											</TouchableOpacity>
										);
									})}
									{!employees.length ? <Text style={{ fontSize: 13, color: "#94A3B8", padding: 8 }}>No employees found.</Text> : null}
								</ScrollView>
							</View>
						</View>
					</View>
				</View>

				{warning ? (
					<View className="mt-4 rounded-xl p-3" style={{ backgroundColor: "#FEFCE8", borderWidth: 1, borderColor: "#FDE68A" }}>
						<Text style={{ color: "#92400E", fontSize: 13, fontWeight: "500" }}>{warning}</Text>
					</View>
				) : null}

				<View className="mt-6" style={{ gap: 12 }}>
					<TouchableOpacity
						onPress={handleSave}
						disabled={saveShiftMutation.isPending}
						className="h-14 flex-row items-center justify-center rounded-2xl"
						style={{ backgroundColor: BRAND, opacity: saveShiftMutation.isPending ? 0.7 : 1 }}
					>
						<CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.2} />
						<Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>{saveShiftMutation.isPending ? "Saving..." : "Save Shift"}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => router.back()} className="h-14 items-center justify-center rounded-2xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "transparent" }}>
						<Text style={{ fontSize: 16, fontWeight: "600", color: "#64748B" }}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<DatePicker
				modal
				mode="date"
				open={showDatePicker}
				date={date}
				onConfirm={(selected) => {
					setDate(selected);
					setShowDatePicker(false);
				}}
				onCancel={() => setShowDatePicker(false)}
			/>
			<DatePicker
				modal
				mode="time"
				open={showStartPicker}
				date={toDateAtTime(date, startTime)}
				onConfirm={(selected) => {
					setStartTime(toTimeLabel(selected));
					setShowStartPicker(false);
				}}
				onCancel={() => setShowStartPicker(false)}
			/>
			<DatePicker
				modal
				mode="time"
				open={showEndPicker}
				date={toDateAtTime(date, endTime)}
				onConfirm={(selected) => {
					setEndTime(toTimeLabel(selected));
					setShowEndPicker(false);
				}}
				onCancel={() => setShowEndPicker(false)}
			/>
		</View>
	);
}
