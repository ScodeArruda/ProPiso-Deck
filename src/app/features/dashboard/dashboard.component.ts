import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Orcamento } from '../../models/orcamento.model';
import { OrcamentoService } from '../../services/orcamento.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    private orcamentoService = inject(OrcamentoService);

    // Métricas de Quantidade
    qtdTotal = 0;
    qtdAprovados = 0;
    qtdRejeitados = 0;
    qtdExcluidos = 0;

    // Métricas de Pendentes (subdivididos por prazo)
    qtdPendentesNoPrazo = 0;
    qtdPendentesExpirados = 0;

    // Métricas Financeiras
    valorTotalAprovado = 0;
    valorTotalPendente = 0;

    ngOnInit(): void {
        this.orcamentoService.getOrcamentos().subscribe(dados => {
            this.calcularMetricas(dados);
        });
    }

    private calcularMetricas(orcamentos: Orcamento[]) {
        // Zera tudo antes de recalcular
        this.qtdTotal = 0;
        this.qtdAprovados = 0;
        this.qtdRejeitados = 0;
        this.qtdExcluidos = 0;
        this.qtdPendentesNoPrazo = 0;
        this.qtdPendentesExpirados = 0;
        this.valorTotalAprovado = 0;
        this.valorTotalPendente = 0;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        orcamentos.forEach(orc => {
            // Converte a data de validade se vier do Firebase como Timestamp
            const validade = (orc.validade as any)?.toDate ? (orc.validade as any).toDate() : new Date(orc.validade);

            // Assume 'pendente' se o orçamento for antigo e não tiver status
            const statusAtual = orc.status || 'pendente';

            // Conta o total (ignorando os excluídos permanentemente da contagem ativa)
            if (statusAtual !== 'excluido') {
                this.qtdTotal++;
            }

            switch (statusAtual) {
                case 'aprovado':
                    this.qtdAprovados++;
                    this.valorTotalAprovado += orc.valorTotal;
                    break;

                case 'rejeitado':
                    this.qtdRejeitados++;
                    break;

                case 'excluido':
                    this.qtdExcluidos++;
                    break;

                case 'pendente':
                    // Se está pendente, soma no dinheiro que "pode" entrar
                    this.valorTotalPendente += orc.valorTotal;

                    // Verifica se está no prazo ou expirado
                    if (validade >= hoje) {
                        this.qtdPendentesNoPrazo++;
                    } else {
                        this.qtdPendentesExpirados++;
                    }
                    break;
            }
        });
    }
}