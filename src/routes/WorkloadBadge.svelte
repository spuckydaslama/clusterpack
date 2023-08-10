<script lang="ts">
	import { getStatusColor } from '$lib/utils/statusColor.js';
	import type { Workload } from '$lib/types';

	export let workload: Workload;
	$: workloadStatus = getStatusColor(workload?.status?.readyReplicas || 0, workload?.spec?.replicas);
</script>

{#if workload}
	<div
		class:variant-filled-error={workloadStatus === 'error'}
		class:variant-filled-success={workloadStatus === 'success'}
		class:variant-filled-surface={workloadStatus === 'surface'}
		class:variant-filled-warning={workloadStatus === 'warning'}
		class="badge p-2 mx-0.5"

	/>
{/if}
