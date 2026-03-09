import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#111827",
				tabBarInactiveTintColor: "#8C9197",
				headerShown: false,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "500",
					marginBottom: 4,
				},
				tabBarStyle: {
					backgroundColor: "white",
					paddingTop: 6,
					height: 68,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="home" size={20} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Calendar",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="calendar" size={20} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="employees"
				options={{
					title: "Employees",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="users" size={20} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="cog" size={20} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
