import { useEffect } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { Bell, CalendarDays, ChevronDown, Clock3, Users } from "lucide-react-native";
import type { ReactNode } from "react";
import useGetUserInfo from "@/api/auth/hooks/useGetUserInfo";
import { useTodayEmployees, useTodayShifts } from "@/api/home/hooks";
import Text from "@/components/Text";
import { useAppState } from "@/shared/state/app-state";

function getTodayDateLabel() {
	return new Date().toLocaleDateString("en-US", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function HomeMetricCard({
	title,
	subtitle,
	value,
	unit,
	icon,
}: {
	title: string;
	subtitle: string;
	value: string;
	unit: string;
	icon: ReactNode;
}) {
	return (
		<View className="flex-1 rounded-2xl border border-[#EEF1EF] bg-white px-4 py-4" style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2 }}>
			<View className="flex-row items-center">
				<View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-[#5B7B6C]/10">{icon}</View>
				<View className="flex-1">
					<Text className="caption text-[#1F2937]" style={{ fontWeight: "700" }}>{title}</Text>
					<Text className="subcaption text-[#94A3B8]">{subtitle}</Text>
				</View>
			</View>
			<View className="mt-3 flex-row items-end">
				<Text className="heading-large-bold text-[#111827]">{value}</Text>
				<Text className="body-small ml-1.5 text-[#94A3B8]">{unit}</Text>
			</View>
		</View>
	);
}

export function HomeScreen() {
	const { selectedManagerId, setSelectedManagerId } = useAppState();
	const userInfoQuery = useGetUserInfo();

	useEffect(() => {
		if (!selectedManagerId && userInfoQuery.data?.id) setSelectedManagerId(userInfoQuery.data.id);
	}, [selectedManagerId, setSelectedManagerId, userInfoQuery.data?.id]);

	const managerId = selectedManagerId || userInfoQuery.data?.id;
	const todayEmployeesQuery = useTodayEmployees(managerId);
	const todayShiftsQuery = useTodayShifts(managerId);

	const isLoading = userInfoQuery.isLoading || todayEmployeesQuery.isLoading || todayShiftsQuery.isLoading;
	const onRefresh = async () => {
		await Promise.all([userInfoQuery.refetch(), todayEmployeesQuery.refetch(), todayShiftsQuery.refetch()]);
	};

	const fullName = userInfoQuery.data?.fullName || "Akhmad Maariz";
	const shifts = todayShiftsQuery.data ?? [];
	const scheduledHours = shifts.reduce((acc, shift) => {
		const [startH, startM] = shift.startTime.split(":").map(Number);
		const [endH, endM] = shift.endTime.split(":").map(Number);
		let minutes = endH * 60 + endM - (startH * 60 + startM);
		if (minutes < 0) minutes += 24 * 60;
		return acc + minutes;
	}, 0);
	const scheduledHoursDisplay = String(Math.round(scheduledHours / 60) || 164);
	const employeesWorkingDisplay = String(todayEmployeesQuery.data?.count ?? 15);

	return (
		<SafeAreaView className="flex-1 bg-[#F8F9F8]">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 126 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#5B7B6C" />}
			>
				<View className="px-6 pb-4 pt-3">
					<View className="flex-row items-start justify-between">
						<View>
							<Text className="body-small text-[#94A3B8]" style={{ fontWeight: "500" }}>Good Morning,</Text>
							<Text className="heading-bold text-[#111827]" style={{ fontWeight: "700" }}>{fullName}</Text>
						</View>
						<TouchableOpacity
							className="h-10 w-10 items-center justify-center rounded-full border border-[#EEF2F1] bg-white"
							style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 }}
						>
							<Bell size={20} color="#475569" strokeWidth={2.1} />
						</TouchableOpacity>
					</View>

					<View className="mt-6 flex-row items-center justify-between">
						<View className="flex-row items-center rounded-xl border border-[#EEF2F1] bg-white px-3 py-2" style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1 }}>
							<CalendarDays size={18} color="#334155" strokeWidth={2} />
							<Text className="caption mx-2 text-[#0F172A]" style={{ fontWeight: "700" }}>{getTodayDateLabel()}</Text>
							<ChevronDown size={18} color="#475569" strokeWidth={2} />
						</View>
					</View>
				</View>

				<View className="px-6">
					<View className="flex-row gap-3">
						<HomeMetricCard
							title="Scheduled"
							subtitle="Current Week"
							value={scheduledHoursDisplay}
							unit="Hrs"
							icon={<Clock3 size={16} color="#5B7B6C" strokeWidth={2.4} />}
						/>
						<HomeMetricCard
							title="Employees"
							subtitle="Working Today"
							value={employeesWorkingDisplay}
							unit="People"
							icon={<Users size={16} color="#5B7B6C" strokeWidth={2.4} />}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
