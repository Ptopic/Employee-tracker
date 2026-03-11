import { useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { Bell, CalendarDays, ChevronDown, ChevronRight, Clock3, FileText, Plus, UserPlus, Users } from "lucide-react-native";
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

function formatTimeTo12h(time: string) {
	const [hours, minutes] = time.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const normalized = hours % 12 || 12;
	return `${String(normalized).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function toDurationLabel(startTime: string, endTime: string) {
	const [startH, startM] = startTime.split(":").map(Number);
	const [endH, endM] = endTime.split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h}h ${m}m`;
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
		<View
			className="flex-1 rounded-2xl border border-[#EEF1EF] bg-white px-4 py-4"
			style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2 }}
		>
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

function ActionButton({ label, icon }: { label: string; icon: ReactNode }) {
	return (
		<TouchableOpacity
			className="flex-1 items-center justify-center space-y-2 rounded-2xl border border-[#EEF1EF] bg-white px-3 py-3"
			style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 1 }}
		>
			<View className="h-9 w-9 items-center justify-center rounded-xl bg-[#5B7B6C]">{icon}</View>
			<Text className="subcaption text-center text-[#111827]" style={{ fontWeight: "700" }}>{label}</Text>
		</TouchableOpacity>
	);
}

function ScheduleCard({ name, startTime, endTime }: { name: string; startTime: string; endTime: string }) {
	return (
		<View
			className="mb-3 flex-row items-center justify-between rounded-2xl border border-[#EEF1EF] bg-white px-4 py-4"
			style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 1 }}
		>
			<View className="flex-row items-center">
				<View className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] border border-[#E2E8F0]">
					<Text className="caption text-[#334155]" style={{ fontWeight: "700" }}>{name.charAt(0)}</Text>
				</View>
				<View className="ml-3">
					<Text className="body-small text-[#111827]" style={{ fontWeight: "700" }}>{name}</Text>
					<Text className="subcaption text-[#64748B]" style={{ fontWeight: "500" }}>
						In {formatTimeTo12h(startTime)}, Out {formatTimeTo12h(endTime)}
					</Text>
				</View>
			</View>
			<View className="flex-row items-center">
				<Text className="caption text-[#475569]" style={{ fontWeight: "700" }}>{toDurationLabel(startTime, endTime)}</Text>
				<ChevronRight size={18} color="#CBD5E1" strokeWidth={2.2} />
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
	const employeesWorkingDisplay = String(todayEmployeesQuery.data?.count ?? 12);

	const scheduleItems = useMemo(() => {
		const flattened = shifts.flatMap((shift) =>
			shift.assignments.map((assignment) => ({
				id: assignment.id,
				name: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
				startTime: shift.startTime.slice(0, 5),
				endTime: shift.endTime.slice(0, 5),
			})),
		);
		if (flattened.length) return flattened.slice(0, 4);
		return [
			{ id: "demo-1", name: "Bagus Fikri", startTime: "09:00", endTime: "17:00" },
			{ id: "demo-2", name: "Vita Putri", startTime: "08:00", endTime: "16:00" },
		];
	}, [shifts]);

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
							title="Working Today"
							subtitle="All Teams"
							value={employeesWorkingDisplay}
							unit="People"
							icon={<Users size={16} color="#5B7B6C" strokeWidth={2.4} />}
						/>
					</View>

					<View className="mt-4 flex-row gap-3">
						<ActionButton label="Add Employee" icon={<UserPlus size={18} color="#FFFFFF" strokeWidth={2.4} />} />
						<ActionButton label="Add Shift" icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.8} />} />
						<ActionButton label="Export PDF" icon={<FileText size={18} color="#FFFFFF" strokeWidth={2.2} />} />
					</View>

					<View className="mt-5 flex-row items-center justify-between">
						<Text className="heading-bold text-[#111827]" style={{ fontWeight: "700" }}>Today's Schedule</Text>
						<Text className="caption text-[#5B7B6C]" style={{ fontWeight: "700" }}>View Full</Text>
					</View>

					<View className="mt-3">
						{scheduleItems.map((item) => (
							<ScheduleCard key={item.id} name={item.name} startTime={item.startTime} endTime={item.endTime} />
						))}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
