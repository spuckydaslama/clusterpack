<script lang="ts">
	import { recentlySelectedNamespaces } from '$lib/stores';
	import type { Workload } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import { getEncodedKubeConfig } from '$lib/utils/getEncodedKubeConfig';
	import { fetchWorkloads } from '$lib/utils/fetchWorkloads';
	import ErrorBadge from '$lib/components/atoms/ErrorBadge.svelte';
	import WorkloadBadge from './WorkloadBadge.svelte';
	import WorkloadBadgesSkeleton from './WorkloadBadgesSkeleton.svelte';

	export let clusterName: string;

	let workloads: Workload[] = [];
	let error: Error | undefined;

	$: selectedNamespaces =
		(clusterName && $recentlySelectedNamespaces[clusterName]) || ([] as string[]);

	let updateWorkloadsTimeout: number;
	let abortUpdateWorkloads: AbortController | undefined;
	let timeoutInSeconds = 10;
	const updateWorkloads = async () => {
		if (abortUpdateWorkloads) {
			abortUpdateWorkloads.abort();
		}
		if (selectedNamespaces.length) {
			const kubeConfig = getEncodedKubeConfig(clusterName, window.btoa);
			abortUpdateWorkloads = new AbortController();
			const { workloads: newWorkloads, error: newError } = await fetchWorkloads(
				kubeConfig,
				selectedNamespaces,
				(abortUpdateWorkloads?.signal || null) as AbortSignal
			);
			if (!newError) {
				workloads = newWorkloads;
			}
			error = newError;
		} else {
			workloads = [];
			error = undefined;
		}
		updateWorkloadsTimeout = setTimeout(
			updateWorkloads,
			timeoutInSeconds * 1000
		) as unknown as number;
	};

	let firstUpdateWorkloadsTimeout: number;
	onMount(() => {
		// I don't want to fetch all workloads at the same time, when multiple clusters are visible
		firstUpdateWorkloadsTimeout = setTimeout(
			updateWorkloads,
			Math.floor(Math.random() * 20000)
		) as unknown as number;
	});

	onDestroy(() => {
		if (abortUpdateWorkloads) {
			abortUpdateWorkloads.abort();
		}
		if (updateWorkloadsTimeout) {
			clearTimeout(updateWorkloadsTimeout);
		}
		if (firstUpdateWorkloadsTimeout) {
			clearTimeout(firstUpdateWorkloadsTimeout);
		}
	});
</script>

<a href={`/clusters/${clusterName}`} class="card p-4 flex flex-col">
	<div>
		{clusterName}
		<span title={`${selectedNamespaces?.length} selected namespaces in this cluster`}>
			({selectedNamespaces?.length})
		</span>
	</div>
	<div>
		{#if !error && selectedNamespaces?.length > 0 && workloads?.length === 0}
			<WorkloadBadgesSkeleton length={selectedNamespaces.length} />
		{/if}
		{#each workloads as workload}
			<WorkloadBadge {workload} />
		{/each}
		{#if error}
			<ErrorBadge>error</ErrorBadge>
		{/if}
	</div>
</a>
