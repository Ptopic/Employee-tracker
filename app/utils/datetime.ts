import type { FirstDayOfWeek, TimeFormat } from "@/api/settings/types";

const extractHHmm = (value: string) => {
	if (!value) return null;
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);

	const isoMatch = value.match(/T(\d{2}:\d{2})/);
	if (isoMatch?.[1]) return isoMatch[1];

	const looseMatch = value.match(/(\d{2}):(\d{2})/);
	if (looseMatch?.[1] && looseMatch?.[2]) return `${looseMatch[1]}:${looseMatch[2]}`;

	return null;
};

export const formatTime = (value: string, format: TimeFormat) => {
	const hhmm = extractHHmm(value);
	if (!hhmm) return value;

	const [hoursRaw, minutesRaw] = hhmm.split(":");
	const hours = Number(hoursRaw);
	const minutes = Number(minutesRaw);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return value;
	}

	if (format === "24h") {
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
	}

	const period = hours >= 12 ? "PM" : "AM";
	const normalized = hours % 12 === 0 ? 12 : hours % 12;
	return `${normalized}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const buildWeekDays = (firstDayOfWeek: FirstDayOfWeek) => {
	const days = ["Ned", "Pon", "Uto", "Sri", "Cet", "Pet", "Sub"];
	return firstDayOfWeek === "Monday"
		? [...days.slice(1), days[0]]
		: days;
};

export const dayIndexForWeekStart = (date: Date, firstDayOfWeek: FirstDayOfWeek) => {
	const day = date.getDay();
	return firstDayOfWeek === "Monday" ? (day + 6) % 7 : day;
};
