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
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket/socket.service';
import { environment } from '../../../environments/environment';
import { UserInfoService } from '../../services/user-info/user-info.service';
import { RandomSongForTheGameComponent } from './random-song-for-the-game/random-song-for-the-game.component';
import { Playlist } from 'src/app/models/playlist.model';
//Pour les icons
import { addIcons } from 'ionicons';
import {
  settingsOutline
} from 'ionicons/icons';
import { PartySettingsComponent } from './party-settings/party-settings.component';

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
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButtons,
  ],
})
export class LobbyPage implements OnInit {
  public accessToken: string | null = null;
  public partyId: string | null = null;
  public members: any[] = [];
  public joinedPartySubscription: any;
  public updatedPartySubscription: any;
  public isHost: boolean = false;
  public isReady: boolean = false;
  public showStartGameButton: boolean = true;
  public tailleJoueursErreur: boolean = false;
  public grandePlaylist: any;
  public numberOfRounds: number = 10;

  public maxPlayers: number = 8;
  public playerSlots: any[] = new Array(this.maxPlayers).fill(null);

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private router: Router,
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {
    addIcons({
      'settings-outline': settingsOutline,
    });
  }

  //fct pour ouvrir le modal des settings
  async openPartySettings() {
    const modal = await this.modalController.create({
      component: PartySettingsComponent,
      cssClass: 'custom-modal',
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
  if (data) {
    this.numberOfRounds = data.numberOfRounds;
  }
  }

  async ngOnInit() {
    // Souscrire aux queryParams pour récupérer l'ID de la partie
    this.route.queryParams.subscribe((params) => {
      this.partyId = params['id'];
      this.isHost = params['isHost'];

      const fragm = new URLSearchParams(params);
      this.accessToken = fragm.get('accessToken');

      // Vous pouvez maintenant utiliser this.partyId pour d'autres opérations
      // Après avoir rejoint la partie :
      if (environment.firstTime) {
        this.socketService.emit('request-party-members', this.partyId);
        environment.firstTime = false;
      }
    });

    // Écouter les événements de 'joined-party' depuis le serveur
    this.joinedPartySubscription = this.socketService
      .listen('joined-party-members')
      .subscribe((members) => {
        this.members = members;
        this.updatePlayerSlots(members);

        if (!this.showStartGameButton) {
          this.showStartGameButton = true;
        }
      });

    this.updatedPartySubscription = this.socketService
      .listen('updated-party-members')
      .subscribe((members) => {
        this.members = members;
        this.updatePlayerSlots(members);
      });

    this.socketService.listen('party-launched').subscribe(() => {
      this.router.navigate(['/party'], {
        fragment: `accessToken=${this.accessToken}`,
        queryParams: {
          id: this.partyId,
          isHost: this.isHost,
        },
      });
    });

    // Dans le composant de l'hôte
    this.socketService.listen('all-players-ready').subscribe((playlists) => {
      // Stocker la grande playlist consolidée
      this.grandePlaylist = playlists;
      // Afficher le bouton "Lancer la partie"
      if (this.members.length > 2) {
        this.tailleJoueursErreur = false;
        this.showStartGameButton = false;
      } else {
        this.tailleJoueursErreur = true;
      }
    });
  }

  updatePlayerSlots(members: any[]) {
    // Réinitialiser les emplacements
    this.playerSlots.fill(null);

    // Remplir les emplacements avec les informations des membres
    members.forEach((member, index) => {
      this.playerSlots[index] = member;
    });
  }

  public async showConfirmReadyModal() {
    // Afficher un modal de confirmation ici
    const modal = await this.modalController.create({
      component: RandomSongForTheGameComponent,
      cssClass: 'custom-modal',
      componentProps: {
        accessToken: this.accessToken,
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
      this.socketService.emit('launch-party', {partyId : this.partyId, nbDeManches: this.numberOfRounds});
      this.router.navigate(['/party'], {
        fragment: `accessToken=${this.accessToken}`,
        queryParams: {
          id: this.partyId,
          isHost: this.isHost,
        },
      });
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
      this.router.navigate(['/home'], {
        fragment: `accessToken=${this.accessToken}`,
      });
    }
  }
  getStatusColorClass(isReady: boolean): string {
    return isReady ? 'ready-status' : 'not-ready-status';
  }
}
