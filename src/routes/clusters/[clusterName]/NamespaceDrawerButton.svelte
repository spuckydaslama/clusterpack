<script lang="ts">
	import IconArrowLeftCircle from '$lib/components/atoms/icons/IconArrowLeftCircle.svelte';
	import IconArrowRightCircle from '$lib/components/atoms/icons/IconArrowRightCircle.svelte';

	export let count: number;
	export let open: boolean;
</script>

<div class="relative inline-block">
	<span class:hidden={open} class="badge-icon variant-filled-surface absolute -top-0 -right-0 z-10">
		{count}
	</span>
	<button type="button" class="btn-icon text-secondary-300-600-token" on:click>
		{#if open}
			<IconArrowLeftCircle class="w-8 h-8" />
		{:else}
			<IconArrowRightCircle class="w-8 h-8" />
		{/if}
	</button>
</div>
