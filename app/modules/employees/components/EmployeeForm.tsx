import { useMemo } from "react";
import { Switch, View } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import Text from "@/components/Text";
import { Button, FieldError, FieldLabel, Input } from "@/components/ui";
import type { EmployeePayload, EmployeeStatus } from "@/api/employees/types";

type EmployeeFormValues = {
	firstName: string;
	lastName: string;
	age: string;
	hourlyRate: string;
	status: EmployeeStatus;
};

const employeeSchema = Yup.object({
	firstName: Yup.string().trim().required("First name is required"),
	lastName: Yup.string().trim().required("Last name is required"),
	age: Yup.number().typeError("Age must be a number").integer("Age must be a whole number").min(16, "Age must be between 16 and 100").max(100, "Age must be between 16 and 100").required("Age is required"),
	hourlyRate: Yup.number().typeError("Hourly rate must be a number").min(0, "Hourly rate must be 0 or greater").required("Hourly rate is required"),
	status: Yup.mixed<EmployeeStatus>().oneOf(["ACTIVE", "INACTIVE"]),
});

const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function EmployeeForm({
	initialValues,
	onSubmit,
	onCancel,
	submitLabel,
	loading,
}: {
	initialValues: EmployeeFormValues;
	onSubmit: (payload: EmployeePayload) => void;
	onCancel?: () => void;
	submitLabel: string;
	loading?: boolean;
}) {
	const initialStats = useMemo(() => ({ weekly: 0, monthly: 0, cost: 0 }), []);

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={employeeSchema}
			validateOnChange={false}
			validateOnBlur={false}
			onSubmit={(values) => {
				onSubmit({
					firstName: values.firstName.trim(),
					lastName: values.lastName.trim(),
					age: Number(values.age),
					hourlyRate: Number(values.hourlyRate),
					status: values.status,
				});
			}}
		>
			{({ values, errors, touched, setFieldValue, handleChange, handleBlur, handleSubmit }) => {
				const estimatedMonthlyCost = Number(values.hourlyRate || 0) * 160;
				return (
					<View style={{ gap: 24 }}>
						<View style={{ gap: 14 }}>
							<FieldLabel label="Employee Info" />

							<View className="flex-row" style={{ gap: 12 }}>
								<View className="flex-1">
									<FieldLabel label="First Name" />
									<Input value={values.firstName} onChangeText={handleChange("firstName")} onBlur={handleBlur("firstName")} placeholder="e.g. John" />
									<FieldError error={touched.firstName ? (errors.firstName as string | undefined) : undefined} />
								</View>
								<View className="flex-1">
									<FieldLabel label="Last Name" />
									<Input value={values.lastName} onChangeText={handleChange("lastName")} onBlur={handleBlur("lastName")} placeholder="e.g. Doe" />
									<FieldError error={touched.lastName ? (errors.lastName as string | undefined) : undefined} />
								</View>
							</View>

							<View className="flex-row" style={{ gap: 12 }}>
								<View className="flex-1">
									<FieldLabel label="Age" />
									<Input value={values.age} onChangeText={handleChange("age")} onBlur={handleBlur("age")} placeholder="25" />
									<FieldError error={touched.age ? (errors.age as string | undefined) : undefined} />
								</View>
								<View className="flex-1">
									<FieldLabel label="Hourly Rate ($)" />
									<Input value={values.hourlyRate} onChangeText={handleChange("hourlyRate")} onBlur={handleBlur("hourlyRate")} placeholder="25.00" />
									<FieldError error={touched.hourlyRate ? (errors.hourlyRate as string | undefined) : undefined} />
								</View>
							</View>

							<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
								<View className="flex-row items-center justify-between">
									<View>
										<Text style={{ fontSize: 14, fontWeight: "600", color: "#334155" }}>Status</Text>
										<Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Employee is active for scheduling</Text>
									</View>
									<Switch value={values.status === "ACTIVE"} onValueChange={(v) => setFieldValue("status", v ? "ACTIVE" : "INACTIVE")} trackColor={{ false: "#CBD5E1", true: "#5B7B6C" }} />
								</View>
							</View>
						</View>

						<View style={{ gap: 12 }}>
							<FieldLabel label="Initial Stats" />
							<View className="flex-row" style={{ gap: 12 }}>
								<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
									<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Weekly</Text>
									<Text style={{ fontSize: 18, fontWeight: "700" }}>{initialStats.weekly} <Text style={{ fontSize: 10, color: "#94A3B8" }}>hrs</Text></Text>
								</View>
								<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
									<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Monthly</Text>
									<Text style={{ fontSize: 18, fontWeight: "700" }}>{initialStats.monthly} <Text style={{ fontSize: 10, color: "#94A3B8" }}>hrs</Text></Text>
								</View>
								<View className="flex-1 rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}>
									<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Cost</Text>
									<Text style={{ fontSize: 18, fontWeight: "700" }}>${Number.isFinite(estimatedMonthlyCost) ? Math.round(estimatedMonthlyCost) : 0}</Text>
								</View>
							</View>
						</View>

						<View style={{ gap: 12, paddingTop: 4 }}>
							<Button
								variant="primary"
								text={loading ? "Saving..." : submitLabel}
								onPress={() => handleSubmit()}
								disabled={loading}
								leftIcon={<CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.2} />}
							/>
							{onCancel ? <Button variant="secondary" text="Cancel" onPress={onCancel} /> : null}
						</View>
					</View>
				);
			}}
		</Formik>
	);
}

export type { EmployeeFormValues };
