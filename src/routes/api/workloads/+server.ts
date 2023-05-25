import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import k8s from '@kubernetes/client-node';
import { decodeKubeConfigFromUrl } from '../decodeKubeConfig';

export const GET: RequestHandler = async ({ url }) => {
	const kubeConfig = decodeKubeConfigFromUrl(url);
	const namespaces = url.searchParams
		.get('namespaces')
		?.split(',')
		.filter((s) => s?.length > 0);
	if (!kubeConfig || !namespaces || namespaces.length === 0) {
		return json([]);
	}

	const appsV1Api = kubeConfig.makeApiClient(k8s.AppsV1Api);
	const deploymentResponses = await Promise.all(
		namespaces.map((namespace) => appsV1Api.listNamespacedDeployment(namespace))
	);
	const statefulSetResponses = await Promise.all(
		namespaces.map((namespace) => appsV1Api.listNamespacedStatefulSet(namespace))
	);

	return json([
		...deploymentResponses.flatMap((response) => response.body.items),
		...statefulSetResponses.flatMap((response) => response.body.items)
	]);
};
