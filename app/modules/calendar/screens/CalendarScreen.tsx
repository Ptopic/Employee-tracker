import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, RefreshControl, ScrollView, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Users } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { SHIFTS_MONTH, useDaySchedule, useMonthShifts } from "@/api/shifts/hooks";
import shiftsRequests from "@/api/shifts/requests";
import Text from "@/components/Text";
import { EmployeeCard } from "@/modules/home/components/EmployeeCard";
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

const extractHHmm = (value: string) => {
	if (!value) return "00:00";
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
	const isoMatch = value.match(/T(\d{2}:\d{2})/);
	if (isoMatch?.[1]) return isoMatch[1];
	const looseMatch = value.match(/(\d{2}):(\d{2})/);
	if (looseMatch?.[1] && looseMatch?.[2]) return `${looseMatch[1]}:${looseMatch[2]}`;
	return "00:00";
};

const toDurationLabel = (startTime: string, endTime: string) => {
	const [startH, startM] = extractHHmm(startTime).split(":").map(Number);
	const [endH, endM] = extractHHmm(endTime).split(":").map(Number);
	let minutes = endH * 60 + endM - (startH * 60 + startM);
	if (minutes < 0) minutes += 24 * 60;
	return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
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
	const dayScheduleQuery = useDaySchedule(selectedDayIso);

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

	const selectedDayShifts = dayScheduleQuery.data?.shifts ?? [];
	const scheduleItems = useMemo(
		() =>
			selectedDayShifts.flatMap((s) =>
				s.assignments.map((a) => ({
					id: a.id,
					employeeId: a.employeeId,
					name: `${a.employee.firstName} ${a.employee.lastName}`,
					startTime: extractHHmm(s.startTime),
					endTime: extractHHmm(s.endTime),
					shiftId: s.id,
					date: s.date,
					employeeIds: s.assignments.map((assignment) => assignment.employeeId),
				})),
			),
		[selectedDayShifts],
	);

	const GRID_GAP = 4;
	const CALENDAR_WIDTH = windowWidth - 20;
	const CELL_SIZE = Math.floor((CALENDAR_WIDTH - GRID_GAP * 6) / 7);
	const CELL_HEIGHT = CELL_SIZE + 16;
	const cellRows = useMemo(() => {
		const rows: Date[][] = [];
		for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
		return rows;
	}, [cells]);

	const monthSwipeLockRef = useRef(false);
	const monthPanResponder = useMemo(
		() =>
			PanResponder.create({
				onMoveShouldSetPanResponder: (_, gesture) =>
					Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 12,
				onPanResponderRelease: (_, gesture) => {
					if (monthSwipeLockRef.current) return;
					if (gesture.dx <= -40) {
						monthSwipeLockRef.current = true;
						setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
						setTimeout(() => {
							monthSwipeLockRef.current = false;
						}, 180);
						return;
					}
					if (gesture.dx >= 40) {
						monthSwipeLockRef.current = true;
						setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
						setTimeout(() => {
							monthSwipeLockRef.current = false;
						}, 180);
					}
				},
			}),
		[],
	);

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
			contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 14, paddingBottom: 28 }}
			refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={BRAND} />}
		>
			<View className="mb-8 flex-row items-center justify-between" style={{ paddingHorizontal: 2 }}>
				<TouchableOpacity
					onPress={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
					className="items-center justify-center rounded-full bg-white"
					style={[CARD_SHADOW, { width: 36, height: 36, borderWidth: 1, borderColor: "#F8FAFC" }]}
				>
					<ChevronLeft size={22} color="#64748B" strokeWidth={2.3} />
				</TouchableOpacity>
				<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26 }}>
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

			<View {...monthPanResponder.panHandlers}>
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
												height: CELL_HEIGHT,
												borderWidth: 1,
												borderColor: isSelected ? "rgba(91,123,108,0.2)" : SURFACE_BORDER,
												paddingHorizontal: 9,
												paddingTop: 9,
												paddingBottom: 8,
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
			</View>

			<View style={{ marginTop: 24, paddingHorizontal: 6 }}>
				<Text style={{ fontSize: 20, fontWeight: "700", lineHeight: 26, marginBottom: 12 }}>Daily Overview</Text>
				<View style={{ gap: 12 }}>
					{scheduleItems.length ? (
						scheduleItems.map((item) => (
							<EmployeeCard
								key={item.id}
								name={item.name}
								timeLabel={`${item.startTime}-${item.endTime}`}
								duration={toDurationLabel(item.startTime, item.endTime)}
								onPress={() =>
									router.push(
										`/shift/edit?shiftId=${item.shiftId}&date=${item.date.slice(0, 10)}&startTime=${item.startTime}&endTime=${item.endTime}&employeeIds=${item.employeeIds.join(",")}` as any,
									)
								}
							/>
						))
					) : (
						<View className="rounded-2xl bg-white p-4" style={[CARD_SHADOW, { borderWidth: 1, borderColor: "#F1F5F9" }]}>
							<Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>No shifts scheduled for selected date.</Text>
						</View>
					)}
				</View>
			</View>
		</ScrollView>
	);
}
