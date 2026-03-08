import { router } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "@/components/Text";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIsoDate(date: Date) {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export default function CalendarScreen() {
	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
	const startWeekday = firstDayOfMonth.getDay();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

	const monthLabel = firstDayOfMonth.toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	});

	const dayCells: Array<number | null> = [];
	for (let i = 0; i < startWeekday; i++) dayCells.push(null);
	for (let day = 1; day <= daysInMonth; day++) dayCells.push(day);
	while (dayCells.length % 7 !== 0) dayCells.push(null);

	return (
		<View className="flex-1 bg-white px-4 pt-6">
			<Text className="heading-xxsmall mb-4 text-black">{monthLabel}</Text>

			<View className="mb-2 flex-row">
				{WEEKDAY_LABELS.map((label) => (
					<View key={label} className="items-center" style={{ width: "14.2857%" }}>
						<Text className="body-xxsmall-regular text-gray500">{label}</Text>
					</View>
				))}
			</View>

			<View className="flex-row flex-wrap">
				{dayCells.map((day, index) => {
					if (!day) {
						return (
							<View
								key={`empty-${index}`}
								className="h-14"
								style={{ width: "14.2857%" }}
							/>
						);
					}

					const isToday = day === today.getDate();
					const selectedDate = new Date(currentYear, currentMonth, day);

					return (
						<Pressable
							key={`day-${day}`}
							className="h-14 items-center justify-center"
							style={{ width: "14.2857%" }}
							onPress={() =>
								router.push({
									pathname: "/day-schedule",
									params: { date: toIsoDate(selectedDate) },
								})
							}
						>
							<View
								className={`h-9 w-9 items-center justify-center rounded-full ${
									isToday ? "bg-black" : "bg-transparent"
								}`}
							>
								<Text className={isToday ? "text-white" : "text-black"}>{day}</Text>
							</View>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
