import { useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useToast } from "react-native-toast-notifications";
import Text from "@/components/Text";
import { LinkIcon } from "@/shared/svgs";

const AddModal = ({
	modalVisible,
	setModalVisible,
}: {
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
}) => {
	const toast = useToast();
	const _queryClient = useQueryClient();
	const modalOpacity = useSharedValue(0);
	const modalTranslateY = useSharedValue(150);
	const textOpacity = useSharedValue(0);

	useEffect(() => {
		if (modalVisible) {
			textOpacity.value = withTiming(1, { duration: 200 });
			modalOpacity.value = withTiming(1, { duration: 200 });
			modalTranslateY.value = withTiming(0, { duration: 200 });
		} else {
			textOpacity.value = withTiming(0, { duration: 200 });
			modalOpacity.value = withTiming(0, { duration: 200 });
			modalTranslateY.value = withTiming(150, { duration: 200 });
		}
	}, [modalVisible, modalOpacity, modalTranslateY, textOpacity]);

	const animatedModalOpacity = useAnimatedStyle(() => ({
		opacity: modalOpacity.value,
	}));

	const animatedModalTranslateY = useAnimatedStyle(() => ({
		transform: [{ translateY: modalTranslateY.value }],
	}));

	const animatedTextOpacity = useAnimatedStyle(() => ({
		opacity: textOpacity.value,
	}));

	const pasteFromClipboard = async () => {
		const url = await Clipboard.getStringAsync();

		if (
			!url.includes("https://") ||
			(!url.includes("tiktok") && !url.includes("instagram"))
		) {
			toast.show("Please paste a valid link", { type: "error" });
			return;
		}

		setModalVisible(false);
		toast.show("Import started", { type: "regular" });
	};

	return (
		<Animated.View
			className="absolute z-20 -top-[83px] left-0 right-0 bottom-0 w-full h-full"
			style={[animatedModalOpacity, animatedModalTranslateY]}
		>
			<BlurView
				intensity={50}
				className="w-full h-full"
				tint="light"
				experimentalBlurMethod="dimezisBlurView"
			>
				<TouchableOpacity
					className="absolute z-20 pb-10 left-0 right-0 bottom-0 w-full h-full flex justify-end items-center"
					onPress={() => setModalVisible(false)}
				>
					<Animated.View
						style={[animatedTextOpacity]}
						className="bg-white border border-gray-200 rounded-lg p-4 flex flex-row items-center gap-2"
					>
						<TouchableOpacity
							onPress={() => pasteFromClipboard()}
							className="flex flex-row items-center gap-2"
						>
							<LinkIcon color="red" width={24} height={24} />
							<Text className="body-medium-regular">
								Paste link from clipboard
							</Text>
						</TouchableOpacity>
					</Animated.View>
				</TouchableOpacity>
			</BlurView>
		</Animated.View>
	);
};

export default AddModal;
