import { Routes } from '@angular/router';
import { MateriaisComponent } from './features/materiais/materiais.component';
import { OrcamentosComponent } from './features/orcamentos/orcamentos.component';

export const routes: Routes = [
    { path: 'materiais', component: MateriaisComponent },
    { path: '', redirectTo: 'materiais', pathMatch: 'full' },
    { path: 'novo-orcamento', component: OrcamentosComponent },
];