import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Material } from '../../models/material.model';
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
                alert('Material cadastrado com sucesso!');
            } catch (error) {
                console.error('Erro ao salvar material:', error);
                alert('Erro ao salvar o material. Verifique o console.');
            }
        } else {
            this.materialForm.markAllAsTouched();
        }
    }

    async excluirMaterial(id: string | undefined): Promise<void> {
        if (!id) return;

        if (confirm('Tem certeza que deseja excluir este material?')) {
            try {
                await this.materialService.deleteMaterial(id);
            } catch (error) {
                console.error('Erro ao excluir:', error);
            }
        }
    }
}