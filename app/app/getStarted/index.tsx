import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import authRequests from "@/api/auth/requests";
import Text from "@/components/Text";
import Title from "@/components/Title";
import { GoogleIcon } from "@/shared/svgs";

WebBrowser.maybeCompleteAuthSession();

const index = () => {
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);

	const googleClientConfig = useMemo(
		() => ({
			expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
			iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
			androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
			webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
		}),
		[],
	);

	const [request, response, promptAsync] = Google.useAuthRequest({
		...googleClientConfig,
		scopes: ["openid", "profile", "email"],
	});

	const handleGoogleSignIn = async () => {
		if (
			!googleClientConfig.expoClientId &&
			!googleClientConfig.iosClientId &&
			!googleClientConfig.androidClientId &&
			!googleClientConfig.webClientId
		) {
			Alert.alert(
				"Google sign-in not configured",
				"Missing Google OAuth client IDs. Please set EXPO_PUBLIC_GOOGLE_*_CLIENT_ID variables.",
			);
			return;
		}

		setIsLoading(true);

		try {
			await promptAsync();
		} catch (error) {
			console.error("Failed to open Google sign-in:", error);
			setIsLoading(false);
			Alert.alert("Error", "Could not open Google sign-in.");
		}
	};

	useEffect(() => {
		const handleAuthResponse = async () => {
			if (response?.type === "success") {
				const accessToken =
					response.authentication?.accessToken ?? response.params?.access_token;

				if (!accessToken) {
					setIsLoading(false);
					Alert.alert(
						"Authentication failed",
						"Google authentication did not return an access token.",
					);
					return;
				}

				try {
					const data = await authRequests.googleLogin(accessToken);
					const appToken = data?.token;

					if (!appToken) {
						Alert.alert(
							"Authentication failed",
							"Backend did not return an application token.",
						);
						return;
					}

					await queryClient.clear();
					await AsyncStorage.setItem("accessToken", appToken);
					router.replace("/" as any);
				} catch (error) {
					console.error("Google auth exchange failed:", error);
					Alert.alert(
						"Authentication failed",
						"Could not sign in with Google. Please try again.",
					);
				} finally {
					setIsLoading(false);
				}
			}

			if (response?.type === "error") {
				console.error("Google OAuth response error:", response.error);
				setIsLoading(false);
				Alert.alert(
					"Google sign-in failed",
					response.error?.message ?? "Invalid OAuth request.",
				);
			}

			if (response?.type === "dismiss" || response?.type === "cancel") {
				setIsLoading(false);
			}
		};

		handleAuthResponse();
	}, [response, queryClient]);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.hero}>
				<Title className="text-3xl">saveit</Title>
				<Text className="text-gray300 mt-2 text-center">
					Employee scheduling and time tracking for managers.
				</Text>
			</View>

			<View style={styles.footer}>
				<TouchableOpacity
					style={styles.googleButton}
					onPress={handleGoogleSignIn}
					disabled={!request || isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color="black" />
					) : (
						<View className="flex-row gap-2 items-center">
							<GoogleIcon width={20} height={20} />
							<Text className="text-black text-lg font-bold">
								Continue with Google
							</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default index;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 32,
	},
	hero: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	footer: {
		paddingBottom: 12,
	},
	googleButton: {
		width: "100%",
		height: 52,
		backgroundColor: "#F3F4F6",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});
