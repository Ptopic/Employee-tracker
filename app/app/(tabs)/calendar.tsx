import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/Text";

type StaffingStatus = "healthy" | "warning" | "critical";

type CalendarDay = {
	date: Date;
	inCurrentMonth: boolean;
};

type StaffingSnapshot = {
	available: number;
	total: number;
	status: StaffingStatus;
	offCount: number;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthLabel = (date: Date) =>
	date.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

const getMonthGrid = (monthDate: Date): CalendarDay[] => {
	const year = monthDate.getFullYear();
	const month = monthDate.getMonth();
	const firstDayOfMonth = new Date(year, month, 1);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const leadingDays = firstDayOfMonth.getDay();
	const monthCells = leadingDays + daysInMonth;
	const totalCells = monthCells <= 35 ? 35 : 42;
	const trailingDays = totalCells - monthCells;
	const previousMonthDays = new Date(year, month, 0).getDate();

	const days: CalendarDay[] = [];

	for (let day = leadingDays - 1; day >= 0; day -= 1) {
		days.push({
			date: new Date(year, month - 1, previousMonthDays - day),
			inCurrentMonth: false,
		});
	}

	for (let day = 1; day <= daysInMonth; day += 1) {
		days.push({
			date: new Date(year, month, day),
			inCurrentMonth: true,
		});
	}

	for (let day = 1; day <= trailingDays; day += 1) {
		days.push({
			date: new Date(year, month + 1, day),
			inCurrentMonth: false,
		});
	}

	return days;
};

const getMockStaffing = (date: Date): StaffingSnapshot => {
	const total = 12;
	const weekday = date.getDay();
	const isWeekend = weekday === 0 || weekday === 6;

	if (isWeekend) {
		return {
			available: 0,
			total,
			status: "critical",
			offCount: total,
		};
	}

	const daySeed = (date.getDate() * 37 + date.getMonth() * 11) % 8;
	const offCount = Math.min(7, daySeed);
	const available = total - offCount;

	let status: StaffingStatus = "healthy";

	if (available < 7) {
		status = "critical";
	} else if (available < 9) {
		status = "warning";
	}

	return {
		available,
		total,
		status,
		offCount,
	};
};

const isSameDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate();

const STATUS_STYLE: Record<
	StaffingStatus,
	{ dot: string; badge: string; text: string; label: string }
> = {
	healthy: {
		dot: "bg-green-400",
		badge: "bg-green100",
		text: "text-black",
		label: "Healthy staffing",
	},
	warning: {
		dot: "bg-yellow400",
		badge: "bg-yellow100",
		text: "text-black",
		label: "Tight staffing",
	},
	critical: {
		dot: "bg-red400",
		badge: "bg-red100",
		text: "text-red700",
		label: "Critical staffing",
	},
};

export default function CalendarScreen() {
	const [visibleMonth, setVisibleMonth] = React.useState(() => new Date());
	const today = React.useMemo(() => new Date(), []);
	const monthDays = React.useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);

	const goToPreviousMonth = () => {
		setVisibleMonth((current) =>
			new Date(current.getFullYear(), current.getMonth() - 1, 1),
		);
	};

	const goToNextMonth = () => {
		setVisibleMonth((current) =>
			new Date(current.getFullYear(), current.getMonth() + 1, 1),
		);
	};

	return (
		<ScrollView className="flex-1 bg-white" contentContainerClassName="px-4 pb-8 pt-6">
			<View className="mb-6 flex-row items-center justify-between">
				<Pressable
					onPress={goToPreviousMonth}
					className="h-10 w-10 items-center justify-center rounded-full bg-gray50"
				>
					<Text className="body-medium-semibold text-black">{"<"}</Text>
				</Pressable>
				<Text className="heading-xxsmall text-black">{getMonthLabel(visibleMonth)}</Text>
				<Pressable
					onPress={goToNextMonth}
					className="h-10 w-10 items-center justify-center rounded-full bg-gray50"
				>
					<Text className="body-medium-semibold text-black">{">"}</Text>
				</Pressable>
			</View>

			<View className="mb-2 flex-row">
				{WEEKDAY_LABELS.map((weekday) => (
					<View key={weekday} style={{ width: "14.2857%" }} className="pb-2">
						<Text className="body-xxsmall-semibold text-gray500 text-center">
							{weekday}
						</Text>
					</View>
				))}
			</View>

			<View className="flex-row flex-wrap rounded-2xl border border-gray200 bg-gray25 px-1 py-1">
				{monthDays.map((day) => {
					const staffing = getMockStaffing(day.date);
					const status = STATUS_STYLE[staffing.status];
					const isToday = isSameDay(day.date, today);

					return (
						<View
							key={day.date.toISOString()}
							style={{ width: "14.2857%", minHeight: 90 }}
							className="p-1"
						>
							<View
								className={`h-full rounded-xl border bg-white p-2 ${
									isToday ? "border-blue400" : "border-gray200"
								}`}
							>
								<Text
									className={`body-xsmall-semibold ${
										day.inCurrentMonth ? "text-black" : "text-gray400"
									}`}
								>
									{day.date.getDate()}
								</Text>
								<View className="mt-2 flex-row items-center gap-1">
									<View className={`h-2 w-2 rounded-full ${status.dot}`} />
									<Text className="body-xxsmall-regular text-gray600">
										{staffing.available}/{staffing.total}
									</Text>
								</View>
								<Text className="body-xxsmall-regular text-gray500 mt-1">
									Off: {staffing.offCount}
								</Text>
							</View>
						</View>
					);
				})}
			</View>

			<View className="mt-6 rounded-2xl border border-gray200 bg-white p-4">
				<Text className="body-small-semibold text-black">Staffing indicator legend</Text>
				{(["healthy", "warning", "critical"] as StaffingStatus[]).map((entry) => (
					<View key={entry} className="mt-3 flex-row items-center justify-between">
						<View className="flex-row items-center gap-2">
							<View className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLE[entry].dot}`} />
							<Text className="body-xsmall-regular text-gray700">
								{STATUS_STYLE[entry].label}
							</Text>
						</View>
						<View className={`rounded-full px-2 py-1 ${STATUS_STYLE[entry].badge}`}>
							<Text className={`body-xxsmall-semibold ${STATUS_STYLE[entry].text}`}>
								{entry === "healthy"
									? "9+ available"
									: entry === "warning"
										? "7-8 available"
										: "<7 available"}
							</Text>
						</View>
					</View>
				))}
			</View>
		</ScrollView>
	);
}
