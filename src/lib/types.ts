// to use the types client side I had to copy the types from @kubernetes/client-node/
export interface KCClusterType {
	readonly name: string;
	readonly caData?: string;
	caFile?: string;
	readonly server: string;
	readonly skipTLSVerify: boolean;
	readonly tlsServerName?: string;
}
export interface KCUserType {
	readonly name: string;
	readonly certData?: string;
	certFile?: string;
	readonly exec?: unknown;
	readonly keyData?: string;
	keyFile?: string;
	readonly authProvider?: unknown;
	readonly token?: string;
	readonly username?: string;
	readonly password?: string;
}

export interface KCDeploymentOrStatefulSet {
	metadata?: { name?: string; namespace?: string; uid?: string };
	status?: { readyReplicas?: number };
	spec?: { replicas?: number; template?: { spec?: { containers?: Array<{ image?: string }> } } };
}

export interface KCKubeConfig {
	cluster: KCClusterType;
	user: KCUserType;
}

export interface SelectedNamespacesPerCluster {
	[key: string]: string[];
}
