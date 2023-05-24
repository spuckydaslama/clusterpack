<script lang="ts">
	import { recentlySelectedNamespaces } from '$lib/stores';
	import type { KCDeploymentOrStatefulSet } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import { getStatusColor } from '$lib/utils/statusColor';
	import { getEncodedKubeConfig } from '$lib/utils/getEncodedKubeConfig';
	import { fetchWorkloads } from '$lib/utils/fetchWorkloads';

	export let clusterName: string;

	let workloads: KCDeploymentOrStatefulSet[] = [];
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
		<span title={`${selectedNamespaces?.length} selected namespaces in this cluster`}
			>({selectedNamespaces?.length})</span
		>
	</div>
	<div>
		{#if !error && selectedNamespaces?.length > 0 && workloads?.length === 0}
			{#each [...Array(Math.floor((2 + Math.random() * 3) * selectedNamespaces?.length)).keys()] as item (item)}
				<div class="badge variant-filled-surface animate-pulse p-1.5 mx-0.5" />
			{/each}
		{/if}
		{#each workloads as workload}
			{@const status = getStatusColor(workload.status?.readyReplicas || 0, workload.spec?.replicas)}
			<div
				class:variant-filled-error={status === 'error'}
				class:variant-filled-success={status === 'success'}
				class:variant-filled-surface={status === 'surface'}
				class:variant-filled-warning={status === 'warning'}
				class="badge p-2 mx-0.5"
			/>
		{/each}
		{#if error}
			<div class="badge variant-filled-error">error</div>
		{/if}
	</div>
</a>
