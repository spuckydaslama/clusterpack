<script lang="ts">
	export let length = 0;
</script>

{#each [...Array(Math.floor((2 + Math.random() * 3) * length)).keys()] as item (item)}
	<div class="badge variant-filled-surface animate-pulse p-1.5 mx-0.5" />
{/each}
