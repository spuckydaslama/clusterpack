import { localStorageStore } from '@skeletonlabs/skeleton';
import type { KCKubeConfig } from '$lib/types';

export const kubeConfigStore = localStorageStore<{ [key: string]: KCKubeConfig }>('kubeConfig', {});
