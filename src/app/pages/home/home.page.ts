import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonLoading,
  IonSpinner,
} from '@ionic/angular/standalone';
import SpotifyWebApi from 'spotify-web-api-js';
import { CommonModule } from '@angular/common';
import { RandLikedSongComponent } from './rand-liked-song/rand-liked-song.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { User } from '../../models/user.model';
import { Playlist } from '../../models/playlist.model';
import { SocketService } from '../../services/socket/socket.service';
import { JoinPartyButtonComponent } from './join-party-button/join-party-button.component';
import { CreatePartyButtonComponent } from './create-party-button/create-party-button.component';
import { environment } from '../../../environments/environment';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    CommonModule,
    IonIcon,
    RandLikedSongComponent,
    UserInfoComponent,
    JoinPartyButtonComponent,
    IonLoading,
    CreatePartyButtonComponent,
    IonSpinner,
  ],
})
export class HomePage implements OnInit {
  public CLIENT_ID = '72a2f504b28f416ead2d3cc6bc1e6aa8';
  public REDIRECT_URI = `http://localhost:8100/`;
  //public REDIRECT_URI = `com.flowfir.wholiked://callback`;
  //public REDIRECT_URI = `http://51.38.113.168:9999/`;
  public SCOPES = [
    'user-library-read',
    'user-modify-playback-state',
    'user-read-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
  ];

  public spotifyWebApi = new SpotifyWebApi();
  public authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${
    this.CLIENT_ID
  }&redirect_uri=${this.REDIRECT_URI}&scope=${this.SCOPES.join(
    '%20'
  )}&response_type=token&show_dialog=true`;
  public accessToken: any;
  public isDisconnected = true;
  public user: User | undefined;
  public playlist: Playlist | undefined;
  public displayButton = true;

  public hasUser: boolean = false;
  public hasPlaylist: boolean = false;

  public showLoading: boolean = true;
  public showHome: boolean = false;

  constructor(
    private socketService: SocketService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    if (hashParams.has('access_token')) {
      this.accessToken = hashParams.get('access_token');
      this.isDisconnected = false;
      environment.accessToken = this.accessToken;

      this.socketService.listen('testEvent').subscribe((data) => {
        console.log(data);
      });

      this.socketService.emit('testEvent', { message: 'Hello from client!' });
    }
  }

  public loginWithSpotify() {
    window.location.href = this.authorizeUrl;
  }

  onUserChanged(newUser: User) {
    this.user = newUser;
    this.hasUser = true;
  }

  onPlaylistChanged(newPlaylist: Playlist) {
    this.playlist = newPlaylist;
    this.hasPlaylist = true;
    if (this.hasUser && this.hasPlaylist) {
      this.updateDisplay();
    }
  }

  private updateDisplay() {
    if (this.hasUser && this.hasPlaylist) {
      this.showLoading = false;
    }
    this.showHome = this.hasUser && this.hasPlaylist;
    console.log(this.showLoading, this.showHome);
  }
}
