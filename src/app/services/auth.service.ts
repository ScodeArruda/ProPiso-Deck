import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private injector = inject(Injector);
    private firestore = inject(Firestore);
    private router = inject(Router);
    private alertService = inject(AlertService);

    public user$: Observable<User | null> = authState(this.auth);
    private monitoramentoSessao?: Subscription;

    constructor() {
        // Fica a escutar se há um utilizador logado para iniciar a vigilância
        this.user$.subscribe(user => {
            if (user) {
                this.iniciarVigilancia(user.uid);
            } else {
                this.pararVigilancia();
            }
        });
    }

    async login(email: string, password: string) {
        return runInInjectionContext(this.injector, async () => {
            const credencial = await signInWithEmailAndPassword(this.auth, email, password);

            // 1. Gera um ID de Sessão único para este dispositivo
            const sessionId = Math.random().toString(36).substring(2, 15);

            // 2. Guarda o ID na memória do navegador local
            localStorage.setItem('sessao_ativa_arruda', sessionId);

            // 3. Regista o ID no banco de dados (subscrevendo qualquer sessão anterior)
            const userRef = doc(this.firestore, `users/${credencial.user.uid}`);
            await setDoc(userRef, { sessionId: sessionId }, { merge: true });

            return credencial;
        });
    }

    async logout(expulso: boolean = false) {
        return runInInjectionContext(this.injector, async () => {
            this.pararVigilancia();
            localStorage.removeItem('sessao_ativa_arruda');
            await signOut(this.auth);

            // Se o logout foi forçado por um novo login, avisa o utilizador e manda para a tela inicial
            if (expulso) {
                this.alertService.erro('A sua conta fez login noutro dispositivo.', 'Sessão Encerrada');
                this.router.navigate(['/login']);
            }
        });
    }

    private iniciarVigilancia(uid: string) {
        const userRef = doc(this.firestore, `users/${uid}`);

        // Fica a "olhar" para o documento do utilizador no banco em tempo real
        this.monitoramentoSessao = docData(userRef).subscribe((dados: any) => {
            if (dados && dados.sessionId) {
                const minhaSessaoLocal = localStorage.getItem('sessao_ativa_arruda');

                // Se o ID do banco for diferente do meu ID local, significa que alguém fez um login mais recente!
                if (minhaSessaoLocal && dados.sessionId !== minhaSessaoLocal) {
                    this.logout(true); // Aciona o logout forçado
                }
            }
        });
    }

    private pararVigilancia() {
        if (this.monitoramentoSessao) {
            this.monitoramentoSessao.unsubscribe();
        }
    }
}