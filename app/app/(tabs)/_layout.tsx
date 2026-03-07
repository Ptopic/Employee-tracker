import { useQueryClient } from "@tanstack/react-query";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus, Pressable } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { IMPORTS, LOCATIONS } from "@/api/constants";
import {
	BookmarkIcon,
	MapPinFullIcon,
	MapPinIcon,
	PlusIcon,
	SearchIcon,
	UserIcon,
} from "@/shared/svgs";

export default function TabLayout() {
	const _toast = useToast();
	const _pathname = usePathname();
	const queryClient = useQueryClient();
	const [_sharedUrlData, _setSharedUrlData] = useState<string | null>(null);
	const [isAppRefocused, setIsAppRefocused] = useState(false);

	const appState = useRef(AppState.currentState);

	useEffect(() => {
		const handleAppStateChange = async (nextAppState: AppStateStatus) => {
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === "active"
			) {
				setIsAppRefocused(true);
			}

			appState.current = nextAppState;
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange,
		);

		return () => {
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		if (isAppRefocused) {
			queryClient.invalidateQueries({
				queryKey: [IMPORTS, "6", "", ""],
			});
			queryClient.invalidateQueries({
				queryKey: [LOCATIONS],
			});
			setIsAppRefocused(false); // Reset the flag after handling
		}
	}, [isAppRefocused, queryClient]);

	const [modalVisible, setModalVisible] = useState(false);

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "black",
				// Disable the static render of the header on web
				// to prevent a hydration error in React Navigation v6.
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: "white",
					// borderTopColor: 'white',
					paddingTop: 15,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<BookmarkIcon
							color={color}
							width={26}
							height={26}
							fill={focused ? "black" : "none"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="map"
				options={{
					tabBarIcon: ({ color, focused }) =>
						focused ? (
							<MapPinFullIcon color={color} width={28} height={28} />
						) : (
							<MapPinIcon color={color} width={28} height={28} />
						),
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					tabBarIcon: () => <PlusIcon color="white" width={24} height={24} />,
					tabBarButton: (props) => (
						<Pressable
							{...props}
							onPress={() => {
								setModalVisible(!modalVisible);
							}}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					tabBarIcon: ({ color }) => (
						<SearchIcon color={color} width={26} height={26} />
					),
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<UserIcon
							color={color}
							width={26}
							height={26}
							fill={focused ? "black" : "none"}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
