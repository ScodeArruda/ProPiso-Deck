import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    // Alerta de sucesso padrão (com botão de OK)
    sucesso(mensagem: string, titulo: string = 'Sucesso!') {
        Swal.fire({
            icon: 'success',
            title: titulo,
            text: mensagem,
            confirmButtonColor: '#1e8e3e', // Verde do seu painel
            confirmButtonText: 'Entendi'
        });
    }

    // Alerta de erro
    erro(mensagem: string, titulo: string = 'Oops...') {
        Swal.fire({
            icon: 'error',
            title: titulo,
            text: mensagem,
            confirmButtonColor: '#1e293b',
            confirmButtonText: 'Fechar'
        });
    }

    // Toast (Aquele alerta pequeno que aparece no canto e some sozinho, ideal para o "Salvo com sucesso")
    toast(mensagem: string, icone: 'success' | 'error' | 'warning' | 'info' = 'success') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });

        Toast.fire({
            icon: icone,
            title: mensagem
        });
    }

    // Substitui o confirm() nativo do navegador (Retorna uma Promise com true ou false)
    async confirmar(titulo: string, texto: string, textoBotaoConfirmar: string = 'Sim, continuar!'): Promise<boolean> {
        const resultado = await Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0056b3', // Azul do seu sistema
            cancelButtonColor: '#dc3545', // Vermelho para cancelar
            confirmButtonText: textoBotaoConfirmar,
            cancelButtonText: 'Cancelar'
        });

        return resultado.isConfirmed;
    }
}