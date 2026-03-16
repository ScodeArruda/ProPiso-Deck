import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    query,
    updateDoc,
    where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Material } from '../models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
    private firestore = inject(Firestore);

    // 1. Referência da coleção na raiz da classe
    private materiaisCollection = collection(this.firestore, 'materiais');

    // 2. Observable instanciado na raiz (no contexto de injeção correto)
    private materiais$ = collectionData(this.materiaisCollection, { idField: 'id' }) as Observable<Material[]>;

    async addMaterial(material: Omit<Material, 'id'>): Promise<string> {
        const docRef = await addDoc(this.materiaisCollection, material);
        return docRef.id;
    }

    getMateriais(): Observable<Material[]> {
        // 3. Apenas retorna a variável que já foi inicializada perfeitamente
        return this.materiais$;
    }

    getMateriaisPorCategoria(categoria: 'madeira' | 'ferragem' | 'quimico'): Observable<Material[]> {
        const q = query(this.materiaisCollection, where('categoria', '==', categoria));
        return collectionData(q, { idField: 'id' }) as Observable<Material[]>;
    }

    getMaterialById(id: string): Observable<Material> {
        const materialRef = doc(this.firestore, `materiais/${id}`);
        return docData(materialRef, { idField: 'id' }) as Observable<Material>;
    }

    async updateMaterial(id: string, data: Partial<Material>): Promise<void> {
        const materialRef = doc(this.firestore, `materiais/${id}`);
        await updateDoc(materialRef, data);
    }

    async deleteMaterial(id: string): Promise<void> {
        const materialRef = doc(this.firestore, `materiais/${id}`);
        await deleteDoc(materialRef);
    }
}