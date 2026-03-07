import { TextInput, TouchableOpacity, View } from "react-native";
import { CloseIcon, SearchIcon } from "@/shared/svgs";

interface IProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
	onClear?: () => void;
	clearAlwaysVisible?: boolean;
}

const Search = ({
	value,
	onChangeText,
	placeholder,
	onClear,
	clearAlwaysVisible = false,
}: IProps) => {
	const handleClearSearch = () => {
		onChangeText("");
		onClear?.();
	};

	return (
		<View className="flex-row gap-2 bg-gray200 rounded-lg p-4">
			<SearchIcon color="black" width={20} height={20} />
			<TextInput
				autoComplete="off"
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor="gray"
				className="flex-1"
			/>
			{(value || clearAlwaysVisible) && (
				<TouchableOpacity onPress={handleClearSearch}>
					<CloseIcon color="black" width={20} height={20} />
				</TouchableOpacity>
			)}
		</View>
	);
};

export default Search;
