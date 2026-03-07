import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Linking, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { logger } from "react-native-logs";
import SharedGroupPreferences from "react-native-shared-group-preferences";
import { getQueryClient } from "@/shared/queryClient";
import { CustomToastProvider } from "@/utils/toast";
import "react-native-reanimated";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const appGroupIdentifier = "group.com.ptopic.employeetimetracker.data";

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
	const [accessToken, setAccessToken] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	var log = logger.createLogger();

	useEffect(() => {
		const getToken = async () => {
			const token = await AsyncStorage.getItem("accessToken");

			setIsLoading(false);
			setAccessToken(token);

			log.info("[Main App] Token from AsyncStorage:", token);

			try {
				await SharedGroupPreferences.setItem(
					"accessToken",
					token || "",
					appGroupIdentifier,
				);
				log.info("[Main App] Token saved to App Group:", token);
			} catch (error) {
				log.error("[Main App] Error saving to App Group:", error);
			}
		};

		getToken();
	}, [log.error, log.info]);

	useEffect(() => {
		if (isLoading) return;

		if (!accessToken) {
			router.navigate("/getStarted" as any);
		} else {
			// PROD: router.navigate('/' as any);
			router.navigate("/" as any);
		}
	}, [accessToken, isLoading]);

	useEffect(() => {
		const handleDeepLink = (event: any) => {
			const { url } = event;
			if (url?.startsWith("employee-tracker://")) {
				return;
			}
		};

		const subscription = Linking.addEventListener("url", handleDeepLink);

		return () => {
			subscription.remove();
		};
	}, []);

	return (
		<CustomToastProvider>
			<QueryClientProvider client={queryClient}>
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
			</QueryClientProvider>
		</CustomToastProvider>
	);
}
