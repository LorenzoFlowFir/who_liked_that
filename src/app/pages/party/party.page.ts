// party.page.ts
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';
import {
  IonCard,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonImg,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket/socket.service';
import { MancheService } from 'src/app/services/manche/manche.service';
import { User } from 'src/app/models/user.model';
import { Subscription } from 'rxjs';
import { Playlist } from 'src/app/models/playlist.model';
import { Track } from 'src/app/models/track.model';
//Pour les icons
import { addIcons } from 'ionicons';
import {
  eyeSharp,
  eyeOffSharp,
  playSharp,
  pauseSharp,
  playSkipForwardSharp,
} from 'ionicons/icons';

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
    IonIcon,
    IonText,
  ],
})
export class PartyPage implements OnInit, OnDestroy {
  public accessToken: string | null = null;
  public partyId: string | null = null;
  public isHost: boolean = false;

  public members: any[] = [];
  public playlists: any[] = [];

  public targetPlayer: any | undefined;
  public targetPlaylist: Playlist | undefined;
  public targetTrack: Track | undefined;

  private queryParamsSubscription: Subscription | undefined;
  private partyInfoSubscription: Subscription | undefined;
  private sendTargetTrackSub: Subscription | undefined;
  private votingStartedSub: Subscription | undefined;
  private updateHiddenSub: Subscription | undefined;
  private subscriptionsInitialized: boolean = false;

  public playerGuesses: { [key: string]: string } = {};
  public guessingTimeOver: boolean = true;

  public timeLeft: number = 15; // Temps en secondes

  public hiddenCover: string = '';
  public hidden: boolean = true;

  public votingStarted: boolean = false;

  
  public currentManche: number = 1; // Suivi de la manche actuelle
  public totalManches: number = 10; // Total des manches

  public myUserId: string = this.userInfoService.user!.id;
  public myUsername: string = this.userInfoService.user!.nom;
  public playerScores: number = 0;
  private memberGuesses: any;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService, // Assurez-vous d'injecter SocketService
    private mancheService: MancheService,
    private userInfoService: UserInfoService,
    private router: Router
  ) {
    addIcons({
      eyeSharp,
      eyeOffSharp,
      playSharp,
      pauseSharp,
      playSkipForwardSharp,
    });
  }

  ngOnInit() {
    this.connexion().then(() => {
      if (!this.subscriptionsInitialized) {
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

                  //Supprime la musique cible de la playlist du joueur cible
                  this.playlists.find(
                    (playlist) =>
                      playlist.userId === this.targetPlayer.idSpotify
                  )!.tracks = this.playlists
                    .find(
                      (playlist) =>
                        playlist.userId === this.targetPlayer.idSpotify
                    )
                    ?.tracks.filter(
                      (track: any) => track.id !== this.targetTrack?.id
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
          this.sendTargetTrackSub = this.socketService
            .listen('send-target-track')
            .subscribe((data) => {
              this.targetTrack = data.track;
              this.targetPlayer = data.player;
              this.members = data.members;
            });
        }
        this.subscriptionsInitialized = true;
      }
      this.startManche(); // Commence la première manche
    });

    this.votingStartedSub = this.socketService
      .listen('voting-started')
      .subscribe(() => {
        this.startVoting();
        this.guessingTimeOver = false;
      });

    this.updateHiddenSub = this.socketService
      .listen('update-hidden')
      .subscribe((data: any) => {
        this.hidden = data.hidden;
      });
  }

  public connexion(): Promise<void> {
    return new Promise((resolve) => {
      this.queryParamsSubscription = this.route.queryParams.subscribe(
        (params) => {
          if (params['id']) {
            this.partyId = params['id'];
            this.isHost = params['isHost'] ?? false;
            const fragm = new URLSearchParams(params);
            this.accessToken = fragm.get('accessToken');
            resolve();
          }
        }
      );
    });
  }

  startManche() {
    // Vérifiez si le nombre actuel de manches est inférieur ou égal au total prévu
    if (this.currentManche <= this.totalManches) {
      // Réinitialiser les états pour la nouvelle manche
      this.guessingTimeOver = true;
      this.votingStarted = false;
      this.hidden = true;
      this.timeLeft = 15; // Réinitialiser le chronomètre
      this.playerGuesses = {}; // Réinitialiser les suppositions des joueurs
      this.memberGuesses = undefined; // Réinitialiser les suppositions des joueurs
      this.targetPlayer = undefined;

      // Si c'est l'hôte, choisissez un nouveau joueur cible et une nouvelle piste
      if (this.isHost && this.partyId) {
        // Sélectionner un nouveau joueur cible au hasard
        this.targetPlayer = this.mancheService.getRandomPlayer(this.members);

        // Trouver la playlist du joueur cible
        this.targetPlaylist = this.playlists.find(
          (playlist) => playlist.userId === this.targetPlayer?.idSpotify
        );

        // Si une playlist cible est trouvée, sélectionnez une piste au hasard
        if (this.targetPlaylist) {
          this.targetTrack = this.mancheService.getRandomTrack(
            this.targetPlaylist
          );

          //Supprime la musique cible de la playlist du joueur cible
          this.playlists.find(
            (playlist) => playlist.userId === this.targetPlayer.idSpotify
          )!.tracks = this.playlists
            .find((playlist) => playlist.userId === this.targetPlayer.idSpotify)
            ?.tracks.filter((track: any) => track.id !== this.targetTrack?.id);

          // Jouer la musique cible
          this.mancheService.playTrack(this.targetTrack);

          // Envoyer les informations de la piste cible au serveur
          this.socketService.emit('target-track', {
            partyId: this.partyId,
            track: this.targetTrack,
            player: this.targetPlayer,
          });
        }
      }
    }
  }

  public startVoting() {
    this.votingStarted = true;
    this.endGuessingTime();
  }

  public toggleHidden() {
    this.hidden = !this.hidden;
    // Envoi de l'état de "hidden" à tous les clients
    this.socketService.emit('toggle-hidden', {
      partyId: this.partyId,
      hidden: this.hidden,
    });
  }

  public triggerVoting() {
    if (this.isHost && this.partyId) {
      this.socketService.emit('start-voting', this.partyId);
    }
  }

  // Fonction appelée lorsque le joueur fait une supposition
  public guessPlayer(member: any) {
    if (!this.guessingTimeOver) {
      // Réinitialiser les choix précédents
      for (const key in this.playerGuesses) {
        if (Object.prototype.hasOwnProperty.call(this.playerGuesses, key)) {
          this.playerGuesses[key] = 'unselected';
        }
      }

      // Enregistrer le nouveau choix
      this.playerGuesses[member.id] = 'selected';
      this.memberGuesses = member;
    }
  }

  // Fonction pour obtenir la couleur du bouton
  public getColor(member: any): string {
    if (this.guessingTimeOver) {
      switch (this.playerGuesses[member.id]) {
        case 'success':
          return 'success';
        case 'danger':
          return 'danger';
        default:
          return 'tertiary';
      }
    } else {
      return this.playerGuesses[member.id] === 'selected'
        ? 'warning'
        : 'tertiary';
    }
  }

  public endGuessingTime() {
    if (this.votingStarted) {
      const interval = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(interval);
          // Autres logiques...
        }
      }, 1000);

      setTimeout(() => {
        this.guessingTimeOver = true;

        // Parcourir tous les membres pour mettre à jour les couleurs
        for (const key in this.playerGuesses) {
          if (Object.prototype.hasOwnProperty.call(this.playerGuesses, key)) {
            if (key === this.targetPlayer.id) {
              // Le targetPlayer est toujours en vert
              this.playerGuesses[key] = 'success';
            } else if (this.playerGuesses[key] === 'selected') {
              // Marquer les autres choix incorrects en rouge
              this.playerGuesses[key] = 'danger';
            }
          }
        }

        // S'assurer que le targetPlayer est en vert même s'il n'a pas été choisi
        if (!this.playerGuesses[this.targetPlayer.id]) {
          this.playerGuesses[this.targetPlayer.id] = 'success';
        }
        // Envoyer la réponse au serveur
        if (
          this.memberGuesses &&
          this.myUsername !== this.targetPlayer.username
        ) {
          this.socketService.emit('player-guess', {
            partyId: this.partyId,
            playerId: this.myUserId,
            isCorrect: this.memberGuesses.id === this.targetPlayer.id,
          });
        }

        this.socketService
          .listen('scores-updated')
          .subscribe((membersScores) => {
            const myScore = membersScores.find(
              (member: any) => member.id === this.myUserId
            )?.score;
            if (myScore !== undefined) {
              this.playerScores = myScore;
            }
          });

        setTimeout(() => {
          this.currentManche++; // Incrémenter le numéro de la manche actuelle
          if (this.currentManche <= this.totalManches) {
            this.startManche(); // Commence la manche suivante
          } else {
            this.router.navigate(['/classement'], {
              fragment: `accessToken=${this.accessToken}`,
              queryParams: {
                id: this.partyId,
                isHost: this.isHost,
              },
            });
            // Ajouter ici la logique de fin de partie
          }
        }, 5000); // 5 secondes
      }, 15000); // 15 secondes
    }
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.partyInfoSubscription) {
      this.partyInfoSubscription.unsubscribe();
    }
    if (this.sendTargetTrackSub) {
      this.sendTargetTrackSub.unsubscribe();
    }
    if (this.votingStartedSub) {
      this.votingStartedSub.unsubscribe();
    }
    if (this.updateHiddenSub) {
      this.updateHiddenSub.unsubscribe();
    }
    this.subscriptionsInitialized = false;
  }
}
