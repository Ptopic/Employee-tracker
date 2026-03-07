import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "black",
				headerShown: false,
				tabBarShowLabel: true,
				tabBarStyle: {
					backgroundColor: "white",
					paddingTop: 8,
					height: 64,
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
