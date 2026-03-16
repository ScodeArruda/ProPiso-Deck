// src/app/services/budget.service.ts

import { Injectable } from '@angular/core';
import { Material } from '../models/material.model';
import { ItemOrcamento } from '../models/orcamento.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {

    calcularItens(area: number, materiais: Material[]): ItemOrcamento[] {
        return materiais.map(m => {
            // Cálculo: Área * Rendimento * Margem de Perda
            const qtdNecessaria = area * m.rendimentoPorM2 * (1 + m.perdaPadrao / 100);

            return {
                materialId: m.id!,
                nome: m.nome,
                unidade: m.unidade, // Importante trazer para a tela (ex: kg, m2)
                quantidade: Number(qtdNecessaria.toFixed(2)),

                // Inicia zerado e desmarcado. A inteligência de cobrar ou não fica na UI.
                inclusoNoValor: false,
                precoUnitario: 0,
                subtotal: 0
            };
        });
    }
}