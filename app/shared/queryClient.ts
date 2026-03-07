import { QueryClient } from "@tanstack/react-query";

export const queryClientDefaultOptions = {
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			retry: false,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: false,
		},
	},
};

export const getQueryClient = () =>
	new QueryClient({
		...queryClientDefaultOptions,
	});
