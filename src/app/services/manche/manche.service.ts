import { Injectable, inject } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { Track } from '../../models/track.model';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { User } from '../../models/user.model';
import { Playlist } from '../../models/playlist.model';
import { UserInfoService } from '../user-info/user-info.service';

@Injectable({
  providedIn: 'root',
})
export class MancheService {
  constructor() {}

  public spotifyWebApi = new SpotifyWebApi();
  public playlist: Playlist | undefined;

  //Récupère un joueur aléatoire parmis les joueurs de la partie
  public getRandomPlayer(players: User[]): User {
    return players[Math.floor(Math.random() * players.length)];
  }
  public getRandomTrack(playlist: any): Track {
    let randomIndex = Math.floor(Math.random() * playlist.tracks.length);
    let randomTrack = playlist.tracks[randomIndex];

    return randomTrack;
  }

  //Jouer la musique qui a été choisi
  public playTrack(track: Track) {
    this.spotifyWebApi.play({
      uris: [`spotify:track:${track.id}`],
    });
  }
}
