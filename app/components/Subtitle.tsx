import { Text } from "react-native";

const Subtitle = ({ children }: { children: React.ReactNode }) => {
	return <Text className="heading-xxsmall">{children}</Text>;
};

export default Subtitle;
