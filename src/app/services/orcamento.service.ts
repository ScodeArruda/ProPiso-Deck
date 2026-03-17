import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import {
    Firestore,
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    orderBy,
    query,
    updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Orcamento } from '../models/orcamento.model';

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
    private firestore = inject(Firestore);
    // Injetamos o contexto principal do Angular
    private injector = inject(Injector);

    private orcamentosCollection = collection(this.firestore, 'orcamentos');

    async addOrcamento(orcamento: Omit<Orcamento, 'id'>): Promise<string> {
        return runInInjectionContext(this.injector, async () => {
            const docRef = await addDoc(this.orcamentosCollection, orcamento);
            return docRef.id;
        });
    }

    getOrcamentos(): Observable<Orcamento[]> {
        // Envolvemos a leitura no contexto de injeção
        return runInInjectionContext(this.injector, () => {
            const q = query(this.orcamentosCollection, orderBy('dataCriacao', 'desc'));
            return collectionData(q, { idField: 'id' }) as Observable<Orcamento[]>;
        });
    }

    getOrcamentoById(id: string): Observable<Orcamento> {
        // Envolvemos a leitura no contexto de injeção
        return runInInjectionContext(this.injector, () => {
            const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
            return docData(orcamentoRef, { idField: 'id' }) as Observable<Orcamento>;
        });
    }

    async updateOrcamento(id: string, data: Partial<Orcamento>): Promise<void> {
        return runInInjectionContext(this.injector, async () => {
            const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
            await updateDoc(orcamentoRef, data);
        });
    }

    async deleteOrcamento(id: string): Promise<void> {
        return runInInjectionContext(this.injector, async () => {
            const orcamentoRef = doc(this.firestore, `orcamentos/${id}`);
            await deleteDoc(orcamentoRef);
        });
    }
}