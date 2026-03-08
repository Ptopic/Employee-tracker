import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { performance } from "node:perf_hooks";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { PrismaService } from "src/prisma/prisma.service";
import {
	UpdateCompanySettingsDto,
	UpdatePreferencesDto,
} from "./dtos/settings.dto";

const DEFAULT_PREFERENCES: UpdatePreferencesDto = {
	timeFormat: "24h",
	firstDayOfWeek: "Monday",
};

@Injectable()
export class SettingsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	async getCompany(managerId: string) {
		const manager = await this.prisma.manager.findUnique({ where: { id: managerId } });
		return {
			companyName: manager?.companyName ?? "",
			logoUrl: manager?.companyLogoUrl ?? "",
		};
	}

	async updateCompany(managerId: string, payload: UpdateCompanySettingsDto) {
		const updated = await this.prisma.manager.update({
			where: { id: managerId },
			data: {
				companyName: payload.companyName,
				companyLogoUrl: payload.logoUrl,
			},
		});

		return {
			companyName: updated.companyName ?? "",
			logoUrl: updated.companyLogoUrl ?? "",
		};
	}

	async uploadLogo(logo: string) {
		try {
			const uploaded = await this.cloudinaryService.uploadImage(logo);
			return { url: uploaded.url };
		} catch (_error) {
			throw new BadRequestException("Logo upload failed. Please try another image.");
		}
	}

	async getPreferences(managerId: string): Promise<UpdatePreferencesDto> {
		const manager = await this.prisma.manager.findUnique({ where: { id: managerId } });
		const current = (manager?.preferences ?? {}) as Partial<UpdatePreferencesDto>;

		return {
			timeFormat:
				current.timeFormat === "12h" || current.timeFormat === "24h"
					? current.timeFormat
					: DEFAULT_PREFERENCES.timeFormat,
			firstDayOfWeek:
				current.firstDayOfWeek === "Sunday" || current.firstDayOfWeek === "Monday"
					? current.firstDayOfWeek
					: DEFAULT_PREFERENCES.firstDayOfWeek,
		};
	}

	async updatePreferences(managerId: string, payload: UpdatePreferencesDto) {
		await this.prisma.manager.update({
			where: { id: managerId },
			data: {
				preferences: payload as unknown as Prisma.InputJsonValue,
			},
		});

		return payload;
	}

	async exportWeeklyPdf(managerId: string, weekStart: string) {
		const parsed = new Date(`${weekStart}T00:00:00.000Z`);
		if (Number.isNaN(parsed.getTime())) {
			throw new BadRequestException("Invalid weekStart date. Expected YYYY-MM-DD");
		}

		const weekEnd = new Date(parsed);
		weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

		const startedAt = performance.now();
		const assignments = await this.prisma.shiftAssignment.findMany({
			where: {
				shift: {
					managerId,
					date: {
						gte: parsed,
						lte: weekEnd,
					},
				},
			},
			select: {
				calculatedHours: true,
				employee: {
					select: {
						firstName: true,
						lastName: true,
						hourlyRate: true,
					},
				},
			},
		});

		const totals = new Map<string, { name: string; hours: number; amount: number }>();
		for (const assignment of assignments) {
			const name = `${assignment.employee.firstName} ${assignment.employee.lastName}`;
			const key = name.toLowerCase();
			const hours = Number(assignment.calculatedHours);
			const amount = hours * Number(assignment.employee.hourlyRate);
			const current = totals.get(key);
			if (current) {
				current.hours += hours;
				current.amount += amount;
			} else {
				totals.set(key, { name, hours, amount });
			}
		}

		const rows = Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
		const totalHours = rows.reduce((sum, row) => sum + row.hours, 0);
		const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

		const lines = [
			"Employee Tracker - Weekly Export",
			`Week: ${weekStart} to ${weekEnd.toISOString().slice(0, 10)}`,
			"",
			...rows.map((row) => `${row.name}: ${row.hours.toFixed(2)}h - $${row.amount.toFixed(2)}`),
			"",
			`Total hours: ${totalHours.toFixed(2)}`,
			`Total payroll: $${totalAmount.toFixed(2)}`,
		];

		return {
			buffer: buildSimplePdf(lines),
			durationMs: Number((performance.now() - startedAt).toFixed(2)),
			fileName: `weekly-${weekStart}.pdf`,
		};
	}
}

function buildSimplePdf(lines: string[]): Buffer {
	const escapedLines = lines.map((line) => escapePdfText(line));
	const textBody = escapedLines
		.map((line, index) => `1 0 0 1 50 ${770 - index * 16} Tm (${line}) Tj`)
		.join("\n");
	const stream = `BT\n/F1 12 Tf\n${textBody}\nET`;

	const objects = [
		"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
		"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
		"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
		"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
		`5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`,
	];

	const header = "%PDF-1.4\n";
	const offsets: number[] = [0];
	let body = "";
	let currentOffset = Buffer.byteLength(header, "utf8");

	for (const object of objects) {
		offsets.push(currentOffset);
		body += object;
		currentOffset += Buffer.byteLength(object, "utf8");
	}

	let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (let i = 1; i <= objects.length; i += 1) {
		xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
	}

	const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;
	return Buffer.from(header + body + xref + trailer, "utf8");
}

function escapePdfText(value: string) {
	return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
