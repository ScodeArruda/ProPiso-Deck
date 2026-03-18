import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private injector = inject(Injector); // NOVO: Injetamos o contexto

    public user$: Observable<User | null> = authState(this.auth);

    async login(email: string, password: string) {
        // Abraçamos a chamada de login
        return runInInjectionContext(this.injector, async () => {
            return await signInWithEmailAndPassword(this.auth, email, password);
        });
    }

    async logout() {
        // Abraçamos a chamada de logout
        return runInInjectionContext(this.injector, async () => {
            await signOut(this.auth);
        });
    }
}