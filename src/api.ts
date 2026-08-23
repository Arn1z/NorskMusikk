import { Difficulty, Region, Genre, Track } from './types';
import { ARTISTS_BY_REGION, ARTISTS_BY_GENRE } from './artists';

export const fetchTracks = async (difficulty: Difficulty, region: Region = 'global', genre: Genre = 'all'): Promise<Track[]> => {
  let artists: string[] = [];
  
  if (genre !== 'all' && ARTISTS_BY_GENRE[region] && ARTISTS_BY_GENRE[region][genre]) {
    artists = ARTISTS_BY_GENRE[region][genre];
  } else if (genre !== 'all' && ARTISTS_BY_GENRE['global'] && ARTISTS_BY_GENRE['global'][genre]) {
    // Fallback to global genre if region doesn't have it
    artists = ARTISTS_BY_GENRE['global'][genre];
  } else {
    artists = ARTISTS_BY_REGION[region][difficulty];
  }

  const allTracks: Track[] = [];

  const fetchPromises = artists.map(async (artist) => {
    try {
      // Map region to iTunes country code (use 'us' for global)
      let countryCode = region === 'global' ? 'us' : region === 'uk' ? 'gb' : region;
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&entity=song&limit=15&country=${countryCode}`);
      const data = await response.json();
      
      return data.results
        .filter((result: any) => result.previewUrl)
        .map((result: any) => ({
          id: result.trackId,
          artistName: result.artistName,
          trackName: result.trackName,
          previewUrl: result.previewUrl,
          artworkUrl100: result.artworkUrl100,
        }));
    } catch (error) {
      console.error(`Failed to fetch for artist ${artist}:`, error);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  
  results.forEach(tracks => {
    allTracks.push(...tracks);
  });

  // Unique tracks by ID
  const uniqueMap = new Map<number, Track>();
  for (const track of allTracks) {
    if (!uniqueMap.has(track.id)) {
      uniqueMap.set(track.id, track);
    }
  }

  const uniqueTracks = Array.from(uniqueMap.values());
  
  // Shuffle
  return uniqueTracks.sort(() => 0.5 - Math.random());
};
