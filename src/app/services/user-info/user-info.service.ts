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
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class UserInfoService {
  public spotifyWebApi = new SpotifyWebApi();
  public user: User | undefined;
  firestore: Firestore = inject(Firestore);
  private currentUser: User | undefined;
  private randomAvatarNumber = Math.floor(Math.random() * 8);

  constructor(private socketService: SocketService) {}

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
      const imageUrl =
        userProfile.images[1]?.url ||
        `../../../assets/profil_picture/avatar_${this.randomAvatarNumber}.png`;

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
        photo_profil: imageUrl,
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
      console.error(
        "Erreur lors de la création de l'utilisateur :",
        error,
        userProfile
      );
      return new Error("Erreur lors de la création de l'utilisateur");
    }
  }

  //Verifier dans la collection joueur si l'utilisateur existe
  public async VerifierUtilisateurExiste(idUtilisateur: string) {
    try {
      const docRef = doc(this.firestore, 'Joueur', idUtilisateur);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return true;
      } else {
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

      console.info('Document written with ID: ', user.id);

      this.socketService.registerUser(
        this.user?.nom ?? 'Un utilisateur',
        this.user?.id ?? '0',
        this.user?.photo_profil ??
          `../../../assets/profil_picture/avatar_${this.randomAvatarNumber}.png`
      );
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      return false;
    }
  }

  //Récupere les infos de l'utilisateur depuis la collection joueur
  public async GetUserInfoFromDB(idUtilisateur: string): Promise<User | false> {
    try {
      const docRef = doc(this.firestore, 'Joueur', idUtilisateur);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.info('Document data (from db):', docSnap.data());
        this.socketService.registerUser(
          this.user?.nom ?? 'Un utilisateur',
          this.user?.id ?? '0',
          this.user?.photo_profil ??
            `../../../assets/profil_picture/avatar_${this.randomAvatarNumber}.png`
        );

        return docSnap.data() as User;
      } else {
        console.error('No such document!');
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      return false;
    }
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
  }

  public getCurrentUser(): User | undefined {
    return this.currentUser;
  }

  public async incrementUserGames(idUtilisateur: string) {
    try {
      const userRef = doc(this.firestore, 'Joueur', idUtilisateur);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData: any = userSnap.data();
        await setDoc(
          userRef,
          { ...userData, nb_parties: (userData.nb_parties || 0) + 1 },
          { merge: true }
        );
      } else {
        console.error(
          `Utilisateur ${idUtilisateur} introuvable dans Firestore`
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du nombre de parties de l'utilisateur :",
        error
      );
    }
  }

  public async incrementUserVictory(idUtilisateur: string) {
    try {
      const userRef = doc(this.firestore, 'Joueur', idUtilisateur);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData: any = userSnap.data();
        await setDoc(
          userRef,
          { ...userData, nb_victoires: (userData.nb_victoires || 0) + 1 },
          { merge: true }
        );
      } else {
        console.error(
          `Utilisateur ${idUtilisateur} introuvable dans Firestore`
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du nombre de parties de l'utilisateur :",
        error
      );
    }
  }
}
