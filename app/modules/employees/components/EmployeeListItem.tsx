import { Pressable, TouchableOpacity, View } from "react-native";
import { ChevronRight, Trash2, User } from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import Text from "@/components/Text";
import type { EmployeeListItem as Employee } from "@/api/employees/types";

const BRAND = "#5B7B6C";
const SURFACE_BORDER = "#F1F5F9";
const CARD_SHADOW = {
	shadowColor: "#000",
	shadowOpacity: 0.05,
	shadowOffset: { width: 0, height: 1 },
	shadowRadius: 3,
	elevation: 2,
} as const;

export function EmployeeListItem({
	employee,
	onPress,
	onDelete,
}: {
	employee: Employee;
	onPress: () => void;
	onDelete: () => void;
}) {
	const isActive = employee.status === "ACTIVE";
	const fullName = `${employee.firstName} ${employee.lastName ?? ""}`.trim();

	return (
		<View style={{ borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
			<Swipeable
				friction={1.15}
				rightThreshold={36}
				dragOffsetFromRightEdge={12}
				overshootFriction={8}
				overshootRight={false}
				renderRightActions={() => (
					<TouchableOpacity
						activeOpacity={1}
						onPress={onDelete}
						className="items-center justify-center"
						style={{
							width: 92,
							backgroundColor: "#EF4444",
						}}
					>
						<Trash2 size={18} color="#FFFFFF" strokeWidth={2.25} />
						<Text style={{ marginTop: 4, fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>Obrisi</Text>
					</TouchableOpacity>
				)}
			>
				<Pressable
					onPress={onPress}
					className="bg-white"
					style={[CARD_SHADOW, { borderWidth: 1, borderColor: SURFACE_BORDER, padding: 16 }]}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center" style={{ flex: 1 }}>
							<View
								className="items-center justify-center rounded-full border"
								style={{ width: 40, height: 40, minWidth: 40, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", marginRight: 12 }}
							>
								<User size={20} color="#94A3B8" strokeWidth={2} />
							</View>
							<View style={{ flex: 1 }}>
								<View className="flex-row items-center" style={{ marginBottom: 4 }}>
									<Text style={{ fontSize: 14, fontWeight: "700", lineHeight: 18, color: "#0F172A", flexShrink: 1 }}>
										{fullName}
									</Text>
									<View
										className="rounded-full"
										style={{
											paddingHorizontal: 8,
											paddingVertical: 3,
											backgroundColor: isActive ? "rgba(91,123,108,0.2)" : "rgba(239,68,68,0.12)",
											marginLeft: 8,
										}}
									>
										<Text style={{ fontSize: 10, lineHeight: 12, fontWeight: "700", color: isActive ? BRAND : "#B91C1C" }}>
											{isActive ? "Aktivan" : "Neaktivan"}
										</Text>
									</View>
								</View>
								<Text style={{ fontSize: 11, lineHeight: 15, color: "#64748B", fontWeight: "500" }}>
									€{employee.hourlyRate.toFixed(2)}/h · {employee.monthlyHours.toFixed(2)}h mjesecno
								</Text>
							</View>
						</View>
						<ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
					</View>
				</Pressable>
			</Swipeable>
		</View>
	);
}
