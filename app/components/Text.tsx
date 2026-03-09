import {
	type StyleProp,
	Text as TextNative,
	type TextStyle,
} from "react-native";

const Text = ({
	children,
	className,
	style,
	numberOfLines,
	allowFontScaling = false,
	...props
}: {
	children: React.ReactNode;
	className?: string;
	style?: StyleProp<TextStyle>;
	numberOfLines?: number;
	allowFontScaling?: boolean;
}) => {
	const finalClassName = className ? className : "body";

	return (
		<TextNative
			className={finalClassName}
			style={style}
			numberOfLines={numberOfLines}
			allowFontScaling={allowFontScaling}
			maxFontSizeMultiplier={1}
			{...props}
		>
			{children}
		</TextNative>
	);
};

export default Text;
