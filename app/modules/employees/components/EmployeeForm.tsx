import { Switch, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
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
	firstName: Yup.string().trim().required("Ime je obavezno"),
	lastName: Yup.string().trim(),
	age: Yup.number()
		.transform((value, originalValue) => (String(originalValue).trim() === "" ? undefined : value))
		.typeError("Dob mora biti broj")
		.integer("Dob mora biti cijeli broj")
		.min(16, "Dob mora biti izmedu 16 i 100")
		.max(100, "Dob mora biti izmedu 16 i 100")
		.optional(),
	hourlyRate: Yup.number().typeError("Satnica mora biti broj").min(0, "Satnica mora biti 0 ili vise").required("Satnica je obavezna"),
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
					age: values.age.trim() ? Number(values.age) : undefined,
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
							<FieldLabel label="Podaci o zaposleniku" />

							<View className="flex-row" style={{ gap: 12 }}>
								<View className="flex-1">
									<FieldLabel label="Ime" />
									<Input value={values.firstName} onChangeText={handleChange("firstName")} onBlur={() => handleBlur("firstName")} placeholder="npr. Ivan" />
									<FieldError error={touched.firstName ? (errors.firstName as string | undefined) : undefined} />
								</View>
								<View className="flex-1">
									<FieldLabel label="Prezime (nije obavezno)" />
									<Input value={values.lastName} onChangeText={handleChange("lastName")} onBlur={() => handleBlur("lastName")} placeholder="npr. Horvat" />
									<FieldError error={touched.lastName ? (errors.lastName as string | undefined) : undefined} />
								</View>
							</View>

							<View className="flex-row" style={{ gap: 12 }}>
								<View className="flex-1">
									<FieldLabel label="Dob (nije obavezno)" />
									<Input type="number" value={values.age} onChangeText={handleChange("age")} onBlur={() => handleBlur("age")} placeholder="25" />
									<FieldError error={touched.age ? (errors.age as string | undefined) : undefined} />
								</View>
								<View className="flex-1">
									<FieldLabel label="Satnica (€)" />
									<Input type="decimal" value={values.hourlyRate} onChangeText={handleChange("hourlyRate")} onBlur={() => handleBlur("hourlyRate")} placeholder="25.00" />
									<FieldError error={touched.hourlyRate ? (errors.hourlyRate as string | undefined) : undefined} />
								</View>
							</View>

							<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
								<View className="flex-row items-center justify-between">
									<View>
										<Text style={{ fontSize: 14, fontWeight: "600", color: "#334155" }}>Status</Text>
										<Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Zaposlenik je aktivan za raspored</Text>
									</View>
									<Switch value={values.status === "ACTIVE"} onValueChange={(v) => { void setFieldValue("status", v ? "ACTIVE" : "INACTIVE"); }} trackColor={{ false: "#CBD5E1", true: "#5B7B6C" }} />
								</View>
							</View>
						</View>

						<View style={{ gap: 12 }}>
							<FieldLabel label="Pocetna statistika" />
							<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER }]}> 
								<Text style={{ fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Trosak</Text>
								<Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>€{Number.isFinite(estimatedMonthlyCost) ? Math.round(estimatedMonthlyCost) : 0}</Text>
							</View>
						</View>

						<View style={{ gap: 12, paddingTop: 4 }}>
							<Button
								variant="primary"
								text={loading ? "Spremanje..." : submitLabel}
								onPress={() => handleSubmit()}
								disabled={loading}
								leftIcon={<CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.2} />}
							/>
							{onCancel ? <Button variant="secondary" text="Odustani" onPress={onCancel} /> : null}
						</View>
					</View>
				);
			}}
		</Formik>
	);
}

export type { EmployeeFormValues };
