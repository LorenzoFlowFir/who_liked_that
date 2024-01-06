import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { Track } from '../../models/track.model';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  public spotifyWebApi = new SpotifyWebApi();

  constructor() {}

  public async getVolume(accessToken: any) {
    this.spotifyWebApi.setAccessToken(accessToken);
    try {
      const volume = await this.spotifyWebApi.getMyCurrentPlaybackState();
      return volume;
    } catch (error) {
      console.error('Erreur lors de la récupération du volume :', error);
      return error;
    }
  }

  public async setVolume(accessToken: any, volume: number) {
    this.spotifyWebApi.setAccessToken(accessToken);
    try {
      const setVolume = await this.spotifyWebApi.setVolume(volume);
      return setVolume;
    } catch (error) {
      console.error('Erreur lors de la modification du volume :', error);
      return error;
    }
  }

  //Fonction qui permet de mettre en pause la musique
  public async pauseMusic(accessToken: any) {
    this.spotifyWebApi.setAccessToken(accessToken);
    try {
      const pause = await this.spotifyWebApi.pause();
      return pause;
    } catch (error) {
      console.error('Erreur lors de la mise en pause de la musique :', error);
      return error;
    }
  }

  //Fonction qui lance une musique avec son id
  public async playMusic(accessToken: any, trackId: any) {
    this.spotifyWebApi.setAccessToken(accessToken);
    try {
      const play = await this.spotifyWebApi.play({
        uris: [`spotify:track:${trackId}`],
      });
      return play;
    } catch (error) {
      console.error('Erreur lors de la lecture de la musique :', error);
      return error;
    }
  }
}
