import { localStorageStore } from '@skeletonlabs/skeleton';
import type { KCKubeConfig, SelectedNamespacesPerCluster } from '$lib/types';

export const kubeConfigStore = localStorageStore<{ [key: string]: KCKubeConfig }>('kubeConfig', {});

export const recentlySelectedNamespaces = localStorageStore<SelectedNamespacesPerCluster>(
	'recentlySelectedNamespaces',
	{}
);
