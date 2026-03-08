import { useQueryClient } from "@tanstack/react-query";
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
import { config } from "@/shared/config";
import { secureStorage } from "@/shared/secureStorage";
import { AppleIcon, GoogleIcon } from "@/shared/svgs";

const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const apiUrl = config.apiUrl;
const googleExpoRedirectUri = "https://auth.expo.io/@ghosty09/saveit";
const googleExpoStartUri = "https://auth.expo.io/@ghosty09/saveit/start";

const index = () => {
	const queryClient = useQueryClient();
	const [modalVisible, setModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: googleClientId,
		webClientId: googleClientId,
		responseType: "token",
		scopes: ["openid", "profile", "email"],
	});

	const handleGoogleSignIn = async () => {
		if (!request?.url || !request.redirectUri) {
			Alert.alert("Error", "Google sign-in is not ready yet. Please try again.");
			return;
		}

		setIsLoading(true);

		const authUrl = new URL(request.url);
		authUrl.searchParams.set("redirect_uri", googleExpoRedirectUri);

		const startUrl = `${googleExpoStartUri}?${new URLSearchParams({
			authUrl: authUrl.toString(),
			returnUrl: request.redirectUri,
		}).toString()}`;

		try {
			await promptAsync({ url: startUrl });
		} catch (error) {
			console.error("Failed to open Google auth prompt:", error);
			setIsLoading(false);
			Alert.alert("Error", "Could not open Google sign in.");
		}
	};

	useEffect(() => {
		const handleAuthResponse = async () => {
			if (response?.type === "success") {
				const accessToken =
					response.authentication?.accessToken ?? response.params?.access_token;

				if (!accessToken) {
					Alert.alert(
						"Error",
						"Google authentication did not return an access token.",
					);
					return;
				}

				try {
					const apiResponse = await fetch(`${apiUrl}/auth/google`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							token: accessToken,
						}),
					});

					const responseText = await apiResponse.text();
					let data: { token?: string; message?: string } | null = null;

					try {
						data = responseText ? JSON.parse(responseText) : null;
					} catch {
						data = null;
					}

					if (!apiResponse.ok) {
						console.error("Google auth API error", {
							status: apiResponse.status,
							body: responseText,
						});
						Alert.alert(
							"Authentication failed",
							data?.message ||
								`Backend returned ${apiResponse.status}. Check console logs for details.`,
						);
						return;
					}

					const appToken = data?.token;

					if (appToken) {
						await queryClient.clear();
						await secureStorage.setAccessToken(appToken);
						setModalVisible(false);
						router.push("/");
					} else {
						console.error("Google auth succeeded without app token", {
							body: responseText,
						});
						Alert.alert(
							"Authentication failed",
							data?.message || "No token returned by backend.",
						);
					}
				} catch (error) {
					console.error("Google auth exchange failed:", error);
					Alert.alert(
						"Error",
						"An error occurred while exchanging the code. Check console logs for details.",
					);
				} finally {
					setIsLoading(false);
				}
			}

			if (response?.type === "error") {
				console.error("Google OAuth response error:", response.error);
				setIsLoading(false);
				Alert.alert(
					"Google Login Failed",
					response.error?.message ?? "Invalid OAuth request.",
				);
			}

			if (response?.type === "dismiss" || response?.type === "cancel") {
				setIsLoading(false);
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
								onPress={handleGoogleSignIn}
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
						onPress={handleGoogleSignIn}
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
