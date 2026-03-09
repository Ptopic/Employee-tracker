import { Alert, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
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
	icon,
}: {
	label: string;
	onPress: () => void;
	secondary?: boolean;
	icon: keyof typeof Ionicons.glyphMap;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className={`rounded-xl px-4 py-3 items-center justify-center flex-row gap-2 ${secondary ? "bg-slate-100 border border-slate-200" : "bg-slate-900"}`}
		>
			<Ionicons name={icon} size={16} color={secondary ? "#1e293b" : "#fff"} />
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
		<View className="gap-3 pb-3">
			<View className="flex-row gap-3">
				<View className="flex-1">
					<ActionButton
						label="Add Employee"
						onPress={onAddEmployee || (() => fallback("Add Employee"))}
						secondary
						icon="person-add-outline"
					/>
				</View>
				<View className="flex-1">
					<ActionButton
						label="Add Shift"
						onPress={onAddShift || (() => fallback("Add Shift"))}
						secondary
						icon="add-circle-outline"
					/>
				</View>
			</View>
			<ActionButton
				label="Export Weekly PDF"
				onPress={onExportWeeklyPdf || (() => fallback("Export Weekly PDF"))}
				icon="document-text-outline"
			/>
		</View>
	);
}
