import { View } from "react-native";
import type { CalendarDaySummary } from "@/api/shifts/types";
import Text from "@/components/Text";
import { CalendarDayCell } from "./CalendarDayCell";

type Props = {
	monthDate: Date;
	summary: CalendarDaySummary[];
	onPressDay: (dayIso: string) => void;
	onLongPressDay: (dayIso: string) => void;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function CalendarGrid({ monthDate, summary, onPressDay, onLongPressDay }: Props) {
	const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
	const startOffset = firstDay.getDay();
	const gridStart = new Date(firstDay);
	gridStart.setDate(firstDay.getDate() - startOffset);

	const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
	const daysInMonth = lastDay.getDate();
	const totalCells = startOffset + daysInMonth <= 35 ? 35 : 42;

	const summaryMap = new Map(summary.map((d) => [d.date, d]));
	const cells = Array.from({ length: totalCells }).map((_, idx) => {
		const date = new Date(gridStart);
		date.setDate(gridStart.getDate() + idx);
		return date;
	});

	return (
		<View>
			<View className="flex-row mb-1">
				{weekDays.map((day) => (
					<View key={day} className="flex-1 items-center">
						<Text className="text-xs text-gray-500">{day}</Text>
					</View>
				))}
			</View>
			<View className="flex-row flex-wrap">
				{cells.map((date) => {
					const dayIso = iso(date);
					const isCurrentMonth = date.getMonth() === monthDate.getMonth();

					return (
						<View key={dayIso} className="w-[14.285%]">
							<CalendarDayCell
								date={date}
								isCurrentMonth={isCurrentMonth}
								summary={summaryMap.get(dayIso)}
								onPress={() => onPressDay(dayIso)}
								onLongPress={() => onLongPressDay(dayIso)}
							/>
						</View>
					);
				})}
			</View>
		</View>
	);
}
