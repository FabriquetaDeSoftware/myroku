import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
    title: 'Dashboard · Myroku',
  },
  {
    path: 'apps',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/apps/apps-list.page').then((m) => m.AppsListPage),
        title: 'Aplicações · Myroku',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/apps/new/new-app-wizard.page').then(
            (m) => m.NewAppWizardPage,
          ),
        title: 'Nova aplicação · Myroku',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/apps/detail/app-detail.page').then(
            (m) => m.AppDetailPage,
          ),
      },
      {
        path: ':id/deployments/:depId',
        loadComponent: () =>
          import(
            './features/deployments/detail/deploy-detail.page'
          ).then((m) => m.DeployDetailPage),
        title: 'Deploy · Myroku',
      },
    ],
  },
  {
    path: 'containers',
    loadComponent: () =>
      import('./features/containers/containers-list.page').then(
        (m) => m.ContainersListPage,
      ),
    title: 'Containers · Myroku',
  },
  {
    path: 'images',
    loadComponent: () =>
      import('./features/images/images-list.page').then(
        (m) => m.ImagesListPage,
      ),
    title: 'Imagens · Myroku',
  },
  {
    path: 'settings',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'system' },
      {
        path: 'system',
        loadComponent: () =>
          import('./features/settings/system/system.page').then(
            (m) => m.SystemPage,
          ),
        title: 'Sistema · Myroku',
      },
      {
        path: 'github',
        loadComponent: () =>
          import('./features/settings/github/github.page').then(
            (m) => m.SettingsGithubPage,
          ),
        title: 'GitHub · Myroku',
      },
      {
        path: 'server',
        loadComponent: () =>
          import('./features/settings/server/server.page').then(
            (m) => m.SettingsServerPage,
          ),
        title: 'Servidor · Myroku',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
