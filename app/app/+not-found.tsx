import { Link, Stack } from "expo-router";
import { View } from "react-native";
import Text from "@/components/Text";
import Title from "@/components/Title";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View className="flex-1 items-center justify-center p-[20]">
				<Title>Page not found</Title>

				<Link href="/" className="mt-[15] p-[15]">
					<Text className="text-black text-lg">Go to home screen!</Text>
				</Link>
			</View>
		</>
	);
}
