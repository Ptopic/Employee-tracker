import type { ReactNode } from "react";
import { Tabs, type BottomTabBarProps } from "expo-router";
import { ChartNoAxesColumn, House, ScanLine, Settings, Send } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

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
			<Text
				className={focused ? "text-[#111827]" : "text-[#6B7280]"}
				style={{ fontSize: 12, fontWeight: "500", lineHeight: 16, marginTop: 4 }}
			>
				{label}
			</Text>
		</Pressable>
	);
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	return (
		<View className="absolute bottom-0 left-0 right-0">
			<View className="h-[78px] bg-white border-t border-[#E8EBEE] px-5">
				<View className="flex-1 flex-row items-center justify-between">
					{state.routes.map((route, index) => {
						const focused = state.index === index;
						const { options } = descriptors[route.key];
						const onPress = () => {
							if (!focused) navigation.navigate(route.name);
						};

						if (route.name === "employees") {
							return <View key={route.key} className="w-14" />;
						}

						const iconColor = focused ? "#111827" : "#6B7280";
						const label = String(options.title ?? route.name);

						if (route.name === "index") {
							return (
								<TabItem
									key={route.key}
									label={label}
									focused={focused}
									onPress={onPress}
									icon={<House size={20} color={iconColor} strokeWidth={2.2} />}
								/>
							);
						}
						if (route.name === "calendar") {
							return (
								<TabItem
									key={route.key}
									label={label}
									focused={focused}
									onPress={onPress}
									icon={<ChartNoAxesColumn size={20} color={iconColor} strokeWidth={2.2} />}
								/>
							);
						}
						if (route.name === "settings") {
							return (
								<TabItem
									key={route.key}
									label={label}
									focused={focused}
									onPress={onPress}
									icon={<Settings size={20} color={iconColor} strokeWidth={2.2} />}
								/>
							);
						}
						return (
							<TabItem
								key={route.key}
								label={label}
								focused={focused}
								onPress={onPress}
								icon={<Send size={20} color={iconColor} strokeWidth={2.2} />}
							/>
						);
					})}
				</View>
			</View>

			<View className="absolute -top-7 left-1/2 -ml-8 h-16 w-16 items-center justify-center rounded-full border-4 border-[#EEF2F1] bg-[#5F857A]">
				<ScanLine size={24} color="#FFFFFF" strokeWidth={2.2} />
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
			<Tabs.Screen name="calendar" options={{ title: "Analytics" }} />
			<Tabs.Screen name="employees" options={{ title: "Leave" }} />
			<Tabs.Screen name="settings" options={{ title: "Setting" }} />
		</Tabs>
	);
}
