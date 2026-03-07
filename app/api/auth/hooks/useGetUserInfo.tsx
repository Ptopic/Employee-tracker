import { useQuery } from "@tanstack/react-query";
import { USER_INFO } from "@/api/constants";
import type { IUser } from "@/api/user/types";
import authRequests from "../requests";

const useGetUserInfo = () => {
	return useQuery<IUser>({
		queryKey: [USER_INFO],
		queryFn: () => authRequests.me(),
	});
};

export default useGetUserInfo;
