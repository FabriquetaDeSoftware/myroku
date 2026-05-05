import { Application, Container, Deployment, EnvVar, GithubRepo } from './types';

/**
 * Dados de exemplo para o Sprint 2. Substituir por chamadas reais à API
 * conforme o backend Go for entregando endpoints (scratch.md §6).
 */
export const APPS_FIXTURE: Application[] = [
  {
    id: '01HABCDE0001',
    name: 'my-api',
    repoFullName: 'czarfbc/my-api',
    branch: 'main',
    buildType: 'dockerfile',
    status: 'running',
    autoDeploy: true,
    lastDeploymentId: 'dep_42',
    lastDeploymentStatus: 'success',
    lastDeploymentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    commitSha: 'a1b2c3d',
    commitMessage: 'fix: ajusta header de auth no proxy',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: '01HABCDE0002',
    name: 'dashboard',
    repoFullName: 'czarfbc/dashboard',
    branch: 'main',
    buildType: 'dockerfile',
    status: 'running',
    autoDeploy: true,
    lastDeploymentId: 'dep_18',
    lastDeploymentStatus: 'success',
    lastDeploymentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    commitSha: '9f8e7d6',
    commitMessage: 'feat: nova rota de relatórios',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: '01HABCDE0003',
    name: 'worker',
    repoFullName: 'czarfbc/worker',
    branch: 'main',
    buildType: 'compose',
    status: 'failed',
    autoDeploy: true,
    lastDeploymentId: 'dep_07',
    lastDeploymentStatus: 'failed',
    lastDeploymentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    commitSha: '5c4b3a2',
    commitMessage: 'refactor: extrai fila para módulo separado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: '01HABCDE0004',
    name: 'docs',
    repoFullName: 'czarfbc/docs',
    branch: 'main',
    buildType: 'dockerfile',
    status: 'stopped',
    autoDeploy: false,
    lastDeploymentId: 'dep_03',
    lastDeploymentStatus: 'success',
    lastDeploymentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    commitSha: '1a2b3c4',
    commitMessage: 'chore: atualiza dependências',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

export const GITHUB_REPOS_FIXTURE: GithubRepo[] = [
  {
    fullName: 'czarfbc/my-api',
    defaultBranch: 'main',
    branches: ['main', 'develop', 'staging'],
    hasDockerfile: true,
    hasCompose: false,
    description: 'API principal em Go.',
  },
  {
    fullName: 'czarfbc/dashboard',
    defaultBranch: 'main',
    branches: ['main'],
    hasDockerfile: true,
    hasCompose: false,
    description: 'Painel administrativo em Angular.',
  },
  {
    fullName: 'czarfbc/worker',
    defaultBranch: 'main',
    branches: ['main', 'staging'],
    hasDockerfile: false,
    hasCompose: true,
    description: 'Worker de processamento assíncrono.',
  },
  {
    fullName: 'czarfbc/notifier',
    defaultBranch: 'main',
    branches: ['main'],
    hasDockerfile: true,
    hasCompose: true,
    description: 'Serviço de notificações.',
  },
];

export const CONTAINERS_FIXTURE: Container[] = [
  {
    id: '7a3f9e1b2c',
    appId: '01HABCDE0001',
    name: 'my-api-prod',
    image: 'my-api:deploy-42',
    status: 'running',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '5c4b3a2e1d',
    appId: '01HABCDE0002',
    name: 'dashboard-prod',
    image: 'dashboard:deploy-18',
    status: 'running',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '9f8e7d6c5b',
    appId: '01HABCDE0003',
    name: 'worker-prod',
    image: 'worker:deploy-07',
    status: 'failed',
    startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '4a5b6c7d8e',
    name: 'postgres-myroku',
    image: 'postgres:16-alpine',
    status: 'running',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '8e7d6c5b4a',
    appId: '01HABCDE0004',
    name: 'docs-prod',
    image: 'docs:deploy-03',
    status: 'stopped',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

export const DEPLOYMENTS_FIXTURE: Record<string, Deployment[]> = {
  '01HABCDE0001': [
    {
      id: 'dep_42',
      appId: '01HABCDE0001',
      trigger: 'webhook',
      commitSha: 'a1b2c3d',
      commitMessage: 'fix: ajusta header de auth no proxy',
      status: 'success',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      finishedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 2 + 1000 * 32,
      ).toISOString(),
      durationMs: 32000,
    },
    {
      id: 'dep_41',
      appId: '01HABCDE0001',
      trigger: 'webhook',
      commitSha: '9f8e7d6',
      commitMessage: 'feat: adiciona endpoint /metrics',
      status: 'success',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      finishedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 + 1000 * 28,
      ).toISOString(),
      durationMs: 28000,
    },
    {
      id: 'dep_40',
      appId: '01HABCDE0001',
      trigger: 'manual',
      commitSha: '5c4b3a2',
      commitMessage: 'refactor: simplifica módulo de auth',
      status: 'failed',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      finishedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 48 + 1000 * 18,
      ).toISOString(),
      durationMs: 18000,
      errorMessage: 'docker build failed: exit code 1',
    },
    {
      id: 'dep_39',
      appId: '01HABCDE0001',
      trigger: 'webhook',
      commitSha: '1a2b3c4',
      commitMessage: 'chore: atualiza dependências',
      status: 'success',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      finishedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 72 + 1000 * 30,
      ).toISOString(),
      durationMs: 30000,
    },
  ],
  '01HABCDE0002': [
    {
      id: 'dep_18',
      appId: '01HABCDE0002',
      trigger: 'webhook',
      commitSha: '9f8e7d6',
      commitMessage: 'feat: nova rota de relatórios',
      status: 'success',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      finishedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 + 1000 * 22,
      ).toISOString(),
      durationMs: 22000,
    },
  ],
  '01HABCDE0003': [
    {
      id: 'dep_07',
      appId: '01HABCDE0003',
      trigger: 'webhook',
      commitSha: '5c4b3a2',
      commitMessage: 'refactor: extrai fila para módulo separado',
      status: 'failed',
      startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      finishedAt: new Date(
        Date.now() - 1000 * 60 * 5 + 1000 * 12,
      ).toISOString(),
      durationMs: 12000,
      errorMessage: 'health check timeout after 30s',
    },
  ],
  '01HABCDE0004': [],
};

export const ENV_VARS_FIXTURE: Record<string, EnvVar[]> = {
  '01HABCDE0001': [
    { key: 'PORT', value: '8080', isSecret: false },
    { key: 'DB_HOST', value: 'postgres.local', isSecret: false },
    { key: 'DB_PASSWORD', value: 'super-secret-value', isSecret: true },
    { key: 'JWT_SECRET', value: 'jwt-secret-here', isSecret: true },
  ],
  '01HABCDE0002': [
    { key: 'API_URL', value: 'http://my-api.local', isSecret: false },
  ],
  '01HABCDE0003': [
    { key: 'REDIS_URL', value: 'redis://redis.local:6379', isSecret: false },
  ],
  '01HABCDE0004': [],
};
