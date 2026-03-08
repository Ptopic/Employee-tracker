import { useEffect, useMemo, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, View } from "react-native";
import Text from "@/components/Text";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import {
	useTodayEmployees,
	useTodayShifts,
	useWeeklyHours,
} from "@/api/home/hooks";
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
		return fullName ? `Welcome back, ${fullName.split(" ")[0]}` : "Welcome back";
	}, [userInfoQuery.data?.fullName]);

	return (
		<SafeAreaView className="flex-1 bg-gray-100">
			<ScrollView
				className="flex-1 bg-gray-100"
				contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				<Text className="text-base text-gray-600 mb-1">{greeting}</Text>
				<MonthYearHeader
					monthDate={visibleMonth}
					onPrevMonth={() =>
						setVisibleMonth(
							(current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
						)
					}
					onNextMonth={() =>
						setVisibleMonth(
							(current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
						)
					}
				/>

				{hasError ? (
					<View className="rounded-xl p-4 mb-4 bg-red-50 border border-red-200">
						<Text className="text-red-700">Unable to load dashboard data. Pull to refresh.</Text>
					</View>
				) : null}

				<StatsCards
					weeklyHours={weeklyHoursQuery.data?.totalHours ?? 0}
					todayEmployees={todayEmployeesQuery.data?.count ?? 0}
					isLoading={isLoading}
				/>

				<TodayScheduleList shifts={todayShiftsQuery.data ?? []} isLoading={isLoading} />

				<PrimaryActions />
			</ScrollView>
		</SafeAreaView>
	);
}
