import fs from 'fs';

let content = fs.readFileSync('src/artists.ts', 'utf8');

// Add to Rap for Norway
content = content.replace(
  "rap: ['Karpe', 'Madcon', 'Klovner i Kamp', 'Kamelen', 'Undergrunn', 'Arif', 'Unge Ferrari', 'Hkeem', 'Ballinciaga', 'Roc Boyz', 'Bausa', 'Stig Brenner', 'Tungtvann', 'Gatas Parlament', 'Equicez', 'Paperboys', 'Erik og Kriss', 'Jaa9 & OnklP', 'OnklP', 'Vinni', 'Tommy Tee', 'Warlocks'],",
  "rap: ['Karpe', 'Madcon', 'Klovner i Kamp', 'Kamelen', 'Undergrunn', 'Arif', 'Unge Ferrari', 'Hkeem', 'Ballinciaga', 'Roc Boyz', 'Bausa', 'Stig Brenner', 'Tungtvann', 'Gatas Parlament', 'Equicez', 'Paperboys', 'Erik og Kriss', 'Jaa9 & OnklP', 'OnklP', 'Vinni', 'Tommy Tee', 'Warlocks', 'Shitrich', 'Sondre Justad']," 
);
// note: Sondre Justad is not rap, oops, just Shitrich. Let me fix the patch string carefully.

// Let's use string replaces precisely.
