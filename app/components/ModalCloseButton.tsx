import { TouchableOpacity } from "react-native";
import { CloseIcon } from "@/shared/svgs";
import { getTailwindHexColor } from "@/utils/getTailwindColor";

interface IProps {
	closeModal: () => void;
}

const ModalCloseButton = ({ closeModal }: IProps) => {
	return (
		<TouchableOpacity
			className="bg-red100 rounded-full w-[30] h-[30] justify-center items-center"
			onPress={() => {
				closeModal();
			}}
		>
			<CloseIcon width={20} height={20} color={getTailwindHexColor("red400")} />
		</TouchableOpacity>
	);
};

export default ModalCloseButton;
