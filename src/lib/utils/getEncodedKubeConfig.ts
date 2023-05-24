import { kubeConfigStore } from '$lib/stores';
import { get } from 'svelte/store';

export const getEncodedKubeConfig = (clusterName: string, encoder: (data: string) => string) => {
	return encoder(JSON.stringify(get(kubeConfigStore)[clusterName]));
};
