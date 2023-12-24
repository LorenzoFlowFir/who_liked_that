// party.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCard,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonImg,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../../services/socket/socket.service';
import { MancheService } from 'src/app/services/manche/manche.service';
import { User } from 'src/app/models/user.model';
import { Subscription } from 'rxjs';
import { Playlist } from 'src/app/models/playlist.model';
import { Track } from 'src/app/models/track.model';

@Component({
  selector: 'app-party',
  templateUrl: './party.page.html',
  styleUrls: ['./party.page.scss'],
  standalone: true,
  imports: [
    IonCard,
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonImg,
    IonCardContent,
    IonButton,
  ],
})
export class PartyPage implements OnInit {
  public partyId: string | null = null;
  public isHost: boolean = false;

  public members: any[] = [];
  public playlists: any[] = [];

  public targetPlayer: any | undefined;
  public targetPlaylist: Playlist | undefined;
  public targetTrack: Track | undefined;

  private queryParamsSubscription: Subscription | undefined;
  private partyInfoSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService, // Assurez-vous d'injecter SocketService
    private mancheService: MancheService
  ) {}

  ngOnInit() {
    this.connexion().then(() => {
      if (this.isHost) {
        if (this.partyId) {
          this.socketService.emit('request-party-info', this.partyId);
          this.partyInfoSubscription = this.socketService
            .listen('party-info')
            .subscribe((data: any) => {
              //Récupère les informations de la partie (Membres + Sons des Joueurs)
              this.members = data.members;
              this.playlists = data.playlists;

              //Choisi le joueur cible
              this.targetPlayer = this.mancheService.getRandomPlayer(
                this.members
              );

              //Récupère les sons en jeu du joueur cible
              this.targetPlaylist = this.playlists.find(
                (playlist) => playlist.userId === this.targetPlayer?.idSpotify
              );
              if (this.targetPlaylist) {
                //Choisi la musique cible
                this.targetTrack = this.mancheService.getRandomTrack(
                  this.targetPlaylist
                );

                //Joue la musique cible
                this.mancheService.playTrack(this.targetTrack);
                this.socketService.emit('target-track', {
                  partyId: this.partyId,
                  track: this.targetTrack,
                  player: this.targetPlayer,
                });
              }
            });
        }
      } else if (this.isHost === false) {
        console.log("Vous n'êtes pas l'hôte de la partie");
        this.socketService.listen('send-target-track').subscribe((data) => {
          this.targetTrack = data.track;
          this.targetPlayer = data.player;
        });
      }
    });
  }

  public connexion(): Promise<void> {
    return new Promise((resolve) => {
      this.queryParamsSubscription = this.route.queryParams.subscribe(
        (params) => {
          if (params['id']) {
            this.partyId = params['id'];
            this.isHost = params['isHost'] ?? false;
            resolve();
          }
        }
      );
    });
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.partyInfoSubscription) {
      this.partyInfoSubscription.unsubscribe();
    }
  }
}
