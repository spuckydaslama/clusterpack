<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { recentlySelectedNamespaces } from '$lib/stores';
	import type { Workload } from '$lib/types';
	import { isUniquePredicate } from '$lib/utils/arrays';
	import { fly } from 'svelte/transition';
	import { fetchWorkloads } from '$lib/utils/fetchWorkloads';
	import { getEncodedKubeConfig } from '$lib/utils/getEncodedKubeConfig';
	import NamespaceListBox from './NamespaceListBox.svelte';
	import type { NamespaceSelectionChangeEventDetail } from './types';
	import Polling from './Polling.svelte';
	import NamespaceDrawerButton from './NamespaceDrawerButton.svelte';
	import WorkloadsGrid from './WorkloadsGrid.svelte';

	let namespaces: string[] | undefined = [] as string[];
	let workloads: Workload[] = [];
	let error: Error | undefined;
	let fetchingWorkloadsInProgress = false;

	$: selectedNamespaces = $recentlySelectedNamespaces[$page.params.clusterName] || ([] as string[]);
	$: namespaceListBoxState = selectedNamespaces;

	$: orderedNamespaces = (namespaces || []).sort((n1, n2) => {
		if (selectedNamespaces.includes(n1) && !selectedNamespaces.includes(n2)) return -1;
		if (!selectedNamespaces.includes(n1) && selectedNamespaces.includes(n2)) return 1;
		return n1.localeCompare(n2);
	});

	let updateWorkloadsTimeout: number;
	let abortUpdateWorkloads: AbortController | undefined;
	let timeoutInSeconds = 10;
	const updateWorkloads = async () => {
		if (abortUpdateWorkloads) {
			abortUpdateWorkloads.abort();
		}
		if (selectedNamespaces.length) {
			const kubeConfig = getEncodedKubeConfig($page.params.clusterName, window.btoa);
			abortUpdateWorkloads = new AbortController();
			fetchingWorkloadsInProgress = true;
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
		}
		fetchingWorkloadsInProgress = false;
		updateWorkloadsTimeout = setTimeout(
			updateWorkloads,
			timeoutInSeconds * 1000
		) as unknown as number;
	};

	const namespaceSelectionChanged = (event: CustomEvent<NamespaceSelectionChangeEventDetail>) => {
		const eventDetail = event.detail;
		if (eventDetail.selected) {
			$recentlySelectedNamespaces[$page.params.clusterName] = [
				...selectedNamespaces,
				eventDetail.namespace
			].filter(isUniquePredicate((namespace) => namespace));
		} else {
			$recentlySelectedNamespaces[$page.params.clusterName] = selectedNamespaces.filter(
				(namespace) => namespace !== eventDetail.namespace
			);
		}
	};

	let namespaceDrawerOpen = false;
	const namespaceDrawerClicked = () => {
		namespaceDrawerOpen = !namespaceDrawerOpen;
	};

	let fetchingNamespacesInProgress = false;
	const fetchNamespaces = async () => {
		fetchingNamespacesInProgress = true;
		const kubeConfig = getEncodedKubeConfig($page.params.clusterName, window.btoa);
		const response = await fetch(`/api/namespaces?kubeConfig=${kubeConfig}`);
		namespaces = await response.json();
		fetchingNamespacesInProgress = false;
	};

	onMount(() => {
		fetchNamespaces();
		namespaceDrawerOpen = selectedNamespaces.length === 0;
		updateWorkloads();
	});

	onDestroy(() => {
		if (abortUpdateWorkloads) {
			abortUpdateWorkloads.abort();
		}
		if (updateWorkloadsTimeout) {
			clearTimeout(updateWorkloadsTimeout);
		}
	});
</script>

<div class="flex items-center gap-4">
	<h1 class="text-4xl pb-3 text-primary-300-600-token">{$page.params.clusterName}</h1>
	<Polling bind:timeoutInSeconds {error} pollingInProgress={fetchingWorkloadsInProgress} />
</div>
<div class="flex gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex items-center">
			{#if namespaceDrawerOpen}
				<h2 class="grow text-2xl text-secondary-300-600-token" transition:fly={{ x: '-100%' }}>
					Namespaces
				</h2>
			{/if}
			<NamespaceDrawerButton
				on:click={namespaceDrawerClicked}
				open={namespaceDrawerOpen}
				count={selectedNamespaces.length}
			/>
		</div>
		{#if namespaceDrawerOpen}
			<div transition:fly={{ x: '-100%' }}>
				<NamespaceListBox
					fetchingInProgress={fetchingNamespacesInProgress}
					namespaces={orderedNamespaces}
					{namespaceListBoxState}
					on:namespaceSelectionChanged={namespaceSelectionChanged}
				/>
			</div>
		{/if}
	</div>
	<WorkloadsGrid {workloads} />
</div>
