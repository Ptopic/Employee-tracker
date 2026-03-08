export const normalizeDateIso = (dateIso: string) => {
	const date = new Date(`${dateIso}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) {
		throw new Error("Invalid date");
	}
	return date;
};

export const roundHours = (value: number) => Math.round(value * 100) / 100;

export const calculateDeterministicHours = (start: string, end: string) => {
	const [sh, sm] = start.split(":").map(Number);
	const [eh, em] = end.split(":").map(Number);
	const startMinutes = sh * 60 + sm;
	const endMinutes = eh * 60 + em;
	if (endMinutes <= startMinutes) {
		throw new Error("End time must be greater than start time");
	}
	return roundHours((endMinutes - startMinutes) / 60);
};
