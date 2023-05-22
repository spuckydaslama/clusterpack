<script lang="ts">
	import { page } from '$app/stores';
	import { ListBox, ListBoxItem, ProgressRadial } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { kubeConfigStore } from '$lib/stores';
	import type { KCDeploymentOrStatefulSet } from '$lib/types';
	import { isUniquePredicate } from '$lib/utils/arrays';
	import { getStatusColor } from '$lib/utils/statusColor';
	import { flip } from 'svelte/animate';

	const encodeKubeConfig = (clusterName: string) => {
		return window.btoa(JSON.stringify($kubeConfigStore[clusterName]));
	};

	let namespaces = [] as string[];
	let selectedNamespaces = [] as string[];
	let workloads: KCDeploymentOrStatefulSet[] = [];
	let fetchingWorkloadsInProgress = false;

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

	onMount(async () => {
		const kubeConfig = encodeKubeConfig($page.params.clusterName);
		const response = await fetch(`/api/namespaces?kubeConfig=${kubeConfig}`);
		namespaces = await response.json();
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
<div class="flex gap-8">
	<div class="w-1/5">
		<ListBox multiple>
			{#each orderedNamespaces as namespace (namespace)}
				<div animate:flip={{ duration: 250 }}>
					<ListBoxItem
						padding="p-1"
						bind:group={selectedNamespaces}
						name="namespace"
						value={namespace}
					>
						{namespace}
					</ListBoxItem>
				</div>
			{/each}
		</ListBox>
	</div>
	<div class="grow grid grid-cols-4 auto-rows-min gap-4">
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
