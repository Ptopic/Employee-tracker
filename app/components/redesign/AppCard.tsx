import { View, type ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";

export function AppCard({ className, ...props }: ViewProps & { className?: string }) {
	return (
		<View
			{...props}
			className={twMerge(
				"rounded-2xl border border-[#E8ECEB] bg-white",
				className,
			)}
		/>
	);
}
