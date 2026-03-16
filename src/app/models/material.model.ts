export interface Material {
    id?: string;
    nome: string;
    categoria: 'madeira' | 'ferragem' | 'quimico';
    unidade: 'm2' | 'kg' | 'un' | 'litro';
    rendimentoPorM2: number; // Ex: 0.5 (meio quilo por m2)
    perdaPadrao: number;     // Ex: 10 (para 10%)
}