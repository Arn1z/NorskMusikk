import fs from 'fs';

let content = fs.readFileSync('src/artists.ts', 'utf8');

// Umulig NO
content = content.replace(
  "umulig: ['Stein Torleif Bjella', 'Odd Nordstoga', 'Klovner i Kamp', 'Tungtvann', 'Honningbarna', 'Razika', 'Kråkesølv', 'John Olav Nilsen & Gjengen', 'Fjorden Baby!', 'Kakkmaddafakka', 'Highasakite', 'Susanne Sundfør', 'Ane Brun', 'Wardruna', 'Enslaved', 'Satyricon', 'Dimmu Borgir', 'Burzum', 'Mayhem', 'Madder Mortem', 'Arcturus', 'Borknagar', 'Leprous', 'Shining', 'Jaga Jazzist', 'Sløtface', 'Blood Command', 'Gatas Parlament', 'Equicez', 'Karpe Diem']",
  "umulig: ['Stein Torleif Bjella', 'Odd Nordstoga', 'Klovner i Kamp', 'Tungtvann', 'Honningbarna', 'Razika', 'Kråkesølv', 'John Olav Nilsen & Gjengen', 'Fjorden Baby!', 'Kakkmaddafakka', 'Highasakite', 'Susanne Sundfør', 'Ane Brun', 'Wardruna', 'Enslaved', 'Satyricon', 'Dimmu Borgir', 'Burzum', 'Mayhem', 'Madder Mortem', 'Arcturus', 'Borknagar', 'Leprous', 'Shining', 'Jaga Jazzist', 'Sløtface', 'Blood Command', 'Gatas Parlament', 'Equicez', 'Karpe Diem', 'Shitrich', 'Terje Tysland', 'Hans Rotmo']"
);

// Vanskelig NO
content = content.replace(
  "vanskelig: ['Kaizers Orchestra', 'Hellbillies', 'CC Cowboys', 'Dumdum Boys', 'Postgirobygget', 'Di Derre', 'Vamp', 'deLillos', 'Raga Rockers', 'Jokke & Valentinerne', 'Seigmen', 'Motorpsycho', 'Turbonegro', 'Kvelertak', 'D.D.E.', 'Åge Aleksandersen', 'Lars Bremnes', 'Sondre Lerche', 'Thomas Dybdahl', 'Kings of Convenience', 'Briskeby', 'Span', 'Gåte', 'Vassendguttene', 'Rotlaus'],",
  "vanskelig: ['Kaizers Orchestra', 'Hellbillies', 'CC Cowboys', 'Dumdum Boys', 'Postgirobygget', 'Di Derre', 'Vamp', 'deLillos', 'Raga Rockers', 'Jokke & Valentinerne', 'Seigmen', 'Motorpsycho', 'Turbonegro', 'Kvelertak', 'D.D.E.', 'Åge Aleksandersen', 'Lars Bremnes', 'Sondre Lerche', 'Thomas Dybdahl', 'Kings of Convenience', 'Briskeby', 'Span', 'Gåte', 'Vassendguttene', 'Rotlaus', 'Terje Tysland'],"
);

// Rock NO
content = content.replace(
  "rock: ['Kaizers Orchestra', 'Dumdum Boys', 'CC Cowboys', 'Hellbillies', 'Seigmen', 'Raga Rockers', 'Jokke & Valentinerne', 'Bigbang', 'Motorpsycho', 'Turbonegro', 'Kvelertak', 'D.D.E.', 'Åge Aleksandersen', 'Span', 'Briskeby', 'Honningbarna', 'Razika', 'Kråkesølv', 'Skambankt', 'Oslo Ess', 'Valentourettes'],",
  "rock: ['Kaizers Orchestra', 'Dumdum Boys', 'CC Cowboys', 'Hellbillies', 'Seigmen', 'Raga Rockers', 'Jokke & Valentinerne', 'Bigbang', 'Motorpsycho', 'Turbonegro', 'Kvelertak', 'D.D.E.', 'Åge Aleksandersen', 'Span', 'Briskeby', 'Honningbarna', 'Razika', 'Kråkesølv', 'Skambankt', 'Oslo Ess', 'Valentourettes', 'Terje Tysland', 'Hans Rotmo'],"
);

// Rap NO
content = content.replace(
  "rap: ['Karpe', 'Madcon', 'Klovner i Kamp', 'Kamelen', 'Undergrunn', 'Arif', 'Unge Ferrari', 'Hkeem', 'Ballinciaga', 'Roc Boyz', 'Bausa', 'Stig Brenner', 'Tungtvann', 'Gatas Parlament', 'Equicez', 'Paperboys', 'Erik og Kriss', 'Jaa9 & OnklP', 'OnklP', 'Vinni', 'Tommy Tee', 'Warlocks'],",
  "rap: ['Karpe', 'Madcon', 'Klovner i Kamp', 'Kamelen', 'Undergrunn', 'Arif', 'Unge Ferrari', 'Hkeem', 'Ballinciaga', 'Roc Boyz', 'Bausa', 'Stig Brenner', 'Tungtvann', 'Gatas Parlament', 'Equicez', 'Paperboys', 'Erik og Kriss', 'Jaa9 & OnklP', 'OnklP', 'Vinni', 'Tommy Tee', 'Warlocks', 'Shitrich'],"
);

// Country NO
content = content.replace(
  "country: ['Vassendguttene', 'Hellbillies', 'Sie Gubba', 'Rotlaus', 'Plumbo', 'Gunslingers', 'Hagle', 'Kurt Nilsen', 'Staut', 'Vestlandsfanden', 'Vømmøl Spellmannslag', 'Too Far Gone', 'D.D.E.', 'Byting', 'Halva Priset', 'Spel', 'E-76', 'Bjøro Håland', 'Sputnik', 'Steff Nevers']",
  "country: ['Vassendguttene', 'Hellbillies', 'Sie Gubba', 'Rotlaus', 'Plumbo', 'Gunslingers', 'Hagle', 'Kurt Nilsen', 'Staut', 'Vestlandsfanden', 'Vømmøl Spellmannslag', 'Too Far Gone', 'D.D.E.', 'Byting', 'Halva Priset', 'Spel', 'E-76', 'Bjøro Håland', 'Sputnik', 'Steff Nevers', 'Hans Rotmo', 'Terje Tysland']"
);

fs.writeFileSync('src/artists.ts', content, 'utf8');
