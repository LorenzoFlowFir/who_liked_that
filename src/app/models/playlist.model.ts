import { Track } from './track.model';

export interface Playlist {
  user_id: string;
  liked_song: Track[];
}
