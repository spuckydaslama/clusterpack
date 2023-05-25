<script lang="ts">
	import { getStatusColor } from '$lib/utils/statusColor.js';
	import type { Workload } from '$lib/types';

	export let workload: Workload;
	let status = getStatusColor(workload?.status?.readyReplicas || 0, workload?.spec?.replicas);
</script>

{#if workload}
	<div
		class:variant-filled-error={status === 'error'}
		class:variant-filled-success={status === 'success'}
		class:variant-filled-surface={status === 'surface'}
		class:variant-filled-warning={status === 'warning'}
		class="badge p-2 mx-0.5"
	/>
{/if}
