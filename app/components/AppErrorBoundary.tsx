import React from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

type Props = {
	children: React.ReactNode;
};

type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		console.error("[AppErrorBoundary]", error);
	}

	render() {
		if (this.state.hasError) {
			return (
				<View className="flex-1 items-center justify-center bg-white p-6">
					<Text className="text-lg font-semibold mb-2">Doslo je do pogreske</Text>
					<Text className="text-gray-600 mb-4 text-center">Molimo ponovno pokrenite aplikaciju.</Text>
					<Pressable className="rounded-lg bg-black px-4 py-2" onPress={() => this.setState({ hasError: false })}>
						<Text className="text-white">Pokusaj ponovno</Text>
					</Pressable>
				</View>
			);
		}
		return this.props.children;
	}
}
