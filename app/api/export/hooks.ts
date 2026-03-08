import { useMutation } from "@tanstack/react-query";
import requests from "./requests";

export const useWeeklyPreview = () =>
	useMutation({
		mutationFn: (weekStart: string) => requests.getWeeklyPreview(weekStart),
	});

export const useExportWeeklyPdf = () =>
	useMutation({
		mutationFn: (weekStart: string) => requests.exportWeeklyPdf(weekStart),
	});
