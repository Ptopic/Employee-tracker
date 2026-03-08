import { useQueryClient } from "@tanstack/react-query";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import Constants from "expo-constants";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
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
import { saveSessionTokens } from "@/shared/auth";
import { GoogleIcon } from "@/shared/svgs";

const googleClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "";

const googleExpoRedirectUri = "https://auth.expo.io/@ghosty09/saveit";
const googleExpoStartUri = "https://auth.expo.io/@ghosty09/saveit/start";

const LoginScreen = () => {
	const queryClient = useQueryClient();
	const [modalVisible, setModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: googleClientId,
		webClientId: googleClientId,
		responseType: "token",
		scopes: ["openid", "profile", "email"],
	});

	const authReady = useMemo(() => Boolean(request?.url && request?.redirectUri), [request]);

	const handleGoogleSignIn = async () => {
		if (!authReady || !request) {
			setErrorMessage("Google sign-in is not ready. Please try again.");
			return;
		}

		setErrorMessage(null);
		setIsLoading(true);

		const authUrl = new URL(request.url);
		authUrl.searchParams.set("redirect_uri", googleExpoRedirectUri);

		const startUrl = `${googleExpoStartUri}?${new URLSearchParams({
			authUrl: authUrl.toString(),
			returnUrl: request.redirectUri,
		}).toString()}`;

		try {
			await promptAsync({ url: startUrl });
		} catch (_error) {
			setIsLoading(false);
			setErrorMessage("Could not open Google sign-in. Please retry.");
		}
	};

	useEffect(() => {
		const handleAuthResponse = async () => {
			if (response?.type === "success") {
				const accessToken =
					response.authentication?.accessToken ?? response.params?.access_token;

				if (!accessToken) {
					setIsLoading(false);
					setErrorMessage("Google authentication did not return an access token.");
					return;
				}

				try {
					const apiResponse = await fetch(`${apiUrl}/auth/google`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token: accessToken }),
					});

					const data = await apiResponse.json();

					if (!apiResponse.ok) {
						setErrorMessage(data?.message || "Authentication failed. Please retry.");
						return;
					}

					if (!data?.accessToken || !data?.refreshToken) {
						setErrorMessage("Authentication succeeded but session tokens were missing.");
						return;
					}

					await queryClient.clear();
					await saveSessionTokens(data.accessToken, data.refreshToken);
					setModalVisible(false);
					router.replace("/");
				} catch (_error) {
					setErrorMessage("Network error while completing login. Please retry.");
				} finally {
					setIsLoading(false);
				}
			}

			if (response?.type === "error") {
				setIsLoading(false);
				setErrorMessage(response.error?.message ?? "Google sign-in failed. Please retry.");
			}

			if (response?.type === "dismiss" || response?.type === "cancel") {
				setIsLoading(false);
			}
		};

		handleAuthResponse();
	}, [response, queryClient]);

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

					{Platform.OS === "ios" && <View className="h-[1] bg-gray200" />}

					<TouchableOpacity
						className="w-full h-[50] bg-gray200 rounded-lg items-center justify-center"
						onPress={handleGoogleSignIn}
						disabled={!authReady || isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="white" />
						) : (
							<View className="flex-row gap-2 items-center">
								<GoogleIcon width={20} height={20} />
								<Text className="text-black text-lg font-bold">
									Continue with Google
								</Text>
							</View>
						)}
					</TouchableOpacity>

					{errorMessage && (
						<View className="bg-red-100 border border-red-300 rounded-lg p-3">
							<Text className="text-red-700 text-sm">{errorMessage}</Text>
							<TouchableOpacity className="mt-2" onPress={handleGoogleSignIn}>
								<Text className="text-red-700 font-bold">Retry</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</ModalComponent>
		</SafeAreaView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
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
});
