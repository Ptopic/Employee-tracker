import { Dimensions } from "react-native";

export const getDeviceWidth = () => {
	const { width } = Dimensions.get("window");
	return width;
};

export const getDeviceHeight = () => {
	const { height } = Dimensions.get("window");
	return height;
};
