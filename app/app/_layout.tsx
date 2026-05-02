import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	Platform,
	StatusBar,
	View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { logger } from "react-native-logs";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import {
	clearSessionTokens,
	getAccessToken,
	getRefreshToken,
	saveSessionTokens,
} from "@/shared/auth";
import { canUseApiAtStartup, config } from "@/shared/config";
import { getQueryClient } from "@/shared/queryClient";
import { AppStateProvider } from "@/shared/state/app-state";
import { PreferencesBootstrap } from "@/shared/state/PreferencesBootstrap";
import { PreferencesProvider } from "@/shared/state/preferences-state";
import { CustomToastProvider } from "@/utils/toast";
import "react-native-reanimated";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const appGroupIdentifier = "group.com.petartopic.saveit.data";
const log = logger.createLogger();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

const queryClient = getQueryClient();

function RootLayoutNav() {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const restoreSession = useCallback(async () => {
		if (!canUseApiAtStartup) {
			log.warn(
				"[Auth] Skipping session restore because EXPO_PUBLIC_API_URL is missing or invalid for startup.",
			);
			setIsAuthenticated(false);
			setIsLoading(false);
			return;
		}

		try {
			const accessToken = await getAccessToken();
			const refreshToken = await getRefreshToken();

			if (!accessToken && !refreshToken) {
				setIsAuthenticated(false);
				return;
			}

			const validate = async (token: string) => {
				const response = await fetch(`${config.apiUrl}/auth/session`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					return null;
				}

				return response.json();
			};

			if (accessToken) {
				const validSession = await validate(accessToken);
				if (validSession) {
					setIsAuthenticated(true);
					return;
				}
			}

			if (refreshToken) {
				try {
					const refreshResponse = await fetch(`${config.apiUrl}/auth/refresh`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ refreshToken }),
					});

					if (!refreshResponse.ok) {
						throw new Error("refresh failed");
					}

					const refreshData = await refreshResponse.json();
					await saveSessionTokens(
						refreshData.accessToken,
						refreshData.refreshToken,
					);
					setIsAuthenticated(true);
					return;
				} catch (error) {
					log.error("[Auth] Session refresh failed", error);
					await clearSessionTokens();
				}
			}

			setIsAuthenticated(false);
		} catch (error) {
			log.error("[Auth] Session restore failed", error);
			await clearSessionTokens();
			setIsAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	useEffect(() => {
		const syncTokenToAppGroup = async () => {
			if (Platform.OS !== "ios") {
				return;
			}

			try {
				const sharedGroupModule = await import(
					"react-native-shared-group-preferences"
				);
				const sharedGroupPreferences = sharedGroupModule.default;

				if (typeof sharedGroupPreferences?.setItem !== "function") {
					log.warn(
						"[Main App] Shared group preferences module is unavailable; skipping token sync.",
					);
					return;
				}

				const token = isAuthenticated
					? ((await getAccessToken()) ?? "")
					: "";
				await sharedGroupPreferences.setItem(
					"accessToken",
					token,
					appGroupIdentifier,
				);
			} catch (error) {
				log.error("[Main App] Error saving to App Group:", error);
			}
		};

		syncTokenToAppGroup();
	}, [isAuthenticated]);

	useEffect(() => {
		if (isLoading) return;
		router.replace(isAuthenticated ? "/" : "/getStarted");
	}, [isAuthenticated, isLoading]);

	useEffect(() => {
		const handleDeepLink = (event: { url: string }) => {
			const { url } = event;
			if (url?.startsWith("saveit://")) {
				return;
			}
		};

		const subscription = Linking.addEventListener("url", handleDeepLink);
		return () => subscription.remove();
	}, []);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<ActivityIndicator size="large" color="black" />
			</View>
		);
	}

	return (
		<AppErrorBoundary>
			<CustomToastProvider>
				<QueryClientProvider client={queryClient}>
					<AppStateProvider>
						<PreferencesProvider>
							<PreferencesBootstrap />
							<StatusBar barStyle="dark-content" backgroundColor="#F8F9F8" />
							<GestureHandlerRootView className="flex-1">
								<Stack
									screenOptions={{
										headerShown: false,
										contentStyle: { backgroundColor: "white" },
									}}
								>
									<Stack.Screen name="(tabs)" />
									<Stack.Screen name="getStarted/index" />
								</Stack>
							</GestureHandlerRootView>
						</PreferencesProvider>
					</AppStateProvider>
				</QueryClientProvider>
			</CustomToastProvider>
		</AppErrorBoundary>
	);
}
