import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    async sair() {
        // 1. Navega para o Login primeiro (isso mata os listeners do Firestore na tela atual)
        await this.router.navigate(['/login']);

        // 2. Só então faz o logout no Firebase
        await this.authService.logout();
    }
}