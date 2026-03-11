import { useEffect, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { Bell, CalendarDays, ChevronDown, ChevronRight, Clock3, FileText, Plus, UserPlus, Users } from "lucide-react-native";
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
	return `${h}h ${String(m).padStart(2, "0")}m`;
}

function DashboardStatCard({
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
	icon: React.ReactNode;
}) {
	return (
		<View
			className="flex-1 rounded-2xl border border-[#F8FAFC] bg-white p-4"
			style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}
		>
			<View className="mb-1 flex-row items-center">
				<View className="mr-2 rounded-full bg-[#5B7B6C]/10 p-2">{icon}</View>
				<View>
					<Text className="text-[#0F172A]" style={{ fontSize: 14, fontWeight: "700", lineHeight: 20 }}>
						{title}
					</Text>
					<Text className="text-[#94A3B8]" style={{ fontSize: 10, fontWeight: "400", lineHeight: 14 }}>
						{subtitle}
					</Text>
				</View>
			</View>
			<View className="mt-2 flex-row items-end">
				<Text className="text-[#0F172A]" style={{ fontSize: 24, fontWeight: "700", lineHeight: 30 }}>
					{value}
				</Text>
				<Text className="ml-1 text-[#94A3B8]" style={{ fontSize: 14, fontWeight: "500", lineHeight: 20 }}>
					{unit}
				</Text>
			</View>
		</View>
	);
}

function PrimaryAction({ label, icon }: { label: string; icon: React.ReactNode }) {
	return (
		<TouchableOpacity
			className="flex-1 items-center justify-center rounded-2xl border border-[#F8FAFC] bg-white p-3"
			style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}
		>
			<View className="rounded-lg bg-[#5B7B6C] p-2">{icon}</View>
			<Text className="mt-2 text-center text-[#0F172A]" style={{ fontSize: 10, fontWeight: "700", lineHeight: 14 }}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

function ScheduleCard({ name, startTime, endTime }: { name: string; startTime: string; endTime: string }) {
	return (
		<View
			className="flex-row items-center justify-between rounded-2xl border border-[#F8FAFC] bg-white p-4"
			style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}
		>
			<View className="flex-row items-center">
				<View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#F1F5F9] bg-[#F1F5F9]">
					<Text className="text-[#64748B]" style={{ fontSize: 12, fontWeight: "700", lineHeight: 16 }}>
						{name.charAt(0)}
					</Text>
				</View>
				<View className="ml-3">
					<Text className="text-[#0F172A]" style={{ fontSize: 14, fontWeight: "700", lineHeight: 20 }}>
						{name}
					</Text>
					<Text className="text-[#64748B]" style={{ fontSize: 10, fontWeight: "500", lineHeight: 14 }}>
						In {formatTimeTo12h(startTime)}, Out {formatTimeTo12h(endTime)}
					</Text>
				</View>
			</View>

			<View className="flex-row items-center">
				<Text className="text-[#334155]" style={{ fontSize: 14, fontWeight: "700", lineHeight: 20 }}>
					{toDurationLabel(startTime, endTime)}
				</Text>
				<ChevronRight size={20} color="#CBD5E1" strokeWidth={2.1} />
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
		if (flattened.length) return flattened.slice(0, 3);
		return [
			{ id: "demo-1", name: "Bagus Fikri", startTime: "09:00", endTime: "17:00" },
			{ id: "demo-2", name: "Susi", startTime: "08:00", endTime: "16:00" },
			{ id: "demo-3", name: "Budi", startTime: "08:00", endTime: "16:00" },
		];
	}, [shifts]);

	return (
		<SafeAreaView className="flex-1 bg-[#F8F9F8]">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 120 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#5B7B6C" />}
			>
				<View className="px-6 pb-4 pt-6">
					<View className="flex-row items-start justify-between">
						<View>
							<Text className="text-[#94A3B8]" style={{ fontSize: 14, fontWeight: "500", lineHeight: 20 }}>
								Good Morning,
							</Text>
							<Text className="text-[#0F172A]" style={{ fontSize: 24, fontWeight: "700", lineHeight: 32 }}>
								{fullName}
							</Text>
						</View>
						<TouchableOpacity
							aria-label="Notifications"
							className="rounded-full bg-white p-2"
							style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}
						>
							<Bell size={24} color="#475569" strokeWidth={2} />
						</TouchableOpacity>
					</View>

					<View className="mt-8 flex-row items-center justify-between">
						<View
							className="flex-row items-center rounded-lg border border-[#F1F5F9] bg-white px-3 py-2"
							style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2 }}
						>
							<CalendarDays size={20} color="#0F172A" strokeWidth={2} />
							<Text className="mx-2 text-[#0F172A]" style={{ fontSize: 14, fontWeight: "700", lineHeight: 20 }}>
								{getTodayDateLabel()}
							</Text>
							<ChevronDown size={20} color="#0F172A" strokeWidth={2} />
						</View>
					</View>
				</View>

				<View className="space-y-6 px-6">
					<View className="flex-row gap-4">
						<DashboardStatCard
							title="Scheduled"
							subtitle="Current Week"
							value={scheduledHoursDisplay}
							unit="Hrs"
							icon={<Clock3 size={16} color="#5B7B6C" strokeWidth={2.5} />}
						/>
						<DashboardStatCard
							title="Working Today"
							subtitle="All Teams"
							value={employeesWorkingDisplay}
							unit="People"
							icon={<Users size={16} color="#5B7B6C" strokeWidth={2.5} />}
						/>
					</View>

					<View className="flex-row gap-3">
						<PrimaryAction label="Add Employee" icon={<UserPlus size={20} color="#FFFFFF" strokeWidth={2.2} />} />
						<PrimaryAction label="Add Shift" icon={<Plus size={20} color="#FFFFFF" strokeWidth={2.5} />} />
						<PrimaryAction label="Export PDF" icon={<FileText size={20} color="#FFFFFF" strokeWidth={2.2} />} />
					</View>

					<View className="mt-1">
						<View className="mb-4 flex-row items-center justify-between">
							<Text className="text-[#0F172A]" style={{ fontSize: 20, fontWeight: "700", lineHeight: 28 }}>
								Today's Schedule
							</Text>
							<Text className="text-[#5B7B6C]" style={{ fontSize: 12, fontWeight: "600", lineHeight: 16 }}>
								View Full
							</Text>
						</View>
						<View className="space-y-3">
							{scheduleItems.map((item) => (
								<ScheduleCard key={item.id} name={item.name} startTime={item.startTime} endTime={item.endTime} />
							))}
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
