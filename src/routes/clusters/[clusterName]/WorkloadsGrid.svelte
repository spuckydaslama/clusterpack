<script lang="ts">
	import type { Workload } from '$lib/types';
	import WorkloadCard from './WorkloadCard.svelte';
	export let workloads: Workload[];
</script>

<div
	class="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min gap-4 mx-4"
>
	{#each workloads as workload}
		<WorkloadCard {workload} />
	{/each}
</div>
