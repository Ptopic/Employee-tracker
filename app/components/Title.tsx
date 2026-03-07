import Text from "@/components/Text";

const Title = ({ children }: { children: React.ReactNode }) => {
	return <Text className="heading-small">{children}</Text>;
};

export default Title;
