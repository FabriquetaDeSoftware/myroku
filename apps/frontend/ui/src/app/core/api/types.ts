export type ContainerStatus = 'running' | 'stopped' | 'failed' | 'pending';

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  startedAt?: string;
  ports?: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  digest?: string;
  sizeBytes: number;
  createdAt: string;
  inUse: boolean;
  containerCount: number;
  dangling?: boolean;
}

export interface SystemDF {
  imagesSizeBytes: number;
  containersSizeBytes: number;
  volumesSizeBytes: number;
  buildCacheSizeBytes: number;
}
