import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
// Importações para o padrão pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// Importação do ngx-mask
import { provideEnvironmentNgxMask } from 'ngx-mask';

// Registra os dados locais
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp(
        {
          projectId: "propiso-e-deck",
          appId: "1:1018913188634:web:0c012536414d79ea3b9aa3",
          storageBucket: "propiso-e-deck.firebasestorage.app",
          apiKey: "AIzaSyDv2GvKd8ugFFb5feU7CYXdjBrxc1ShoeU",
          authDomain: "propiso-e-deck.firebaseapp.com",
          messagingSenderId: "1018913188634",
        })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    // Força o Angular a usar o padrão brasileiro (R$, vírgula para decimais)
    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // Provedor da máscara
    provideEnvironmentNgxMask()
  ]
};