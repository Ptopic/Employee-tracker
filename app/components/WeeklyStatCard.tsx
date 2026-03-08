import { View } from "react-native";
import Text from "@/components/Text";

type WeeklyStatCardProps = {
	title: string;
	value: string;
	helperText: string;
	accentClassName: string;
};

export default function WeeklyStatCard({
	title,
	value,
	helperText,
	accentClassName,
}: WeeklyStatCardProps) {
	return (
		<View className="w-[48%] rounded-2xl border border-gray200 bg-white p-4">
			<View className={`mb-3 h-1.5 w-10 rounded-full ${accentClassName}`} />
			<Text className="body-small-semibold text-gray500">{title}</Text>
			<Text className="heading-small mt-1 text-black">{value}</Text>
			<Text className="body-xsmall-regular mt-2 text-gray600">{helperText}</Text>
		</View>
	);
}
