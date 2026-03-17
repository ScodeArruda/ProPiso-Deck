import { Routes } from '@angular/router';
import { ListaOrcamentosComponent } from './features/listagem-orcamento/lista-orcamentos.component';
import { MateriaisComponent } from './features/materiais/materiais.component';
import { OrcamentosComponent } from './features/orcamentos/orcamentos.component';
import { VisualizarOrcamentoComponent } from './features/visualizar-orcamento/visualizar-orcamento.component';

export const routes: Routes = [
    { path: 'materiais', component: MateriaisComponent },
    { path: '', redirectTo: 'materiais', pathMatch: 'full' },
    { path: 'novo-orcamento', component: OrcamentosComponent },
    { path: 'lista-orcamentos', component: ListaOrcamentosComponent },
    {
        path: 'orcamento/:id',
        component: VisualizarOrcamentoComponent
    }
];