import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Text from "@/components/Text";
import ErrorText from "./ErrorText";

type InputKind = "text" | "password" | "number" | "decimal";

const keyboardTypeFor = (type: InputKind) => {
	if (type === "number") return "number-pad" as const;
	if (type === "decimal") return "decimal-pad" as const;
	return "default" as const;
};

const Input = ({
	name,
	placeholder,
	value,
	onChangeText,
	onBlur,
	error,
	type = "text",
	maxLength,
	disabled,
	placeholderAlwaysVisible = false,
}: {
	name: string;
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	onBlur?: () => void;
	error?: string;
	type?: InputKind;
	maxLength?: number;
	disabled?: boolean;
	placeholderAlwaysVisible?: boolean;
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const placeholderPosition = useSharedValue(value && value.length > 0 && !placeholderAlwaysVisible ? -32 : 0);
	const placeholderOpacity = useSharedValue(value && value.length > 0 && !placeholderAlwaysVisible ? 1 : 0);

	const animatedPlaceholderStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: placeholderPosition.value }, { translateX: 2 }],
		opacity: placeholderOpacity.value,
	}));

	const handleChangeText = (text: string) => {
		setIsFocused(text.length > 0);
		onChangeText(text);
	};

	const handleBlur = () => {
		setIsFocused(false);
		if (!value) {
			placeholderPosition.value = withTiming(0, { duration: 150 });
			placeholderOpacity.value = withTiming(0, { duration: 150 });
		}
		onBlur?.();
	};

	useEffect(() => {
		if (placeholderAlwaysVisible || value) {
			placeholderPosition.value = withTiming(-32, { duration: 150 });
			placeholderOpacity.value = withTiming(1, { duration: 150 });
			return;
		}

		placeholderPosition.value = withTiming(0, { duration: 150 });
		placeholderOpacity.value = withTiming(0, { duration: 150 });
	}, [placeholderAlwaysVisible, value, placeholderOpacity, placeholderPosition]);

	return (
		<View className="gap-[5] relative w-full" style={{ marginTop: isFocused || value || placeholderAlwaysVisible ? 20 : 0 }}>
			<Animated.Text className="absolute left-[2] top-[10] text-black" style={animatedPlaceholderStyle}>
				{placeholder}
			</Animated.Text>
			<View className="border border-black rounded-lg p-[10]" style={{ opacity: disabled ? 0.5 : 1 }}>
				<TextInput
					testID={name}
					autoComplete="off"
					secureTextEntry={type === "password"}
					value={value}
					onChangeText={handleChangeText}
					onBlur={handleBlur}
					placeholder={placeholder}
					placeholderTextColor="gray"
					style={maxLength ? { width: "85%" } : {}}
					editable={!disabled}
					keyboardType={keyboardTypeFor(type)}
				/>
				{maxLength ? (
					<Text className="absolute right-[10] bottom-[10] text-gray-500">
						{value.length}/{maxLength}
					</Text>
				) : null}
			</View>
			{error ? <ErrorText error={error} /> : null}
		</View>
	);
};

export default Input;
