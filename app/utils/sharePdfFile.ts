import { Share } from "react-native";
import * as FileSystem from "expo-file-system";
import type { WeeklyExportFile } from "@/api/export/types";

const sanitizeFileName = (name: string) => {
	const trimmed = name.trim();
	if (!trimmed) return "weekly-export.pdf";
	return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
};

export async function sharePdfFile(file: WeeklyExportFile) {
	const fileName = sanitizeFileName(file.fileName);
	const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
	if (!baseDir) throw new Error("Could not resolve device file directory");

	const uri = `${baseDir}${fileName}`;
	await FileSystem.writeAsStringAsync(uri, file.base64, {
		encoding: FileSystem.EncodingType.Base64,
	});

	await Share.share({
		title: fileName,
		url: uri,
		message: fileName,
	});
}
