import type { ReactNode } from "react";
import { Tabs, type BottomTabBarProps } from "expo-router";
import { CalendarDays, Home, ScanLine, Settings, Users } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

function TabItem({
	label,
	focused,
	icon,
	onPress,
}: {
	label: string;
	focused: boolean;
	icon: ReactNode;
	onPress: () => void;
}) {
	return (
		<Pressable onPress={onPress} className="flex-1 items-center justify-center">
			{icon}
			<Text
				className={focused ? "text-[#0F172A]" : "text-[#94A3B8]"}
				style={{ fontSize: 11, fontWeight: focused ? "700" : "500", lineHeight: 14, marginTop: 2 }}
			>
				{label}
			</Text>
		</Pressable>
	);
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	return (
		<View className="absolute bottom-0 left-0 right-0">
			<View
				className="h-20 flex-row items-center justify-around bg-white px-4"
				style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: -4 }, shadowRadius: 10, elevation: 10 }}
			>
				{state.routes.map((route, index) => {
					const focused = state.index === index;
					const { options } = descriptors[route.key];
					const onPress = () => {
						if (!focused) navigation.navigate(route.name);
					};
					const iconColor = focused ? "#0F172A" : "#94A3B8";
					const label = String(options.title ?? route.name);

					if (route.name === "index") {
						return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Home size={28} color={iconColor} strokeWidth={2.1} />} />;
					}
					if (route.name === "calendar") {
						return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<CalendarDays size={28} color={iconColor} strokeWidth={2.1} />} />;
					}
					if (route.name === "employees") {
						return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Users size={28} color={iconColor} strokeWidth={2.1} />} />;
					}
					if (route.name === "settings") {
						return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Settings size={28} color={iconColor} strokeWidth={2.1} />} />;
					}
					return null;
				})}
			</View>

			<View className="absolute left-1/2 top-0 -ml-[34px] -mt-[30px] rounded-full bg-[#5B7B6C]/20 p-[6px]">
				<View className="h-14 w-14 items-center justify-center rounded-full bg-[#5B7B6C]">
					<ScanLine size={28} color="#FFFFFF" strokeWidth={1.8} />
				</View>
			</View>
		</View>
	);
}

export default function TabLayout() {
	return (
		<Tabs
			tabBar={(props) => <CustomTabBar {...props} />}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
			<Tabs.Screen name="employees" options={{ title: "Employees" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
		</Tabs>
	);
}
