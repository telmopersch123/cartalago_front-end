import { Routes } from '@angular/router';
import { protetorGuard } from './Guards/Protetor.guard';
// Função para carregar o formulário
const loadFormulario = () =>
  import('./components/formulario/formulario').then(
    (m) => m.FormularioComponent,
  );
// Função para carregar o CRUD
const loadCrud = () => import('./components/crud/crud').then((m) => m.Crud);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'produtos',
  },
  {
    path: 'produtos',
    loadComponent: loadCrud,
  },
  {
    path: 'form',

    children: [
      {
        path: '',
        loadComponent: loadFormulario,
        canDeactivate: [protetorGuard],
      },
      {
        path: ':id',
        loadComponent: loadFormulario,
        canDeactivate: [protetorGuard],
      },
    ],
  },
  {
    path: '**',
    loadComponent: loadCrud,
  },
];
