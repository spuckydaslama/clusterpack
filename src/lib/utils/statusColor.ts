export type StatusColor = 'surface' | 'error' | 'warning' | 'success';
export const getStatusColor = (
	readyReplicas: number,
	replicas: number | undefined
): StatusColor => {
	if (replicas === undefined) {
		return 'surface';
	} else if (readyReplicas === 0 || replicas === 0) {
		return 'error';
	} else if (readyReplicas < replicas) {
		return 'warning';
	} else {
		return 'success';
	}
};
