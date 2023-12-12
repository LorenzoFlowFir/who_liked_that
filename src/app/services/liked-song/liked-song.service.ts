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

@Injectable({
  providedIn: 'root',
})
export class LikedSongService {
  public playlist: Track[] = [];
  public allTracks: Track[] = [];
  public allPlaylists: Track[] = [];
  public loader = false;
  public firestore: Firestore = inject(Firestore);

  constructor() {}

  public spotifyWebApi = new SpotifyWebApi();

  public async addToQueue(trackId: any) {
    const hashParams = new URLSearchParams(window.location.hash.substr(1));
    let accessToken = hashParams.get('access_token');
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackId}`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Could not add track to queue: ${response.statusText}`);
      }

      console.log(`Track ${trackId} added to queue`);
    } catch (error) {
      console.error('Error adding track to queue:', error);
    }
  }

  public async getLikedTracks(accessToken: any) {
    let offset = 0;
    let total = 1;
    let allTracks: Track[] = [];

    this.spotifyWebApi.setAccessToken(accessToken);
    this.loader = true;
    while (allTracks.length < total) {
      const data = await this.spotifyWebApi.getMySavedTracks({
        limit: 50,
        offset,
      });
      console.log(data);

      const tracks = data.items.map((item) => ({
        id: item.track.id,
        cover: item.track.album?.images[0]
          ? item.track.album.images[0].url
          : 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/XEU.jpg/1200px-XEU.jpg',
        name: item.track.name,
        artist: item.track.artists[0].name,
      }));
      allTracks = allTracks.concat(tracks);
      total = data.total;
      offset += 50;
    }
    this.loader = false;
    console.log(`Nombre de titres aimés : ${total}`);
    return allTracks;
  }

  public async getNumberOfLikedTracks(accessToken: string): Promise<number> {
    this.spotifyWebApi.setAccessToken(accessToken);

    try {
      const response = await this.spotifyWebApi.getMySavedTracks({
        limit: 1, // Nous mettons limit à 1 car nous avons seulement besoin du total
      });
      return response.total; // Retourne le nombre total de titres aimés
    } catch (error) {
      console.error(
        'Erreur lors de la récupération du nombre de titres aimés :',
        error
      );
      return 0; // Retourne 0 en cas d'erreur
    }
  }

  // public async displayLikedTrack(allTracks: Track[]) {
  //   this.playlist = [];
  //   let randomTrack;
  //   for (let i = 0; i < 10; i++) {
  //     randomTrack = allTracks[Math.floor(Math.random() * allTracks.length)];
  //     this.playlist.push(randomTrack);
  //   }

  //   const likedTrackDiv = document.getElementById('liked-track');

  //   if (likedTrackDiv) {
  //     likedTrackDiv.innerHTML = ' ';
  //   } else {
  //     // Gérer le cas où l'élément n'existe pas
  //     console.error('Element avec l\'id "liked-track" n\'a pas été trouvé');
  //   }
  //   // Vider les détails de la this.playlist précédente

  //   for (const music of this.playlist) {
  //     const p = document.createElement('p');
  //     const trackData = await this.spotifyWebApi.getTrack(music.id);
  //     const img = document.createElement('img');
  //     img.src = trackData.album.images[0].url;
  //     img.alt = `Cover de ${music.name} - ${music.artist}`;
  //     img.style.width = '50px';
  //     p.appendChild(img);
  //     p.appendChild(document.createTextNode(`${music.name} - ${music.artist}`));
  //     likedTrackDiv?.appendChild(p);
  //   }

  //   const btnRefrshLike = document.createElement('ion-button');
  //   btnRefrshLike.classList.add('btn');
  //   btnRefrshLike.classList.add('btn-primary');
  //   btnRefrshLike.textContent = "Charger d'autres musiques";
  //   btnRefrshLike.id = 'reload-liked';
  //   btnRefrshLike.addEventListener('click', () =>
  //     this.displayLikedTrack(allTracks)
  //   );
  //   likedTrackDiv?.appendChild(btnRefrshLike);
  // }
}
