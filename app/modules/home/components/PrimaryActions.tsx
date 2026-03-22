import { Alert, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/components/Text";

type PrimaryActionsProps = {
	onAddEmployee?: () => void;
	onAddShift?: () => void;
	onExportWeeklyPdf?: () => void;
};

const fallback = (label: string) =>
	Alert.alert("Uskoro dostupno", `Akcija \"${label}\" bit ce uskoro dostupna.`);

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
			className={`rounded-xl px-4 py-3 items-center justify-center flex-row gap-2 ${secondary ? "bg-slate-100 border border-slate-200" : "bg-blue-100 border border-blue-400"}`}
		>
			<Ionicons name={icon} size={16} color={secondary ? "#1e293b" : "#007AFF"} />
			<Text className={`${secondary ? "text-slate-800" : "text-blue-400"} font-semibold`}>
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
						label="Dodaj zaposlenika"
						onPress={onAddEmployee || (() => fallback("Dodaj zaposlenika"))}
						secondary
						icon="person-add-outline"
					/>
				</View>
				<View className="flex-1">
					<ActionButton
						label="Dodaj smjenu"
						onPress={onAddShift || (() => fallback("Dodaj smjenu"))}
						secondary
						icon="add-circle-outline"
					/>
				</View>
			</View>
			<ActionButton
				label="Generiraj tjedni PDF"
				onPress={onExportWeeklyPdf || (() => fallback("Generiraj tjedni PDF"))}
				icon="document-text-outline"
			/>
		</View>
	);
}
