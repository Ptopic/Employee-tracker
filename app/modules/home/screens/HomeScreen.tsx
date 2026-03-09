import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, View } from "react-native";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import {
	useTodayEmployees,
	useTodayShifts,
	useWeeklyHours,
} from "@/api/home/hooks";
import Text from "@/components/Text";
import { useAppState } from "@/shared/state/app-state";
import { MonthYearHeader } from "../components/MonthYearHeader";
import { PrimaryActions } from "../components/PrimaryActions";
import { StatsCards } from "../components/StatsCards";
import { TodayScheduleList } from "../components/TodayScheduleList";

export function HomeScreen() {
	const [visibleMonth, setVisibleMonth] = useState(new Date());
	const { selectedManagerId, setSelectedManagerId } = useAppState();

	const userInfoQuery = useGetUserInfo();

	useEffect(() => {
		if (!selectedManagerId && userInfoQuery.data?.id) {
			setSelectedManagerId(userInfoQuery.data.id);
		}
	}, [selectedManagerId, setSelectedManagerId, userInfoQuery.data?.id]);

	const managerId = selectedManagerId || userInfoQuery.data?.id;

	const weeklyHoursQuery = useWeeklyHours(managerId);
	const todayEmployeesQuery = useTodayEmployees(managerId);
	const todayShiftsQuery = useTodayShifts(managerId);

	const isLoading =
		userInfoQuery.isLoading ||
		weeklyHoursQuery.isLoading ||
		todayEmployeesQuery.isLoading ||
		todayShiftsQuery.isLoading;

	const hasError =
		Boolean(userInfoQuery.error) ||
		Boolean(weeklyHoursQuery.error) ||
		Boolean(todayEmployeesQuery.error) ||
		Boolean(todayShiftsQuery.error);

	const onRefresh = async () => {
		await Promise.all([
			userInfoQuery.refetch(),
			weeklyHoursQuery.refetch(),
			todayEmployeesQuery.refetch(),
			todayShiftsQuery.refetch(),
		]);
	};

	const greeting = useMemo(() => {
		const fullName = userInfoQuery.data?.fullName;
		return fullName
			? `Welcome back, ${fullName.split(" ")[0]}`
			: "Welcome back";
	}, [userInfoQuery.data?.fullName]);

	return (
		<SafeAreaView className="flex-1 bg-slate-950">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 26 }}
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#fff" />
				}
			>
				<View className="px-5 pt-4 pb-7 bg-slate-950">
					<Text className="text-slate-300 text-sm tracking-wide">{greeting}</Text>
					<Text className="text-white text-[28px] font-bold mt-1">Time Management</Text>
					<View className="flex-row mt-6 border-b border-slate-800">
						<Text className="text-amber-300 font-semibold pb-3 mr-6 border-b-2 border-amber-300 text-[17px]">
							Attendance
						</Text>
						<Text className="text-slate-500 pb-3 mr-6 text-[17px]">Time off</Text>
						<Text className="text-slate-500 pb-3 text-[17px]">Overtime</Text>
					</View>
				</View>

				<View className="-mt-4 bg-white rounded-t-3xl px-5 pt-5 shadow-sm">
					<MonthYearHeader
						monthDate={visibleMonth}
						onPrevMonth={() =>
							setVisibleMonth(
								(current) =>
									new Date(current.getFullYear(), current.getMonth() - 1, 1),
							)
						}
						onNextMonth={() =>
							setVisibleMonth(
								(current) =>
									new Date(current.getFullYear(), current.getMonth() + 1, 1),
							)
						}
					/>

					{hasError ? (
						<View className="rounded-2xl p-4 mb-4 bg-red-50 border border-red-200">
							<Text className="text-red-700">
								Unable to load dashboard data. Pull to refresh.
							</Text>
						</View>
					) : null}

					<StatsCards
						weeklyHours={weeklyHoursQuery.data?.totalHours ?? 0}
						todayEmployees={todayEmployeesQuery.data?.count ?? 0}
						todayShifts={todayShiftsQuery.data?.length ?? 0}
						isLoading={isLoading}
					/>

					<TodayScheduleList
						shifts={todayShiftsQuery.data ?? []}
						isLoading={isLoading}
					/>

					<PrimaryActions
						onExportWeeklyPdf={() => {
							const now = new Date();
							const utcDay = (now.getUTCDay() + 6) % 7;
							const monday = new Date(now);
							monday.setUTCDate(now.getUTCDate() - utcDay);
							router.push({
								pathname: "/export/preview",
								params: { weekStart: monday.toISOString().slice(0, 10) },
							});
						}}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
