import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Text from "@/components/Text";

type ShiftStatus = "Scheduled" | "In progress" | "Completed";

type Shift = {
	id: string;
	title: string;
	start: string;
	end: string;
	location: string;
	assignees: number;
	status: ShiftStatus;
};

const TODAY_SHIFTS: Shift[] = [
	{
		id: "shift-1",
		title: "Morning Front Desk",
		start: "08:00",
		end: "12:00",
		location: "HQ • Lobby",
		assignees: 2,
		status: "Completed",
	},
	{
		id: "shift-2",
		title: "Warehouse Dispatch",
		start: "12:00",
		end: "16:00",
		location: "Warehouse A",
		assignees: 4,
		status: "In progress",
	},
	{
		id: "shift-3",
		title: "Customer Support",
		start: "16:00",
		end: "21:00",
		location: "Remote",
		assignees: 3,
		status: "Scheduled",
	},
];

function getStatusClasses(status: ShiftStatus) {
	switch (status) {
		case "Completed":
			return "bg-green100 text-green400";
		case "In progress":
			return "bg-blue100 text-blue400";
		default:
			return "bg-yellow100 text-yellow500";
	}
}

function formatHeaderDate(date: Date) {
	const weekday = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
	}).format(date);

	const fullDate = new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(date);

	return { weekday, fullDate };
}

export default function DayScheduleScreen() {
	const { date } = useLocalSearchParams<{ date?: string }>();
	const selectedDate = date ? new Date(`${date}T00:00:00`) : new Date();
	const safeDate = Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate;
	const { weekday, fullDate } = formatHeaderDate(safeDate);

	return (
		<View className="flex-1 bg-gray25">
			<ScrollView contentContainerClassName="px-4 pb-8 pt-16">
				<View className="rounded-2xl bg-black p-5">
					<Text className="body-xsmall-semibold uppercase tracking-widest text-gray300">
						Day schedule
					</Text>
					<Text className="heading-medium mt-2 text-white">{weekday}</Text>
					<Text className="body-small-regular mt-1 text-gray300">{fullDate}</Text>
					<Text className="body-small-regular mt-3 text-gray300">
						{TODAY_SHIFTS.length} shifts planned
					</Text>
				</View>

				<View className="mb-3 mt-6">
					<Text className="heading-xxsmall text-black">Shift cards</Text>
					<Text className="body-small-regular mt-1 text-gray600">
						Review assignments and coverage for each shift block
					</Text>
				</View>

				<View className="gap-3">
					{TODAY_SHIFTS.map((shift) => (
						<View
							key={shift.id}
							className="rounded-2xl border border-gray200 bg-white p-4"
						>
							<View className="flex-row items-start justify-between">
								<View className="flex-1 pr-3">
									<Text className="body-small-semibold text-black">{shift.title}</Text>
									<Text className="body-xsmall-regular mt-1 text-gray600">
										{shift.location}
									</Text>
								</View>
								<View
									className={`rounded-full px-2.5 py-1 ${getStatusClasses(shift.status)}`}
								>
									<Text className="body-xxsmall-semibold">{shift.status}</Text>
								</View>
							</View>

							<View className="mt-4 flex-row items-center justify-between rounded-xl bg-gray50 px-3 py-2">
								<Text className="body-small-semibold text-black">
									{shift.start} - {shift.end}
								</Text>
								<Text className="body-xsmall-regular text-gray600">
									{shift.assignees} assigned
								</Text>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}
