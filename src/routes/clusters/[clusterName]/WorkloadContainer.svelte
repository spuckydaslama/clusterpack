<script lang="ts">
	import type { WorkloadContainer } from '$lib/types';

	export let container: WorkloadContainer;
</script>

{#if container}
	<span
		title={(container.image && container.image.split(':')[0]) || '?'}
		class="bold text-sm text-orange-500 after:content-['|'] last:after:content-['']"
	>
		{(container.image && container.image.split(':')[1]) || '?'}
	</span>
{/if}
