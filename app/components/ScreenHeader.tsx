import type React from "react";
import { TouchableOpacity, View } from "react-native";
import { ArrowLeftIcon } from "@/shared/svgs";
import { goBack } from "@/utils/navigation";
import Title from "./Title";

interface IProps {
	allowBack?: boolean;
	title: string;
	rightElement?: React.ReactNode;
}

const ScreenHeader = ({ allowBack = true, title, rightElement }: IProps) => {
	return (
		<View className="flex-row gap-[10] items-center">
			{allowBack && (
				<View className="bg-white p-2 rounded-md border-gray300 border-[1px]">
					<TouchableOpacity onPress={() => goBack()}>
						<ArrowLeftIcon width={22} height={22} color="black" />
					</TouchableOpacity>
				</View>
			)}
			<View className="flex-1 flex-row justify-between">
				<Title>{title}</Title>

				{rightElement}
			</View>
		</View>
	);
};

export default ScreenHeader;
