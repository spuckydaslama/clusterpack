import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import k8s from '@kubernetes/client-node';

export const POST: RequestHandler = async ({ request }) => {
	const kubeConfig = new k8s.KubeConfig();
	kubeConfig.loadFromString(await request.text());

	return json({ cluster: kubeConfig.getCurrentCluster(), user: kubeConfig.getCurrentUser() });
};
