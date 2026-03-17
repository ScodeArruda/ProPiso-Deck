import { Injectable } from '@angular/core';
import { Material } from '../models/material.model';
import { ItemOrcamento } from '../models/orcamento.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {

    // Agora recebe apenas os materiais que você selecionou para este orçamento
    inicializarItens(materiaisSelecionados: Material[]): ItemOrcamento[] {
        return materiaisSelecionados.map(m => {
            return {
                materialId: m.id!,
                nome: m.nome,
                unidade: m.unidade,
                
                // Inicializa zerado. A quantidade será definida pelo usuário na UI.
                quantidade: 0, 
                
                inclusoNoValor: false,
                precoUnitario: 0,
                subtotal: 0
            };
        });
    }

    // Método utilitário para chamar sempre que a quantidade ou preço mudarem na tela
    calcularSubtotalItem(item: ItemOrcamento): number {
        // Se a quantidade ou preço não existirem, o subtotal é 0
        if (!item.quantidade || !item.precoUnitario) {
            return 0;
        }
        
        // Se a regra de negócio dita que itens "inclusos" não somam no valor final
        // cobrado à parte, você pode retornar 0 aqui também, ou calcular normalmente 
        // e tratar isso no totalizador geral.
        return item.quantidade * item.precoUnitario;
    }
    
    // Calcula o valor total apenas dos materiais (útil para o rodapé do orçamento)
    calcularTotalMateriais(itens: ItemOrcamento[]): number {
        return itens.reduce((total, item) => total + this.calcularSubtotalItem(item), 0);
    }
}