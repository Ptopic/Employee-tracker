import type { ReactNode } from "react";
import { Tabs, type BottomTabBarProps } from "expo-router";
import { BriefcaseBusiness, ChartNoAxesColumn, House, ScanLine, Settings } from "lucide-react-native";
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
		<Pressable onPress={onPress} className="items-center justify-center px-1">
			{icon}
			<Text className={`subcaption mt-1 ${focused ? "text-[#5B7B6C]" : "text-[#94A3B8]"}`} style={{ fontWeight: "600" }}>
				{label}
			</Text>
		</Pressable>
	);
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	return (
		<View className="absolute bottom-0 left-0 right-0">
			<View
				className="h-[82px] border-t border-[#EEF2F1] bg-white px-7"
				style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: -4 }, shadowRadius: 10, elevation: 8 }}
			>
				<View className="flex-1 flex-row items-center justify-between">
					{state.routes.map((route, index) => {
						const focused = state.index === index;
						const { options } = descriptors[route.key];
						const onPress = () => {
							if (!focused) navigation.navigate(route.name);
						};

						const iconColor = focused ? "#5B7B6C" : "#94A3B8";
						const label = String(options.title ?? route.name);

						if (route.name === "index") {
							return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<House size={20} color={iconColor} strokeWidth={2.3} />} />;
						}
						if (route.name === "calendar") {
							return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<ChartNoAxesColumn size={20} color={iconColor} strokeWidth={2.3} />} />;
						}
						if (route.name === "employees") {
							return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<BriefcaseBusiness size={20} color={iconColor} strokeWidth={2.3} />} />;
						}
						if (route.name === "settings") {
							return <TabItem key={route.key} label={label} focused={focused} onPress={onPress} icon={<Settings size={20} color={iconColor} strokeWidth={2.3} />} />;
						}
						return null;
					})}
				</View>
			</View>

			<View className="absolute -top-8 left-1/2 -ml-[34px] h-[68px] w-[68px] items-center justify-center rounded-full bg-[#5B7B6C]/20">
				<View className="h-14 w-14 items-center justify-center rounded-full bg-[#5B7B6C]">
					<ScanLine size={24} color="#FFFFFF" strokeWidth={2.2} />
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
