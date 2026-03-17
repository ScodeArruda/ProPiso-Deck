import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask'; // Importe o Pipe para usar no HTML
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento.service';

@Component({
    selector: 'app-lista-orcamentos',
    standalone: true,
    // Note a importação do NgxMaskPipe aqui para formatar o telefone na tabela
    imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, RouterModule],
    templateUrl: './lista-orcamentos.component.html',
    styleUrls: ['./lista-orcamentos.component.scss']
})
export class ListaOrcamentosComponent implements OnInit {
    private fb = inject(FormBuilder);
    private orcamentoService = inject(OrcamentoService);

    filtroForm!: FormGroup;

    // Guarda a lista original intocada do banco
    todosOrcamentos: Orcamento[] = [];
    // Guarda a lista que vai ser renderizada na tela (após os filtros)
    orcamentosFiltrados: Orcamento[] = [];

    ngOnInit(): void {
        this.initForm();
        this.carregarOrcamentos();

        // Escuta qualquer digitação nos filtros e re-aplica a busca instantaneamente
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
            // Mapeia os dados do Firebase garantindo que as datas venham no formato Date correto
            this.todosOrcamentos = dados.map(orc => {
                return {
                    ...orc,
                    // O Firebase usa "Timestamp". Se existir o método toDate(), executamos.
                    dataCriacao: (orc.dataCriacao as any)?.toDate ? (orc.dataCriacao as any).toDate() : new Date(orc.dataCriacao),
                    validade: (orc.validade as any)?.toDate ? (orc.validade as any).toDate() : new Date(orc.validade),
                };
            });

            // Assim que a lista carregar, aplica os filtros (se a pessoa já tiver digitado algo)
            this.aplicarFiltros();
        });
    }

    aplicarFiltros() {
        const filtros = this.filtroForm.value;

        this.orcamentosFiltrados = this.todosOrcamentos.filter(orc => {

            // 1. Filtro por Número (Ignora maiúscula/minúscula)
            const matchNumero = !filtros.numero ||
                orc.numeroOrcamento.toLowerCase().includes(filtros.numero.toLowerCase());

            // 2. Filtro por Cliente
            const matchCliente = !filtros.cliente ||
                orc.cliente.toLowerCase().includes(filtros.cliente.toLowerCase());

            // 3. Filtro por Telefone (Remove a formatação para comparar só os números)
            const telBusca = filtros.telefone?.replace(/\D/g, '') || '';
            const telOrcamento = orc.telefone?.replace(/\D/g, '') || '';
            const matchTelefone = !telBusca || telOrcamento.includes(telBusca);

            // 4. Filtro por Data exata
            let matchData = true;
            if (filtros.data) {
                const dataBusca = new Date(filtros.data).toISOString().split('T')[0];
                const dataOrcamento = orc.dataCriacao.toISOString().split('T')[0];
                matchData = dataBusca === dataOrcamento;
            }

            // O orçamento só aparece se passar em TODAS as validações digitadas
            return matchNumero && matchCliente && matchTelefone && matchData;
        });
    }

    // Regra de Negócio: Verifica se a data de validade é hoje ou no futuro
    verificarStatus(dataValidade: Date): boolean {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera as horas para a comparação focar só no dia
        return dataValidade >= hoje;
    }

    async excluirOrcamento(id: string | undefined) {
        if (!id) return;

        if (confirm('Atenção: Tem certeza que deseja excluir permanentemente este orçamento?')) {
            try {
                await this.orcamentoService.deleteOrcamento(id);
                // A atualização da tela é automática porque estamos "inscritos" no Observable do Firebase!
            } catch (error) {
                console.error('Erro ao excluir:', error);
                alert('Ocorreu um erro ao excluir.');
            }
        }
    }
}