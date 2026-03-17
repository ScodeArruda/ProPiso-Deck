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

    totalMateriais = 0;
    totalMaoDeObra = 0;
    totalGeral = 0;

    async ngOnInit() {
        this.initForm();
        this.materiaisCatalogo = await firstValueFrom(this.materialService.getMateriais());

        this.orcamentoForm.valueChanges.subscribe(() => {
            this.calcularTotaisFinanceiros();
        });
    }

    private initForm(): void {
        // Calcula a data de hoje + 15 dias como validade padrão
        const dataValidade = new Date();
        dataValidade.setDate(dataValidade.getDate() + 15);
        const validadeFormatada = dataValidade.toISOString().split('T')[0]; // Formato YYYY-MM-DD para o input type="date"

        this.orcamentoForm = this.fb.group({
            cliente: ['', Validators.required],
            descricaoServico: ['', Validators.required],
            areaM2: [1, [Validators.required, Validators.min(0.1)]],
            valorMaoDeObra: [0, [Validators.required, Validators.min(0)]],
            
            // Novos campos
            validade: [validadeFormatada, Validators.required],
            observacoes: [''],
            termoAceite: [
                'O orçamento tem validade conforme a data estipulada neste documento. ' +
                'A obra será iniciada mediante pagamento de 50% do valor total. ' +
                'Alterações no escopo do projeto estão sujeitas a novos cálculos de custo.'
            ],

            materialSelecionado: [''],
            itens: this.fb.array([])
        });
    }

    get itensFormArray(): FormArray {
        return this.orcamentoForm.get('itens') as FormArray;
    }

    adicionarMaterial() {
        const materialId = this.orcamentoForm.get('materialSelecionado')?.value;
        if (!materialId) return;

        const materialDb = this.materiaisCatalogo.find(m => m.id === materialId);
        if (!materialDb) return;

        const jaExiste = this.itensFormArray.controls.some(ctrl => ctrl.get('materialId')?.value === materialId);
        if (jaExiste) {
            alert('Este material já está no orçamento.');
            return;
        }

        const [itemInicializado] = this.budgetService.inicializarItens([materialDb]);

        const itemGroup = this.fb.group({
            materialId: [itemInicializado.materialId],
            nome: [itemInicializado.nome],
            unidade: [itemInicializado.unidade],
            quantidade: [1, [Validators.required, Validators.min(0.01)]],
            inclusoNoValor: [itemInicializado.inclusoNoValor],
            precoUnitario: [itemInicializado.precoUnitario, Validators.min(0)],
            subtotal: [itemInicializado.subtotal]
        });

        this.itensFormArray.push(itemGroup);
        this.orcamentoForm.get('materialSelecionado')?.setValue('');
    }

    removerItem(index: number) {
        this.itensFormArray.removeAt(index);
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

            control.patchValue({ subtotal: sub }, { emitEvent: false });
        });

        this.totalMaoDeObra = maoDeObra;
        this.totalMateriais = somaMateriais;
        this.totalGeral = maoDeObra + somaMateriais;
    }

    salvarOrcamento() {
        if (this.orcamentoForm.invalid) {
            alert('Preencha os dados do cliente e as quantidades corretamente.');
            return;
        }

        const formValues = this.orcamentoForm.value;
        
        // Converte a string YYYY-MM-DD do input de volta para um objeto Date real do JavaScript
        const dataValidadeFinal = new Date(formValues.validade);
        dataValidadeFinal.setHours(23, 59, 59, 999); // Validade vai até o último segundo do dia escolhido

        const dadosParaSalvar = {
            ...formValues,
            validade: dataValidadeFinal, // Substitui a string pela Data convertida
            totalGeral: this.totalGeral,
            dataCriacao: new Date()
        };

        delete dadosParaSalvar.materialSelecionado;

        console.log('Orçamento Pronto para o Firebase:', dadosParaSalvar);
        alert('Orçamento gerado! Verifique o console.');
    }
}