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

export const ARTISTS_BY_GENRE: Record<string, string[]> = {
  pop: ['Taylor Swift', 'Dua Lipa', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'Adele', 'Ed Sheeran', 'Justin Bieber', 'Madonna', 'Michael Jackson'],
  rock: ['Queen', 'The Beatles', 'Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Nirvana', 'Foo Fighters', 'AC/DC', 'Guns N Roses', 'Metallica'],
  rap: ['Eminem', 'Drake', 'Kendrick Lamar', 'Kanye West', 'Tupac', 'The Notorious B.I.G.', 'Snoop Dogg', 'Jay-Z', 'Travis Scott', 'J. Cole']
};
