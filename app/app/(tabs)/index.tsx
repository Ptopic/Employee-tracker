import { ScrollView, View } from "react-native";
import Text from "@/components/Text";
import WeeklyStatCard from "@/components/WeeklyStatCard";

type WeeklyStat = {
	title: string;
	value: string;
	helperText: string;
	accentClassName: string;
};

const WEEKLY_STATS: WeeklyStat[] = [
	{
		title: "Hours tracked",
		value: "168h",
		helperText: "Across all assigned shifts",
		accentClassName: "bg-blue400",
	},
	{
		title: "Overtime",
		value: "12h",
		helperText: "3 employees above target",
		accentClassName: "bg-yellow400",
	},
	{
		title: "On leave",
		value: "4",
		helperText: "Approved PTO this week",
		accentClassName: "bg-green400",
	},
	{
		title: "Missing logs",
		value: "6",
		helperText: "Needs manager review",
		accentClassName: "bg-red300",
	},
];

function getWeekLabel(today: Date) {
	const day = today.getDay();
	const distanceFromMonday = (day + 6) % 7;

	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - distanceFromMonday);

	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);

	const formatter = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	});

	return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`;
}

export default function HomeScreen() {
	const now = new Date();
	const monthHeader = new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
	}).format(now);
	const weekLabel = getWeekLabel(now);

	return (
		<View className="flex-1 bg-gray25">
			<ScrollView contentContainerClassName="px-4 pb-8 pt-16">
				<View className="mb-6 rounded-2xl bg-black p-5">
					<Text className="body-xsmall-semibold uppercase tracking-widest text-gray300">
						Home dashboard
					</Text>
					<Text className="heading-medium mt-2 text-white">{monthHeader}</Text>
					<Text className="body-small-regular mt-1 text-gray300">{weekLabel}</Text>
				</View>

				<View className="mb-3">
					<Text className="heading-xxsmall text-black">Weekly stats</Text>
					<Text className="body-small-regular mt-1 text-gray600">
						Quick overview of this week&apos;s activity
					</Text>
				</View>

				<View className="flex-row flex-wrap justify-between gap-y-3">
					{WEEKLY_STATS.map((stat) => (
						<WeeklyStatCard
							key={stat.title}
							title={stat.title}
							value={stat.value}
							helperText={stat.helperText}
							accentClassName={stat.accentClassName}
						/>
					))}
				</View>
			</ScrollView>
		</View>
	);
}
