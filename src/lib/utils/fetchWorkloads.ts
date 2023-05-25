import type { Workload } from '$lib/types';
import { isUniquePredicate } from '$lib/utils/arrays';

type ApiResponse = Workload[] | Error;

export const fetchWorkloads = async (
	encodedKubeConfig: string,
	namespaces: string[],
	abortSignal: AbortSignal | null
) => {
	const response = await fetch(
		`/api/workloads?namespaces=${namespaces.join(',')}&kubeConfig=${encodedKubeConfig}`,
		{ signal: abortSignal }
	);
	const apiResponse = (await response.json()) as ApiResponse;
	if (response.status !== 200) {
		return {
			workloads: [],
			error: apiResponse as Error
		};
	}
	return {
		workloads: (apiResponse as Workload[])
			.filter((workload) => workload?.metadata?.name)
			.filter(isUniquePredicate((workload) => workload.metadata?.uid))
			.filter((workload) => namespaces.includes(workload.metadata?.namespace || ''))
			.sort((w1, w2) => {
				if (w1.metadata?.uid === undefined || w2.metadata?.uid === undefined) {
					return w1.metadata?.uid === undefined ? -1 : 1;
				}
				return w1.metadata.uid.localeCompare(w2.metadata.uid);
			})
	};
};
