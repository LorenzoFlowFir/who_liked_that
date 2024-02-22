import { Track } from './track.model';

export interface Playlist {
  user_id: string;
  liked_song: Track[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  owner?: any;
  collaborative?: boolean;
  external_urls?: any;
  href?: string;
  images: any;
  primary_color?: any;
  public?: boolean;
  snapshot_id?: string;
  tracks?: any;
  type?: string;
  uri?: string;
}
