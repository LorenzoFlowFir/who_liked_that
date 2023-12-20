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
import { environment } from '../../environments/environment';
import { UserInfoService } from '../services/user-info/user-info.service';

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
  public joinedPartySubscription: any;
  public updatedPartySubscription: any;
  public isHost: boolean = true; //TODO Déterminez si l'utilisateur est l'hôte
  public isReady: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private router: Router,
    private userInfoService: UserInfoService
  ) {}

  async ngOnInit() {
    // Souscrire aux queryParams pour récupérer l'ID de la partie
    this.route.queryParams.subscribe((params) => {
      this.partyId = params['id'];
      // Vous pouvez maintenant utiliser this.partyId pour d'autres opérations
      // Après avoir rejoint la partie :
      if (environment.firstTime) {
        this.socketService.emit('request-party-members', this.partyId);
        environment.firstTime = false;
      }
    });

    //console.log(this.userInfoService.getCurrentUser());

    // Écouter les événements de 'joined-party' depuis le serveur
    this.joinedPartySubscription = this.socketService
      .listen('joined-party-members')
      .subscribe((members) => {
        console.log('Joined Party:', members);

        this.members = members;
      });

    this.updatedPartySubscription = this.socketService
      .listen('updated-party-members')
      .subscribe((members) => {
        this.members = members;
      });

    this.socketService.listen('party-launched').subscribe(() => {
      this.router.navigate(['/party'], { queryParams: { id: this.partyId } });
    });
  }

  public showConfirmReadyModal() {
    // Afficher un modal de confirmation ici
    // Si l'utilisateur confirme, exécutez la méthode setReady()
    this.setReady();
  }

  public setReady() {
    this.socketService.emit('set-player-ready', this.partyId);
    this.isReady = true;
  }

  public launchParty() {
    if (this.partyId) {
      this.socketService.emit('launch-party', this.partyId);
      this.router.navigate(['/party']); // Naviguer vers la nouvelle page party
    }
  }

  ngOnDestroy() {
    if (this.joinedPartySubscription) {
      this.joinedPartySubscription.unsubscribe();
    }
    if (this.updatedPartySubscription) {
      this.updatedPartySubscription.unsubscribe();
    }
  }

  leaveParty() {
    if (this.partyId) {
      this.socketService.emit('leave-party', this.partyId);
      this.router.navigate(['/home']); // Naviguez vers la page d'accueil
    }
  }
}
