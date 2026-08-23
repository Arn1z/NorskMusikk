export type Difficulty = 'lett' | 'medium' | 'vanskelig' | 'umulig';

export interface Track {
  id: number;
  artistName: string;
  trackName: string;
  previewUrl: string;
  artworkUrl100: string;
}

export type GameState = 'start' | 'loading' | 'playing' | 'result' | 'pvp_queue' | 'pvp_playing' | 'pvp_result';
