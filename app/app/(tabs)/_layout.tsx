import type { ReactNode } from "react";
import { Tabs, type BottomTabBarProps } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";
import { ScannerIcon } from "@/modules/home/screens/HomeScreen";

function Icon({ path, focused }: { path: string; focused: boolean }) {
	return (
		<Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
			<Path d={path} stroke={focused ? "#0F172A" : "#94A3B8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	);
}

const paths = {
	home: "M3 10.182V19a2 2 0 0 0 2 2h3m10-10.818V19a2 2 0 0 1-2 2h-3m0 0a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4m-6 0h6",
	calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
	employees: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m22 0v-2a4 4 0 0 0-3-3.87m-4-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm6 2a4 4 0 0 1-3 3.87",
	settings: "M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.94-2.18a1 1 0 0 0 .2 1.1l.03.03a1 1 0 1 1-1.42 1.42l-.03-.03a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V17a1 1 0 1 1-2 0v-.04a1 1 0 0 0-.6-.92 1 1 0 0 0-1.1.2l-.03.03a1 1 0 1 1-1.42-1.42l.03-.03a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H7a1 1 0 1 1 0-2h.04a1 1 0 0 0 .92-.6 1 1 0 0 0-.2-1.1l-.03-.03a1 1 0 1 1 1.42-1.42l.03.03a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.92V7a1 1 0 1 1 2 0v.04a1 1 0 0 0 .6.92 1 1 0 0 0 1.1-.2l.03-.03a1 1 0 1 1 1.42 1.42l-.03.03a1 1 0 0 0-.2 1.1 1 1 0 0 0 .92.6H17a1 1 0 1 1 0 2h-.04a1 1 0 0 0-.92.6z",
};

function TabItem({ label, focused, icon, onPress }: { label: string; focused: boolean; icon: ReactNode; onPress: () => void }) {
	return (
		<Pressable onPress={onPress} className="flex-1 items-center justify-center">
			{icon}
			<Text className={focused ? "text-slate-900" : "text-slate-400"} style={{ fontSize: 11, fontWeight: focused ? "700" : "500", marginTop: 2 }}>{label}</Text>
		</Pressable>
	);
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	return (
		<View className="absolute bottom-0 left-0 right-0">
			<View className="h-20 flex-row items-center justify-around bg-white px-4" style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: -4 }, shadowRadius: 10, elevation: 10 }}>
				{state.routes.map((route, index) => {
					const focused = state.index === index;
					const label = String(descriptors[route.key].options.title ?? route.name);
					const onPress = () => !focused && navigation.navigate(route.name);
					if (route.name === "index") return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Icon path={paths.home} focused={focused} />} />;
					if (route.name === "calendar") return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Icon path={paths.calendar} focused={focused} />} />;
					if (route.name === "employees") return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Icon path={paths.employees} focused={focused} />} />;
					if (route.name === "settings") return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Icon path={paths.settings} focused={focused} />} />;
					return null;
				})}
			</View>
			<View className="absolute left-1/2 top-0 -ml-[34px] -mt-[30px] rounded-full bg-[#5B7B6C]/20 p-[6px]"><View className="h-14 w-14 items-center justify-center rounded-full bg-[#5B7B6C]"><ScannerIcon /></View></View>
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
