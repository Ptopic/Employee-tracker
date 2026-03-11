import type { ReactNode } from "react";
import { Tabs, type BottomTabBarProps } from "expo-router";
import { CalendarDays, Home, Settings, Users } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";
import { ScannerIcon } from "@/modules/home/screens/HomeScreen";

const BRAND = "#5B7B6C";

function TabIcon({ name, focused }: { name: "index" | "calendar" | "employees" | "settings"; focused: boolean }) {
	const color = focused ? "#0F172A" : "#94A3B8";

	if (name === "index") return <Home size={26} color={color} strokeWidth={2} />;
	if (name === "calendar") return <CalendarDays size={26} color={color} strokeWidth={2} />;
	if (name === "employees") return <Users size={26} color={color} strokeWidth={2} />;
	return <Settings size={26} color={color} strokeWidth={2} />;
}

function TabItem({ label, focused, icon, onPress }: { label: string; focused: boolean; icon: ReactNode; onPress: () => void }) {
	return (
		<Pressable onPress={onPress} className="flex-1 items-center justify-center">
			{icon}
			<Text
				className={focused ? "text-slate-900" : "text-slate-400"}
				style={{ fontSize: 10, lineHeight: 12, fontWeight: focused ? "700" : "500", marginTop: 3 }}
			>
				{label}
			</Text>
		</Pressable>
	);
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const routeMap = new Map(state.routes.map((r) => [r.name, r]));
	const orderedNames: Array<"index" | "calendar" | "employees" | "settings"> = ["index", "calendar", "employees", "settings"];

	return (
		<View className="absolute bottom-0 left-0 right-0 items-center">
			<View className="h-[72px] w-full max-w-[960px] flex-row items-center bg-white px-4" style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: -4 }, shadowRadius: 10, elevation: 4 }}>
				<View className="flex-1 flex-row">
					{orderedNames.slice(0, 2).map((name) => {
						const route = routeMap.get(name);
						if (!route) return null;
						const index = state.routes.findIndex((r) => r.key === route.key);
						const focused = state.index === index;
						const label = String(descriptors[route.key].options.title ?? route.name);
						const onPress = () => !focused && navigation.navigate(route.name);
						return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<TabIcon name={name} focused={focused} />} />;
					})}
				</View>

				<View style={{ width: 76 }} />

				<View className="flex-1 flex-row">
					{orderedNames.slice(2).map((name) => {
						const route = routeMap.get(name);
						if (!route) return null;
						const index = state.routes.findIndex((r) => r.key === route.key);
						const focused = state.index === index;
						const label = String(descriptors[route.key].options.title ?? route.name);
						const onPress = () => !focused && navigation.navigate(route.name);
						return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<TabIcon name={name} focused={focused} />} />;
					})}
				</View>
			</View>
			<View className="absolute top-0 -mt-[27px] rounded-full p-[6px]" style={{ backgroundColor: "rgba(91, 123, 108, 0.2)" }}>
				<View className="h-[54px] w-[54px] items-center justify-center rounded-full" style={{ backgroundColor: BRAND }}>
					<ScannerIcon size={25} />
				</View>
			</View>
		</View>
	);
}

export default function TabLayout() {
	return (
		<Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
			<Tabs.Screen name="employees" options={{ title: "Employees" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
		</Tabs>
	);
}
