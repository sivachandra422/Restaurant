// Lightweight, opinionated phonetic transliteration for dish NAMES only
// Goal: keep modern, familiar feel (English words rendered in Hindi/Telugu script)

type Lang = 'hi' | 'te';

// Core token map, lowercase keys
const MAP_HI: Record<string, string> = {
  // meats & proteins
  chicken: 'चिकन', mutton: 'मटन', egg: 'एग', prawn: 'प्रॉन्स', prawns: 'प्रॉन्स', fish: 'फिश', wings: 'विंग्स', bone: 'बोन', boneless: 'बोनलेस', keema: 'कीमा', bhurji: 'भुर्जी',
  // veg & staples
  veg: 'वेज', vegetable: 'वेजिटेबल', vegetables: 'वेजिटेबल्स', paneer: 'पनीर', mushroom: 'मशरूम', palak: 'पालक', methi: 'मेथी', kaju: 'काजू', tomato: 'टोमैटो',
  // dishes
  biryani: 'बिरयानी', fry: 'फ्राय', fried: 'फ्रायड', rice: 'राइस', noodles: 'नूडल्स', curry: 'करी', masala: 'मसाला', manchurian: 'मंचूरियन', chilly: 'चिली', chili: 'चिली', chilli: 'चिली', dragon: 'ड्रैगन', lolipop: 'लॉलीपॉप', lollipop: 'लॉलीपॉप', kadai: 'कड़ाही', hyderabadi: 'हैदराबादी', mughlai: 'मुगलई', schezwan: 'स्केज़वान', mix: 'मिक्स', mixed: 'मिक्स्ड', special: 'स्पेशल', signature: 'सिग्नेचर', dum: 'दम', joint: 'जॉइंट', plain: 'प्लेन', loose: 'लूज', balls: 'बॉल्स', non: 'नॉन', chaman: 'चमन', pawan: 'पवन', kalyan: 'कल्याण',
  // bread
  pulka: 'फुल्का', roti: 'रोटी', bread: 'ब्रेड',
  // adjectives/time
  spicy: 'स्पाइसी', crispy: 'क्रिस्पी', speciall: 'स्पेशल', classic: 'क्लासिक', royal: 'रॉयल',
  // sizes/parts
  half: 'हाफ', full: 'फुल',
  // numbers (as-is)
  '65': '65', '555': '555',
};

const MAP_TE: Record<string, string> = {
  // meats & proteins
  chicken: 'చికెన్', mutton: 'మటన్', egg: 'ఎగ్', prawn: 'ప్రాన్స్', prawns: 'ప్రాన్స్', fish: 'ఫిష్', wings: 'వింగ్స్', bone: 'బోన్', boneless: 'బోన్‌లెస్', keema: 'కీమా', bhurji: 'భూర్జీ',
  // veg & staples
  veg: 'వెజ్', vegetable: 'వెజిటబుల్', vegetables: 'వెజిటబుల్స్', paneer: 'పనీర్', mushroom: 'మష్రూమ్', palak: 'పాలక్', methi: 'మెథీ', kaju: 'కజూ', tomato: 'టమాటో',
  // dishes
  biryani: 'బిర్యానీ', fry: 'ఫ్రై', fried: 'ఫ్రైడ్', rice: 'రైస్', noodles: 'నూడల్స్', curry: 'కర్రీ', masala: 'మసాలా', manchurian: 'మంచూరియన్', chilly: 'చిల్లీ', chili: 'చిల్లీ', chilli: 'చిల్లీ', dragon: 'డ్రాగన్', lolipop: 'లాలిపాప్', lollipop: 'లాలిపాప్', kadai: 'కడాయి', hyderabadi: 'హైదరాబాదీ', mughlai: 'మొగలాయి', schezwan: 'స్కెజ్వాన్', mix: 'మిక్స్', mixed: 'మిక్స్‌డ్', special: 'స్పెషల్', signature: 'సిగ్నేచర్', dum: 'డమ్', joint: 'జాయింట్', plain: 'ప్లేన్', loose: 'లూజ్', balls: 'బాల్స్', non: 'నాన్', chaman: 'చమన', pawan: 'పవన్', kalyan: 'కల్యాణ్',
  // bread
  pulka: 'పుల్కా', roti: 'రోటి', bread: 'బ్రెడ్',
  // adjectives/time
  spicy: 'స్పైసీ', crispy: 'క్రిస్పీ', classic: 'క్లాసిక్', royal: 'రాయల్',
  // sizes/parts
  half: 'హాఫ్', full: 'ఫుల్',
  // numbers
  '65': '65', '555': '555',
};

const MAPS: Record<Lang, Record<string, string>> = { hi: MAP_HI, te: MAP_TE };

function capitalizeLike(source: string, target: string): string {
  if (!source) return target;
  if (source.toUpperCase() === source) return target; // keep script case as-is
  if (source[0] === source[0].toUpperCase()) return target; // scripts don't have case
  return target; // default
}

export function transliterateFriendly(name: string, lang: Lang): string {
  const map = MAPS[lang];
  // Split words keeping tokens like 65, (Half), etc.
  return name
    .split(/(\s+|\(|\)|-|&|,)/g)
    .map(token => {
      const lower = token.toLowerCase();
      if (map[lower]) return capitalizeLike(token, map[lower]);
      // Remove trailing 's' plural if needed
      const singular = lower.endsWith('s') ? lower.slice(0, -1) : lower;
      if (map[singular]) return map[singular];
      return token; // keep as-is for unknown tokens
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}


