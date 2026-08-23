import { Difficulty, Region } from './types';

export const ARTISTS_BY_REGION: Record<Region, Record<Difficulty, string[]>> = {
  global: {
    lett: ['Taylor Swift', 'Ed Sheeran', 'Justin Bieber', 'Ariana Grande', 'Dua Lipa', 'The Weeknd', 'Billie Eilish', 'Drake'],
    medium: ['Coldplay', 'Imagine Dragons', 'Maroon 5', 'Katy Perry', 'Lady Gaga', 'Bruno Mars', 'Rihanna', 'Eminem'],
    vanskelig: ['Queen', 'The Beatles', 'Michael Jackson', 'Madonna', 'Elton John', 'David Bowie', 'Prince', 'Nirvana'],
    umulig: ['Radiohead', 'Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Bob Dylan', 'The Cure', 'The Smiths', 'Joy Division']
  },
  no: {
    lett: ['Karpe', 'TIX', 'Kygo', 'Alan Walker', 'a-ha', 'Madcon', 'Marcus & Martinus', 'Hkeem'],
    medium: ['Sigrid', 'Astrid S', 'Aurora', 'Girl in Red', 'Röyksopp', 'Matoma', 'Broiler', 'Julie Bergan'],
    vanskelig: ['Sondre Justad', 'Kaizers Orchestra', 'Hellbillies', 'CC Cowboys', 'Dumdum Boys', 'Postgirobygget', 'Di Derre', 'Vamp'],
    umulig: ['Jokke', 'Raga Rockers', 'DeLillos', 'Klovner i Kamp', 'Stein Torleif Bjella', 'Odd Nordstoga', 'Gåte', 'Seigmen']
  },
  se: {
    lett: ['ABBA', 'Avicii', 'Zara Larsson', 'Swedish House Mafia', 'Roxette', 'Robyn', 'Tove Lo', 'Alesso'],
    medium: ['Veronica Maggio', 'Håkan Hellström', 'Kent', 'Ghost', 'First Aid Kit', 'Mando Diao', 'The Cardigans', 'Lykke Li'],
    vanskelig: ['Cornelis Vreeswijk', 'Laleh', 'Tomas Ledin', 'Gyllene Tider', 'Europe', 'The Hives', 'In Flames', 'Opeth'],
    umulig: ['Thåström', 'Lars Winnerbäck', 'Bob hund', 'Markoolio', 'E-Type', 'Dr. Alban', 'Basshunter', 'Yung Lean']
  },
  dk: {
    lett: ['Lukas Graham', 'Aqua', 'Volbeat', 'MØ', 'Martin Jensen', 'Christopher', 'Medina', 'Kesi'],
    medium: ['Rasmus Seebach', 'Kim Larsen', 'D-A-D', 'Mew', 'The Raveonettes', 'Alphabeat', 'Gilli', 'Burhan G'],
    vanskelig: ['Gasolin', 'Nephew', 'Kashmir', 'Saybia', 'VETO', 'Dizzy Mizz Lizzy', 'Tim Christensen', 'Nik & Jay'],
    umulig: ['Sort Sol', 'Suspekt', 'Malk de Koijn', 'C.V. Jørgensen', 'Gnags', 'TV-2', 'Thomas Helmig', 'Sanne Salomonsen']
  },
  us: {
    lett: ['Taylor Swift', 'Drake', 'Beyonce', 'Eminem', 'Bruno Mars', 'Billie Eilish', 'Post Malone', 'Ariana Grande'],
    medium: ['Kanye West', 'Kendrick Lamar', 'Katy Perry', 'Lady Gaga', 'Red Hot Chili Peppers', 'Foo Fighters', 'Green Day', 'Linkin Park'],
    vanskelig: ['Michael Jackson', 'Elvis Presley', 'Madonna', 'Prince', 'Johnny Cash', 'Bruce Springsteen', 'Nirvana', 'Metallica'],
    umulig: ['The Doors', 'Jimi Hendrix', 'Bob Dylan', 'Frank Sinatra', 'Aretha Franklin', 'Stevie Wonder', 'Miles Davis', 'John Coltrane']
  },
  uk: {
    lett: ['Ed Sheeran', 'Dua Lipa', 'Harry Styles', 'Adele', 'Sam Smith', 'Coldplay', 'Arctic Monkeys', 'Calvin Harris'],
    medium: ['One Direction', 'Little Mix', 'Oasis', 'Blur', 'Muse', 'Radiohead', 'Gorillaz', 'Florence + The Machine'],
    vanskelig: ['The Beatles', 'Queen', 'Elton John', 'David Bowie', 'The Rolling Stones', 'Pink Floyd', 'Led Zeppelin', 'Fleetwood Mac'],
    umulig: ['The Smiths', 'Joy Division', 'The Cure', 'The Clash', 'Sex Pistols', 'Black Sabbath', 'Iron Maiden', 'Judas Priest']
  }
};

export const ARTISTS_BY_GENRE: Record<Region, Record<string, string[]>> = {
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
