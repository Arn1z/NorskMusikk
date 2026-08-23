export type Difficulty = 'lett' | 'medium' | 'vanskelig' | 'umulig';
export type Region = 'global' | 'no' | 'se' | 'dk' | 'us' | 'uk';
export type Genre = 'all' | 'pop' | 'rock' | 'rap';
export type Language = 'no' | 'en';

export interface Track {
  id: number;
  artistName: string;
  trackName: string;
  previewUrl: string;
  artworkUrl100: string;
}

export type GameState = 'start' | 'loading' | 'playing' | 'result' | 'pvp_queue' | 'pvp_playing' | 'pvp_result';
