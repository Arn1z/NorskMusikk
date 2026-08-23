import fs from 'fs';

const content = `import { Difficulty, Region } from './types';

export const ARTISTS_BY_REGION: Record<Region, Record<Difficulty, string[]>> = {
  global: {
    lett: ['Taylor Swift', 'Ed Sheeran', 'Justin Bieber', 'Ariana Grande', 'Dua Lipa', 'The Weeknd', 'Billie Eilish', 'Drake', 'Bruno Mars', 'Post Malone', 'Eminem', 'Rihanna', 'Katy Perry', 'Coldplay', 'Imagine Dragons', 'Maroon 5', 'Shawn Mendes', 'Miley Cyrus', 'Selena Gomez', 'Olivia Rodrigo', 'Harry Styles', 'Doja Cat', 'Lady Gaga', 'Sam Smith', 'Adele', 'Sia', 'David Guetta', 'Calvin Harris', 'Avicii'],
    medium: ['Queen', 'The Beatles', 'Michael Jackson', 'Madonna', 'Elton John', 'David Bowie', 'Prince', 'Nirvana', 'Red Hot Chili Peppers', 'Foo Fighters', 'Green Day', 'Linkin Park', 'Blink-182', 'Oasis', 'Blur', 'Radiohead', 'The Killers', 'Arctic Monkeys', 'The Strokes', 'Muse', 'Gorillaz', 'Beyonce', 'Jay-Z', 'Kanye West', 'Kendrick Lamar', 'Outkast', 'TLC', 'Destinys Child', 'Spice Girls', 'Backstreet Boys'],
    vanskelig: ['Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Bob Dylan', 'The Cure', 'The Smiths', 'Joy Division', 'Fleetwood Mac', 'Eagles', 'Aerosmith', 'AC/DC', 'Guns N Roses', 'Metallica', 'Iron Maiden', 'Black Sabbath', 'Judas Priest', 'The Clash', 'Sex Pistols', 'Ramones', 'Misfits', 'Sonic Youth', 'Pixies', 'The Smashing Pumpkins', 'Pearl Jam', 'Soundgarden', 'Alice in Chains', 'Stone Temple Pilots'],
    umulig: ['Miles Davis', 'John Coltrane', 'Charles Mingus', 'Thelonious Monk', 'Nina Simone', 'Aretha Franklin', 'Stevie Wonder', 'Marvin Gaye', 'James Brown', 'Curtis Mayfield', 'Sly & The Family Stone', 'Parliament', 'Funkadelic', 'Earth, Wind & Fire', 'Kool & The Gang', 'Chic', 'Sister Sledge', 'Diana Ross', 'Donna Summer', 'Giorgio Moroder', 'Kraftwerk', 'Brian Eno', 'Tangerine Dream', 'Can', 'Neu!', 'Faust', 'Velvet Underground', 'Patti Smith', 'Television', 'Talking Heads']
  },
  no: {
    lett: ['Karpe', 'TIX', 'Kygo', 'Alan Walker', 'a-ha', 'Madcon', 'Marcus & Martinus', 'Hkeem', 'Astrid S', 'Sigrid', 'Julie Bergan', 'Chris Holsten', 'Dagny', 'Matoma', 'Broiler', 'Victoria Nadine', 'Kamelen', 'Undergrunn', 'Ballinciaga', 'Roc Boyz', 'Bausa', 'Emma Steinbakken', 'Stig Brenner', 'Arif', 'Morgan Sulele', 'Innertier', 'Katastrofe'],
    medium: ['Aurora', 'Girl in Red', 'Röyksopp', 'Sondre Justad', 'Gabrielle', 'Vinni', 'Paperboys', 'Madrugada', 'Bigbang', 'Ina Wroldsen', 'Ruben', 'Halvdan Sivertsen', 'Jan Eggum', 'Bjørn Eidsvåg', 'Wenche Myhre', 'Kurt Nilsen', 'Espen Lind', 'Lene Marlin', 'Donkeyboy', 'Maria Mena', 'M2M', 'Tone Damli', 'Sissel Kyrkjebø', 'Ole Paus', 'Jahn Teigen', 'Finn Kalvik', 'Kari Bremnes'],
    vanskelig: ['Kaizers Orchestra', 'Hellbillies', 'CC Cowboys', 'Dumdum Boys', 'Postgirobygget', 'Di Derre', 'Vamp', 'deLillos', 'Raga Rockers', 'Jokke & Valentinerne', 'Seigmen', 'Motorpsycho', 'Turbonegro', 'Kvelertak', 'D.D.E.', 'Åge Aleksandersen', 'Lars Bremnes', 'Sondre Lerche', 'Thomas Dybdahl', 'Kings of Convenience', 'Briskeby', 'Span', 'Gåte', 'Vassendguttene', 'Rotlaus'],
    umulig: ['Stein Torleif Bjella', 'Odd Nordstoga', 'Klovner i Kamp', 'Tungtvann', 'Honningbarna', 'Razika', 'Kråkesølv', 'John Olav Nilsen & Gjengen', 'Fjorden Baby!', 'Kakkmaddafakka', 'Highasakite', 'Susanne Sundfør', 'Ane Brun', 'Wardruna', 'Enslaved', 'Satyricon', 'Dimmu Borgir', 'Burzum', 'Mayhem', 'Madder Mortem', 'Arcturus', 'Borknagar', 'Leprous', 'Shining', 'Jaga Jazzist', 'Sløtface', 'Blood Command', 'Gatas Parlament', 'Equicez', 'Karpe Diem']
  },
  se: {
    lett: ['ABBA', 'Avicii', 'Zara Larsson', 'Swedish House Mafia', 'Roxette', 'Robyn', 'Tove Lo', 'Alesso', 'Veronica Maggio', 'Håkan Hellström', 'Kent', 'Molly Sandén', 'Danny Saucedo', 'Benjamin Ingrosso', 'Victor Leksell', 'Hov1', 'Miss Li', 'Eric Saade', 'Måns Zelmerlöw'],
    medium: ['Ghost', 'First Aid Kit', 'Mando Diao', 'The Cardigans', 'Lykke Li', 'Laleh', 'Tomas Ledin', 'Gyllene Tider', 'Europe', 'The Hives', 'Orup', 'Eva Dahlgren', 'Carola', 'Loreen', 'Darin', 'Agnes', 'September', 'Miriam Bryant', 'Linnea Henriksson'],
    vanskelig: ['In Flames', 'Opeth', 'Cornelis Vreeswijk', 'Thåström', 'Lars Winnerbäck', 'Bob hund', 'Markoolio', 'E-Type', 'Dr. Alban', 'Basshunter', 'Yung Lean', 'Einár', 'Z.E', 'Ant Wan', 'Dree Low', 'Yasin', 'Bladee', 'Silvana Imam', 'Timbuktu', 'Petter'],
    umulig: ['Meshuggah', 'At The Gates', 'Dark Tranquillity', 'Bathory', 'Entombed', 'Candlemass', 'Amon Amarth', 'Katatonia', 'Tiamat', 'Soilwork', 'Peter Bjorn and John', 'The Knife', 'Fever Ray', 'Dungen', 'José González', 'The Tallest Man on Earth', 'Jens Lekman', 'Shout Out Louds', 'Miike Snow', 'Galantis']
  },
  dk: {
    lett: ['Lukas Graham', 'Aqua', 'Volbeat', 'MØ', 'Martin Jensen', 'Christopher', 'Medina', 'Kesi', 'Gilli', 'Suspekt', 'Branco', 'Node', 'Stepz', 'Sivas', 'TopGunn', 'Kidd', 'Icekiid', 'Jimilian', 'Gobs', 'Thor Farlov'],
    medium: ['Rasmus Seebach', 'Kim Larsen', 'D-A-D', 'Mew', 'The Raveonettes', 'Alphabeat', 'Burhan G', 'Nik & Jay', 'Hjalmer', 'Mads Langer', 'Carpark North', 'Kashmir', 'Saybia', 'VETO', 'Dizzy Mizz Lizzy', 'Tim Christensen', 'Sort Sol', 'Thomas Helmig', 'Sanne Salomonsen'],
    vanskelig: ['Gasolin', 'Nephew', 'Malk de Koijn', 'C.V. Jørgensen', 'Gnags', 'TV-2', 'Shu-bi-dua', 'Lis Sørensen', 'Anne Linnet', 'Poul Krebs', 'Allan Olsen', 'Lars Lilholt', 'Michael Learns To Rock', 'Outlandish', 'Infernal', 'Safri Duo', 'Trentemøller', 'Phlake', 'Scarlet Pleasure'],
    umulig: ['King Diamond', 'Mercyful Fate', 'Artillery', 'Pretty Maids', 'Mournful Congregation', 'Myrkur', 'Iceage', 'Efterklang', 'Under Byen', 'Bisse', 'Jada', 'The Minds of 99', 'Magtens Korridorer', 'Ulige Numre', 'Vild Smith', 'Specktors', 'Ukendt Kunstner', 'Folkeklubben']
  },
  us: {
    lett: ['Taylor Swift', 'Drake', 'Beyonce', 'Eminem', 'Bruno Mars', 'Billie Eilish', 'Post Malone', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'The Weeknd', 'Justin Timberlake', 'Miley Cyrus', 'Selena Gomez', 'Demi Lovato', 'Nicki Minaj', 'Cardi B', 'Megan Thee Stallion', 'Doja Cat', 'Lil Nas X'],
    medium: ['Kanye West', 'Kendrick Lamar', 'Red Hot Chili Peppers', 'Foo Fighters', 'Green Day', 'Linkin Park', 'Blink-182', 'Weezer', 'The Killers', 'Imagine Dragons', 'Maroon 5', 'Fall Out Boy', 'Panic! At The Disco', 'My Chemical Romance', 'Paramore', 'Aerosmith', 'Bon Jovi', 'Bruce Springsteen', 'Tom Petty', 'John Mellencamp'],
    vanskelig: ['Michael Jackson', 'Elvis Presley', 'Madonna', 'Prince', 'Johnny Cash', 'Nirvana', 'Metallica', 'Guns N Roses', 'Motley Crue', 'Def Leppard', 'Poison', 'Cinderella', 'Warrant', 'Skid Row', 'Alice Cooper', 'KISS', 'Van Halen', 'Rush', 'Journey', 'Foreigner', 'Styx', 'REO Speedwagon', 'Boston', 'Kansas'],
    umulig: ['The Doors', 'Jimi Hendrix', 'Bob Dylan', 'Frank Sinatra', 'Aretha Franklin', 'Stevie Wonder', 'Miles Davis', 'John Coltrane', 'Chuck Berry', 'Little Richard', 'Fats Domino', 'Buddy Holly', 'Jerry Lee Lewis', 'Roy Orbison', 'Patsy Cline', 'Hank Williams', 'Merle Haggard', 'Waylon Jennings', 'Willie Nelson', 'Townes Van Zandt']
  },
  uk: {
    lett: ['Ed Sheeran', 'Dua Lipa', 'Harry Styles', 'Adele', 'Sam Smith', 'Coldplay', 'Arctic Monkeys', 'Calvin Harris', 'Rita Ora', 'Ellie Goulding', 'Jess Glynne', 'One Direction', 'Little Mix', 'Zayn', 'Niall Horan', 'Liam Payne', 'Louis Tomlinson', 'George Ezra', 'James Bay', 'Lewis Capaldi'],
    medium: ['Oasis', 'Blur', 'Muse', 'Radiohead', 'Gorillaz', 'Florence + The Machine', 'The 1975', 'Bastille', 'Mumford & Sons', 'Royal Blood', 'Catfish and the Bottlemen', 'Foals', 'Biffy Clyro', 'Two Door Cinema Club', 'The Wombats', 'The Kooks', 'Kasabian', 'Kaiser Chiefs', 'Franz Ferdinand', 'Snow Patrol'],
    vanskelig: ['The Beatles', 'Queen', 'Elton John', 'David Bowie', 'The Rolling Stones', 'Pink Floyd', 'Led Zeppelin', 'Fleetwood Mac', 'The Who', 'The Kinks', 'The Animals', 'The Yardbirds', 'Cream', 'Dire Straits', 'Police', 'The Jam', 'The Clash', 'Sex Pistols', 'Joy Division', 'New Order', 'Depeche Mode', 'The Cure', 'The Smiths', 'Stone Roses', 'Happy Mondays'],
    umulig: ['Black Sabbath', 'Iron Maiden', 'Judas Priest', 'Motorhead', 'Deep Purple', 'Jethro Tull', 'Genesis', 'Yes', 'King Crimson', 'ELP', 'T. Rex', 'Roxy Music', 'Slade', 'Sweet', 'Mott the Hoople', 'Madness', 'The Specials', 'UB40', 'Dexys Midnight Runners', 'Tears for Fears', 'Human League', 'Soft Cell', 'Yazoo', 'Eurythmics']
  }
};

export const ARTISTS_BY_GENRE: Record<Region, Record<string, string[]>> = {
  global: {
    pop: ['Taylor Swift', 'Dua Lipa', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'Adele', 'Ed Sheeran', 'Justin Bieber', 'Madonna', 'Michael Jackson', 'Beyonce', 'Rihanna', 'Bruno Mars', 'The Weeknd', 'Billie Eilish', 'Miley Cyrus', 'Selena Gomez', 'Shawn Mendes', 'Charlie Puth', 'Harry Styles'],
    rock: ['Queen', 'The Beatles', 'Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Nirvana', 'Foo Fighters', 'AC/DC', 'Guns N Roses', 'Metallica', 'Red Hot Chili Peppers', 'Green Day', 'Linkin Park', 'Blink-182', 'Oasis', 'Blur', 'Radiohead', 'The Killers', 'Arctic Monkeys', 'The Strokes', 'Aerosmith', 'Bon Jovi'],
    rap: ['Eminem', 'Drake', 'Kendrick Lamar', 'Kanye West', 'Tupac', 'The Notorious B.I.G.', 'Snoop Dogg', 'Jay-Z', 'Travis Scott', 'J. Cole', 'Post Malone', 'Nicki Minaj', 'Cardi B', 'Megan Thee Stallion', 'Lil Wayne', '50 Cent', 'Dr. Dre', 'Ice Cube', 'Nas', 'Wu-Tang Clan', 'Outkast'],
    country: ['Johnny Cash', 'Dolly Parton', 'Shania Twain', 'Garth Brooks', 'Carrie Underwood', 'Luke Combs', 'Morgan Wallen', 'Kenny Rogers', 'Willie Nelson', 'Tim McGraw', 'Faith Hill', 'Brad Paisley', 'Blake Shelton', 'Miranda Lambert', 'Kacey Musgraves', 'Alan Jackson', 'George Strait', 'Reba McEntire', 'Dixie Chicks', 'Lady A']
  },
  no: {
    pop: ['Sigrid', 'Astrid S', 'Aurora', 'Julie Bergan', 'Dagny', 'Chris Holsten', 'Marcus & Martinus', 'Emma Steinbakken', 'Victoria Nadine', 'Ina Wroldsen', 'Lene Marlin', 'Maria Mena', 'Tone Damli', 'Sissel Kyrkjebø', 'Wenche Myhre', 'Hanne Krogh', 'Elisabeth Andreassen', 'Anita Skorgan', 'Inger Lise Rypdal', 'Kirsti Sparboe'],
    rock: ['Kaizers Orchestra', 'Dumdum Boys', 'CC Cowboys', 'Hellbillies', 'Seigmen', 'Raga Rockers', 'Jokke & Valentinerne', 'Bigbang', 'Motorpsycho', 'Turbonegro', 'Kvelertak', 'D.D.E.', 'Åge Aleksandersen', 'Span', 'Briskeby', 'Honningbarna', 'Razika', 'Kråkesølv', 'Skambankt', 'Oslo Ess', 'Valentourettes'],
    rap: ['Karpe', 'Madcon', 'Klovner i Kamp', 'Kamelen', 'Undergrunn', 'Arif', 'Unge Ferrari', 'Hkeem', 'Ballinciaga', 'Roc Boyz', 'Bausa', 'Stig Brenner', 'Tungtvann', 'Gatas Parlament', 'Equicez', 'Paperboys', 'Erik og Kriss', 'Jaa9 & OnklP', 'OnklP', 'Vinni', 'Tommy Tee', 'Warlocks'],
    country: ['Vassendguttene', 'Hellbillies', 'Sie Gubba', 'Rotlaus', 'Plumbo', 'Gunslingers', 'Hagle', 'Kurt Nilsen', 'Staut', 'Vestlandsfanden', 'Vømmøl Spellmannslag', 'Too Far Gone', 'D.D.E.', 'Byting', 'Halva Priset', 'Spel', 'E-76', 'Bjøro Håland', 'Sputnik', 'Steff Nevers']
  },
  se: {
    pop: ['ABBA', 'Zara Larsson', 'Robyn', 'Tove Lo', 'Veronica Maggio', 'Molly Sandén', 'Danny Saucedo', 'Benjamin Ingrosso', 'Victor Leksell', 'Miss Li', 'Eric Saade', 'Måns Zelmerlöw', 'Carola', 'Loreen', 'Darin', 'Agnes', 'September', 'Orup', 'Eva Dahlgren', 'Roxette', 'Ace of Base'],
    rock: ['Kent', 'Ghost', 'The Hives', 'Mando Diao', 'In Flames', 'Opeth', 'Europe', 'The Cardigans', 'Gyllene Tider', 'Tomas Ledin', 'Thåström', 'Lars Winnerbäck', 'Bob hund', 'Meshuggah', 'At The Gates', 'Dark Tranquillity', 'Bathory', 'Entombed', 'Candlemass', 'Amon Amarth'],
    rap: ['Yung Lean', 'Bladee', 'Z.E', 'Einár', 'Jireel', 'Hov1', 'Ant Wan', 'Mwuana', 'Dree Low', 'Yasin', 'Silvana Imam', 'Timbuktu', 'Petter', 'Ken Ring', 'Latin Kings', 'Just D', 'LoopTroop', 'Maskinen', 'Ansiktet', 'Snook'],
    country: ['Jill Johnson', 'Kikki Danielsson', 'Lasse Stefanz', 'First Aid Kit', 'Doug Seegers', 'Hasse Andersson', 'Jay Smith', 'Christian Kjellvander', 'The Tallest Man on Earth', 'José González', 'Weeping Willows', 'Sophie Zelmani', 'Anna Ternheim', 'Melissa Horn', 'Lars Winnerbäck']
  },
  dk: {
    pop: ['Lukas Graham', 'MØ', 'Medina', 'Christopher', 'Aqua', 'Alphabeat', 'Burhan G', 'Hjalmer', 'Mads Langer', 'Rasmus Seebach', 'Kim Larsen', 'Thomas Helmig', 'Sanne Salomonsen', 'Lis Sørensen', 'Anne Linnet', 'Michael Learns To Rock', 'Infernal', 'Safri Duo', 'Trentemøller', 'Phlake', 'Scarlet Pleasure'],
    rock: ['Volbeat', 'D-A-D', 'Gasolin', 'Nephew', 'Kashmir', 'Mew', 'Dizzy Mizz Lizzy', 'Sort Sol', 'Carpark North', 'Saybia', 'VETO', 'Tim Christensen', 'Shu-bi-dua', 'Gnags', 'TV-2', 'Magtens Korridorer', 'King Diamond', 'Mercyful Fate', 'Iceage', 'The Minds of 99'],
    rap: ['Gilli', 'Suspekt', 'Kesi', 'Malk de Koijn', 'Branco', 'Node', 'Stepz', 'Sivas', 'TopGunn', 'Kidd', 'Icekiid', 'Jimilian', 'Gobs', 'Thor Farlov', 'Outlandish', 'Vild Smith', 'Specktors', 'Ukendt Kunstner', 'Tessa', 'L.O.C.', 'Clemens', 'Jokeren'],
    country: ['Jacob Dinesen', 'Tamra Rosanes', 'Ester Brohus', 'Kandis', 'Poul Krebs', 'Allan Olsen', 'Søren Huss', 'Signe Svendsen', 'Lars Lilholt', 'Dalton', 'Johnny Madsen', 'Folkeklubben', 'Niels Hausgaard', 'Mikael Wiehe', 'Björn Afzelius']
  },
  us: {
    pop: ['Taylor Swift', 'Ariana Grande', 'Katy Perry', 'Lady Gaga', 'Billie Eilish', 'Beyonce', 'Bruno Mars', 'Post Malone', 'The Weeknd', 'Justin Timberlake', 'Miley Cyrus', 'Selena Gomez', 'Demi Lovato', 'Madonna', 'Michael Jackson', 'Prince', 'Whitney Houston', 'Mariah Carey', 'Celine Dion', 'Cher'],
    rock: ['Nirvana', 'Foo Fighters', 'Red Hot Chili Peppers', 'Green Day', 'Linkin Park', 'The Doors', 'Jimi Hendrix', 'Metallica', 'Guns N Roses', 'Aerosmith', 'Bon Jovi', 'Bruce Springsteen', 'Tom Petty', 'John Mellencamp', 'Eagles', 'Fleetwood Mac', 'Boston', 'Kansas', 'Styx', 'REO Speedwagon', 'Journey', 'Foreigner'],
    rap: ['Eminem', 'Drake', 'Kendrick Lamar', 'Kanye West', 'Tupac', 'The Notorious B.I.G.', 'Snoop Dogg', 'Travis Scott', 'J. Cole', 'Lil Wayne', '50 Cent', 'Dr. Dre', 'Ice Cube', 'Nas', 'Wu-Tang Clan', 'Outkast', 'Jay-Z', 'Nicki Minaj', 'Cardi B', 'Megan Thee Stallion', 'Lil Nas X', 'Juice WRLD'],
    country: ['Johnny Cash', 'Dolly Parton', 'Willie Nelson', 'Garth Brooks', 'Carrie Underwood', 'Luke Bryan', 'Morgan Wallen', 'Chris Stapleton', 'Shania Twain', 'Tim McGraw', 'Faith Hill', 'Brad Paisley', 'Blake Shelton', 'Miranda Lambert', 'Kacey Musgraves', 'Alan Jackson', 'George Strait', 'Reba McEntire', 'Dixie Chicks', 'Lady A', 'Patsy Cline', 'Hank Williams', 'Merle Haggard', 'Waylon Jennings', 'Townes Van Zandt']
  },
  uk: {
    pop: ['Ed Sheeran', 'Dua Lipa', 'Harry Styles', 'Adele', 'Sam Smith', 'Rita Ora', 'Ellie Goulding', 'Jess Glynne', 'One Direction', 'Little Mix', 'Zayn', 'Niall Horan', 'Liam Payne', 'Louis Tomlinson', 'George Ezra', 'James Bay', 'Lewis Capaldi', 'Spice Girls', 'Take That', 'Robbie Williams', 'George Michael', 'Elton John'],
    rock: ['The Beatles', 'Queen', 'Pink Floyd', 'Led Zeppelin', 'The Rolling Stones', 'Arctic Monkeys', 'Oasis', 'Radiohead', 'Blur', 'Muse', 'The 1975', 'Bastille', 'Mumford & Sons', 'Royal Blood', 'Catfish and the Bottlemen', 'Foals', 'Biffy Clyro', 'Two Door Cinema Club', 'The Wombats', 'The Kooks', 'Kasabian', 'Kaiser Chiefs', 'Franz Ferdinand', 'Snow Patrol'],
    rap: ['Stormzy', 'Skepta', 'Dave', 'Central Cee', 'Aitch', 'AJ Tracey', 'Giggs', 'J Hus', 'Dizzee Rascal', 'Wiley', 'Kano', 'Lethal Bizzle', 'Tinie Tempah', 'Tinchy Stryder', 'Chip', 'Wretch 32', 'Krept & Konan', 'Bugzy Malone', 'Stefflon Don', 'Ms Banks'],
    country: ['The Shires', 'Ward Thomas', 'Catherine McGrath', 'Mumford & Sons', 'Frank Turner', 'Passenger', 'Laura Marling', 'Bears Den', 'Ben Howard', 'George Ezra', 'Jake Bugg', 'Tom Odell', 'James Morrison', 'Paolo Nutini', 'KT Tunstall', 'Amy Macdonald']
  }
};
`;
fs.writeFileSync('src/artists.ts', content, 'utf8');
