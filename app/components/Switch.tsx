import type { Dispatch, SetStateAction } from "react";
import { Switch as SwitchComponent } from "react-native";
import { getTailwindHexColor } from "@/utils/getTailwindColor";

interface IProps {
	isPublic: boolean;
	setIsPublic: Dispatch<SetStateAction<boolean>>;
}

const Switch = ({ isPublic, setIsPublic }: IProps) => {
	return (
		<SwitchComponent
			trackColor={{
				false: getTailwindHexColor("gray200"),
				true: getTailwindHexColor("black"),
			}}
			thumbColor={isPublic ? "#f4f3f4" : "#f4f3f4"}
			ios_backgroundColor={getTailwindHexColor("gray200")}
			onValueChange={setIsPublic}
			value={isPublic}
			style={{
				transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
			}}
		/>
	);
};

export default Switch;
