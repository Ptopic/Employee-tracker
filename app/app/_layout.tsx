import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	SafeAreaView,
	StatusBar,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { logger } from "react-native-logs";
import SharedGroupPreferences from "react-native-shared-group-preferences";
import {
	clearSessionTokens,
	getAccessToken,
	getRefreshToken,
	saveSessionTokens,
} from "@/shared/auth";
import { config } from "@/shared/config";
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

	const log = logger.createLogger();

	const restoreSession = async () => {
		const accessToken = await getAccessToken();
		const refreshToken = await getRefreshToken();

		if (!accessToken && !refreshToken) {
			setIsAuthenticated(false);
			setIsLoading(false);
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
				setIsLoading(false);
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
			} catch (error) {
				log.error("[Auth] Session refresh failed", error);
				await clearSessionTokens();
				setIsAuthenticated(false);
			}
		}

		setIsLoading(false);
	};

	useEffect(() => {
		restoreSession();
	}, []);

	useEffect(() => {
		const syncTokenToAppGroup = async () => {
			const token = (await getAccessToken()) || "";
			try {
				await SharedGroupPreferences.setItem(
					"accessToken",
					token,
					appGroupIdentifier,
				);
			} catch (error) {
				log.error("[Main App] Error saving to App Group:", error);
			}
		};

		syncTokenToAppGroup();
	}, [isAuthenticated, log]);

	useEffect(() => {
		if (isLoading) return;
		router.replace(isAuthenticated ? "/" : "/getStarted");
	}, [isAuthenticated, isLoading]);

	useEffect(() => {
		const handleDeepLink = (event: any) => {
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
			<SafeAreaView className="flex-1 items-center justify-center bg-white">
				<ActivityIndicator size="large" color="black" />
			</SafeAreaView>
		);
	}

	return (
		<CustomToastProvider>
			<QueryClientProvider client={queryClient}>
				<AppStateProvider>
					<PreferencesProvider>
						<SafeAreaView className="flex-1 bg-white">
							<PreferencesBootstrap />
							<StatusBar barStyle="dark-content" backgroundColor="white" />
							<GestureHandlerRootView>
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
						</SafeAreaView>
					</PreferencesProvider>
				</AppStateProvider>
			</QueryClientProvider>
		</CustomToastProvider>
	);
}
