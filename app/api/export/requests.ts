import { config } from "@/shared/config";
import { getAccessToken } from "@/shared/auth";
import type { WeeklyExportFile, WeeklyExportPreview } from "./types";

const toBase64 = (arrayBuffer: ArrayBuffer) => {
	const bytes = new Uint8Array(arrayBuffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]);
	// @ts-ignore
	return globalThis.btoa ? globalThis.btoa(binary) : Buffer.from(binary, "binary").toString("base64");
};

const authHeaders = async () => {
	const accessToken = await getAccessToken();
	return {
		Authorization: accessToken ? `Bearer ${accessToken}` : "",
	};
};

const getWeeklyPreview = async (weekStart: string) => {
	const response = await fetch(
		`${config.apiUrl}/exports/weekly-preview?weekStart=${encodeURIComponent(weekStart)}`,
		{ method: "GET", headers: await authHeaders() },
	);
	if (!response.ok) return null;
	return (await response.json()) as WeeklyExportPreview;
};

const exportWeeklyPdf = async (weekStart: string) => {
	const response = await fetch(
		`${config.apiUrl}/exports/weekly-pdf?weekStart=${encodeURIComponent(weekStart)}`,
		{ method: "GET", headers: await authHeaders() },
	);
	if (!response.ok) return null;

	const contentDisposition = response.headers.get("content-disposition") || "";
	const fileName = /filename="?([^\"]+)"?/i.exec(contentDisposition)?.[1] || `weekly-${weekStart}.pdf`;
	const durationMs = Number(response.headers.get("x-export-duration-ms") || "0") || undefined;
	const buffer = await response.arrayBuffer();
	return {
		fileName,
		mimeType: "application/pdf",
		base64: toBase64(buffer),
		fileSize: buffer.byteLength,
		durationMs,
	} as WeeklyExportFile;
};

export default {
	getWeeklyPreview,
	exportWeeklyPdf,
};
