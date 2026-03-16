import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { firstValueFrom } from 'rxjs';
import { Material } from '../../models/material.model';
import { BudgetService } from '../../services/budget.service';
import { MaterialService } from '../../services/material.service';

@Component({
    selector: 'app-orcamentos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
    templateUrl: './orcamentos.component.html',
    styleUrls: ['./orcamentos.component.scss']
})
export class OrcamentosComponent implements OnInit {
    private fb = inject(FormBuilder);
    private materialService = inject(MaterialService);
    private budgetService = inject(BudgetService);

    orcamentoForm!: FormGroup;
    materiaisCatalogo: Material[] = [];

    // Totais calculados dinamicamente
    totalMateriais = 0;
    totalMaoDeObra = 0;
    totalGeral = 0;

    async ngOnInit() {
        this.initForm();
        // Carrega o catálogo de materiais para o Select
        this.materiaisCatalogo = await firstValueFrom(this.materialService.getMateriais());

        // Fica escutando qualquer mudança no formulário para refazer as contas financeiras
        this.orcamentoForm.valueChanges.subscribe(() => {
            this.calcularTotaisFinanceiros();
        });

        // Se a área do projeto mudar, recalcula a quantidade física de todos os itens já inseridos
        this.orcamentoForm.get('areaM2')?.valueChanges.subscribe(novaArea => {
            if (novaArea > 0) this.recalcularQuantidadesFisicas(novaArea);
        });
    }

    private initForm(): void {
        this.orcamentoForm = this.fb.group({
            cliente: ['', Validators.required],
            descricaoServico: ['', Validators.required],
            areaM2: [1, [Validators.required, Validators.min(0.1)]],
            valorMaoDeObra: [0, [Validators.required, Validators.min(0)]],
            materialSelecionado: [''], // Campo temporário só para o Select
            itens: this.fb.array([])  // O FormArray que guarda os materiais do orçamento
        });
    }

    get itensFormArray(): FormArray {
        return this.orcamentoForm.get('itens') as FormArray;
    }

    // Adiciona um material do Select para dentro da tabela do Orçamento
    adicionarMaterial() {
        const materialId = this.orcamentoForm.get('materialSelecionado')?.value;
        if (!materialId) return;

        const materialDb = this.materiaisCatalogo.find(m => m.id === materialId);
        if (!materialDb) return;

        // Evita adicionar o mesmo material duas vezes
        const jaExiste = this.itensFormArray.controls.some(ctrl => ctrl.get('materialId')?.value === materialId);
        if (jaExiste) {
            alert('Este material já está no orçamento.');
            return;
        }

        const area = this.orcamentoForm.get('areaM2')?.value || 1;

        // Passa pelo BudgetService para aplicar a regra de rendimento e perda
        const [itemCalculado] = this.budgetService.calcularItens(area, [materialDb]);

        // Cria a linha (FormGroup) para este material específico
        const itemGroup = this.fb.group({
            materialId: [itemCalculado.materialId],
            nome: [itemCalculado.nome],
            unidade: [itemCalculado.unidade],
            quantidade: [itemCalculado.quantidade],
            inclusoNoValor: [false], // Padrão: Cliente compra
            precoUnitario: [0, Validators.min(0)],
            subtotal: [0]
        });

        this.itensFormArray.push(itemGroup);
        this.orcamentoForm.get('materialSelecionado')?.setValue(''); // Limpa o Select
    }

    removerItem(index: number) {
        this.itensFormArray.removeAt(index);
    }

    // Atualiza as quantidades (ex: de 4L para 8L) se o cliente mudar a área da obra
    private recalcularQuantidadesFisicas(novaArea: number) {
        this.itensFormArray.controls.forEach(control => {
            const matId = control.get('materialId')?.value;
            const materialDb = this.materiaisCatalogo.find(m => m.id === matId);

            if (materialDb) {
                const [recalculado] = this.budgetService.calcularItens(novaArea, [materialDb]);
                control.patchValue({ quantidade: recalculado.quantidade }, { emitEvent: false });
            }
        });
        this.calcularTotaisFinanceiros(); // Força o recálculo do dinheiro após mudar a quantidade
    }

    private calcularTotaisFinanceiros() {
        const maoDeObra = this.orcamentoForm.get('valorMaoDeObra')?.value || 0;
        let somaMateriais = 0;

        this.itensFormArray.controls.forEach(control => {
            const qty = control.get('quantidade')?.value || 0;
            const preco = control.get('precoUnitario')?.value || 0;
            const incluso = control.get('inclusoNoValor')?.value;

            let sub = 0;
            if (incluso) {
                sub = qty * preco;
                somaMateriais += sub;
            }

            // Atualiza o subtotal da linha visualmente
            control.patchValue({ subtotal: sub }, { emitEvent: false });
        });

        this.totalMaoDeObra = maoDeObra;
        this.totalMateriais = somaMateriais;
        this.totalGeral = maoDeObra + somaMateriais;
    }

    salvarOrcamento() {
        if (this.orcamentoForm.invalid) {
            alert('Preencha os dados do cliente e a área corretamente.');
            return;
        }

        const dadosParaSalvar = {
            ...this.orcamentoForm.value,
            totalGeral: this.totalGeral,
            dataCriacao: new Date()
        };

        delete dadosParaSalvar.materialSelecionado; // Não precisamos salvar o valor do Select no banco

        console.log('Orçamento Pronto para o Firebase:', dadosParaSalvar);
        alert('Orçamento gerado! Verifique o console. Faremos a integração com o banco no próximo passo.');
    }
}