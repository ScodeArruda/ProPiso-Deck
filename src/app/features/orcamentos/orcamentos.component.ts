import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { firstValueFrom } from 'rxjs';
import { Material } from '../../models/material.model';
import { AlertService } from '../../services/alert.service'; // NOVO: Importando o serviço de alertas
import { BudgetService } from '../../services/budget.service';
import { MaterialService } from '../../services/material.service';
import { OrcamentoService } from '../../services/orcamento.service';

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
    private orcamentoService = inject(OrcamentoService);
    private alertService = inject(AlertService); // NOVO: Injetando o serviço
    private router = inject(Router);

    orcamentoForm!: FormGroup;
    materiaisCatalogo: Material[] = [];

    totalMateriais = 0;
    totalMaoDeObra = 0;
    totalGeral = 0;

    isSalvando = false;

    async ngOnInit() {
        this.initForm();
        this.materiaisCatalogo = await firstValueFrom(this.materialService.getMateriais());

        this.orcamentoForm.valueChanges.subscribe(() => {
            this.calcularTotaisFinanceiros();
        });
    }

    private initForm(): void {
        const dataValidade = new Date();
        dataValidade.setDate(dataValidade.getDate() + 15);
        const validadeFormatada = dataValidade.toISOString().split('T')[0];

        this.orcamentoForm = this.fb.group({
            cliente: ['', Validators.required],
            telefone: ['', Validators.required],
            descricaoServico: ['', Validators.required],
            areaM2: [1, [Validators.required, Validators.min(0.1)]],
            valorMaoDeObra: [0, [Validators.required, Validators.min(0)]],
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

    private gerarNumeroOrcamento(): string {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const aleatorio = Math.floor(1000 + Math.random() * 9000);
        return `ORC-${ano}${mes}${dia}-${aleatorio}`;
    }

    adicionarMaterial() {
        const materialId = this.orcamentoForm.get('materialSelecionado')?.value;
        if (!materialId) return;

        const materialDb = this.materiaisCatalogo.find(m => m.id === materialId);
        if (!materialDb) return;

        const jaExiste = this.itensFormArray.controls.some(ctrl => ctrl.get('materialId')?.value === materialId);
        if (jaExiste) {
            // NOVO: Toast de aviso em vez de alert
            this.alertService.toast('Este material já está no orçamento.', 'warning');
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

    async salvarOrcamento() {
        if (this.orcamentoForm.invalid) {
            // NOVO: Alerta de erro profissional
            this.alertService.erro('Preencha os dados do cliente e as quantidades corretamente.', 'Atenção!');
            this.orcamentoForm.markAllAsTouched();
            return;
        }

        this.isSalvando = true;

        try {
            const formValues = this.orcamentoForm.value;

            const dataValidadeFinal = new Date(formValues.validade);
            dataValidadeFinal.setHours(23, 59, 59, 999);

            const dadosParaSalvar = {
                numeroOrcamento: this.gerarNumeroOrcamento(),
                cliente: formValues.cliente,
                telefone: formValues.telefone,
                descricaoServico: formValues.descricaoServico,
                areaM2: formValues.areaM2,
                itens: formValues.itens,
                valorMaoDeObra: formValues.valorMaoDeObra,
                valorMateriais: this.totalMateriais,
                valorTotal: this.totalGeral,
                observacoes: formValues.observacoes,
                termoAceite: formValues.termoAceite,
                validade: dataValidadeFinal,
                dataCriacao: new Date()
            };

            const orcamentoId = await this.orcamentoService.addOrcamento(dadosParaSalvar);
            console.log('Orçamento salvo no Firebase:', orcamentoId);

            // NOVO: Alerta de sucesso profissional
            this.alertService.sucesso(`O orçamento ${dadosParaSalvar.numeroOrcamento} foi gerado com sucesso!`, 'Orçamento Salvo!');

            // 1. Limpa a tabela de materiais primeiro
            this.itensFormArray.clear();

            // 2. Calcula a data de 15 dias para frente novamente
            const dataValidade = new Date();
            dataValidade.setDate(dataValidade.getDate() + 15);
            const validadeFormatada = dataValidade.toISOString().split('T')[0];

            // 3. Reseta o formulário mantendo a mesma instância
            this.orcamentoForm.reset({
                cliente: '',
                telefone: '',
                descricaoServico: '',
                areaM2: 1,
                valorMaoDeObra: 0,
                validade: validadeFormatada,
                observacoes: '',
                termoAceite: 'O orçamento tem validade conforme a data estipulada neste documento. A obra será iniciada mediante pagamento de 50% do valor total. Alterações no escopo do projeto estão sujeitas a novos cálculos de custo.',
                materialSelecionado: ''
            });

        } catch (error) {
            console.error('Erro ao salvar no Firebase:', error);
            // NOVO: Erro com SweetAlert
            this.alertService.erro('Erro ao salvar orçamento. Verifique sua conexão com a internet.');
        } finally {
            this.isSalvando = false;
        }
    }
}