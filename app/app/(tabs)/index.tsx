import FontAwesome from "@expo/vector-icons/FontAwesome";
import Text from "@/components/Text";
import { ScrollView, View } from "react-native";

type ScheduleStatus = "onTime" | "late" | "timeOff";

type TodayScheduleItem = {
	id: string;
	employeeName: string;
	role: string;
	startTime: string;
	endTime: string;
	status: ScheduleStatus;
};

const TODAY_SCHEDULE: TodayScheduleItem[] = [
	{
		id: "1",
		employeeName: "Emma Wilson",
		role: "Barista",
		startTime: "08:00",
		endTime: "16:00",
		status: "onTime",
	},
	{
		id: "2",
		employeeName: "Liam Carter",
		role: "Shift Supervisor",
		startTime: "09:00",
		endTime: "17:00",
		status: "late",
	},
	{
		id: "3",
		employeeName: "Sophia Lee",
		role: "Cashier",
		startTime: "12:00",
		endTime: "20:00",
		status: "onTime",
	},
	{
		id: "4",
		employeeName: "Noah Patel",
		role: "Kitchen",
		startTime: "10:00",
		endTime: "18:00",
		status: "timeOff",
	},
];

const STATUS_STYLES: Record<
	ScheduleStatus,
	{ label: string; containerClassName: string; textClassName: string }
> = {
	onTime: {
		label: "On time",
		containerClassName: "bg-green-50 border-green-200",
		textClassName: "text-green-700",
	},
	late: {
		label: "Late",
		containerClassName: "bg-amber-50 border-amber-200",
		textClassName: "text-amber-700",
	},
	timeOff: {
		label: "Time off",
		containerClassName: "bg-gray50 border-gray200",
		textClassName: "text-gray600",
	},
};

const ScheduleCard = ({
	employeeName,
	role,
	startTime,
	endTime,
	status,
}: TodayScheduleItem) => {
	const statusStyle = STATUS_STYLES[status];

	return (
		<View className="rounded-2xl border border-gray200 bg-white p-4">
			<View className="flex-row items-start justify-between gap-3">
				<View className="flex-1">
					<Text className="body-medium-semibold text-black">{employeeName}</Text>
					<Text className="body-small-regular mt-1 text-gray600">{role}</Text>
				</View>
				<View
					className={`rounded-full border px-3 py-1 ${statusStyle.containerClassName}`}
				>
					<Text className={`body-xsmall-semibold ${statusStyle.textClassName}`}>
						{statusStyle.label}
					</Text>
				</View>
			</View>

			<View className="mt-4 flex-row items-center gap-2">
				<FontAwesome name="clock-o" size={14} color="#6B7280" />
				<Text className="body-small-regular text-gray700">
					{startTime} - {endTime}
				</Text>
			</View>
		</View>
	);
};

export default function HomeScreen() {
	const todayLabel = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

	return (
		<View className="flex-1 bg-gray25">
			<ScrollView contentContainerClassName="px-4 pb-8 pt-16">
				<View className="mb-6">
					<Text className="heading-xsmall text-black">Today schedule</Text>
					<Text className="body-small-regular mt-1 text-gray600">{todayLabel}</Text>
				</View>

				<View className="mb-4 flex-row items-center justify-between">
					<Text className="body-small-semibold text-gray500">{TODAY_SCHEDULE.length} shifts</Text>
					<Text className="body-small-regular text-gray500">Sorted by start time</Text>
				</View>

				<View className="gap-3">
					{TODAY_SCHEDULE.map((item) => (
						<ScheduleCard key={item.id} {...item} />
					))}
				</View>
			</ScrollView>
		</View>
	);
}
