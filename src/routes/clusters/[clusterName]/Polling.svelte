<script lang="ts">
	import { ProgressRadial, RangeSlider } from '@skeletonlabs/skeleton';
	import ErrorBadge from '$lib/components/atoms/ErrorBadge.svelte';

	export let timeoutInSeconds: number;
	export let error: Error | undefined;
	export let pollingInProgress = false;
</script>

<div class="flex items-center gap-2">
	<div>Polling interval in</div>
	<div>
		<RangeSlider
			name="range-slider"
			accent="filled-secondary-300"
			bind:value={timeoutInSeconds}
			max={60}
			min={1}
			step={1}
		/>
	</div>
	<div>{timeoutInSeconds}s</div>
	{#if error}
		<ErrorBadge>error</ErrorBadge>
	{/if}
	{#if pollingInProgress}
		<ProgressRadial width="w-6" />
	{/if}
</div>
