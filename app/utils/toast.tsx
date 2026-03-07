import type React from "react";
import { StyleSheet, View } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import Text from "@/components/Text";
import { AlertTriangleIconFull, CheckCircledIconFull } from "@/shared/svgs";
import { getTailwindHexColor } from "./getTailwindColor";

export const CustomToastProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<ToastProvider
			duration={2000}
			animationType="slide-in"
			swipeEnabled={false}
			offsetBottom={90}
			renderType={{
				regular: (toast) => (
					<View style={styles.regular}>
						<CheckCircledIconFull
							width={24}
							height={24}
							color={getTailwindHexColor("red400")}
						/>
						<Text className="body-small-regular">{toast.message}</Text>
					</View>
				),
				success: (toast) => (
					<View style={styles.success}>
						<CheckCircledIconFull
							width={24}
							height={24}
							color={getTailwindHexColor("green400")}
						/>
						<Text className="body-small-regular">{toast.message}</Text>
					</View>
				),
				error: (toast) => (
					<View style={styles.error}>
						<AlertTriangleIconFull
							width={22}
							height={22}
							color={getTailwindHexColor("red400")}
						/>
						<Text className="body-small-regular">{toast.message}</Text>
					</View>
				),
			}}
		>
			{children}
		</ToastProvider>
	);
};

const styles = StyleSheet.create({
	regular: {
		backgroundColor: "white",
		borderRadius: 10,
		padding: 10,
		margin: 5,
		shadowColor: getTailwindHexColor("gray800"),
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
	},
	success: {
		backgroundColor: "white",
		borderRadius: 10,
		padding: 10,
		margin: 5,
		borderWidth: 1,
		borderColor: getTailwindHexColor("green400"),
		shadowColor: getTailwindHexColor("green400"),
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
	},
	error: {
		backgroundColor: "white",
		borderRadius: 10,
		padding: 10,
		margin: 5,
		borderWidth: 1,
		borderColor: getTailwindHexColor("red400"),
		shadowColor: getTailwindHexColor("red400"),
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
	},
});
