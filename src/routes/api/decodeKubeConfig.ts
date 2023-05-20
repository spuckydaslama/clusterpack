import k8s from '@kubernetes/client-node';

export const decodeKubeConfigFromUrl = (url: URL) => {
	const kubeConfigParam = url.searchParams.get('kubeConfig');
	if (!kubeConfigParam) {
		return null;
	}
	const clusterAndUserConfig = JSON.parse(Buffer.from(kubeConfigParam, 'base64').toString());
	const kubeConfig = new k8s.KubeConfig();
	kubeConfig.loadFromClusterAndUser(clusterAndUserConfig.cluster, clusterAndUserConfig.user);
	return kubeConfig;
};
