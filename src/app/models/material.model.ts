export interface Material {
    id?: string;
    nome: string;
    categoria: 'madeira' | 'ferragem' | 'quimico';
    unidade: 'm2' | 'kg' | 'un' | 'litro';
}