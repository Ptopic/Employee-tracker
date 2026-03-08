import { ScrollView, View } from "react-native";
import Text from "@/components/Text";

type EmployeeStatus = "Active" | "On Leave" | "Inactive";

type Employee = {
	id: string;
	name: string;
	role: string;
	monthlyHours: number;
	status: EmployeeStatus;
};

const EMPLOYEE_ROSTER: Employee[] = [
	{
		id: "emp-001",
		name: "Sophia Carter",
		role: "Barista",
		monthlyHours: 152,
		status: "Active",
	},
	{
		id: "emp-002",
		name: "Liam Brooks",
		role: "Kitchen Staff",
		monthlyHours: 138,
		status: "Active",
	},
	{
		id: "emp-003",
		name: "Ava Mitchell",
		role: "Shift Supervisor",
		monthlyHours: 164,
		status: "Active",
	},
	{
		id: "emp-004",
		name: "Noah Patel",
		role: "Cashier",
		monthlyHours: 96,
		status: "On Leave",
	},
	{
		id: "emp-005",
		name: "Mia Nguyen",
		role: "Barista",
		monthlyHours: 0,
		status: "Inactive",
	},
];

const statusStyleMap: Record<
	EmployeeStatus,
	{ labelClassName: string; dotClassName: string }
> = {
	Active: {
		labelClassName: "text-emerald-700 bg-emerald-100",
		dotClassName: "bg-emerald-600",
	},
	"On Leave": {
		labelClassName: "text-amber-700 bg-amber-100",
		dotClassName: "bg-amber-500",
	},
	Inactive: {
		labelClassName: "text-slate-700 bg-slate-200",
		dotClassName: "bg-slate-500",
	},
};

export default function EmployeesScreen() {
	const totalMonthlyHours = EMPLOYEE_ROSTER.reduce(
		(total, employee) => total + employee.monthlyHours,
		0,
	);

	return (
		<ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-5 pb-8">
			<View className="mb-5 gap-1">
				<Text className="heading-small text-slate-900">Employees</Text>
				<Text className="body-small-regular text-slate-500">
					Roster, monthly hours, and current status
				</Text>
			</View>

			<View className="mb-5 flex-row gap-3">
				<View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
					<Text className="body-xsmall-semibold uppercase text-slate-500">Roster size</Text>
					<Text className="mt-1 heading-xsmall text-slate-900">
						{EMPLOYEE_ROSTER.length}
					</Text>
				</View>
				<View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
					<Text className="body-xsmall-semibold uppercase text-slate-500">Monthly hours</Text>
					<Text className="mt-1 heading-xsmall text-slate-900">
						{totalMonthlyHours}h
					</Text>
				</View>
			</View>

			<View className="gap-3">
				{EMPLOYEE_ROSTER.map((employee) => {
					const statusStyles = statusStyleMap[employee.status];

					return (
						<View
							key={employee.id}
							className="rounded-2xl border border-slate-200 bg-white p-4"
						>
							<View className="flex-row items-start justify-between gap-3">
								<View className="flex-1">
									<Text className="body-medium-semibold text-slate-900">
										{employee.name}
									</Text>
									<Text className="body-small-regular text-slate-500">
										{employee.role}
									</Text>
								</View>

								<View
									className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${statusStyles.labelClassName}`}
								>
									<View className={`h-2 w-2 rounded-full ${statusStyles.dotClassName}`} />
									<Text className="body-xsmall-semibold">{employee.status}</Text>
								</View>
							</View>

							<View className="mt-3 flex-row items-end justify-between">
								<Text className="body-small-regular text-slate-500">Monthly hours</Text>
								<Text className="body-medium-bold text-slate-900">
									{employee.monthlyHours}h
								</Text>
							</View>
						</View>
					);
				})}
			</View>
		</ScrollView>
	);
}
