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
  ModalController,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonThumbnail,
  IonImg,
  IonLabel,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket/socket.service';
import { environment } from '../../../environments/environment';
import { UserInfoService } from '../../services/user-info/user-info.service';
import { RandomSongForTheGameComponent } from './random-song-for-the-game/random-song-for-the-game.component';
import { Playlist } from 'src/app/models/playlist.model';

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
    RandomSongForTheGameComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonThumbnail,
    IonImg,
    IonLabel,
  ],
})
export class LobbyPage implements OnInit {
  public partyId: string | null = null;
  public members: any[] = [];
  public joinedPartySubscription: any;
  public updatedPartySubscription: any;
  public isHost: boolean = false;
  public isReady: boolean = false;
  public showStartGameButton: boolean = true;
  public grandePlaylist: any;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private router: Router,
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    // Souscrire aux queryParams pour récupérer l'ID de la partie
    this.route.queryParams.subscribe((params) => {
      this.partyId = params['id'];
      this.isHost = params['isHost'];
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
      this.router.navigate(['/party'], {
        queryParams: { id: this.partyId, isHost: this.isHost },
      });
    });

    // Dans le composant de l'hôte
    this.socketService.listen('all-players-ready').subscribe((playlists) => {
      // Stocker la grande playlist consolidée
      this.grandePlaylist = playlists;
      // Afficher le bouton "Lancer la partie"
      this.showStartGameButton = false;
    });
  }

  public async showConfirmReadyModal() {
    // Afficher un modal de confirmation ici
    const modal = await this.modalController.create({
      component: RandomSongForTheGameComponent,
      cssClass: 'custom-modal',
      componentProps: {
        partyId: this.partyId, // Passez "partyId" comme propriété au modal
      },
    });

    // Présenter le modal
    await modal.present();

    // Attendre que le modal soit fermé
    const { data } = await modal.onDidDismiss();

    // Mettre à jour l'état isReady basé sur les données renvoyées par le modal
    if (data?.isReady) {
      this.isReady = true;
      // Effectuer d'autres actions si nécessaire
    }
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
