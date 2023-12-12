import { Injectable, inject } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { User } from '../../models/user.model';
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
export class UserInfoService {
  public spotifyWebApi = new SpotifyWebApi();
  public user: User | undefined;
  firestore: Firestore = inject(Firestore);

  constructor() {}

  //Récupere les infos de l'utilisateur depuis son compte Spotify
  public async getInfoPersonnelUtilisateur(accessToken: string) {
    this.spotifyWebApi.setAccessToken(accessToken);

    try {
      const userProfile = await this.spotifyWebApi.getMe();
      return userProfile;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations de l'utilisateur :",
        error
      );
      return error;
    }
  }

  //Créer un utilisateur
  public async CreateUser(userProfile: any): Promise<User | Error> {
    try {
      const user: User = {
        id: userProfile.id,
        nom: userProfile.display_name,
        api_joueur: userProfile.href,
        followers: userProfile.followers.total,
        nb_connexion: 0,
        nb_parties: 0,
        nb_victoires: 0,
        nb_defaites: 0,
        niveau_joueur: 0,
        photo_profil: userProfile.images[0].url,
        profil_spotify: userProfile.external_urls.spotify,
        type: userProfile.type,
        uri: userProfile.uri,
        volume_effets_joueur: 0,
        volume_musique_joueur: 0,
        xp: 0,
      };
      this.user = user;
      return user;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      return new Error("Erreur lors de la création de l'utilisateur");
    }
  }

  //Verifier dans la collection joueur si l'utilisateur existe
  public async VerifierUtilisateurExiste(idUtilisateur: string) {
    try {
      const docRef = doc(this.firestore, 'Joueur', idUtilisateur);
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

  //Créer un utilisateur dans la collection joueur
  public async AddUserInDB(user: User) {
    try {
      // Créez une référence au document avec l'ID spécifique
      const docRef = doc(this.firestore, 'Joueur', user.id);

      // Utilisez setDoc pour créer le document avec les données de l'utilisateur
      await setDoc(docRef, user);

      console.log('Document written with ID: ', user.id);
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      return false;
    }
  }

  //Récupere les infos de l'utilisateur depuis la collection joueur
  public async GetUserInfoFromDB(idUtilisateur: string) {
    try {
      const docRef = doc(this.firestore, 'Joueur', idUtilisateur);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Document data (from db):', docSnap.data());
        return docSnap.data();
      } else {
        console.log('No such document!');
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      return false;
    }
  }
}
