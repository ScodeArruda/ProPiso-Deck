import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// NOVO: Importamos o 'map' do rxjs
import { Observable, map, switchMap } from 'rxjs';
import { Orcamento } from '../../models/orcamento.model';
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

    orcamento$!: Observable<Orcamento>;

    ngOnInit() {
        this.orcamento$ = this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.router.navigate(['/lista-orcamentos']);
                    return [];
                }

                // NOVO: Interceptamos a busca para converter o Timestamp do Firebase
                return this.orcamentoService.getOrcamentoById(id).pipe(
                    map(orcamento => {
                        if (!orcamento) return orcamento;

                        return {
                            ...orcamento,
                            // Converte Timestamp para Date do JavaScript
                            dataCriacao: (orcamento.dataCriacao as any)?.toDate ? (orcamento.dataCriacao as any).toDate() : new Date(orcamento.dataCriacao),
                            validade: (orcamento.validade as any)?.toDate ? (orcamento.validade as any).toDate() : new Date(orcamento.validade),
                        };
                    })
                );
            })
        );
    }

    imprimir() {
        window.print();
    }

    enviarWhatsApp(orcamento: Orcamento) {
        const telefoneLimpo = orcamento.telefone.replace(/\D/g, '');
        const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const valor = formatadorMoeda.format(orcamento.valorTotal);

        const mensagem = `Olá ${orcamento.cliente}, tudo bem? Segue a proposta comercial *${orcamento.numeroOrcamento}* da *Arruda Pisos de Madeira*. O valor total estimado é de *${valor}*. Fico à disposição para qualquer dúvida!`;

        const url = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    }

    enviarEmail(orcamento: Orcamento) {
        const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        const valor = formatadorMoeda.format(orcamento.valorTotal);

        const assunto = `Orçamento ${orcamento.numeroOrcamento} - Arruda Pisos de Madeira`;
        const mensagem = `Olá ${orcamento.cliente},\n\nSegue os detalhes do orçamento referente à área de ${orcamento.areaM2}m².\n\nValor Total: ${valor}\n\nGuarde o arquivo PDF em anexo gerado pelo sistema para o seu registro.\n\nAtenciosamente,\nArruda Pisos de Madeira e Decks`;

        const url = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    }

    voltar() {
        this.router.navigate(['/lista-orcamentos']);
    }
}