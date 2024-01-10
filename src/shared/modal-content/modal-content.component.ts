import { Component, Input } from '@angular/core';
import { Track } from '../../app/models/track.model';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonContent,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-modal-content',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Détails de la piste</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Fermer</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <img [src]="track?.cover" alt="Couverture" />
      <h2>{{ track?.name }}</h2>
      <p>Artiste: {{ track?.artist }}</p>
    </ion-content>
  `,
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonButtons],
})
export class ModalContentComponent {
  @Input() track: Track | undefined;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}
