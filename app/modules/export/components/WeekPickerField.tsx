import { TextInput, View } from "react-native";
import Text from "@/components/Text";

type Props = {
	value: string;
	onChange: (value: string) => void;
};

export function WeekPickerField({ value, onChange }: Props) {
	return (
		<View>
			<Text className="text-gray-700 mb-2">Pocetak tjedna (YYYY-MM-DD)</Text>
			<TextInput
				className="rounded-lg border border-gray-300 px-3 py-3"
				placeholder="2026-03-02"
				value={value}
				onChangeText={onChange}
			/>
		</View>
	);
}
