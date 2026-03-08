import { useMemo, useState } from "react";
import { Pressable, Switch, TextInput, View } from "react-native";
import Text from "@/components/Text";
import type { EmployeePayload, EmployeeStatus } from "@/api/employees/types";

type EmployeeFormValues = {
	firstName: string;
	lastName: string;
	age: string;
	hourlyRate: string;
	status: EmployeeStatus;
};

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
	const [values, setValues] = useState<EmployeeFormValues>(initialValues);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const estimatedMonthlyCost = useMemo(() => {
		const rate = Number(values.hourlyRate || 0);
		return Number.isFinite(rate) ? rate * 160 : 0;
	}, [values.hourlyRate]);

	const validate = () => {
		const nextErrors: Record<string, string> = {};
		if (!values.firstName.trim()) nextErrors.firstName = "First name is required";
		if (!values.lastName.trim()) nextErrors.lastName = "Last name is required";

		const age = Number(values.age);
		if (!Number.isInteger(age) || age < 16 || age > 100) {
			nextErrors.age = "Age must be between 16 and 100";
		}

		const rate = Number(values.hourlyRate);
		if (!Number.isFinite(rate) || rate < 0) {
			nextErrors.hourlyRate = "Hourly rate must be 0 or greater";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validate()) return;
		onSubmit({
			firstName: values.firstName.trim(),
			lastName: values.lastName.trim(),
			age: Number(values.age),
			hourlyRate: Number(values.hourlyRate),
			status: values.status,
		});
	};

	const Field = ({
		label,
		value,
		onChangeText,
		keyboardType,
		error,
	}: {
		label: string;
		value: string;
		onChangeText: (text: string) => void;
		keyboardType?: "default" | "numeric" | "decimal-pad";
		error?: string;
	}) => (
		<View className="mb-3">
			<Text className="mb-1 text-gray-700">{label}</Text>
			<TextInput
				value={value}
				onChangeText={onChangeText}
				keyboardType={keyboardType}
				className="rounded-lg border border-gray-300 bg-white px-3 py-3"
			/>
			{error ? <Text className="text-red-600 text-xs mt-1">{error}</Text> : null}
		</View>
	);

	return (
		<View>
			<Field
				label="First name"
				value={values.firstName}
				onChangeText={(text) => setValues((prev) => ({ ...prev, firstName: text }))}
				error={errors.firstName}
			/>
			<Field
				label="Last name"
				value={values.lastName}
				onChangeText={(text) => setValues((prev) => ({ ...prev, lastName: text }))}
				error={errors.lastName}
			/>
			<Field
				label="Age"
				value={values.age}
				onChangeText={(text) => setValues((prev) => ({ ...prev, age: text }))}
				keyboardType="numeric"
				error={errors.age}
			/>
			<Field
				label="Hourly rate"
				value={values.hourlyRate}
				onChangeText={(text) => setValues((prev) => ({ ...prev, hourlyRate: text }))}
				keyboardType="decimal-pad"
				error={errors.hourlyRate}
			/>

			<View className="flex-row items-center justify-between mb-4">
				<Text className="text-gray-700">Status</Text>
				<View className="flex-row items-center gap-2">
					<Text>{values.status === "ACTIVE" ? "Active" : "Inactive"}</Text>
					<Switch
						value={values.status === "ACTIVE"}
						onValueChange={(v) =>
							setValues((prev) => ({
								...prev,
								status: v ? "ACTIVE" : "INACTIVE",
							}))
						}
					/>
				</View>
			</View>

			<View className="rounded-lg bg-gray-50 p-3 mb-4 border border-gray-200">
				<Text className="text-gray-700">
					Est. monthly cost (160h): ${estimatedMonthlyCost.toFixed(2)}
				</Text>
			</View>

			<View className="flex-row gap-2">
				{onCancel ? (
					<Pressable className="flex-1 rounded-lg bg-gray-200 py-3 items-center" onPress={onCancel}>
						<Text className="font-semibold">Cancel</Text>
					</Pressable>
				) : null}
				<Pressable
					className="flex-1 rounded-lg bg-black py-3 items-center"
					onPress={handleSubmit}
					disabled={loading}
				>
					<Text className="text-white font-semibold">{loading ? "Saving..." : submitLabel}</Text>
				</Pressable>
			</View>
		</View>
	);
}

export type { EmployeeFormValues };
