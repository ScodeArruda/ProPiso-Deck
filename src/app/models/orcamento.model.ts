// src/app/models/orcamento.model.ts

export interface ItemOrcamento {
    materialId: string;
    nome: string;
    unidade: string;
    quantidade: number;
    // Novos campos para a sua lógica de negócio:
    inclusoNoValor: boolean; // true = Você compra (soma no total), false = Cliente compra
    precoUnitario: number;   // Você digita na hora do orçamento
    subtotal: number;
}

export interface Orcamento {
    id?: string;
    cliente: string;
    descricaoServico: string;
    areaM2: number;
    itens: ItemOrcamento[];
    valorMaoDeObra: number;
    valorMateriais: number;
    valorTotal: number;
    
    // Novos campos
    observacoes: string;
    termoAceite: string;
    validade: Date;
    
    dataCriacao: Date;
}