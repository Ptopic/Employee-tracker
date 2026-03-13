import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import type React from "react";
import { forwardRef, useCallback, useMemo } from "react";

interface IProps {
	children: React.ReactNode;
	snapPoints?: string[];
	onChange?: (index: number) => void;
}

type Ref = BottomSheet;

const DrawerModal = forwardRef<Ref, IProps>((props, ref) => {
	const snapPoints = useMemo(
		() => props.snapPoints || ["70%"],
		[props.snapPoints],
	);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
			/>
		),
		[],
	);

	return (
		<BottomSheet
			ref={ref}
			index={-1}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			onChange={props.onChange}
			enablePanDownToClose={true}
			enableHandlePanningGesture={true}
			enableContentPanningGesture={true}
			handleComponent={() => null}
			backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#fff" }}
		>
			<BottomSheetView className="p-[10] bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
				{props.children}
			</BottomSheetView>
		</BottomSheet>
	);
});

export default DrawerModal;
