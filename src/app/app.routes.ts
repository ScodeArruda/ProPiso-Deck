import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ListaOrcamentosComponent } from './features/listagem-orcamento/lista-orcamentos.component';
import { MateriaisComponent } from './features/materiais/materiais.component';
import { OrcamentosComponent } from './features/orcamentos/orcamentos.component';
import { VisualizarOrcamentoComponent } from './features/visualizar-orcamento/visualizar-orcamento.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redireciona a raiz para o login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rotas Protegidas (adicionamos o canActivate: [authGuard] em todas)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'novo-orcamento', component: OrcamentosComponent, canActivate: [authGuard] },
  { path: 'lista-orcamentos', component: ListaOrcamentosComponent, canActivate: [authGuard] },
  { path: 'materiais', component: MateriaisComponent, canActivate: [authGuard] },
  { path: 'orcamento/:id', component: VisualizarOrcamentoComponent, canActivate: [authGuard] }
];