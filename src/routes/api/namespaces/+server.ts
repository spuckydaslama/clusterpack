import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { decodeKubeConfigFromUrl } from '../decodeKubeConfig';
import k8s from '@kubernetes/client-node';

export const GET: RequestHandler = async ({ url }) => {
	const kubeConfig = decodeKubeConfigFromUrl(url);
	if (!kubeConfig) {
		return json([]);
	}

	const coreV1Api = kubeConfig.makeApiClient(k8s.CoreV1Api);
	const namespacesResponse = await coreV1Api.listNamespace();
	const namespaces = namespacesResponse.body.items
		.map((item) => item.metadata?.name)
		.filter((name): name is string => !!name);

	return json(namespaces, { headers: { 'Cache-Control': 'max-age=300' } });
};
