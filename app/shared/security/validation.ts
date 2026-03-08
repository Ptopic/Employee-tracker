const DANGEROUS_PATTERN = /[<>"'`;]/g;

export const sanitizeInput = (value: string) => value.replace(DANGEROUS_PATTERN, "").trim();

export const assertSafeUrl = (url: string) => {
	if (!url.startsWith("https://")) {
		throw new Error("Only HTTPS endpoints are allowed");
	}
	return url;
};

export const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);
