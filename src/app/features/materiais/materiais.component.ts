import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Material } from '../../models/material.model';
import { AlertService } from '../../services/alert.service'; // NOVO: Importando o serviço de alertas
import { MaterialService } from '../../services/material.service';

@Component({
    selector: 'app-materiais',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './materiais.component.html',
    styleUrls: ['./materiais.component.scss']
})
export class MateriaisComponent implements OnInit {
    private fb = inject(FormBuilder);
    private materialService = inject(MaterialService);
    private alertService = inject(AlertService); // NOVO: Injetando o serviço

    materialForm!: FormGroup;
    materiais$: Observable<Material[]> = this.materialService.getMateriais();

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        // Removidos os campos rendimentoPorM2 e perdaPadrao
        this.materialForm = this.fb.group({
            nome: ['', Validators.required],
            categoria: ['madeira', Validators.required],
            unidade: ['m2', Validators.required]
        });
    }

    async onSubmit(): Promise<void> {
        if (this.materialForm.valid) {
            try {
                const novoMaterial = this.materialForm.value;
                await this.materialService.addMaterial(novoMaterial);

                // Reset ajustado apenas para os campos restantes
                this.materialForm.reset({ categoria: 'madeira', unidade: 'm2' });

                // NOVO: Substituído o alert() por um Toast elegante e silencioso
                this.alertService.toast('Material cadastrado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao salvar material:', error);

                // NOVO: Substituído o alert() por um alerta de erro
                this.alertService.erro('Erro ao salvar o material. Verifique a sua ligação.');
            }
        } else {
            this.materialForm.markAllAsTouched();
        }
    }

    async excluirMaterial(id: string | undefined): Promise<void> {
        if (!id) return;

        // NOVO: Substituindo o confirm() nativo pela caixa de diálogo do SweetAlert2
        const confirmado = await this.alertService.confirmar(
            'Excluir Material?',
            'Tem a certeza que deseja excluir este material permanentemente do catálogo?',
            'Sim, excluir'
        );

        if (confirmado) {
            try {
                await this.materialService.deleteMaterial(id);

                // NOVO: Feedback de sucesso
                this.alertService.toast('Material removido!', 'success');
            } catch (error) {
                console.error('Erro ao excluir:', error);

                // NOVO: Feedback de erro
                this.alertService.erro('Ocorreu um erro ao excluir este material.');
            }
        }
    }
}