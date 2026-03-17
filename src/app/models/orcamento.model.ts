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
    id?: string;                 // ID gerado pelo Firebase (ex: sxZj1m0...)
    numeroOrcamento: string;     // NOVO: ID amigável gerado por nós (ex: ORC-20260317-1234)
    cliente: string;
    telefone: string;            // NOVO: Contato do cliente
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
}