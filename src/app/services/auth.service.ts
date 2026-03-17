import { inject, Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);

    // Fica escutando se o utilizador está logado ou não
    public user$: Observable<User | null> = authState(this.auth);

    async login(email: string, password: string) {
        try {
            return await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    async logout() {
        await signOut(this.auth);
    }
}