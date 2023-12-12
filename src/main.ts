import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp({
        "projectId":"who-liked-that",
        "appId":"1:900730803541:web:4584cb3e5b8d702451cbdc",
        "storageBucket":"who-liked-that.appspot.com",
        "apiKey":"AIzaSyDmw_tFIQipNfnc7Pdz_ht4Ze2QJGScUPI",
        "authDomain":"who-liked-that.firebaseapp.com",
        "messagingSenderId":"900730803541",
        "measurementId":"G-6JNRDMZV72"
      }))),
      importProvidersFrom(
        provideAuth(
          () => getAuth()
        )
      ),
      importProvidersFrom(
        provideFirestore(
          () => getFirestore()
        )
      ),
  ],
});
