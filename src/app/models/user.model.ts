export interface User {
  id: string;
  nom: string;
  api_joueur: string;
  followers: number;
  nb_connexion: number;
  nb_parties: number;
  nb_victoires: number;
  nb_defaites: number;
  niveau_joueur: number;
  photo_profil: string;
  profil_spotify: string;
  type: string;
  uri: string;
  volume_effets_joueur: number;
  volume_musique_joueur: number;
  xp: number;
}
