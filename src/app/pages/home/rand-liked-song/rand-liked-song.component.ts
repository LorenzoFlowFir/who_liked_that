import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikedSongService } from '../../../services/liked-song/liked-song.service';
import { Track } from '../../../models/track.model';
import { IonSpinner } from '@ionic/angular/standalone';
import { User } from '../../../models/user.model';
import { Playlist } from '../../../models/playlist.model';
import { OptionsService } from '../../../services/options/options.service';

@Component({
  selector: 'app-rand-liked-song',
  templateUrl: './rand-liked-song.component.html',
  styleUrls: ['./rand-liked-song.component.scss'],
  imports: [IonSpinner, CommonModule],
  standalone: true,
})
export class RandLikedSongComponent implements OnInit {
  public playlist: Playlist | undefined;
  public allTracks: Track[] = [];
  public loader = this.randomLikeService.loader;
  public isDisconnected = true;
  public userId: string | undefined;

  @Input() public accessToken: any;
  @Input() public user: User | undefined;

  @Output() playlistChanged = new EventEmitter<Playlist>();

  constructor(private randomLikeService: LikedSongService) {}

  async ngOnInit() {
    this.userId = this.user?.id;
    if (this.userId) {
      await this.handlePlaylist(this.userId);
      if (this.playlist) {
        //this.randomLikeService.displayLikedTrack(this.playlist?.liked_song);
      }
    }
  }

  async handlePlaylist(userId: string) {
    const playlistExists = await this.randomLikeService.VerifierPlaylistExiste(
      userId
    );
    if (playlistExists) {
      await this.getPlaylistFromDB(userId);
    } else {
      await this.createAndStoreNewPlaylist();
    }
  }

  async getPlaylistFromDB(userId: string) {
    try {
      const playlist = await this.randomLikeService.GetPlaylistFromDB(userId);
      if (typeof playlist !== 'boolean') {
        this.playlist = playlist;
        this.playlistChanged.emit(this.playlist);
      } else {
        this.handleError(
          'Une erreur est survenue lors de la récupération de la playlist'
        );
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAndStoreNewPlaylist() {
    try {
      const allTracks = await this.randomLikeService.getLikedTracks(
        this.accessToken
      );
      if (this.user) {
        const playlist = await this.randomLikeService.CreatePlaylist(
          this.user,
          allTracks
        );
        if (!(playlist instanceof Error)) {
          await this.randomLikeService.AddPlaylistInDB(playlist);
          this.playlist = playlist;
          this.playlistChanged.emit(this.playlist);
        } else {
          this.handleError(playlist);
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    console.error('Une erreur est survenue :', error);
  }
}
