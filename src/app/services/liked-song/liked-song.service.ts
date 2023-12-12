import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { Track } from '../../models/track.model';

@Injectable({
  providedIn: 'root',
})
export class LikedSongService {
  public playlist: Track[] = [];
  public allTracks: Track[] = [];
  public allPlaylists: Track[] = [];
  public loader = false;

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

  public async getLikedTracksAndPlayRandomTrack(accessToken: any) {
    let offset = 0;
    let total = 1;
    this.spotifyWebApi.setAccessToken(accessToken);
    this.loader = true;
    while (this.allTracks.length < total) {
      const data = await this.spotifyWebApi.getMySavedTracks({
        limit: 50,
        offset,
      });
      console.log(data);

      const tracks = data.items.map((item) => ({
        id: item.track.id,
        cover:
          item.track.album.images && item.track.album.images[0]
            ? item.track.album.images[0].url
            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/XEU.jpg/1200px-XEU.jpg',
        name: item.track.name,
        artist: item.track.artists[0].name,
      }));
      this.allTracks = this.allTracks.concat(tracks);
      total = data.total;
      offset += 50;
    }
    console.log('c bon');

    this.loader = false;
    console.log(`Nombre de titres aimés : ${total}`);
  }

  public saveTrackInFile() {
    localStorage.setItem('likedTracks', JSON.stringify(this.allTracks));
  }

  public async displayLikedTrack() {
    this.playlist = [];
    let randomTrack;
    for (let i = 0; i < 10; i++) {
      randomTrack =
        this.allTracks[Math.floor(Math.random() * this.allTracks.length)];
      this.playlist.push(randomTrack);
    }

    const likedTrackDiv = document.getElementById('liked-track');

    if (likedTrackDiv) {
      likedTrackDiv.innerHTML = ' ';
    } else {
      // Gérer le cas où l'élément n'existe pas
      console.error('Element avec l\'id "liked-track" n\'a pas été trouvé');
    }
    // Vider les détails de la this.playlist précédente

    for (const music of this.playlist) {
      const p = document.createElement('p');
      const trackData = await this.spotifyWebApi.getTrack(music.id);
      const img = document.createElement('img');
      img.src = trackData.album.images[0].url;
      img.alt = `Cover de ${music.name} - ${music.artist}`;
      img.style.width = '50px';
      p.appendChild(img);
      p.appendChild(document.createTextNode(`${music.name} - ${music.artist}`));
      // Bouton pour mettre la musique en file d'attente sur Spotify
      // const divtools = document.createElement('div');
      // divtools.id = 'tools';

      // const addToQueueButton = document.createElement('ion-button');
      // addToQueueButton.addEventListener('click', () => {
      //   this.addToQueue(music.id);
      // });
      // const queueImg = document.createElement('ion-icon');
      // queueImg.name = 'ionic'; // Votre chemin d'accès à l'image ici
      // queueImg.style.width = '25px';

      // addToQueueButton.appendChild(queueImg);
      // divtools.appendChild(addToQueueButton);

      // // Bouton pour jouer la musique sur Spotify
      // const playButton = document.createElement('ion-button');
      // playButton.addEventListener('click', () => {
      //   this.spotifyWebApi.play({
      //     uris: [`spotify:track:${music.id}`],
      //   });
      // });
      // const playImg = document.createElement('ion-icon');
      // playImg.name = 'ionic'; // Votre chemin d'accès à l'image ici

      // playImg.classList.add('tools-track');
      // playImg.style.width = '25px';
      // playButton.appendChild(playImg);
      // divtools.appendChild(playButton);
      // p.appendChild(divtools);

      likedTrackDiv?.appendChild(p);
    }

    const btnRefrshLike = document.createElement('ion-button');
    btnRefrshLike.classList.add('btn');
    btnRefrshLike.classList.add('btn-primary');
    btnRefrshLike.textContent = "Charger d'autres musiques";
    btnRefrshLike.id = 'reload-liked';
    btnRefrshLike.addEventListener('click', () => this.displayLikedTrack());
    likedTrackDiv?.appendChild(btnRefrshLike);

    /*
    // Jouer le titre aimé aléatoire
    let o = 0;

    document.getElementById('pre').addEventListener('click', () => {
      o--;
      this.appComponent.spotifyWebApi.play({
        uris: [`spotify:track:${this.playlist[o].id}`],
      });
    });

    document.getElementById('next').addEventListener('click', () => {
      o++;
      this.appComponent.spotifyWebApi.play({
        uris: [`spotify:track:${this.playlist[o].id}`],
      });
    });

    document.getElementById('play').addEventListener('click', () => {
      this.appComponent.spotifyWebApi.play({
        uris: [`spotify:track:${this.playlist[o].id}`],
      });
    });*/
  }
}
