import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { Orcamento } from '../../models/orcamento.model';
import { AlertService } from '../../services/alert.service'; // NOVO: Importando o serviço
import { OrcamentoService } from '../../services/orcamento.service';

@Component({
    selector: 'app-visualizar-orcamento',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './visualizar-orcamento.component.html',
    styleUrls: ['./visualizar-orcamento.component.scss']
})
export class VisualizarOrcamentoComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private orcamentoService = inject(OrcamentoService);
    private router = inject(Router);
    private alertService = inject(AlertService); // NOVO: Injetando o serviço

    orcamento$!: Observable<Orcamento>;

    ngOnInit() {
        this.orcamento$ = this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.router.navigate(['/lista-orcamentos']);
                    return [];
                }

                return this.orcamentoService.getOrcamentoById(id).pipe(
                    map(orcamento => {
                        // NOVO: Tratamento caso o documento não exista mais no banco
                        if (!orcamento) {
                            this.alertService.erro('Este orçamento não foi encontrado ou já foi excluído.', 'Ops!');
                            this.router.navigate(['/lista-orcamentos']);
                            return orcamento as any; // Cast para satisfazer a tipagem
                        }

                        return {
                            ...orcamento,
                            dataCriacao: (orcamento.dataCriacao as any)?.toDate ? (orcamento.dataCriacao as any).toDate() : new Date(orcamento.dataCriacao),
                            validade: (orcamento.validade as any)?.toDate ? (orcamento.validade as any).toDate() : new Date(orcamento.validade),
                        };
                    })
                );
            })
        );
    }

    imprimir() {
        // NOVO: Feedback visual antes de abrir a tela de impressão
        this.alertService.toast('Preparando documento...', 'info');

        // Um pequeno atraso (meio segundo) só para o Toast ter tempo de aparecer na tela
        setTimeout(() => {
            window.print();
        }, 500);
    }

    enviarWhatsApp(orcamento: Orcamento) {
        const telefoneLimpo = orcamento.telefone?.replace(/\D/g, '');

        // NOVO: Validação de segurança
        if (!telefoneLimpo) {
            this.alertService.erro('O cliente não possui um número de telefone válido cadastrado.');
            return;
        }

        const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const valor = formatadorMoeda.format(orcamento.valorTotal);

        const mensagem = `Olá ${orcamento.cliente}, tudo bem? Segue a proposta comercial *${orcamento.numeroOrcamento}* da *Arruda Pisos de Madeira*. O valor total estimado é de *${valor}*. Fico à disposição para qualquer dúvida!`;

        const url = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`;

        this.alertService.toast('Abrindo o WhatsApp...', 'success');
        window.open(url, '_blank');
    }

    enviarEmail(orcamento: Orcamento) {
        const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const valor = formatadorMoeda.format(orcamento.valorTotal);

        const assunto = `Orçamento ${orcamento.numeroOrcamento} - Arruda Pisos de Madeira`;
        const mensagem = `Olá ${orcamento.cliente},\n\nSegue os detalhes do orçamento referente à área de ${orcamento.areaM2}m².\n\nValor Total: ${valor}\n\nGuarde o arquivo PDF em anexo gerado pelo sistema para o seu registro.\n\nAtenciosamente,\nArruda Pisos de Madeira e Decks`;

        const url = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;

        this.alertService.toast('Abrindo cliente de E-mail...', 'success');
        window.open(url, '_blank');
    }

    voltar() {
        this.router.navigate(['/lista-orcamentos']);
    }
}