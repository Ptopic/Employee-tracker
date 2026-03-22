import type { Dispatch, SetStateAction } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/Text";
import { AlertTriangleIcon } from "@/shared/svgs";

interface IProps {
	setIsModalVisible: Dispatch<SetStateAction<boolean>>;
}

const DeleteModalContent = ({ setIsModalVisible }: IProps) => {
	const handleDeleteAccount = () => {
		// TODO
		console.log("delete account");
		setIsModalVisible(false);
	};
	return (
		<View className="gap-3 flex-col items-center">
			<View className="p-2 bg-red50 rounded-full">
				<AlertTriangleIcon color="#b00000" width={22} height={22} />
			</View>
			<Text className="heading-xxsmall">Jeste li sigurni?</Text>
			<View className="w-full px-6">
				<Text className="text-gray500 text-center">
					Ovu radnju nije moguce ponistiti. Svi podaci ce biti izgubljeni.
				</Text>
			</View>
			<TouchableOpacity
				className="bg-red500 rounded-lg p-2 w-full"
				onPress={handleDeleteAccount}
			>
				<Text className="body-xsmall-regular text-white text-center">
					Obrisi racun
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				className="border border-gray300 rounded-lg p-2 w-full"
				onPress={() => setIsModalVisible(false)}
			>
				<Text className="body-xsmall-regular text-gray800 text-center">
					Odustani
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default DeleteModalContent;
