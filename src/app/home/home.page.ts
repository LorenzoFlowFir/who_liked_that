import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import SpotifyWebApi from 'spotify-web-api-js';
import { CommonModule } from '@angular/common';
import { RandLikedSongComponent } from '../rand-liked-song/rand-liked-song.component';
import { LikedSongService } from '../services/liked-song/liked-song.service';
import { UserInfoService } from '../services/user-info/user-info.service';

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
  ],
})
export class HomePage implements OnInit {
  public CLIENT_ID = '72a2f504b28f416ead2d3cc6bc1e6aa8';
  public REDIRECT_URI = `http://localhost:8100/`;
  //public REDIRECT_URI = `com.flowfir.wholiked://callback`;
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

  constructor(
    public randomlikeService: LikedSongService,
    public userInfoService: UserInfoService
  ) {}
  public loginWithSpotify() {
    window.location.href = this.authorizeUrl;
  }

  ngOnInit() {
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    if (hashParams.has('access_token')) {
      this.accessToken = hashParams.get('access_token');
      this.isDisconnected = false;

      // this.randomlikeService
      //   .getLikedTracksAndPlayRandomTrack(accessToken)
      //   .then(() => {
      //     this.randomlikeService.displayLikedTrack();
      //   });
    }
    this.userInfoService
      .getInfoPersonnelUtilisateur(this.accessToken)
      .then(async (userProfile) => {
        const user = await this.userInfoService.CreateUser(userProfile);
        if (user instanceof Error) {
          console.error('Une erreur est survenue :', user);
        } else {
          const utilisateurExiste =
            await this.userInfoService.VerifierUtilisateurExiste(user.id);
          if (utilisateurExiste) {
            this.userInfoService.GetUserInfoFromDB(user.id);
          } else {
            this.userInfoService.AddUserInDB(user);
          }
        }
      });
  }
}
