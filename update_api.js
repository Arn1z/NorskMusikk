import fs from 'fs';

let content = fs.readFileSync('src/api.ts', 'utf8');

const apiReplacement = `export const fetchTracks = async (difficulty: Difficulty, region: Region = 'global', genre: Genre = 'all'): Promise<Track[]> => {
  let artists: string[] = [];
  
  if (genre !== 'all' && ARTISTS_BY_GENRE[region] && ARTISTS_BY_GENRE[region][genre]) {
    artists = ARTISTS_BY_GENRE[region][genre];
  } else if (genre !== 'all' && ARTISTS_BY_GENRE['global'] && ARTISTS_BY_GENRE['global'][genre]) {
    // Fallback to global genre if region doesn't have it
    artists = ARTISTS_BY_GENRE['global'][genre];
  } else {
    artists = ARTISTS_BY_REGION[region][difficulty];
  }`;

content = content.replace(
  /export const fetchTracks = async [\s\S]*?artists = ARTISTS_BY_REGION\[region\]\[difficulty\];\n  }/,
  apiReplacement
);

fs.writeFileSync('src/api.ts', content, 'utf8');
