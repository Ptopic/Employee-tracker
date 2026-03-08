import { Pressable, View } from "react-native";
import Text from "@/components/Text";

type Option<T extends string> = { label: string; value: T };

type Props<T extends string> = {
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: Option<T>[];
};

export function OptionSelector<T extends string>({
	label,
	value,
	onChange,
	options,
}: Props<T>) {
	return (
		<View className="mb-3">
			<Text className="text-gray-700 mb-2">{label}</Text>
			<View className="flex-row gap-2">
				{options.map((option) => {
					const active = option.value === value;
					return (
						<Pressable
							key={option.value}
							onPress={() => onChange(option.value)}
							className={`flex-1 rounded-lg border px-3 py-2 items-center ${
								active ? "bg-black border-black" : "bg-white border-gray-300"
							}`}
						>
							<Text className={active ? "text-white" : "text-black"}>{option.label}</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
