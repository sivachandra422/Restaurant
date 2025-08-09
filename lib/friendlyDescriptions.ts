// Generate simple, friendly Hindi/Telugu descriptions from English text
// Heuristic approach using keyword maps so owners don't have to write full texts

type Lang = 'hi' | 'te';

const CORE_HI: Record<string, string> = {
  chicken: 'चिकन', mutton: 'मटन', prawn: 'प्रॉन्स', prawns: 'प्रॉन्स', fish: 'फिश', egg: 'एग',
  paneer: 'पनीर', mushroom: 'मशरूम', kaju: 'काजू', palak: 'पालक', methi: 'मेथी',
  biryani: 'बिरयानी', rice: 'राइस', noodles: 'नूडल्स', gravy: 'ग्रेवी', butter: 'बटर', schezwan: 'स्केज़वान'
};

const CORE_TE: Record<string, string> = {
  chicken: 'చికెన్', mutton: 'మటన్', prawn: 'ప్రాన్స్', prawns: 'ప్రాన్స్', fish: 'ఫిష్', egg: 'ఎగ్',
  paneer: 'పనీర్', mushroom: 'మష్రూమ్', kaju: 'కజూ', palak: 'పాలక్', methi: 'మెథీ',
  biryani: 'బిర్యానీ', rice: 'రైస్', noodles: 'నూడల్స్', gravy: 'గ్రేవీ', butter: 'బటర్', schezwan: 'స్కెజ్వాన్'
};

const STYLE_HI: Record<string, string> = {
  aromatic: 'सुगंधित मसाले', flavorful: 'रिच स्वाद', spicy: 'मसालेदार', crispy: 'क्रिस्पी', creamy: 'क्रीमी',
  rich: 'रिच ग्रेवी', tangy: 'टैंगी', slow: 'धीमी आँच पर पकी', fried: 'तली हुई', saffron: 'केसर', tender: 'नर्म',
};

const STYLE_TE: Record<string, string> = {
  aromatic: 'సువాసన మసాలాలు', flavorful: 'రిచ్ రుచి', spicy: 'మసాలా', crispy: 'క్రిస్పీ', creamy: 'క్రీమీ',
  rich: 'రిచ్ గ్రేవీ', tangy: 'ట్యాంగీ', slow: 'నెమ్మదిగా వండిన', fried: 'వేడి చేసిన', saffron: 'కుంకుమపువ్వు', tender: 'మెత్తగా',
};

function pick<T extends Record<string, string>>(map: T, text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  Object.keys(map).forEach(key => {
    if (lower.includes(key)) found.push(map[key]);
  });
  return found;
}

export function generateFriendlyDescription(english: string, lang: Lang): string {
  const core = lang === 'hi' ? CORE_HI : CORE_TE;
  const style = lang === 'hi' ? STYLE_HI : STYLE_TE;
  const lower = (english || '').toLowerCase();

  const coreWords = pick(core, lower);
  const styleWords = pick(style, lower);

  // Ensure we mention category if detected
  const hasBiryani = lower.includes('biryani');
  const hasRice = lower.includes('rice');
  const hasNoodles = lower.includes('noodle');

  if (lang === 'hi') {
    const coreText = coreWords.join(', ');
    const styleText = styleWords.join(', ');
    const dishType = hasBiryani ? 'बिरयानी' : hasNoodles ? 'नूडल्स' : hasRice ? 'राइस' : 'डिश';
    const part1 = coreText ? `${coreText} के साथ` : '';
    const part2 = styleText ? ` ${styleText}` : '';
    return `${part1}${part2} बनी ${dishType}। स्वादिष्ट और ताज़ा।`.trim().replace(/^के साथ /, '');
  }

  const coreText = coreWords.join(', ');
  const styleText = styleWords.join(', ');
  const dishType = hasBiryani ? 'బిర్యానీ' : hasNoodles ? 'నూడల్స్' : hasRice ? 'రైస్' : 'వంటకం';
  const part1 = coreText ? `${coreText} తో` : '';
  const part2 = styleText ? ` ${styleText}` : '';
  return `${part1}${part2} తయారైన ${dishType}. రుచికరంగా సర్వ్ చేస్తాం.`.trim().replace(/^తో /, '');
}


