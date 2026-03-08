export async function measurePerformance<T>(label: string, task: () => Promise<T>) {
	const start = performance.now();
	const result = await task();
	const durationMs = Number((performance.now() - start).toFixed(2));
	if (__DEV__) {
		console.log(`[Perf] ${label}: ${durationMs}ms`);
	}
	return { result, durationMs };
}
