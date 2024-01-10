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
import { RandomSongForTheGameComponent } from 'src/app/pages/lobby/random-song-for-the-game/random-song-for-the-game.component';
import { ModalController } from '@ionic/angular/standalone';
import { ModalContentComponent } from 'src/shared/modal-content/modal-content.component';
import { SongDetailComponent } from 'src/app/pages/lobby/random-song-for-the-game/song-detail/song-detail.component';

@Injectable({
  providedIn: 'root',
})
export class LikedSongService {
  public playlist: Playlist | undefined;
  public newPlaylist: Playlist | undefined;
  public allTracks: Track[] = [];
  public allPlaylists: Track[] = [];
  public loader = false;
  public firestore: Firestore = inject(Firestore);

  constructor(
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {}

  public spotifyWebApi = new SpotifyWebApi();
  public isLoading = true;

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

  //Verifie que l'utilisateur n'a pas un document dans la collection Playlist
  public async VerifierPlaylistExiste(idUtilisateur: string) {
    try {
      const docRef = doc(
        this.firestore,
        'Playlist',
        `playlist_${idUtilisateur}`
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        //console.log('Document data:', docSnap.data());
        return true;
      } else {
        //console.log("Ce joueur n'existe pas!");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur :", error);
      return false; // Il est préférable de renvoyer false plutôt que l'erreur elle-même
    }
  }

  //Créer une Playlist
  public async CreatePlaylist(user: User, liked_song: Track[]) {
    try {
      const playlist: Playlist = {
        user_id: user.id,
        liked_song: liked_song,
      };
      this.playlist = playlist;
      return playlist;
    } catch (error) {
      console.error('Erreur lors de la création de la playlist :', error);
      return new Error('Erreur lors de la création de la playlist');
    }
  }

  //Créer un document dans la collection Playlist
  public async AddPlaylistInDB(playlist: Playlist) {
    try {
      // Créez une référence au document avec l'ID spécifique
      const docRef = doc(
        this.firestore,
        'Playlist',
        `playlist_${playlist.user_id}`
      );

      // Utilisez setDoc pour créer le document avec les données de l'utilisateur
      await setDoc(docRef, playlist);

      console.log('Document written with ID: ', `playlist_${playlist.user_id}`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      return false;
    }
  }

  //Récupere les infos de l'utilisateur depuis la collection Playlist
  public async GetPlaylistFromDB(
    idUtilisateur: string
  ): Promise<Playlist | boolean> {
    try {
      const docRef = doc(
        this.firestore,
        'Playlist',
        `playlist_${idUtilisateur}`
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Document data (from db):', docSnap.data());
        return docSnap.data() as Playlist;
      } else {
        console.log('No such document!');
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      return false;
    }
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

  public async get10RandomTracksFromPlaylist(allTracks: Playlist) {
    this.newPlaylist = {
      user_id: allTracks.user_id,
      liked_song: [],
    };

    let randomTrack;
    for (let i = 0; i < 10; i++) {
      randomTrack =
        allTracks.liked_song[
          Math.floor(Math.random() * allTracks.liked_song.length)
        ];
      this.newPlaylist?.liked_song.push(randomTrack);
    }

    return this.newPlaylist;
  }

  public async displayLikedTrack(allTracks: Playlist, newPlaylist: Playlist) {
    const likedTrackDiv = document.getElementById('liked-track');
    if (likedTrackDiv) {
      likedTrackDiv.innerHTML = ' ';
    } else {
      // Gérer le cas où l'élément n'existe pas
      console.error('Element avec l\'id "liked-track" n\'a pas été trouvé');
    }
    // Vider les détails de la newPlaylist précédente

    for (const music of newPlaylist?.liked_song ?? []) {
      const trackData = await this.spotifyWebApi.getTrack(music.id);
      // Créez un conteneur flex pour chaque piste
      const trackContainer = document.createElement('div');
      trackContainer.style.display = 'flex';
      trackContainer.style.alignItems = 'center';
      trackContainer.style.marginBottom = '10px'; // Espace entre les pistes

      // Créez et configurez l'image
      const img = document.createElement('img');
      img.src = trackData.album.images[0].url;
      img.alt = `Cover de ${music.name} - ${music.artist}`;
      img.style.width = '50px';
      img.style.marginRight = '10px'; // Espace entre l'image et le texte
      img.addEventListener('click', () => {
        this.showTrackDetailsModal(music);
      });

      // Ajoutez l'image au conteneur
      trackContainer.appendChild(img);

      // Créez et configurez le texte de la piste
      const trackText = document.createElement('span'); // Utilisez 'span' pour le texte
      const truncatedName = this.truncateString(music.name, 15);
      const truncatedArtist = this.truncateString(music.artist, 15);
      trackText.textContent = `${truncatedName} - ${truncatedArtist}`;
      trackText.style.flex = '1'; // Permet au texte de remplir l'espace restant

      // Ajoutez le texte au conteneur
      trackContainer.appendChild(trackText);

      // Ajoutez le conteneur au div#liked-track
      likedTrackDiv?.appendChild(trackContainer);
    }

    // const btnRefrshLike = document.createElement('ion-button');
    // btnRefrshLike.classList.add('btn');
    // btnRefrshLike.classList.add('btn-primary');
    // btnRefrshLike.textContent = "Charger d'autres musiques";
    // btnRefrshLike.id = 'reload-liked';
    // btnRefrshLike.addEventListener('click', () =>
    //   this.get10RandomTracksFromPlaylist(allTracks).then((playlist) => {
    //     this.isLoading = true;
    //     document.getElementById('btnslot')?.removeChild(btnRefrshLike);
    //     this.displayLikedTrack(allTracks, playlist);
    //   })
    // );

    // document.getElementById('btnslot')?.appendChild(btnRefrshLike);
    console.log(newPlaylist);
    this.isLoading = false;
    return newPlaylist;
  }

  private async showTrackDetailsModal(track: Track) {
    // Afficher un modal de confirmation ici
    const modal = await this.modalController.create({
      component: SongDetailComponent,
      cssClass: 'detail-song',
      componentProps: {
        track: track, // Passez "partyId" comme propriété au modal
      },
    });

    // Présenter le modal
    return modal.present();
  }

  //Getter et setter curent AllTracks

  public getAllTracks(): Track[] {
    return this.allTracks;
  }

  public setAllTracks(allTracks: Track[]): void {
    this.allTracks = allTracks;
  }

  truncateString(str: string, num: number): string {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + '...';
  }
}
