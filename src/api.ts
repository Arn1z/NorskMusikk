import { Difficulty, Track } from './types';

const ARTISTS: Record<Difficulty, string[]> = {
  lett: ['Karpe', 'TIX', 'Kygo', 'Alan Walker', 'a-ha', 'Madcon', 'Marcus & Martinus', 'Hkeem'],
  medium: ['Sigrid', 'Astrid S', 'Aurora', 'Girl in Red', 'Röyksopp', 'Matoma', 'Broiler', 'Julie Bergan'],
  vanskelig: ['Sondre Justad', 'Kaizers Orchestra', 'Hellbillies', 'CC Cowboys', 'Dumdum Boys', 'Postgirobygget', 'Di Derre', 'Vamp'],
  umulig: ['Jokke', 'Raga Rockers', 'DeLillos', 'Klovner i Kamp', 'Stein Torleif Bjella', 'Odd Nordstoga', 'Gåte', 'Seigmen']
};

export const fetchTracks = async (difficulty: Difficulty): Promise<Track[]> => {
  const artists = ARTISTS[difficulty];
  const allTracks: Track[] = [];

  const fetchPromises = artists.map(async (artist) => {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&entity=song&limit=15&country=no`);
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
