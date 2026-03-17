import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    erro = '';
    isCarregando = false;

    async onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isCarregando = true;
        this.erro = '';

        try {
            const { email, password } = this.loginForm.value;
            await this.authService.login(email!, password!);
            // Se deu certo, vai pro Dashboard!
            this.router.navigate(['/dashboard']);
        } catch (e: any) {
            this.erro = 'E-mail ou senha incorretos.';
        } finally {
            this.isCarregando = false;
        }
    }
}