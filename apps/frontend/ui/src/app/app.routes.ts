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
