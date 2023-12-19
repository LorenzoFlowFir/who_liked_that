import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonList,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
  ],
})
export class LobbyPage implements OnInit {
  public partyId: string | null = null;
  public members: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Souscrire aux queryParams pour récupérer l'ID de la partie
    this.route.queryParams.subscribe((params) => {
      this.partyId = params['id'];
      // Vous pouvez maintenant utiliser this.partyId pour d'autres opérations
    });

    // Écouter les événements de 'joined-party' depuis le serveur
    this.socketService.listen('joined-party-members').subscribe((members) => {
      console.log('Joined Party:', members);

      this.members = members; // Mettre à jour la liste des membres
    });

    this.socketService.listen('updated-party-members').subscribe((members) => {
      this.members = members; // Mettre à jour la liste des membres
    });
  }

  leaveParty() {
    if (this.partyId) {
      this.socketService.emit('leave-party', this.partyId);
      this.router.navigate(['/home']); // Naviguez vers la page d'accueil
    }
  }
}
