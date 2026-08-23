import fs from 'fs';

let content = fs.readFileSync('src/artists.ts', 'utf8');

const newGenreMapping = `export const ARTISTS_BY_GENRE: Record<Region, Record<string, string[]>> = {
  global: {
    pop: ['Taylor Swift', 'Dua Lipa', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'Adele', 'Ed Sheeran', 'Justin Bieber', 'Madonna', 'Michael Jackson'],
    rock: ['Queen', 'The Beatles', 'Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Nirvana', 'Foo Fighters', 'AC/DC', 'Guns N Roses', 'Metallica'],
    rap: ['Eminem', 'Drake', 'Kendrick Lamar', 'Kanye West', 'Tupac', 'The Notorious B.I.G.', 'Snoop Dogg', 'Jay-Z', 'Travis Scott', 'J. Cole']
  },
  no: {
    pop: ['Sigrid', 'Astrid S', 'Aurora', 'Julie Bergan', 'Dagny', 'Chris Holsten', 'Marcus & Martinus', 'Emma Steinbakken'],
    rock: ['Kaizers Orchestra', 'Dumdum Boys', 'CC Cowboys', 'Hellbillies', 'Seigmen', 'Raga Rockers', 'Jokke & Valentinerne', 'Bigbang'],
    rap: ['Karpe', 'Madcon', 'Klovner i Kamp', 'Kamelen', 'Undergrunn', 'Arif', 'Unge Ferrari', 'Hkeem']
  },
  se: {
    pop: ['ABBA', 'Zara Larsson', 'Robyn', 'Tove Lo', 'Veronica Maggio', 'Molly Sandén', 'Danny Saucedo', 'Benjamin Ingrosso'],
    rock: ['Kent', 'Ghost', 'The Hives', 'Mando Diao', 'In Flames', 'Opeth', 'Europe', 'The Cardigans'],
    rap: ['Yung Lean', 'Bladee', 'Z.E', 'Einár', 'Jireel', 'Hov1', 'Ant Wan', 'Mwuana']
  },
  dk: {
    pop: ['Lukas Graham', 'MØ', 'Medina', 'Christopher', 'Aqua', 'Alphabeat', 'Burhan G', 'Hjalmer'],
    rock: ['Volbeat', 'D-A-D', 'Gasolin', 'Nephew', 'Kashmir', 'Mew', 'Dizzy Mizz Lizzy', 'Sort Sol'],
    rap: ['Gilli', 'Suspekt', 'Kesi', 'Malk de Koijn', 'Branco', 'Node', 'Stepz', 'Sivas']
  },
  us: {
    pop: ['Taylor Swift', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'Billie Eilish', 'Beyonce', 'Bruno Mars', 'Post Malone'],
    rock: ['Nirvana', 'Foo Fighters', 'Red Hot Chili Peppers', 'Green Day', 'Linkin Park', 'The Doors', 'Jimi Hendrix', 'Metallica'],
    rap: ['Eminem', 'Drake', 'Kendrick Lamar', 'Kanye West', 'Tupac', 'The Notorious B.I.G.', 'Snoop Dogg', 'Travis Scott']
  },
  uk: {
    pop: ['Ed Sheeran', 'Dua Lipa', 'Harry Styles', 'Adele', 'Sam Smith', 'Rita Ora', 'Ellie Goulding', 'Jess Glynne'],
    rock: ['The Beatles', 'Queen', 'Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Arctic Monkeys', 'Oasis', 'Radiohead'],
    rap: ['Stormzy', 'Skepta', 'Dave', 'Central Cee', 'Aitch', 'AJ Tracey', 'Giggs', 'J Hus']
  }
};
`;

content = content.replace(
  /export const ARTISTS_BY_GENRE[\s\S]*/,
  newGenreMapping
);

fs.writeFileSync('src/artists.ts', content, 'utf8');
