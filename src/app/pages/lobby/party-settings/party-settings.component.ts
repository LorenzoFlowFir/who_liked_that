import { Component, Output, EventEmitter } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ModalController, 
} from '@ionic/angular/standalone';
// import { FormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-party-settings',
  templateUrl: './party-settings.component.html',
  styleUrls: ['./party-settings.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    
  ],
})
export class PartySettingsComponent {
  numberOfRounds: number = 3;
  
  @Output() settingsChanged = new EventEmitter<any>();
  
  
  constructor(private modalController: ModalController) {} 

  saveSettings() {
    this.modalController.dismiss({
      numberOfRounds: this.numberOfRounds
    });
  }
  
} 
