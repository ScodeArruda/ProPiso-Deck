import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    // Escuta o estado do Firebase Auth
    return authState(auth).pipe(
        map(user => {
            if (user) {
                return true; // Deixa passar
            } else {
                router.navigate(['/login']); // Bloqueia e joga pro login
                return false;
            }
        })
    );
};