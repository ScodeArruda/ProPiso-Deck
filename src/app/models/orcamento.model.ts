export interface ItemOrcamento {
    materialId: string;
    nome: string;
    unidade: string;
    quantidade: number;
    inclusoNoValor: boolean;
    precoUnitario: number;
    subtotal: number;
}

export interface Orcamento {
    id?: string;
    numeroOrcamento: string;
    cliente: string;
    telefone: string;
    descricaoServico: string;
    areaM2: number;
    itens: ItemOrcamento[];
    valorMaoDeObra: number;
    valorMateriais: number;
    valorTotal: number;
    observacoes: string;
    termoAceite: string;
    validade: Date;
    dataCriacao: Date;

    // NOVO: Controle de status do orçamento
    // 'pendente' é o padrão quando nasce. 
    status?: 'pendente' | 'aprovado' | 'rejeitado' | 'excluido';
}