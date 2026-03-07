import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	SafeAreaView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import Button from "@/components/Button";
import ModalComponent from "@/components/ModalComponent";
import Text from "@/components/Text";
import Title from "@/components/Title";
import { AppleIcon, GoogleIcon } from "@/shared/svgs";

const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.16:3002";

const index = () => {
	const queryClient = useQueryClient();
	const [modalVisible, setModalVisible] = useState(false);
	const [isLoading, _setIsLoading] = useState(false);
	const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
		clientId: googleClientId,
		iosClientId: iosClientId,
		androidClientId: androidClientId,
		redirectUri: makeRedirectUri({
			native: "com.petartopic.etracker:/oauth2redirect/google",
			scheme: "etracker",
		}),
	});

	useEffect(() => {
		const handleAuthResponse = async () => {
			if (response?.type === "success") {
				const { access_token } = response.params;

				try {
					const apiResponse = await fetch(`${apiUrl}/auth/google`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							token: access_token,
						}),
					});

					const data = await apiResponse.json();
					if (data.token) {
						await queryClient.clear();
						await AsyncStorage.setItem("accessToken", data.token);
						setModalVisible(false);
						router.push("/");
					} else {
						Alert.alert("Error", "Authentication failed.");
					}
				} catch (_error) {
					Alert.alert("Error", "An error occurred while exchanging the code.");
				}
			}
		};
		handleAuthResponse();
	}, [response, queryClient.clear]);

	return (
		<SafeAreaView className="flex-1 gap-[20]">
			<View className="flex-1 bg-gray400 items-center justify-center">
				<Text className="text-2xl font-bold">Video</Text>
			</View>

			<View className="items-center justify-center px-[15]">
				<Button onPress={() => setModalVisible(true)} text="Get Started" />
			</View>

			<ModalComponent
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				overlayStyle={styles.modalOverlay}
				modalStyle={styles.modalContainer}
			>
				<View className="gap-[10]">
					<Title>Sign in to continue</Title>

					{Platform.OS === "ios" && (
						<>
							<TouchableOpacity
								className="w-full h-[50] bg-gray200 rounded-lg items-center justify-center"
								onPress={() => promptAsync()}
								disabled={!request || isLoading}
							>
								{isLoading ? (
									<ActivityIndicator color="white" />
								) : (
									<View className="flex-row gap-2 items-center">
										<AppleIcon width={20} height={20} />
										<Text className="text-black text-lg font-bold">
											Sign in with Apple
										</Text>
									</View>
								)}
							</TouchableOpacity>
							<View className="h-[1] bg-gray200" />
						</>
					)}

					<TouchableOpacity
						className="w-full h-[50] bg-gray200 rounded-lg items-center justify-center"
						onPress={() => promptAsync()}
						disabled={!request || isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="white" />
						) : (
							<View className="flex-row gap-2 items-center">
								<GoogleIcon width={20} height={20} />
								<Text className="text-black text-lg font-bold">
									Sign in with Google
								</Text>
							</View>
						)}
					</TouchableOpacity>
				</View>
			</ModalComponent>
		</SafeAreaView>
	);
};

export default index;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 20,
	},
	content: {
		flex: 1,
		backgroundColor: "gray400",
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	button: {
		width: "80%",
		height: 50,
		backgroundColor: "black",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	modalOverlay: {
		justifyContent: "flex-end",
	},
	modalContainer: {
		width: "100%",
		borderRadius: 10,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
	modalContent: {
		gap: 20,
	},
});
