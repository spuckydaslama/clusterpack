<script lang="ts">
	import { page } from '$app/stores';
	import { ListBox, ListBoxItem, ProgressRadial } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { kubeConfigStore, recentlySelectedNamespaces } from '$lib/stores';
	import type { KCDeploymentOrStatefulSet } from '$lib/types';
	import { isUniquePredicate } from '$lib/utils/arrays';
	import { getStatusColor } from '$lib/utils/statusColor';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';

	const encodeKubeConfig = (clusterName: string) => {
		return window.btoa(JSON.stringify($kubeConfigStore[clusterName]));
	};

	let namespaces = [] as string[];
	let workloads: KCDeploymentOrStatefulSet[] = [];
	let fetchingWorkloadsInProgress = false;

	$: selectedNamespaces = $recentlySelectedNamespaces[$page.params.clusterName] || ([] as string[]);
	$: namespaceListBoxState = selectedNamespaces;

	$: orderedNamespaces = namespaces.sort((n1, n2) => {
		if (selectedNamespaces.includes(n1) && !selectedNamespaces.includes(n2)) return -1;
		if (!selectedNamespaces.includes(n1) && selectedNamespaces.includes(n2)) return 1;
		return n1.localeCompare(n2);
	});

	let updateWorkloadsTimeout: number;
	let abortUpdateWorkloads: AbortController | undefined;
	const updateWorkloads = async () => {
		if (abortUpdateWorkloads) {
			abortUpdateWorkloads.abort();
		}
		if (selectedNamespaces.length) {
			abortUpdateWorkloads = new AbortController();
			const kubeConfig = encodeKubeConfig($page.params.clusterName);
			fetchingWorkloadsInProgress = true;
			const response = await fetch(
				`/api/workloads?namespaces=${selectedNamespaces.join(',')}&kubeConfig=${kubeConfig}`,
				{ signal: (abortUpdateWorkloads?.signal || null) as AbortSignal }
			);
			const newWorkloads = (await response.json()) as KCDeploymentOrStatefulSet[];
			workloads = newWorkloads
				.filter((workload) => workload?.metadata?.name)
				.filter(isUniquePredicate((workload) => workload.metadata?.name))
				.filter((workload) => selectedNamespaces.includes(workload.metadata?.namespace || ''))
				.sort((w1, w2) => {
					if (w1.metadata?.uid === undefined || w2.metadata?.uid === undefined) {
						return w1.metadata?.uid === undefined ? -1 : 1;
					}
					return w1.metadata.uid.localeCompare(w2.metadata.uid);
				});
		} else {
			workloads = [];
		}
		fetchingWorkloadsInProgress = false;
		updateWorkloadsTimeout = setTimeout(updateWorkloads, 10000) as unknown as number;
	};

	const namespaceSelectionChange = (event: Event) => {
		const eventTarget = event.currentTarget as HTMLInputElement;
		if (eventTarget.checked) {
			$recentlySelectedNamespaces[$page.params.clusterName] = [
				...selectedNamespaces,
				eventTarget.value
			].filter(isUniquePredicate((namespace) => namespace));
		} else {
			$recentlySelectedNamespaces[$page.params.clusterName] = selectedNamespaces.filter(
				(namespace) => namespace !== eventTarget.value
			);
		}
	};

	let namespaceDrawerOpen = false;
	const namespaceDrawerClicked = () => {
		namespaceDrawerOpen = !namespaceDrawerOpen;
	};

	onMount(async () => {
		const kubeConfig = encodeKubeConfig($page.params.clusterName);
		const response = await fetch(`/api/namespaces?kubeConfig=${kubeConfig}`);
		namespaces = await response.json();
		namespaceDrawerOpen = selectedNamespaces.length === 0;
		await updateWorkloads();
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
	{#if fetchingWorkloadsInProgress}
		<ProgressRadial width="w-6" />
	{/if}
</div>
<div class="flex gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex items-center">
			{#if namespaceDrawerOpen}
				<h2 class="grow text-2xl text-secondary-300-600-token" transition:fly={{ x: '-100%' }}>
					Namespaces
				</h2>
			{/if}
			<div class="relative inline-block">
				<span
					class:hidden={namespaceDrawerOpen}
					class="badge-icon variant-filled-surface absolute -top-0 -right-0 z-10"
					>{selectedNamespaces.length}</span
				>
				<button
					type="button"
					class="btn-icon text-secondary-300-600-token"
					on:click={namespaceDrawerClicked}
				>
					{#if namespaceDrawerOpen}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-8 h-8"
						>
							<path
								fill-rule="evenodd"
								d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-8 h-8"
						>
							<path
								fill-rule="evenodd"
								d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
		{#if namespaceDrawerOpen}
			<div transition:fly={{ x: '-100%' }}>
				<ListBox multiple>
					{#each orderedNamespaces as namespace (namespace)}
						<div animate:flip={{ duration: 250 }}>
							<ListBoxItem
								on:change={namespaceSelectionChange}
								bind:group={namespaceListBoxState}
								padding="p-1"
								name="namespace"
								value={namespace}
							>
								{namespace}
							</ListBoxItem>
						</div>
					{/each}
				</ListBox>
			</div>
		{/if}
	</div>
	<div class="grow grid grid-cols-4 auto-rows-min gap-4 mx-4">
		{#each workloads as workload}
			{@const replicaStatus = `${workload.status?.readyReplicas || '0'} / ${
				workload.spec?.replicas !== undefined ? workload.spec.replicas : '?'
			} `}
			{@const backgroundColor = `bg-${getStatusColor(
				workload.status?.readyReplicas || 0,
				workload.spec?.replicas
			)}-100-800-token`}
			<div class={'card card-hover p-1 ' + backgroundColor}>
				<header>
					<div class="flex items-center">
						<span class="grow text-xl text-center">{workload.metadata?.name || '?'}</span>
						<span class="text-xs">{replicaStatus}</span>
					</div>
				</header>
				<section>
					<div class="flex flex-col gap-1">
						{#if workload.spec?.template?.spec?.containers?.length}
							{#each workload.spec?.template?.spec?.containers as container}
								<span
									title={(container.image && container.image.split(':')[0]) || '?'}
									class="bold text-sm text-orange-500"
								>
									{(container.image && container.image.split(':')[1]) || '?'}
								</span>
							{/each}
						{/if}
					</div>
				</section>
			</div>
		{/each}
	</div>
</div>
