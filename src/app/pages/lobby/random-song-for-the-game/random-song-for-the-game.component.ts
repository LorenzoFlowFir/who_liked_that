import { Component, Input, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonContent,
  ModalController,
  IonModal,
  IonLoading,
} from '@ionic/angular/standalone';
import { LikedSongService } from '../../../services/liked-song/liked-song.service';
import { UserInfoService } from '../../../services/user-info/user-info.service';
import { User } from '../../../models/user.model';
import { Playlist } from '../../../models/playlist.model';
import { SocketService } from '../../../services/socket/socket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-random-song-for-the-game',
  templateUrl: './random-song-for-the-game.component.html',
  styleUrls: ['./random-song-for-the-game.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonButtons,
    CommonModule,
    IonModal,
    IonLoading,
  ],
})
export class RandomSongForTheGameComponent implements OnInit {
  public user: User | undefined;
  public isReady: boolean = false;
  @Input() partyId!: string;
  public playlist: Playlist | undefined;
  public isLoading: boolean = this.likedSongService.isLoading;
  public tracks: Playlist | boolean = false;

  constructor(
    private modalController: ModalController,
    private likedSongService: LikedSongService,
    private userInfoService: UserInfoService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.user = this.userInfoService.getCurrentUser();

    if (this.user) {
      this.likedSongService.GetPlaylistFromDB(this.user.id).then((tracks) => {
        if (tracks && typeof tracks !== 'boolean') {
          this.tracks = tracks;
          this.likedSongService
            .get10RandomTracksFromPlaylist(tracks)
            .then((playlist) => {
              this.isLoading = true;

              this.likedSongService
                .displayLikedTrack(tracks, playlist)
                .then((playlist) => {
                  this.playlist = playlist;
                  this.isLoading = false;
                });
            });
        }
      });
    }
  }

  public setReady() {
    if (this.partyId && this.playlist) {
      this.socketService.emit('set-player-ready', {
        partyId: this.partyId,
        playlist: this.playlist,
      });
      this.isReady = true;
      // Fermer le modal et passer les données
      this.modalController.dismiss({ isReady: true });
    } else {
      console.error(
        'setReady was called but partyId or playlist is not defined'
      );
    }
  }

  public getPlaylist() {
    if (this.tracks && typeof this.tracks !== 'boolean') {
      this.likedSongService
        .get10RandomTracksFromPlaylist(this.tracks)
        .then((playlist) => {
          this.isLoading = true;

          if (this.tracks && typeof this.tracks !== 'boolean') {
            this.likedSongService
              .displayLikedTrack(this.tracks, playlist)
              .then((playlist) => {
                this.playlist = playlist;
                this.isLoading = false;
              });
          }
        });
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
