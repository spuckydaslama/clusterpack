<script lang="ts">
	import { ListBox, ListBoxItem, ProgressRadial } from '@skeletonlabs/skeleton';
	import { flip } from 'svelte/animate';

	// create event dispatcher
	import { createEventDispatcher } from 'svelte';
	import type { NamespaceSelectionChangeEventDetail } from './types';
	export const dispatch = createEventDispatcher<{
		namespaceSelectionChanged: NamespaceSelectionChangeEventDetail;
	}>();

	export let namespaces: string[] = [];
	export let namespaceListBoxState: string[];
	export let fetchingInProgress = false;

	const namespaceSelectionClicked = (event: Event) => {
		const eventTarget = event.target as HTMLInputElement;
		dispatch('namespaceSelectionChanged', {
			namespace: eventTarget.value,
			selected: eventTarget.checked
		});
	};
</script>

<div class="flex justify-center">
	{#if fetchingInProgress}
		<ProgressRadial width="w-6" />
	{/if}
</div>
<ListBox multiple>
	{#each namespaces as namespace (namespace)}
		<div animate:flip={{ duration: 250 }}>
			<ListBoxItem
				on:click={namespaceSelectionClicked}
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
