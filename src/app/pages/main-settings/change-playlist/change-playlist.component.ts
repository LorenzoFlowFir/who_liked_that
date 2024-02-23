import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyPlaylist } from 'src/app/models/playlist.model';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';
import { environment } from 'src/environments/environment';
import {
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonImg,
  IonSpinner,
  IonButton,
  IonLabel,
  IonAvatar,
} from '@ionic/angular/standalone';
import { LikedSongService } from 'src/app/services/liked-song/liked-song.service';
import { User } from 'src/app/models/user.model';
import { Track } from 'src/app/models/track.model';
import { Playlist } from '@spotify/web-api-ts-sdk';
import { FormsModule } from '@angular/forms';
import { navigate } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-playlist',
  templateUrl: './change-playlist.component.html',
  styleUrls: ['./change-playlist.component.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonLabel,
    IonButton,
    IonSpinner,
    IonImg,
    IonItem,
    IonList,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
  ],
})
export class ChangePlaylistComponent implements OnInit {
  public accessToken: string = environment.accessToken;
  public playlistLike: SpotifyPlaylist = {
    id: 'Titres Likés',
    name: 'Titres Likés',
    description: '',
    images: ['../../../../assets/icon/likeCover.jpg'],
    public: true,
    uri: '',
    collaborative: false,
    external_urls: {},
    href: '',
    primary_color: '',
    snapshot_id: '',
    tracks: {},
    type: '',
  };
  public playlists: SpotifyPlaylist[] = [this.playlistLike];
  public selectedPlaylist: SpotifyPlaylist | null = null;
  public selectedPlaylistId: string | null = null;
  public loading = true;
  public haveAccess = true;
  public tracks: Track[] = [];
  public myUser: User | undefined;
  public validatingPlaylist = false;

  constructor(
    private userInfoService: UserInfoService,
    private likedSongService: LikedSongService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.haveAccess = !!this.accessToken;
    if (this.haveAccess) {
      try {
        const newPlaylists = await this.userInfoService.getAllPlaylist(
          this.accessToken
        );
        this.playlists = [...this.playlists, ...newPlaylists];
      } catch (error) {
        console.error('Error fetching playlists', error);
      } finally {
        this.loading = false;
      }
    }
    this.getSelectedPlaylistFromDb();
  }

  public handleChange(event: any) {
    this.selectedPlaylist = event.detail.value;
    this.selectedPlaylistId = event.detail.value.id;
  }

  public getSelectedPlaylistFromDb() {
    this.userInfoService
      .GetUserInfoFromDB(this.userInfoService.user!.id)
      .then((user) => {
        if (user) {
          this.myUser = user;
        }
      })
      .then(() => {
        if (this.myUser) {
          if (this.myUser?.playlists === 'Titres Likés') {
            this.selectedPlaylist = this.playlistLike;
          } else {
            const userPlaylist = this.playlists.find(
              (p) => p.id === this.myUser?.playlists
            );
            if (userPlaylist) {
              this.selectedPlaylist = userPlaylist;
            }
          }
        }
      });
  }

  async validatePlaylist() {
    console.log('Validating playlist started');

    this.validatingPlaylist = true;

    if (!this.selectedPlaylistId) {
      this.validatingPlaylist = false;
      return;
    }
    const selectedPlaylist = this.playlists.find(
      (p) => p.id === this.selectedPlaylistId
    );
    if (!selectedPlaylist) return console.error('Playlist not found');

    try {
      if (selectedPlaylist.id !== 'Titres Likés') {
        this.tracks = await this.likedSongService.fetchPlaylistTracks(
          selectedPlaylist.id,
          this.accessToken
        );
      } else if (selectedPlaylist.id === 'Titres Likés') {
        this.tracks = await this.likedSongService.getLikedTracks(
          this.accessToken
        );
      }
      const user = this.userInfoService.user;
      if (!user) return console.error('No user found');

      await this.likedSongService.DeletePlaylistInDB(user.id);
      const newPlaylist = await this.likedSongService.CreatePlaylist(
        user,
        this.tracks
      );
      if (newPlaylist instanceof Error) throw newPlaylist;

      await this.userInfoService.changePlaylist(user.id, selectedPlaylist.id);
      await this.likedSongService.AddPlaylistInDB(newPlaylist);
      console.log('Playlist validated');
    } catch (error) {
      console.error('Error validating playlist', error);
    } finally {
      this.validatingPlaylist = false;
      this.router.navigate(['/home']);
    }
  }
}
