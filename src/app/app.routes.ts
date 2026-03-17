import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ListaOrcamentosComponent } from './features/listagem-orcamento/lista-orcamentos.component';
import { MateriaisComponent } from './features/materiais/materiais.component';
import { OrcamentosComponent } from './features/orcamentos/orcamentos.component';
import { VisualizarOrcamentoComponent } from './features/visualizar-orcamento/visualizar-orcamento.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'novo-orcamento', component: OrcamentosComponent },
    { path: 'lista-orcamentos', component: ListaOrcamentosComponent },
    { path: 'materiais', component: MateriaisComponent },
    { path: 'orcamento/:id', component: VisualizarOrcamentoComponent }
  ];