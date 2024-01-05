import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonBadge,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';

import { SocketService } from '../../services/socket/socket.service'; // Assurez-vous d'importer le service Socket

@Component({
  selector: 'app-classement',
  templateUrl: './classement.page.html',
  styleUrls: ['./classement.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonBadge,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButton,
  ],
})
export class ClassementPage implements OnInit {
  public members: any[] = [];

  public partyId: string | null = null;
  public isHost: boolean = false;

  constructor(
    private socketService: SocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.partyId = params['id'];
      this.isHost = params['isHost'];
      this.socketService.emit('end-game', this.partyId);
    });

    this.socketService.listen('game-ended').subscribe((data: any) => {
      this.members = data;
    });
  }

  public backHome() {
    if (this.partyId) {
      this.socketService.emit('leave-party', this.partyId);
      this.router.navigate(['/home']); // Naviguez vers la page d'accueil
    }
  }
}
