import { Alert, View } from "react-native";
import Button from "@/components/Button";

type PrimaryActionsProps = {
	onAddEmployee?: () => void;
	onAddShift?: () => void;
	onExportWeeklyPdf?: () => void;
};

const fallback = (label: string) => Alert.alert("Coming soon", `${label} action will be available soon.`);

export function PrimaryActions({
	onAddEmployee,
	onAddShift,
	onExportWeeklyPdf,
}: PrimaryActionsProps) {
	return (
		<View className="gap-3 pb-2">
			<Button text="➕ Add Employee" onPress={onAddEmployee || (() => fallback("Add Employee"))} />
			<Button text="➕ Add Shift" onPress={onAddShift || (() => fallback("Add Shift"))} />
			<Button
				text="📄 Export Weekly PDF"
				onPress={onExportWeeklyPdf || (() => fallback("Export Weekly PDF"))}
			/>
		</View>
	);
}
