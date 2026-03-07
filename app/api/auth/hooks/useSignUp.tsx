import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import auth from "../requests";

const useSignUp = (options?: UseMutationOptions<any, Error, any, unknown>) => {
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			auth.signup(email, password),
		...options,
	});
};

export default useSignUp;
