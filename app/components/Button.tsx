import { TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";
import Text from "./Text";

const Button = ({
	onPress,
	text,
	disabled,
	isSubmitting,
	submittingText,
}: {
	onPress: () => void;
	text: string;
	disabled?: boolean;
	isSubmitting?: boolean;
	submittingText?: string;
}) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			className={twMerge(
				"bg-black rounded-lg p-[10] justify-center items-center w-full",
				disabled && "opacity-50",
			)}
		>
			<Text className="text-white text-lg font-bold">
				{isSubmitting ? submittingText : text}
			</Text>
		</TouchableOpacity>
	);
};

export default Button;
