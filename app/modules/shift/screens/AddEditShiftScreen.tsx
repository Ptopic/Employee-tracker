import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ActivityIndicator, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { CheckCircle2, X } from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Formik } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import { useEmployeesList } from "@/api/employees/hooks";
import { usePreferencesSettings } from "@/api/settings/hooks";
import { useSaveShift } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import DrawerModal from "@/components/DrawerModal";
import Text from "@/components/Text";
import { Button, DatePickerField, EmployeePickerField, FieldError, FieldLabel, TextArea, TimePickerField } from "@/components/ui";

const BRAND = "#5B7B6C";
const BG = "#F8F9F8";
const DEFAULT_FIRST_SHIFT_START = "09:00";
const DEFAULT_FIRST_SHIFT_END = "16:00";
const DEFAULT_SECOND_SHIFT_START = "16:00";
const DEFAULT_SECOND_SHIFT_END = "22:00";

const normalizeTime = (v: string | undefined, fallback: string) => {
	if (!v) return fallback;
	if (/^\d{2}:\d{2}/.test(v)) return v.slice(0, 5);
	const isoMatch = v.match(/T(\d{2}:\d{2})/);
	if (isoMatch?.[1]) return isoMatch[1];
	const looseMatch = v.match(/(\d{2}):(\d{2})/);
	if (looseMatch?.[1] && looseMatch?.[2]) return `${looseMatch[1]}:${looseMatch[2]}`;
	return fallback;
};
const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const toDateAtTime = (baseDate: Date, hhmm: string) => {
	const [h, m] = hhmm.split(":").map(Number);
	const next = new Date(baseDate);
	next.setHours(h, m, 0, 0);
	return next;
};
const toTimeLabel = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
const toMinutes = (hhmm: string) => {
	const [hours, minutes] = hhmm.split(":").map(Number);
	return hours * 60 + minutes;
};
const isValidShiftRange = (start: string, end: string) => toMinutes(start) !== toMinutes(end);

const shiftSchema = Yup.object({
	date: Yup.string().required("Datum je obavezan"),
	employeeId: Yup.string().required("Zaposlenik je obavezan"),
	isDayOff: Yup.boolean().default(false),
	startTime: Yup.string().when("isDayOff", ([isDayOff], schema) =>
		isDayOff ? schema.optional() : schema.required("Vrijeme pocetka je obavezno"),
	),
	endTime: Yup.string().when("isDayOff", ([isDayOff], schema) =>
		isDayOff
			? schema.optional()
			: schema.required("Vrijeme zavrsetka je obavezno").test("end-after-start", "Vrijeme pocetka i zavrsetka ne mogu biti isti.", function (value) {
					const { startTime } = this.parent as { startTime?: string };
					if (!value || !startTime) return true;
					return isValidShiftRange(startTime, value);
				}),
	),
	notes: Yup.string().max(300, "Biljeske mogu imati najvise 300 znakova"),
});

export function AddEditShiftScreen() {
	const params = useLocalSearchParams<{ date?: string; shiftId?: string; startTime?: string; endTime?: string; employeeIds?: string; isDayOff?: string }>();
	const toast = useToast();
	const employeesQuery = useEmployeesList({ status: "ACTIVE", sortBy: "name", sortOrder: "asc" });
	const preferencesQuery = usePreferencesSettings();
	const saveShiftMutation = useSaveShift();
	const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
	const firstShiftStart = normalizeTime(preferencesQuery.data?.firstShiftStart, DEFAULT_FIRST_SHIFT_START);
	const firstShiftEnd = normalizeTime(preferencesQuery.data?.firstShiftEnd, DEFAULT_FIRST_SHIFT_END);
	const secondShiftStart = normalizeTime(preferencesQuery.data?.secondShiftStart, DEFAULT_SECOND_SHIFT_START);
	const secondShiftEnd = normalizeTime(preferencesQuery.data?.secondShiftEnd, DEFAULT_SECOND_SHIFT_END);

	const baseDate = params.date ? new Date(`${params.date}T00:00:00`) : new Date();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [showEmployeePicker, setShowEmployeePicker] = useState(false);
	const employeeDrawerRef = useRef<BottomSheet>(null);

	useEffect(() => {
		if (showEmployeePicker) {
			employeeDrawerRef.current?.snapToIndex(0);
		} else {
			employeeDrawerRef.current?.close();
		}
	}, [showEmployeePicker]);

	const initialEmployeeIds = params.employeeIds ? params.employeeIds.split(",").filter(Boolean) : [];
	const initialValues = {
		date: toIsoDate(baseDate),
		employeeId: initialEmployeeIds[0] ?? "",
		isDayOff: params.isDayOff === "true",
		startTime: normalizeTime(params.startTime, firstShiftStart),
		endTime: normalizeTime(params.endTime, firstShiftEnd),
		notes: "",
	};

	return (
		<Formik
			initialValues={initialValues}
			enableReinitialize
			validationSchema={shiftSchema}
			validateOnChange={false}
			validateOnBlur={false}
			onSubmit={async (values, { setSubmitting }) => {
				try {
					const payload = {
						date: values.date,
						isDayOff: values.isDayOff,
						startTime: values.isDayOff ? undefined : values.startTime,
						endTime: values.isDayOff ? undefined : values.endTime,
						employeeIds: values.employeeId ? [values.employeeId] : [],
					};

					if (values.employeeId) {
						const overlap = await shiftsRequests.validateOverlap({ ...payload, shiftId: params.shiftId });
						if (overlap && !overlap.valid) {
							toast.show("Otkriveno je preklapanje smjena. Uklonite konfliktne zaposlenike.", { type: "error" });
							setSubmitting(false);
							return;
						}
					}

					await saveShiftMutation.mutateAsync({ shiftId: params.shiftId, payload });
					toast.show(params.shiftId ? "Smjena je uspjesno azurirana" : "Smjena je uspjesno kreirana", { type: "success" });
					router.back();
				} catch {
					toast.show("Spremanje smjene nije uspjelo. Pokusajte ponovno.", { type: "error" });
					setSubmitting(false);
				}
			}}
		>
			{({ values, errors, touched, setFieldValue, setFieldTouched, handleChange, handleSubmit, isSubmitting }) => {
				const selectedDateObj = new Date(`${values.date}T00:00:00`);
				const selectedDateLabel = selectedDateObj.toLocaleDateString("hr-HR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
				const selectedEmployee = employees.find((e) => e.id === values.employeeId);
				const selectedEmployeeName = selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Odaberite zaposlenika";

				return (
					<SafeAreaView className="flex-1" style={{ backgroundColor: BG }}>
						<ScrollView bounces={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28, paddingTop: 4 }}>
							<View className="items-center pt-1 pb-1">
								<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
							</View>

							<View className="mb-6 mt-4 flex-row items-center justify-between">
								<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>{params.shiftId ? "Uredi smjenu" : "Dodaj novu smjenu"}</Text>
								<TouchableOpacity className="items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: "#F1F5F9" }} onPress={() => router.back()}>
									<X size={20} color="#64748B" strokeWidth={2} />
								</TouchableOpacity>
							</View>

							<View style={{ gap: 16 }}>
								<View>
									<FieldLabel label="Datum" />
									<DatePickerField
										value={selectedDateLabel}
										onPress={() => {
											setFieldTouched("date", true);
											setShowDatePicker(true);
										}}
									/>
									<FieldError error={touched.date ? (errors.date as string | undefined) : undefined} />
								</View>

								<View>
									<FieldLabel label="Zaposlenik" />
									<EmployeePickerField
										value={selectedEmployeeName}
										onPress={() => {
											setFieldTouched("employeeId", true);
											setShowEmployeePicker(true);
										}}
									/>
									<FieldError error={touched.employeeId ? (errors.employeeId as string | undefined) : undefined} />
								</View>

								<View className="rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 12 }}>
									<View className="flex-row items-center justify-between">
										<View style={{ flex: 1, paddingRight: 14 }}>
											<Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>Slobodan dan</Text>
											<Text style={{ marginTop: 4, fontSize: 12, color: "#64748B" }}>
												Ukljucite ovo kada je odabrani zaposlenik slobodan cijeli dan.
											</Text>
										</View>
										<Switch
											value={values.isDayOff}
											onValueChange={(nextValue) => {
												setFieldValue("isDayOff", nextValue);
												if (!nextValue) {
													setFieldTouched("startTime", false);
													setFieldTouched("endTime", false);
												}
											}}
											trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
											thumbColor={values.isDayOff ? BRAND : "#FFFFFF"}
										/>
									</View>
								</View>

								{!values.isDayOff ? (
									<View style={{ gap: 10 }}>
										<View className="flex-row" style={{ gap: 8 }}>
											<TouchableOpacity
												onPress={() => {
													setFieldValue("startTime", firstShiftStart);
													setFieldValue("endTime", firstShiftEnd);
												}}
												className="flex-1 items-center justify-center rounded-xl"
												style={{ height: 42, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}
											>
												<Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
													Prva smjena
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => {
													setFieldValue("startTime", secondShiftStart);
													setFieldValue("endTime", secondShiftEnd);
												}}
												className="flex-1 items-center justify-center rounded-xl"
												style={{ height: 42, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}
											>
												<Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>
													Druga smjena
												</Text>
											</TouchableOpacity>
										</View>
										<View className="flex-row" style={{ gap: 12 }}>
											<View className="flex-1">
												<FieldLabel label="Pocetak" />
												<TimePickerField
													value={values.startTime}
												onPress={() => {
													setFieldTouched("startTime", true);
													setShowStartPicker(true);
												}}
											/>
												<FieldError error={touched.startTime ? (errors.startTime as string | undefined) : undefined} />
											</View>
											<View className="flex-1">
												<FieldLabel label="Kraj" />
												<TimePickerField
													value={values.endTime}
												onPress={() => {
													setFieldTouched("endTime", true);
													setShowEndPicker(true);
												}}
											/>
												<FieldError error={touched.endTime ? (errors.endTime as string | undefined) : undefined} />
											</View>
										</View>
									</View>
								) : null}

								<View>
									<FieldLabel label="Biljeske / Opis" />
									<TextArea
										value={values.notes}
										onChangeText={handleChange("notes")}
										onBlur={() => setFieldTouched("notes", true)}
										placeholder="Dodajte konkretne zadatke ili upute..."
									/>
									<FieldError error={touched.notes ? (errors.notes as string | undefined) : undefined} />
								</View>
							</View>

							<View style={{ marginTop: 16, gap: 12 }}>
								<Button
									variant="primary"
									text={isSubmitting || saveShiftMutation.isPending ? "Spremanje..." : "Spremi smjenu"}
									onPress={() => handleSubmit()}
									disabled={isSubmitting || saveShiftMutation.isPending}
									leftIcon={<CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.2} />}
								/>
								<Button variant="secondary" text="Odustani" onPress={() => router.back()} />
							</View>
						</ScrollView>

						<DrawerModal
							ref={employeeDrawerRef}
							snapPoints={["56%"]}
							onChange={(index) => {
								if (index === -1) setShowEmployeePicker(false);
							}}
						>
							<View className="items-center pb-3">
								<View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "#CBD5E1" }} />
							</View>
							<Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, paddingHorizontal: 4 }}>Odaberite zaposlenika</Text>

							{employeesQuery.isLoading ? (
								<View className="items-center justify-center" style={{ paddingVertical: 28 }}>
									<ActivityIndicator size="small" color={BRAND} />
									<Text style={{ marginTop: 10, color: "#64748B", fontSize: 13 }}>Ucitavanje zaposlenika...</Text>
								</View>
							) : employeesQuery.isError ? (
								<View className="rounded-2xl bg-slate-50 items-center" style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: "#334155" }}>Nije moguce ucitati zaposlenike</Text>
									<Text style={{ fontSize: 13, color: "#64748B", marginTop: 6, textAlign: "center" }}>
										Pokusajte ponovno za trenutak.
									</Text>
								</View>
							) : employees.length === 0 ? (
								<View className="rounded-2xl bg-slate-50 items-center" style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: "#334155" }}>Jos nema zaposlenika</Text>
									<Text style={{ fontSize: 13, color: "#64748B", marginTop: 6, textAlign: "center" }}>
										Prvo dodajte zaposlenika pa ga zatim dodijelite smjeni.
									</Text>
								</View>
							) : (
								<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36, paddingHorizontal: 4 }}>
									{employees.map((employee) => {
										const isSelected = values.employeeId === employee.id;
										return (
											<TouchableOpacity
												key={employee.id}
												onPress={() => {
													setFieldValue("employeeId", employee.id);
													setFieldTouched("employeeId", true);
													setShowEmployeePicker(false);
												}}
												className="rounded-xl px-3"
												style={{
													paddingVertical: 12,
													marginBottom: 6,
													backgroundColor: isSelected ? "#E7EFEA" : "#FFFFFF",
													borderWidth: 1,
													borderColor: isSelected ? BRAND : "#E2E8F0",
												}}
											>
												<Text style={{ fontSize: 15, fontWeight: isSelected ? "700" : "500", color: "#0F172A" }}>
													{employee.firstName} {employee.lastName}
												</Text>
											</TouchableOpacity>
										);
									})}
								</ScrollView>
							)}
						</DrawerModal>

						<DatePicker
							modal
							mode="date"
							locale="hr-HR"
							open={showDatePicker}
							date={selectedDateObj}
							onConfirm={(selected) => {
								setFieldValue("date", toIsoDate(selected));
								setFieldTouched("date", true);
								setShowDatePicker(false);
							}}
							onCancel={() => setShowDatePicker(false)}
						/>
						<DatePicker
							modal
							mode="time"
							locale="hr-HR"
							open={showStartPicker}
							date={toDateAtTime(selectedDateObj, values.startTime)}
							onConfirm={(selected) => {
								setFieldValue("startTime", toTimeLabel(selected));
								setFieldTouched("startTime", true);
								setShowStartPicker(false);
							}}
							onCancel={() => setShowStartPicker(false)}
						/>
						<DatePicker
							modal
							mode="time"
							locale="hr-HR"
							open={showEndPicker}
							date={toDateAtTime(selectedDateObj, values.endTime)}
							onConfirm={(selected) => {
								setFieldValue("endTime", toTimeLabel(selected));
								setFieldTouched("endTime", true);
								setShowEndPicker(false);
							}}
							onCancel={() => setShowEndPicker(false)}
						/>
					</SafeAreaView>
				);
			}}
		</Formik>
	);
}
