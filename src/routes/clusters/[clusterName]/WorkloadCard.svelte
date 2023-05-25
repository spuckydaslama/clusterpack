<script lang="ts">
	import { getStatusColor } from '$lib/utils/statusColor';
	import type { Workload } from '$lib/types';
	import WorkloadContainer from './WorkloadContainer.svelte';

	export let workload: Workload;

	let readyReplicas = workload?.status?.readyReplicas || '0';
	let replicas = workload?.spec?.replicas !== undefined ? workload?.spec.replicas : '?';
	let backgroundColor = `bg-${getStatusColor(
		workload?.status?.readyReplicas || 0,
		workload?.spec?.replicas
	)}-100-800-token`;
</script>

{#if workload}
	<div class={'card card-hover p-1 ' + backgroundColor}>
		<header class="flex flex-col">
			<div class="flex items-center">
				<span class="grow text-lg text-center">{workload.metadata?.name || '?'}</span>
				<span class="text-xs">{readyReplicas}/{replicas}</span>
			</div>
			<div class="flex justify-center">
				<span class="text-xs">{workload.metadata?.namespace}</span>
			</div>
		</header>
		<section>
			<div class="flex">
				{#if workload.spec?.template?.spec?.containers?.length}
					{#each workload.spec?.template?.spec?.containers as container}
						<WorkloadContainer {container} />
					{/each}
				{/if}
			</div>
		</section>
	</div>
{/if}
