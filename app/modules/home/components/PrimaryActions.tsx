import { Alert, TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";

type PrimaryActionsProps = {
	onAddEmployee?: () => void;
	onAddShift?: () => void;
	onExportWeeklyPdf?: () => void;
};

const fallback = (label: string) =>
	Alert.alert("Coming soon", `${label} action will be available soon.`);

function ActionButton({
	label,
	onPress,
	secondary,
}: {
	label: string;
	onPress: () => void;
	secondary?: boolean;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className={`rounded-xl px-4 py-3 items-center justify-center ${secondary ? "bg-slate-100 border border-slate-200" : "bg-slate-900"}`}
		>
			<Text className={`${secondary ? "text-slate-800" : "text-white"} font-semibold`}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

export function PrimaryActions({
	onAddEmployee,
	onAddShift,
	onExportWeeklyPdf,
}: PrimaryActionsProps) {
	return (
		<View className="gap-3 pb-2">
			<View className="flex-row gap-3">
				<View className="flex-1">
					<ActionButton
						label="Add Employee"
						onPress={onAddEmployee || (() => fallback("Add Employee"))}
						secondary
					/>
				</View>
				<View className="flex-1">
					<ActionButton
						label="Add Shift"
						onPress={onAddShift || (() => fallback("Add Shift"))}
						secondary
					/>
				</View>
			</View>
			<ActionButton
				label="Export Weekly PDF"
				onPress={onExportWeeklyPdf || (() => fallback("Export Weekly PDF"))}
			/>
		</View>
	);
}
