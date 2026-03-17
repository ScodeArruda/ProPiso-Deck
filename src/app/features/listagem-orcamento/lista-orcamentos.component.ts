import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento.service';

@Component({
    selector: 'app-lista-orcamentos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, RouterModule],
    templateUrl: './lista-orcamentos.component.html',
    styleUrls: ['./lista-orcamentos.component.scss']
})
export class ListaOrcamentosComponent implements OnInit {
    private fb = inject(FormBuilder);
    private orcamentoService = inject(OrcamentoService);

    filtroForm!: FormGroup;

    todosOrcamentos: Orcamento[] = [];
    orcamentosFiltrados: Orcamento[] = [];

    ngOnInit(): void {
        this.initForm();
        this.carregarOrcamentos();

        this.filtroForm.valueChanges.subscribe(() => {
            this.aplicarFiltros();
        });
    }

    private initForm(): void {
        this.filtroForm = this.fb.group({
            numero: [''],
            cliente: [''],
            telefone: [''],
            data: ['']
        });
    }

    private carregarOrcamentos() {
        this.orcamentoService.getOrcamentos().subscribe(dados => {
            this.todosOrcamentos = dados.map(orc => {
                return {
                    ...orc,
                    dataCriacao: (orc.dataCriacao as any)?.toDate ? (orc.dataCriacao as any).toDate() : new Date(orc.dataCriacao),
                    validade: (orc.validade as any)?.toDate ? (orc.validade as any).toDate() : new Date(orc.validade),
                };
            });
            this.aplicarFiltros();
        });
    }

    aplicarFiltros() {
        const filtros = this.filtroForm.value;

        this.orcamentosFiltrados = this.todosOrcamentos.filter(orc => {
            // REGRA NOVA: Esconde orçamentos excluídos da visão principal (eles continuam existindo no banco para a Dashboard)
            const statusAtual = orc.status || 'pendente';
            if (statusAtual === 'excluido') return false;

            const matchNumero = !filtros.numero || orc.numeroOrcamento.toLowerCase().includes(filtros.numero.toLowerCase());
            const matchCliente = !filtros.cliente || orc.cliente.toLowerCase().includes(filtros.cliente.toLowerCase());
            const telBusca = filtros.telefone?.replace(/\D/g, '') || '';
            const telOrcamento = orc.telefone?.replace(/\D/g, '') || '';
            const matchTelefone = !telBusca || telOrcamento.includes(telBusca);

            let matchData = true;
            if (filtros.data) {
                const dataBusca = new Date(filtros.data).toISOString().split('T')[0];
                const dataOrcamento = orc.dataCriacao.toISOString().split('T')[0];
                matchData = dataBusca === dataOrcamento;
            }

            return matchNumero && matchCliente && matchTelefone && matchData;
        });
    }

    // --- MÉTODOS DE STATUS E UI ---

    verificarSeEstaNoPrazo(dataValidade: Date): boolean {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return dataValidade >= hoje;
    }

    getBadgeClass(orc: Orcamento): string {
        const status = orc.status || 'pendente';
        if (status === 'aprovado') return 'badge-success';
        if (status === 'rejeitado') return 'badge-danger';

        // Se for pendente, verifica o prazo
        return this.verificarSeEstaNoPrazo(orc.validade) ? 'badge-warning' : 'badge-dark';
    }

    getStatusLabel(orc: Orcamento): string {
        const status = orc.status || 'pendente';
        if (status === 'aprovado') return 'Aprovado';
        if (status === 'rejeitado') return 'Rejeitado';

        return this.verificarSeEstaNoPrazo(orc.validade) ? 'Pendente' : 'Expirado';
    }

    // --- AÇÕES DO USUÁRIO ---

    async alterarStatus(id: string | undefined, novoStatus: 'aprovado' | 'rejeitado' | 'excluido') {
        if (!id) return;

        let mensagem = '';
        if (novoStatus === 'aprovado') mensagem = 'O cliente aceitou a proposta? Marcar como APROVADO?';
        if (novoStatus === 'rejeitado') mensagem = 'Marcar esta proposta como REJEITADA?';
        if (novoStatus === 'excluido') mensagem = 'Tem certeza que deseja mover este orçamento para a LIXEIRA?';

        if (confirm(mensagem)) {
            try {
                // Atualiza apenas o campo 'status' no Firebase
                await this.orcamentoService.updateOrcamento(id, { status: novoStatus });
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                alert('Erro ao processar a ação.');
            }
        }
    }
}