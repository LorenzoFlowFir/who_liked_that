import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonModal,
  IonRange,
  IonLabel,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parametres-modal',
  templateUrl: './parametres-modal.component.html',
  styleUrls: ['./parametres-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    CommonModule,
    IonButtons,
    IonModal,
    IonRange,
    IonLabel,
  ],
})
export class ParametresModalComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("test")
  }

  isModalOpen = false;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

}
