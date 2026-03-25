import { useEffect, useState } from "react";
import { Modal, Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Text from "@/components/Text";

type PickerMode = "date" | "time";

export function AppDateTimeModal({
	visible,
	mode,
	date,
	locale = "hr-HR",
	onConfirm,
	onCancel,
}: {
	visible: boolean;
	mode: PickerMode;
	date: Date;
	locale?: string;
	onConfirm: (date: Date) => void;
	onCancel: () => void;
}) {
	const [tempDate, setTempDate] = useState(date);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		if (visible) setTempDate(date);
	}, [visible, date]);

	if (!visible) return null;

	if (Platform.OS === "android") {
		return (
			<DateTimePicker
				value={date}
				mode={mode}
				display="default"
				locale={locale}
				onChange={(event: DateTimePickerEvent, selected?: Date) => {
					if (event.type === "dismissed") {
						onCancel();
						return;
					}
					onCancel();
					if (selected) onConfirm(selected);
				}}
			/>
		);
	}

	return (
		<Modal visible transparent animationType="fade" onRequestClose={onCancel}>
			<View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.35)" }}>
				<View style={{ backgroundColor: "#F8F9F8", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingHorizontal: 12, paddingBottom: Math.max(insets.bottom, 12) + 10 }}>
					<DateTimePicker
						value={tempDate}
						mode={mode}
						display="spinner"
						locale={locale}
						themeVariant="light"
						textColor="#0F172A"
						style={{ width: "100%" }}
						onChange={(_, selected) => {
							if (selected) setTempDate(selected);
						}}
					/>
					<View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
						<TouchableOpacity
							onPress={onCancel}
							style={{ flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}
						>
							<Text style={{ fontSize: 13, fontWeight: "700", color: "#475569" }}>Odustani</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								onConfirm(tempDate);
								onCancel();
							}}
							style={{ flex: 1, height: 42, borderRadius: 10, backgroundColor: "#5B7B6C", alignItems: "center", justifyContent: "center" }}
						>
							<Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Primijeni</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}
