export const getStatusColor = (readyReplicas: number, replicas: number | undefined): string => {
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
