import { Component, Input, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonContent,
  ModalController,
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
  ],
})
export class RandomSongForTheGameComponent implements OnInit {
  public user: User | undefined;
  public isReady: boolean = false;
  @Input() partyId!: string;
  public playlist: Playlist | undefined;

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
          this.likedSongService
            .get10RandomTracksFromPlaylist(tracks)
            .then((playlist) => {
              this.likedSongService
                .displayLikedTrack(tracks, playlist)
                .then((playlist) => {
                  this.playlist = playlist;
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

  closeModal() {
    this.modalController.dismiss();
  }
}
