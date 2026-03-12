import { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Modal, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { CheckCircle2, X } from "lucide-react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import { useSaveShift, useShiftEmployees } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import Text from "@/components/Text";
import { Button, DatePickerField, EmployeePickerField, FieldError, FieldLabel, TextArea, TimePickerField } from "@/components/ui";

const BRAND = "#5B7B6C";
const BG = "#F8F9F8";

const normalizeTime = (v?: string) => (v ? v.slice(0, 5) : "09:00");
const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const toDateAtTime = (baseDate: Date, hhmm: string) => {
	const [h, m] = hhmm.split(":").map(Number);
	const next = new Date(baseDate);
	next.setHours(h, m, 0, 0);
	return next;
};
const toTimeLabel = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const shiftSchema = Yup.object({
	date: Yup.string().required("Date is required"),
	employeeId: Yup.string().required("Employee is required"),
	startTime: Yup.string().required("Start time is required"),
	endTime: Yup.string()
		.required("End time is required")
		.test("end-after-start", "End time must be later than start time.", function (value) {
			const { startTime } = this.parent as { startTime: string };
			if (!value || !startTime) return true;
			return value > startTime;
		}),
	notes: Yup.string().max(300, "Notes must be 300 characters or less"),
});

export function AddEditShiftScreen() {
	const params = useLocalSearchParams<{ date?: string; shiftId?: string; startTime?: string; endTime?: string; employeeIds?: string }>();
	const toast = useToast();
	const employeesQuery = useShiftEmployees();
	const saveShiftMutation = useSaveShift();
	const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);

	const baseDate = params.date ? new Date(`${params.date}T00:00:00`) : new Date();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [showEmployeePicker, setShowEmployeePicker] = useState(false);

	const initialEmployeeIds = params.employeeIds ? params.employeeIds.split(",").filter(Boolean) : [];
	const initialValues = {
		date: toIsoDate(baseDate),
		employeeId: initialEmployeeIds[0] ?? "",
		startTime: normalizeTime(params.startTime),
		endTime: normalizeTime(params.endTime || "17:00"),
		notes: "",
	};

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={shiftSchema}
			validateOnChange={false}
			validateOnBlur={false}
			onSubmit={async (values, { setSubmitting }) => {
				try {
					const payload = {
						date: values.date,
						startTime: values.startTime,
						endTime: values.endTime,
						employeeIds: values.employeeId ? [values.employeeId] : [],
					};

					const overlap = await shiftsRequests.validateOverlap({ ...payload, shiftId: params.shiftId });
					if (overlap && !overlap.valid) {
						toast.show("Overlapping assignment detected. Remove conflicting employees.", { type: "error" });
						setSubmitting(false);
						return;
					}

					await saveShiftMutation.mutateAsync({ shiftId: params.shiftId, payload });
					toast.show(params.shiftId ? "Shift updated successfully" : "Shift created successfully", { type: "success" });
					router.back();
				} catch {
					toast.show("Failed to save shift. Please try again.", { type: "error" });
					setSubmitting(false);
				}
			}}
		>
			{({ values, errors, touched, setFieldValue, setFieldTouched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
				const selectedDateObj = new Date(`${values.date}T00:00:00`);
				const selectedDateLabel = selectedDateObj.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
				const selectedEmployee = employees.find((e) => e.id === values.employeeId);
				const selectedEmployeeName = selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Select employee";

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
									<FieldLabel label="Date" />
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
									<FieldLabel label="Employee" />
									<EmployeePickerField
										value={selectedEmployeeName}
										onPress={() => {
											setFieldTouched("employeeId", true);
											setShowEmployeePicker(true);
										}}
									/>
									<FieldError error={touched.employeeId ? (errors.employeeId as string | undefined) : undefined} />
								</View>

								<View className="flex-row" style={{ gap: 12 }}>
									<View className="flex-1">
										<FieldLabel label="Start Time" />
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
										<FieldLabel label="End Time" />
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

								<View>
									<FieldLabel label="Notes / Description" />
									<TextArea
										value={values.notes}
										onChangeText={handleChange("notes")}
										onBlur={() => setFieldTouched("notes", true)}
										placeholder="Add specific tasks or instructions..."
									/>
									<FieldError error={touched.notes ? (errors.notes as string | undefined) : undefined} />
								</View>
							</View>

							<View style={{ marginTop: 16, gap: 12 }}>
								<Button
									variant="primary"
									text={isSubmitting || saveShiftMutation.isPending ? "Saving..." : "Save Shift"}
									onPress={() => handleSubmit()}
									disabled={isSubmitting || saveShiftMutation.isPending}
									leftIcon={<CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.2} />}
								/>
								<Button variant="secondary" text="Cancel" onPress={() => router.back()} />
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
													setFieldValue("employeeId", employee.id);
													setFieldTouched("employeeId", true);
													setShowEmployeePicker(false);
												}}
												style={{ paddingVertical: 12 }}
											>
												<Text style={{ fontSize: 16, fontWeight: values.employeeId === employee.id ? "700" : "500", color: "#0F172A" }}>
													{employee.firstName} {employee.lastName}
												</Text>
											</TouchableOpacity>
										))}
									</ScrollView>
								</View>
							</TouchableOpacity>
						</Modal>

						<DatePicker
							modal
							mode="date"
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
