export type ContainerStatus = 'running' | 'stopped' | 'failed' | 'pending';

export type DeploymentStatus =
  | 'queued'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failed'
  | 'rolled_back';

export type BuildType = 'dockerfile' | 'compose';

export interface Application {
  id: string;
  name: string;
  repoFullName: string;
  branch: string;
  buildType: BuildType;
  status: ContainerStatus;
  autoDeploy: boolean;
  lastDeploymentId?: string;
  lastDeploymentStatus?: DeploymentStatus;
  lastDeploymentAt?: string; // ISO
  commitSha?: string;
  commitMessage?: string;
  createdAt: string;
}

export interface Container {
  id: string;
  appId?: string;
  name: string;
  image: string;
  status: ContainerStatus;
  startedAt?: string;
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

export interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface GithubRepo {
  fullName: string;
  defaultBranch: string;
  branches: string[];
  hasDockerfile: boolean;
  hasCompose: boolean;
  description?: string;
}

export interface Deployment {
  id: string;
  appId: string;
  trigger: 'webhook' | 'manual' | 'initial';
  commitSha: string;
  commitMessage: string;
  status: DeploymentStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  errorMessage?: string;
}
