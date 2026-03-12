import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, CalendarCheck2, Users } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { SHIFTS_MONTH, useMonthShifts } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import Text from "@/components/Text";
import { usePreferencesState } from "@/shared/state/preferences-state";
import { buildWeekDays, dayIndexForWeekStart } from "@/utils/datetime";

const BRAND = "#5B7B6C";
const BG = "#F8F9F8";
const SURFACE_BORDER = "#F8FAFC";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

const toIsoDate = (d: Date) => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
};

export function CalendarScreen() {
	const { firstDayOfWeek } = usePreferencesState();
	const [monthDate, setMonthDate] = useState(new Date());
	const [selectedDayIso, setSelectedDayIso] = useState(toIsoDate(new Date()));
	const [isRefreshing, setIsRefreshing] = useState(false);
	const queryClient = useQueryClient();
	const { width: windowWidth } = useWindowDimensions();

	const monthStart = useMemo(() => new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), [monthDate]);
	const monthEnd = useMemo(() => new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0), [monthDate]);

	const monthShiftsQuery = useMonthShifts(toIsoDate(monthStart), toIsoDate(monthEnd));

	const summary = useMemo(
		() => shiftsRequests.buildCalendarSummary(monthShiftsQuery.data ?? [], monthStart, monthEnd),
		[monthShiftsQuery.data, monthStart, monthEnd],
	);

	useEffect(() => {
		const prevMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
		const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
		const prevEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
		const nextEnd = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);

		queryClient.prefetchQuery({
			queryKey: [SHIFTS_MONTH, toIsoDate(prevMonth), toIsoDate(prevEnd)],
			queryFn: () => shiftsRequests.getMonthSummary(toIsoDate(prevMonth), toIsoDate(prevEnd)),
		});
		queryClient.prefetchQuery({
			queryKey: [SHIFTS_MONTH, toIsoDate(nextMonth), toIsoDate(nextEnd)],
			queryFn: () => shiftsRequests.getMonthSummary(toIsoDate(nextMonth), toIsoDate(nextEnd)),
		});
	}, [monthDate, queryClient]);

	const weekDays = buildWeekDays(firstDayOfWeek);
	const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
	const startOffset = dayIndexForWeekStart(firstDay, firstDayOfWeek);
	const gridStart = new Date(firstDay);
	gridStart.setDate(firstDay.getDate() - startOffset);
	const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
	const daysInMonth = lastDay.getDate();
	const totalCells = startOffset + daysInMonth <= 35 ? 35 : 42;

	const summaryMap = useMemo(() => new Map(summary.map((d) => [d.date, d])), [summary]);
	const cells = useMemo(() => {
		return Array.from({ length: totalCells }).map((_, idx) => {
			const date = new Date(gridStart);
			date.setDate(gridStart.getDate() + idx);
			return date;
		});
	}, [totalCells, gridStart]);

	const selectedSummary = summaryMap.get(selectedDayIso);
	const selectedDateObj = new Date(`${selectedDayIso}T00:00:00`);
	const selectedLabel = selectedDateObj.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

	const GRID_GAP = 12;
	const CALENDAR_WIDTH = windowWidth - 32;
	const CELL_SIZE = Math.floor((CALENDAR_WIDTH - GRID_GAP * 6) / 7);
	const cellRows = useMemo(() => {
		const rows: Date[][] = [];
		for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
		return rows;
	}, [cells]);

	const onRefresh = async () => {
		setIsRefreshing(true);
		try {
			await monthShiftsQuery.refetch();
		} finally {
			setIsRefreshing(false);
		}
	};

	return (
		<ScrollView
			className="flex-1"
			style={{ backgroundColor: BG }}
			contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 28 }}
			refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={BRAND} />}
		>
			<View className="mb-8 flex-row items-center justify-between" style={{ paddingHorizontal: 8 }}>
				<TouchableOpacity
					onPress={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
					className="items-center justify-center rounded-full bg-white"
					style={[CARD_SHADOW, { width: 36, height: 36, borderWidth: 1, borderColor: "#F8FAFC" }]}
				>
					<ChevronLeft size={22} color="#64748B" strokeWidth={2.3} />
				</TouchableOpacity>
				<Text style={{ fontSize: 24, fontWeight: "700", lineHeight: 30 }}>
					{monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
				</Text>
				<TouchableOpacity
					onPress={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
					className="items-center justify-center rounded-full bg-white"
					style={[CARD_SHADOW, { width: 36, height: 36, borderWidth: 1, borderColor: "#F8FAFC" }]}
				>
					<ChevronRight size={22} color="#64748B" strokeWidth={2.3} />
				</TouchableOpacity>
			</View>

			<View className="mb-4 flex-row">
				{weekDays.map((day) => (
					<View key={day} className="flex-1 items-center">
						<Text
							style={{
								fontSize: 10,
								fontWeight: "700",
								color: "#94A3B8",
								textTransform: "uppercase",
								letterSpacing: 1.15,
							}}
						>
							{day}
						</Text>
					</View>
				))}
			</View>

			<View style={{ gap: GRID_GAP }}>
				{cellRows.map((row, rowIndex) => (
					<View key={`row-${rowIndex}`} className="flex-row" style={{ gap: GRID_GAP }}>
						{row.map((date) => {
							const dayIso = toIsoDate(date);
							const isCurrentMonth = date.getMonth() === monthDate.getMonth();
							const isSelected = selectedDayIso === dayIso;
							const daySummary = summaryMap.get(dayIso);
							const count = daySummary?.employeeCount ?? 0;

							const statusColor =
								daySummary?.staffingStatus === "full"
									? BRAND
									: daySummary?.staffingStatus === "partial"
										? "#FBBF24"
										: "#F43F5E";

							return (
								<TouchableOpacity
									key={dayIso}
									onPress={() => setSelectedDayIso(dayIso)}
									className="rounded-2xl bg-white"
									style={[
										CARD_SHADOW,
										{
											width: CELL_SIZE,
											height: CELL_SIZE,
											borderWidth: 1,
											borderColor: isSelected ? "rgba(91,123,108,0.2)" : SURFACE_BORDER,
											paddingHorizontal: 8,
											paddingTop: 7,
											paddingBottom: 6,
											opacity: isCurrentMonth ? 1 : 0.45,
										},
									]}
								>
									<View className="items-center">
										<Text style={{ fontSize: 12, fontWeight: isSelected ? "700" : "600", color: isSelected ? BRAND : "#0F172A" }}>
											{date.getDate()}
										</Text>
									</View>

									<View className="items-center" style={{ marginTop: "auto" }}>
										<View className="flex-row items-center" style={{ gap: 2 }}>
											<Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>{count}</Text>
											<Users size={12} color="#64748B" strokeWidth={2.2} />
										</View>
										<View className="rounded-full" style={{ width: "100%", height: 4, backgroundColor: statusColor, marginTop: 4 }} />
									</View>
								</TouchableOpacity>
							);
						})}
					</View>
				))}
			</View>

			<View style={{ marginTop: 30 }}>
				<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26, marginBottom: 16 }}>Daily Overview</Text>
				<TouchableOpacity
					onPress={() => router.push(`/schedule/day/${selectedDayIso}` as any)}
					activeOpacity={0.9}
					className="rounded-2xl bg-white"
					style={[CARD_SHADOW, { borderWidth: 1, borderColor: "#F8FAFC", padding: 16 }]}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center" style={{ gap: 14, flex: 1 }}>
							<View className="items-center justify-center rounded-xl" style={{ width: 48, height: 48, backgroundColor: "rgba(91,123,108,0.1)" }}>
								<CalendarCheck2 size={21} color={BRAND} strokeWidth={2.1} />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>{selectedLabel}</Text>
								<Text style={{ fontSize: 10, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
									{selectedSummary?.employeeCount ?? 0} employees scheduled
								</Text>
							</View>
						</View>
						<View className="rounded-full" style={{ width: 10, height: 10, backgroundColor: BRAND }} />
					</View>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
