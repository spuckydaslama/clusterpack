<script lang="ts">
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import type { KCKubeConfig } from '$lib/types';
	import { kubeConfigStore } from '$lib/stores';

	let files: FileList;
	const onKubeConfigUploaded = async () => {
		if (files?.length > 0) {
			const response = await fetch('/api/kubeconfig', {
				method: 'POST',
				body: await files[0].text()
			});
			const kubeConfig = (await response.json()) as KCKubeConfig;
			if (kubeConfig.cluster?.name) {
				kubeConfigStore.update((currentValue) => ({
					...currentValue,
					[kubeConfig.cluster.name]: {
						...kubeConfig
					}
				}));
			}
		}
	};
	$: clusterNames = Object.keys($kubeConfigStore).map((key) => $kubeConfigStore[key].cluster.name);
</script>

<div class="container h-full mx-auto flex justify-center items-center gap-2">
	{#each clusterNames as clusterName}
		<a href={`/clusters/${clusterName}`} class="card card-hover p-4">
			{clusterName}
		</a>
	{/each}
	<div class="card">
		<FileDropzone padding="p-4" name="kubeConfigFile" bind:files on:change={onKubeConfigUploaded}>
			<svelte:fragment slot="message">
				<div class="flex gap-2">
					<i class="text-4xl text-secondary-400-500-token">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-6 h-6"
						>
							<path
								fill-rule="evenodd"
								d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
								clip-rule="evenodd"
							/>
						</svg>
					</i>
					Gimme your kube-configs
				</div>
			</svelte:fragment>
			<svelte:fragment slot="meta">one cluster/user per file</svelte:fragment>
		</FileDropzone>
	</div>
</div>
