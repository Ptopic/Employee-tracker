import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Modal,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	ScrollView,
	StyleSheet,
	View,
	type ViewStyle,
} from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

interface BottomSheetComponentProps {
	isVisible: boolean;
	setIsVisible: (visible: boolean) => void;
	children: React.ReactNode;
	overlayStyle?: ViewStyle;
	sheetStyle?: ViewStyle;
	customAnimatedOverlayStyle?: ViewStyle;
	snapPoints?: string[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BottomSheetComponent: React.FC<BottomSheetComponentProps> = ({
	isVisible,
	setIsVisible,
	children,
	overlayStyle,
	sheetStyle,
	customAnimatedOverlayStyle,
	snapPoints = ["30%", "80%"],
}) => {
	const [internalVisible, setInternalVisible] = useState(false);
	const [isScrollEnabled, setIsScrollEnabled] = useState(false);
	const scrollY = useSharedValue(0);

	const snapPointsPixels = snapPoints
		.map((point) => SCREEN_HEIGHT * (parseFloat(point) / 100))
		.sort((a, b) => a - b);

	const initialSnapPoint = snapPointsPixels[0];
	const maxSnapPointIndex = snapPointsPixels.length - 1;
	const maxSnapPoint = Math.max(...snapPointsPixels);

	const translateY = useSharedValue(SCREEN_HEIGHT);
	const activeSnapPointIndex = useSharedValue(0);
	const context = useSharedValue({ y: 0, startY: 0 });
	const overlayOpacity = useSharedValue(0);

	const scrollRef = useRef<ScrollView>(null);

	const handleClosing = useCallback(() => {
		overlayOpacity.value = withTiming(0, { duration: 250 });

		setTimeout(() => {
			setInternalVisible(false);
			setIsVisible(false);
		}, 300);
	}, [setIsVisible, overlayOpacity]);

	useEffect(() => {
		if (isVisible) {
			setInternalVisible(true);
			translateY.value = SCREEN_HEIGHT;
			overlayOpacity.value = 0;
			setIsScrollEnabled(false);

			setTimeout(() => {
				overlayOpacity.value = withTiming(1, { duration: 250 });
				translateY.value = withSpring(SCREEN_HEIGHT - initialSnapPoint, {
					damping: 20,
					stiffness: 200,
				});
				activeSnapPointIndex.value = 0;
			}, 10);
		} else if (internalVisible) {
			translateY.value = withSpring(SCREEN_HEIGHT, {
				damping: 20,
				stiffness: 200,
			});
			overlayOpacity.value = withTiming(0, { duration: 250 });
			setIsScrollEnabled(false);
		}
	}, [
		isVisible,
		initialSnapPoint,
		translateY,
		activeSnapPointIndex,
		internalVisible,
		overlayOpacity,
	]);

	const snapToIndex = useCallback(
		(index: number) => {
			"worklet";
			const snapPoint = snapPointsPixels[index];
			if (snapPoint !== undefined) {
				translateY.value = withSpring(SCREEN_HEIGHT - snapPoint, {
					damping: 40,
					stiffness: 400,
				});
				activeSnapPointIndex.value = index;

				// Enable scrolling if at max snap point
				if (index === maxSnapPointIndex) {
					runOnJS(setIsScrollEnabled)(true);
				} else {
					runOnJS(setIsScrollEnabled)(false);
				}
			}
		},
		[snapPointsPixels, translateY, activeSnapPointIndex, maxSnapPointIndex],
	);

	const close = useCallback(() => {
		"worklet";
		translateY.value = withSpring(SCREEN_HEIGHT, {
			damping: 20,
			stiffness: 200,
		});
		runOnJS(handleClosing)();
	}, [translateY, handleClosing]);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const offsetY = event.nativeEvent.contentOffset.y;
			scrollY.value = offsetY;

			if (offsetY < -20) {
				snapToIndex(maxSnapPointIndex - 1);
			}

			// if (offsetY < 0 && scrollRef.current) {
			// 	scrollRef.current.scrollTo({ y: 0, animated: false });
			// }
		},
		[maxSnapPointIndex, scrollY, snapToIndex],
	);

	const gesture = Gesture.Pan()
		.onStart(() => {
			"worklet";
			context.value = { y: translateY.value, startY: translateY.value };
		})
		.onUpdate((event) => {
			"worklet";
			const atMaxSnap = activeSnapPointIndex.value === maxSnapPointIndex;
			const isPanningDown = event.translationY > 0;

			if (atMaxSnap) {
				if (scrollY.value <= 0 && isPanningDown) {
					// At top of scroll and pulling down - allow sheet to move
					const posY = Math.max(
						context.value.y + event.translationY,
						SCREEN_HEIGHT - maxSnapPoint,
					);
					translateY.value = posY;
					runOnJS(setIsScrollEnabled)(false); // disable scroll temporarily
				}
			} else {
				// Not at max snap - always pan
				const posY = Math.max(
					context.value.y + event.translationY,
					SCREEN_HEIGHT - maxSnapPoint,
				);
				translateY.value = posY;
				runOnJS(setIsScrollEnabled)(false);
			}
		})
		.onEnd((event) => {
			"worklet";

			const isDraggingDown = event.velocityY > 0;

			if (
				event.velocityY < -500 &&
				activeSnapPointIndex.value < maxSnapPointIndex
			) {
				snapToIndex(maxSnapPointIndex);
				return;
			}

			if (event.velocityY > 500) {
				if (activeSnapPointIndex.value === 0) {
					close();
				} else {
					snapToIndex(0);
				}
				return;
			}

			// Decide snap index based on position
			const currentPositionFromBottom = SCREEN_HEIGHT - translateY.value;
			const currentSnapIndex = activeSnapPointIndex.value;

			if (isDraggingDown) {
				if (currentSnapIndex > 0) {
					snapToIndex(currentSnapIndex - 1);
				} else {
					const shouldClose =
						currentPositionFromBottom < initialSnapPoint * 0.5;
					if (shouldClose) {
						close();
					} else {
						snapToIndex(0);
					}
				}
			} else {
				if (currentSnapIndex < maxSnapPointIndex) {
					snapToIndex(currentSnapIndex + 1);
				} else {
					snapToIndex(maxSnapPointIndex);
				}
			}
		});

	const bottomSheetStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
		};
	});

	const overlayAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: overlayOpacity.value,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
		};
	});

	const handleOverlayPress = useCallback(() => {
		translateY.value = withSpring(SCREEN_HEIGHT, {
			damping: 20,
			stiffness: 200,
		});
		handleClosing();
	}, [translateY, handleClosing]);

	if (!internalVisible) return null;

	return (
		<Modal
			transparent={true}
			visible={internalVisible}
			animationType="none"
			onRequestClose={() => handleClosing()}
		>
			<View style={styles.container}>
				<Animated.View
					style={[
						styles.overlay,
						overlayAnimatedStyle,
						overlayStyle,
						customAnimatedOverlayStyle,
					]}
					onTouchEnd={handleOverlayPress}
				/>

				<GestureHandlerRootView style={styles.gestureHandlerContainer}>
					<GestureDetector gesture={gesture}>
						<Animated.View
							style={[styles.bottomSheet, bottomSheetStyle, sheetStyle]}
						>
							<View style={styles.handleContainer}>
								<View style={styles.handle} />
							</View>

							<ScrollView
								style={styles.contentContainer}
								showsVerticalScrollIndicator={false}
								scrollEnabled={isScrollEnabled}
								bounces={true}
								ref={scrollRef}
								onScroll={handleScroll}
								contentContainerStyle={{ paddingBottom: 40 }}
							>
								{children}
							</ScrollView>
						</Animated.View>
					</GestureDetector>
				</GestureHandlerRootView>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
	},
	gestureHandlerContainer: {
		flex: 1,
		height: SCREEN_HEIGHT,
		width: "100%",
	},
	bottomSheet: {
		position: "absolute",
		width: "100%",
		height: SCREEN_HEIGHT,
		backgroundColor: "white",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		elevation: 5,
	},
	handleContainer: {
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	handle: {
		width: 50,
		height: 4,
		backgroundColor: "#BDBDBD",
		borderRadius: 2,
	},
	contentContainer: {
		flex: 1,
		padding: 16,
	},
});

export default BottomSheetComponent;
