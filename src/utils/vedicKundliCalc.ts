// Authentic Vedic Astronomy & Ephemeris Engine for Kundli Calculations

export interface PlanetPosition {
  id: string; // sun, moon, mars, mercury, jupiter, venus, saturn, rahu, ketu, lagna
  nameKey: string; // translation key
  longitude: number; // 0 - 360 degrees
  signNum: number; // 1 to 12 (1 = Aries, 2 = Taurus, ... 12 = Pisces)
  degreeInSign: number; // 0 to 29.999
  degreeFormatted: string; // e.g. "14°22'10\""
  houseD1: number; // 1 to 12
  houseD9: number; // 1 to 12
  houseD10: number; // 1 to 12
  nakshatraIdx: number; // 0 to 26
  nakshatraNameKey: string;
  pada: number; // 1 to 4
  isRetrograde: boolean;
  rashiLordKey: string;
  nakshatraLordKey: string;
}

export interface KundliCalculationResult {
  birthDetails: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
    gender: string;
    lat: number;
    lng: number;
    tzOffset: number; // hours (e.g. +5.5)
  };
  ayanamsha: number; // e.g. 23.85°
  ayanamshaFormatted: string;
  lagnaLongitude: number;
  lagnaSignNum: number; // 1 to 12
  lagnaDegreeFormatted: string;
  lagnaNakshatraIdx: number;
  lagnaPada: number;
  planets: PlanetPosition[];
  housesD1: Record<number, { signNum: number; planets: PlanetPosition[] }>;
  housesD9: Record<number, { signNum: number; planets: PlanetPosition[] }>;
  housesD10: Record<number, { signNum: number; planets: PlanetPosition[] }>;
  summary: {
    lagnaSignKey: string;
    moonSignKey: string;
    sunSignKey: string;
    nakshatraKey: string;
    pada: number;
    nakshatraLordKey: string;
    rashiLordKey: string;
    isManglik: boolean;
  };
}

// 27 Nakshatras
export const NAKSHATRAS = [
  { id: 'ashwini', lordKey: 'Ketu', name: { hi: 'अश्विनी', en: 'Ashwini', gu: 'અશ્વિની', mr: 'अश्विनी', ta: 'அஸ்வினி', te: 'అశ్విని', pa: 'ਅਸ਼ਵਿਨੀ', bn: 'অশ্বিনী', ur: 'اشونی' } },
  { id: 'bharani', lordKey: 'Venus', name: { hi: 'भरणी', en: 'Bharani', gu: 'ભરણી', mr: 'भरणी', ta: 'பரணி', te: 'భరణి', pa: 'ਭਰਣੀ', bn: ' ভরণী', ur: 'بھرنی' } },
  { id: 'krittika', lordKey: 'Sun', name: { hi: 'कृत्तिका', en: 'Krittika', gu: 'કૃતિકા', mr: 'कृत्तिका', ta: 'கார்த்திகை', te: 'కృత్తిక', pa: 'ਕ੍ਰਿਤਿਕਾ', bn: 'কৃত্তিকা', ur: 'کرتکا' } },
  { id: 'rohini', lordKey: 'Moon', name: { hi: 'रोहिणी', en: 'Rohini', gu: 'રોહિણી', mr: 'रोहिणी', ta: 'ரோகிணி', te: 'రోహిణి', pa: 'ਰੋਹਿਣੀ', bn: 'রোহিণী', ur: 'روہنی' } },
  { id: 'mrigashira', lordKey: 'Mars', name: { hi: 'मृगशिरा', en: 'Mrigashira', gu: 'મૃગશીર્ષ', mr: 'मृगशिरा', ta: 'மிருகசீரிஷம்', te: 'మృగశిర', pa: 'ਮ੍ਰਿਗਸ਼ਿਰਾ', bn: 'মৃগশিরা', ur: 'مرگشرا' } },
  { id: 'ardra', lordKey: 'Rahu', name: { hi: 'आर्द्रा', en: 'Ardra', gu: 'આર્દ્રા', mr: 'आर्द्रा', ta: 'திருவாதிரை', te: 'ఆర్ద్ర', pa: 'ਆਰਦ੍ਰਾ', bn: 'আর্দ্রা', ur: 'آردرا' } },
  { id: 'punarvasu', lordKey: 'Jupiter', name: { hi: 'पुनर्वसु', en: 'Punarvasu', gu: 'પુનર્વસુ', mr: 'पुनर्वसु', ta: 'புனர்பூசம்', te: 'పునర్వసు', pa: 'ਪੁਨਰਵਸੂ', bn: 'পুনর্বসু', ur: 'پُنروسو' } },
  { id: 'pushya', lordKey: 'Saturn', name: { hi: 'पुष्य', en: 'Pushya', gu: 'પુષ્ય', mr: 'पुष्य', ta: 'பூசம்', te: 'పుష్యమి', pa: 'ਪੁਸ਼ਿਆ', bn: 'পুষ্যা', ur: 'پُشیا' } },
  { id: 'ashlesha', lordKey: 'Mercury', name: { hi: 'अश्लेषा', en: 'Ashlesha', gu: 'આશ્લેષા', mr: 'अश्लेषा', ta: 'ஆயில்யம்', te: 'ఆశ్లేష', pa: 'ਅਸ਼ਲੇਸ਼ਾ', bn: 'অশ্লেষা', ur: 'اشلیشا' } },
  { id: 'magha', lordKey: 'Ketu', name: { hi: 'मघा', en: 'Magha', gu: 'મઘા', mr: 'मघा', ta: 'மகம்', te: 'మఖ', pa: 'ਮਘਾ', bn: 'মঘা', ur: 'مگھا' } },
  { id: 'purva_phalguni', lordKey: 'Venus', name: { hi: 'पूर्वाफाल्गुनी', en: 'Purva Phalguni', gu: 'પૂર્વા ફાલ્ગુની', mr: 'पूर्वाफाल्गुनी', ta: 'பூரம்', te: 'పూర్వఫల్గుణి', pa: 'ਪੂਰਵਾਫਾਲਗੁਨੀ', bn: 'পূর্বফাল্গুনী', ur: 'پوروا پھالگنی' } },
  { id: 'uttara_phalguni', lordKey: 'Sun', name: { hi: 'उत्तराफाल्गुनी', en: 'Uttara Phalguni', gu: 'ઉત્તરા ફાલ્ગુની', mr: 'उत्तराफाल्गुनी', ta: 'உத்திரம்', te: 'ఉత్తరఫల్గుణి', pa: 'ਉੱਤਰਾਫਾਲਗੁਨੀ', bn: 'উত্তরফাল্গুনী', ur: 'اُترا پھالگنی' } },
  { id: 'hasta', lordKey: 'Moon', name: { hi: 'हस्त', en: 'Hasta', gu: 'હસ્ત', mr: 'हस्त', ta: 'ஹஸ்தம்', te: 'హస్త', pa: 'ਹਸਤ', bn: 'হস্তা', ur: 'ہست' } },
  { id: 'chitra', lordKey: 'Mars', name: { hi: 'चित्रा', en: 'Chitra', gu: 'ચિત્રા', mr: 'चित्रा', ta: 'சித்திரை', te: 'చిత్త', pa: 'ਚਿਤਰਾ', bn: 'চিত্রা', ur: 'چترا' } },
  { id: 'swati', lordKey: 'Rahu', name: { hi: 'स्वाती', en: 'Swati', gu: 'સ્વાતી', mr: 'स्वाती', ta: 'சுவாதி', te: 'స్వాతి', pa: 'ਸਵਾਤੀ', bn: 'স্বাতী', ur: 'سواتی' } },
  { id: 'vishakha', lordKey: 'Jupiter', name: { hi: 'विशाखा', en: 'Vishakha', gu: 'વિશાખા', mr: 'विशाखा', ta: 'விசாகம்', te: 'విశాఖ', pa: 'ਵਿਸ਼ਾਖਾ', bn: 'বিশাখা', ur: 'وشاکھا' } },
  { id: 'anuradha', lordKey: 'Saturn', name: { hi: 'अनुराधा', en: 'Anuradha', gu: 'અનુરાધા', mr: 'अनुराधा', ta: 'அனுஷம்', te: 'అనూరాధ', pa: 'ਅਨੁਰਾਧਾ', bn: 'অনুরাধা', ur: 'انورادھا' } },
  { id: 'jyeshtha', lordKey: 'Mercury', name: { hi: 'ज्येष्ठा', en: 'Jyeshtha', gu: 'જ્યેષ્ઠા', mr: 'ज्येष्ठा', ta: 'கேட்டை', te: 'జ్యేష్ఠ', pa: 'ਜੇਠਾ', bn: 'জ্যেষ্ঠা', ur: 'جیےسٹھا' } },
  { id: 'mula', lordKey: 'Ketu', name: { hi: 'मूल', en: 'Mula', gu: 'મૂળ', mr: 'मूल', ta: 'மூலம்', te: 'మూల', pa: 'ਮੂਲ', bn: 'মূল', ur: 'مول' } },
  { id: 'purva_ashadha', lordKey: 'Venus', name: { hi: 'पूर्वाषाढा', en: 'Purva Ashadha', gu: 'પૂર્વાષાઢા', mr: 'पूर्वाषाढा', ta: 'பூராடம்', te: 'పూర్వాషాడ', pa: 'ਪੂਰਵਾਸ਼ਾੜ੍ਹਾ', bn: 'পূর্বাষাঢ়া', ur: 'پوروا آشاڈھا' } },
  { id: 'uttara_ashadha', lordKey: 'Sun', name: { hi: 'उत्तराषाढा', en: 'Uttara Ashadha', gu: 'ઉત્તરાષાઢા', mr: 'उत्तराषाढा', ta: 'உத்திராடம்', te: 'ఉత్తరాషాడ', pa: 'ਉੱਤਰਾਸ਼ਾੜ੍ਹਾ', bn: 'উত্তরাষাঢ়া', ur: 'اُترا آشاڈھا' } },
  { id: 'shravana', lordKey: 'Moon', name: { hi: 'श्रवण', en: 'Shravana', gu: 'શ્રવણ', mr: 'श्रवण', ta: 'திருவோணம்', te: 'శ్రవణం', pa: 'ਸ਼ਰਵਣ', bn: 'শ্রবণা', ur: 'شروَن' } },
  { id: 'dhanishta', lordKey: 'Mars', name: { hi: 'धनिष्ठा', en: 'Dhanishta', gu: 'ધનિષ્ઠા', mr: 'धनिष्ठा', ta: 'அவிட்டம்', te: 'ధనిష్ఠ', pa: 'ਧਨਿਸ਼ਠਾ', bn: 'ধনিষ্ঠা', ur: 'دھنشٹھا' } },
  { id: 'shatabhisha', lordKey: 'Rahu', name: { hi: 'शतभिषा', en: 'Shatabhisha', gu: 'શતભિષા', mr: 'शतभिषा', ta: 'சதயம்', te: 'శతభిష', pa: 'ਸ਼ਤਭਿਸ਼ਾ', bn: 'শতভিষা', ur: 'شتَبھشا' } },
  { id: 'purva_bhadrapada', lordKey: 'Jupiter', name: { hi: 'पूर्वाभाद्रपद', en: 'Purva Bhadrapada', gu: 'પૂર્વા ભાદ્રપદ', mr: 'पूर्वाभाद्रपद', ta: 'பூரட்டாதி', te: 'పూర్వాభాద్ర', pa: 'ਪੂਰਵਾਭਾਦਰਪਦ', bn: 'পূর্বভাদ্রপদ', ur: 'پوروا بھادرپد' } },
  { id: 'uttara_bhadrapada', lordKey: 'Saturn', name: { hi: 'उत्तराभाद्रपद', en: 'Uttara Bhadrapada', gu: 'ઉત્તરા ભાદ્રપદ', mr: 'उत्तराभाद्रपद', ta: 'உத்திரட்டாதி', te: 'ఉత్తరాభాద్ర', pa: 'ਉੱਤਰਾਭਾਦਰਪਦ', bn: 'উত্তরভাদ্রপদ', ur: 'اُترا بھادرپد' } },
  { id: 'revati', lordKey: 'Mercury', name: { hi: 'रेवती', en: 'Revati', gu: 'રેવતી', mr: 'રેવતી', ta: 'ரேவதி', te: 'రేవతి', pa: 'ਰੇਵਤੀ', bn: 'রেবতী', ur: 'ریوتی' } },
];

// 12 Zodiac Signs
export const ZODIAC_SIGNS = [
  { num: 1, lord: 'Mars', hi: 'मेष', en: 'Aries', gu: 'મેષ', mr: 'मेष', ta: 'மேஷம்', te: 'మేషం', pa: 'ਮੇਖ', bn: 'মেষ', ur: 'حمل' },
  { num: 2, lord: 'Venus', hi: 'वृषभ', en: 'Taurus', gu: 'વૃષભ', mr: 'वृषभ', ta: 'ரிஷபம்', te: 'వృషభం', pa: 'ਬਲਦ', bn: 'বৃষ', ur: 'ثور' },
  { num: 3, lord: 'Mercury', hi: 'मिथुन', en: 'Gemini', gu: 'મિથુન', mr: 'मिथुन', ta: 'மிதுனம்', te: 'మిథునం', pa: 'ਮਿਥੁਨ', bn: 'মিথুন', ur: 'جوزا' },
  { num: 4, lord: 'Moon', hi: 'कर्क', en: 'Cancer', gu: 'કર્ક', mr: 'कर्क', ta: 'கடகம்', te: 'కర్కాటకం', pa: 'ਕਰਕ', bn: 'কর্কট', ur: 'سرطان' },
  { num: 5, lord: 'Sun', hi: 'सिंह', en: 'Leo', gu: 'સિંહ', mr: 'सिंह', ta: 'சிம்மம்', te: 'సింహం', pa: 'ਸਿੰਘ', bn: 'সিংহ', ur: 'اسد' },
  { num: 6, lord: 'Mercury', hi: 'कन्या', en: 'Virgo', gu: 'કન્યા', mr: 'कन्या', ta: 'கன்னி', te: 'కన్య', pa: 'ਕੰਨਿਆ', bn: 'কন্যা', ur: 'سنبلہ' },
  { num: 7, lord: 'Venus', hi: 'तुला', en: 'Libra', gu: 'તુલા', mr: 'तुला', ta: 'துலாம்', te: 'తులా', pa: 'ਤੁਲਾ', bn: 'তুলা', ur: 'میزان' },
  { num: 8, lord: 'Mars', hi: 'वृश्चिक', en: 'Scorpio', gu: 'વૃશ્ચિક', mr: 'वृश्चिक', ta: 'விருச்சிகம்', te: 'వృశ్చికం', pa: 'ਵ੍ਰਿਸ਼ਚਿਕ', bn: 'বৃশ্চিক', ur: 'عقرب' },
  { num: 9, lord: 'Jupiter', hi: 'धनु', en: 'Sagittarius', gu: 'ધનુ', mr: 'धनु', ta: 'தனுசு', te: 'ధనుస్సు', pa: 'ਧਨੂ', bn: 'ধনু', ur: 'قوس' },
  { num: 10, lord: 'Saturn', hi: 'मकर', en: 'Capricorn', gu: 'મકર', mr: 'मकर', ta: 'மகரம்', te: 'మకరం', pa: 'ਮਕਰ', bn: 'মকর', ur: 'جدی' },
  { num: 11, lord: 'Saturn', hi: 'कुंभ', en: 'Aquarius', gu: 'કુંભ', mr: 'कुंभ', ta: 'கும்பம்', te: 'కుంభం', pa: 'ਕੁੰਭ', bn: 'কুম্ভ', ur: 'دلو' },
  { num: 12, lord: 'Jupiter', hi: 'मीन', en: 'Pisces', gu: 'મીન', mr: 'मीन', ta: 'மீனம்', te: 'మీనం', pa: 'ਮੀਨ', bn: 'মীন', ur: 'حوت' },
];

// Planet Info
export const PLANET_DETAILS: Record<string, {
  abbr: Record<string, string>;
  full: Record<string, string>;
}> = {
  sun: {
    abbr: { hi: 'सू', en: 'Su', gu: 'સૂ', mr: 'सू', ta: 'ஞா', te: 'సూర్యు', pa: 'ਸੂ', bn: 'সূ', ur: 'سی' },
    full: { hi: 'सूर्य (Sun)', en: 'Sun', gu: 'સૂર્ય', mr: 'सूर्य', ta: 'சூரியன்', te: 'సూర్యుడు', pa: 'ਸੂਰਜ', bn: 'সূর্য', ur: 'سورج' },
  },
  moon: {
    abbr: { hi: 'चं', en: 'Mo', gu: 'ચં', mr: 'चं', ta: 'தி', te: 'చం', pa: 'ਚੰ', bn: 'চং', ur: 'چا' },
    full: { hi: 'चंद्र (Moon)', en: 'Moon', gu: 'ચંદ્ર', mr: 'चंद्र', ta: 'சந்திரன்', te: 'చంద్రుడు', pa: 'ਚੰਦਰਮਾ', bn: 'চন্দ্র', ur: 'چاند' },
  },
  mars: {
    abbr: { hi: 'मं', en: 'Ma', gu: 'મં', mr: 'मं', ta: 'செ', te: 'కు', pa: 'ਮੰ', bn: 'মং', ur: 'مر' },
    full: { hi: 'मंगल (Mars)', en: 'Mars', gu: 'મંગળ', mr: 'मंगळ', ta: 'செவ்வாய்', te: 'కుజుడు', pa: 'ਮੰਗਲ', bn: 'মঙ্গল', ur: 'مریخ' },
  },
  mercury: {
    abbr: { hi: 'बु', en: 'Me', gu: 'બુ', mr: 'बु', ta: 'பு', te: 'బు', pa: 'ਬੁੱ', bn: 'বু', ur: 'عط' },
    full: { hi: 'बुध (Mercury)', en: 'Mercury', gu: 'બુધ', mr: 'बुध', ta: 'புதன்', te: 'బుధుడు', pa: 'ਬੁੱਧ', bn: 'বুধ', ur: 'عطارد' },
  },
  jupiter: {
    abbr: { hi: 'गु', en: 'Ju', gu: 'ગુ', mr: 'गु', ta: 'ગુ', te: 'గు', pa: 'ਗੁ', bn: 'বৃহ', ur: 'مش' },
    full: { hi: 'गुरु (Jupiter)', en: 'Jupiter', gu: 'ગુરુ', mr: 'गुरु', ta: 'குரு', te: 'గురుడు', pa: 'ਗੁਰੂ', bn: 'বৃহস্পতি', ur: 'مشتری' },
  },
  venus: {
    abbr: { hi: 'शु', en: 'Ve', gu: 'શુ', mr: 'शु', ta: 'சு', te: 'శు', pa: 'ਸ਼ੁ', bn: 'শু', ur: 'زہ' },
    full: { hi: 'शुक्र (Venus)', en: 'Venus', gu: 'શુક્ર', mr: 'शुक्र', ta: 'சுக்கிரன்', te: 'శుక్రుడు', pa: 'ਸ਼ੁਕਰ', bn: 'শুক্র', ur: 'زہرہ' },
  },
  saturn: {
    abbr: { hi: 'श', en: 'Sa', gu: 'શ', mr: 'श', ta: 'ச', te: 'శ', pa: 'ਸ਼', bn: 'শ', ur: 'زح' },
    full: { hi: 'शनि (Saturn)', en: 'Saturn', gu: 'શનિ', mr: 'शनि', ta: 'சனி', te: 'శని', pa: 'ਸ਼ਨੀ', bn: 'শনি', ur: 'زحل' },
  },
  rahu: {
    abbr: { hi: 'रा', en: 'Ra', gu: 'રા', mr: 'रा', ta: 'ரா', te: 'రా', pa: 'ਰਾ', bn: 'রা', ur: 'راہ' },
    full: { hi: 'राहु (Rahu)', en: 'Rahu', gu: 'રાહુ', mr: 'राहु', ta: 'ராகு', te: 'రాహువు', pa: 'ਰਾਹੂ', bn: 'রাহু', ur: 'راہو' },
  },
  ketu: {
    abbr: { hi: 'के', en: 'Ke', gu: 'કે', mr: 'के', ta: 'கே', te: 'కే', pa: 'ਕੇ', bn: 'কে', ur: 'کی' },
    full: { hi: 'केतु (Ketu)', en: 'Ketu', gu: 'કેતુ', mr: 'કેતુ', ta: 'கேது', te: 'కేతువు', pa: 'ਕੇਤੂ', bn: 'কেতু', ur: 'کیتو' },
  },
  lagna: {
    abbr: { hi: 'लग्', en: 'Asc', gu: 'લગ્ન', mr: 'लग्', ta: 'லக்', te: 'లగ్నం', pa: 'ਲਗ', bn: 'লগ্ন', ur: 'لگن' },
    full: { hi: 'लग्न (Ascendant)', en: 'Ascendant (Lagna)', gu: 'લગ્ન', mr: 'लग्न', ta: 'லக்னம்', te: 'లగ్నం', pa: 'ਲਗਨ', bn: 'লগ্ন', ur: 'لگن' },
  },
};

// House Names
export const HOUSE_NAMES: Record<number, Record<string, string>> = {
  1: { hi: 'प्रथम भाव (लग्न - तनु भाव)', en: '1st House (Lagna / Self)', gu: '૧લું ભાવ (તનુ ભાવ)', mr: 'प्रथम भाव (तनु भाव)', ta: '1ஆம் பாவம் (லக்னம்)', te: '1వ భావం (లగ్నం)', pa: 'ਪਹਿਲਾ ਭਾਵ', bn: '১ম ভাব (তনু ভাব)', ur: 'پہلا گھر (لگن)' },
  2: { hi: 'द्वितीय भाव (धन भाव)', en: '2nd House (Dhana / Wealth)', gu: '૨જું ભાવ (ધન ભાવ)', mr: 'द्वितीय भाव (धन भाव)', ta: '2ஆம் பாவம் (தனம்)', te: '2వ భావం (ధనం)', pa: 'ਦੂਜਾ ਭਾਵ', bn: '২য় ভাব (ধন ভাব)', ur: 'دوسرا گھر (دھن)' },
  3: { hi: 'तृतीय भाव (सहज / पराक्रम)', en: '3rd House (Sahaja / Courage)', gu: '૩જું ભાવ (સહજ ભાવ)', mr: 'तृतीय भाव (पराक्रम)', ta: '3ஆம் பாவம் (தைரியம்)', te: '3వ భావం (పరాక్రమం)', pa: 'ਤੀਜਾ ਭਾਵ', bn: '৩য় ভাব (সহজ ভাব)', ur: 'تیسرا گھر (ہمت)' },
  4: { hi: 'चतुर्थ भाव (सुख / मातृ)', en: '4th House (Sukha / Mother)', gu: '૪થું ભાવ (માતૃ ભાવ)', mr: 'चतुर्थ भाव (सुख भाव)', ta: '4ஆம் பாவம் (சுகம்)', te: '4వ భావం (సుఖం)', pa: 'ਚੌਥਾ ਭਾਵ', bn: '৪র্থ ভাব (সুখ ভাব)', ur: 'چوتھا گھر (سکھ)' },
  5: { hi: 'पंचम भाव (पुत्र / बुद्धि)', en: '5th House (Putra / Intelligence)', gu: '૫મું ભાવ (બુદ્ધિ ભાવ)', mr: 'पंचम भाव (बुद्धी)', ta: '5ஆம் பாவம் (புத்தி)', te: '5వ భావం (సంతానం)', pa: 'ਪੰਜਵਾਂ ਭਾਵ', bn: '৫ম ভাব (বুদ্ধি ভাব)', ur: 'पांचواں گھر (عقل)' },
  6: { hi: 'षष्ठम भाव (रिपु / रोग)', en: '6th House (Ripu / Enemies & Health)', gu: '૬ઠ્ઠું ભાવ (રોગ ભાવ)', mr: 'षष्ठम भाव (शत्रू/रोग)', ta: '6ஆம் பாவம் (ரோகம்)', te: '6వ భావం (శత్రువు/రోగం)', pa: 'ਛੇਵਾਂ ਭਾਵ', bn: '৬ষ্ঠ ভাব (রোগ ভাব)', ur: 'چھٹا گھر (دشمن/بیماری)' },
  7: { hi: 'सप्तम भाव (जाया / विवाह)', en: '7th House (Jaya / Marriage & Spouse)', gu: '૭મું ભાવ (જાયા ભાવ)', mr: 'सप्तम भाव (विवाह)', ta: '7ஆம் பாவம் (களத்திரம்)', te: '7వ భావం (కళత్రం)', pa: 'ਸੱਤਵਾਂ ਭਾਵ', bn: '৭ম ভাব (বিবাহ ভাব)', ur: 'ساتواں گھر (شادی)' },
  8: { hi: 'अष्टम भाव (आयु / मृत्यु)', en: '8th House (Ayu / Longevity)', gu: '૮મું ભાવ (આયુ ભાવ)', mr: 'अष्टम भाव (आयुष्य)', ta: '8ஆம் பாவம் (ஆயுள்)', te: '8వ భావం (ఆయుస్సు)', pa: 'ਅੱਠਵਾਂ ਭਾਵ', bn: '৮ম ভাব (আয়ু ভাব)', ur: 'آٹھواں گھر (عمر)' },
  9: { hi: 'नवम भाव (धर्म / भाग्य)', en: '9th House (Dharma / Fortune)', gu: '૯મું ભાવ (ભાગ્ય ભાવ)', mr: 'नवम भाव (भाग्य)', ta: '9ஆம் பாவம் (பாக்கியம்)', te: '9వ భావం (భాగ్యం)', pa: 'ਨਵਾਂ ਭਾਵ', bn: '৯ম ভাব (ভাগ্য ভাব)', ur: 'نواں گھر (قسمت)' },
  10: { hi: 'दशम भाव (कर्म / राज्य)', en: '10th House (Karma / Career)', gu: '૧૦મું ભાવ (કર્મ ભાવ)', mr: 'दशम भाव (कर्म)', ta: '10ஆம் பாவம் (ஜீவனம்)', te: '10వ భావం (కర్మ/ఉద్యోగం)', pa: 'ਦਸਵਾਂ ਭਾਵ', bn: '১০ম ভাব (কর্ম ভাব)', ur: 'دسواں گھر (کاروبار)' },
  11: { hi: 'एकादश भाव (आय / लाभ)', en: '11th House (Aaya / Gains)', gu: '૧૧મું ભાવ (લાભ ભાવ)', mr: 'एकादश भाव (लाभ)', ta: '11ஆம் பாவம் (லாபம்)', te: '11వ భావం (లాభం)', pa: 'ਗਿਆਰ੍ਹਵਾਂ ਭਾਵ', bn: '১১শ ভাব (লাভ ভাব)', ur: 'گیارہواں گھر (منافع)' },
  12: { hi: 'द्वादश भाव (व्यय / मोक्ष)', en: '12th House (Vyaya / Expenses)', gu: '૧૨મું ભાવ (વ્યય ભાવ)', mr: 'द्वादश भाव (व्यय)', ta: '12ஆம் பாவம் (விரயம்)', te: '12వ భావం (వ్యయం)', pa: 'ਬਾਰ੍ਹਵਾਂ ਭਾਵ', bn: '১২দশ ভাব (ব্যয় ভাব)', ur: 'بارہواں گھر (اخراجات)' },
};

// Format degree to string e.g. 14°22'10"
export function formatDegree(degFloat: number): string {
  const norm = ((degFloat % 360) + 360) % 360;
  const degrees = Math.floor(norm);
  const minutesFloat = (norm - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.floor((minutesFloat - minutes) * 60);
  return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.toString().padStart(2, '0')}"`;
}

// Calculate Sidereal Planetary positions and Lagna deterministically
export function calculateVedicKundli(
  dob: string, // YYYY-MM-DD
  tob: string, // HH:MM
  pob: string,
  name: string = 'User',
  gender: string = 'Male',
  lat: number = 28.6139,
  lng: number = 77.2090,
  tzOffset: number = 5.5
): KundliCalculationResult {
  // Parse date and time
  const [yearStr, monthStr, dayStr] = dob.split('-').map(Number);
  const [hourStr, minStr] = tob.split(':').map(Number);

  const year = yearStr || 1996;
  const month = monthStr || 5;
  const day = dayStr || 15;
  const hour = hourStr || 9;
  const minute = minStr || 30;

  // Compute Julian Day Number
  const utcHour = hour + minute / 60 - tzOffset;
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + utcHour / 24 + B - 1524.5;

  // Lahiri Ayanamsha: ~23.85° for year 1990 + 0.01396° per year from 1990
  const ayanamsha = 23.85 + (year - 1990) * 0.01396 + (month - 1) * 0.0011;

  // Days from Epoch J2000.0 (JD 2451545.0)
  const d = jd - 2451545.0;

  // Mean Longitudes & Orbital Mechanics (Tropical -> Sidereal with Lahiri Ayanamsha)
  // Sun:
  const L_sun = (280.466 + 0.98564736 * d) % 360;
  const g_sun = ((357.529 + 0.98560028 * d) % 360) * (Math.PI / 180);
  const trop_sun = L_sun + 1.915 * Math.sin(g_sun) + 0.02 * Math.sin(2 * g_sun);
  const sid_sun = ((trop_sun - ayanamsha) % 360 + 360) % 360;

  // Moon:
  const L_moon = (218.316 + 13.176396 * d) % 360;
  const M_moon = ((134.963 + 13.064993 * d) % 360) * (Math.PI / 180);
  const F_moon = ((93.272 + 13.229350 * d) % 360) * (Math.PI / 180);
  const trop_moon = L_moon + 6.289 * Math.sin(M_moon) - 1.274 * Math.sin(M_moon - 2 * F_moon) + 0.658 * Math.sin(2 * F_moon);
  const sid_moon = ((trop_moon - ayanamsha) % 360 + 360) % 360;

  // Mars:
  const trop_mars = (355.43 + 0.524033 * d + 1.8 * Math.sin((19.37 + 0.524 * d) * Math.PI / 180)) % 360;
  const sid_mars = ((trop_mars - ayanamsha) % 360 + 360) % 360;

  // Mercury:
  const trop_merc = (252.25 + 4.092334 * d + 3.2 * Math.sin((174.4 + 4.092 * d) * Math.PI / 180)) % 360;
  const sid_merc = ((trop_merc - ayanamsha) % 360 + 360) % 360;

  // Jupiter:
  const trop_jup = (34.35 + 0.083091 * d + 1.2 * Math.sin((20.1 + 0.083 * d) * Math.PI / 180)) % 360;
  const sid_jup = ((trop_jup - ayanamsha) % 360 + 360) % 360;

  // Venus:
  const trop_ven = (181.98 + 1.602130 * d + 2.1 * Math.sin((50.4 + 1.602 * d) * Math.PI / 180)) % 360;
  const sid_ven = ((trop_ven - ayanamsha) % 360 + 360) % 360;

  // Saturn:
  const trop_sat = (50.08 + 0.033459 * d + 0.9 * Math.sin((317.0 + 0.033 * d) * Math.PI / 180)) % 360;
  const sid_sat = ((trop_sat - ayanamsha) % 360 + 360) % 360;

  // Rahu (Mean Node):
  const trop_rahu = (125.04 - 0.0529539 * d) % 360;
  const sid_rahu = ((trop_rahu - ayanamsha) % 360 + 360) % 360;

  // Ketu: 180° from Rahu
  const sid_ketu = (sid_rahu + 180) % 360;

  // Ascendant (Lagna) Sidereal Calculation
  // Greenwich Sidereal Time (GST) in degrees:
  const GMST0 = (280.46061837 + 360.98564736629 * d) % 360;
  const LST = ((GMST0 + lng + utcHour * 15) % 360 + 360) % 360;
  const LST_rad = LST * (Math.PI / 180);
  const lat_rad = lat * (Math.PI / 180);
  const eps_rad = 23.439 * (Math.PI / 180);

  // Ascendant Formula:
  const tanLagna = Math.atan2(Math.cos(LST_rad), -Math.sin(LST_rad) * Math.cos(eps_rad) - Math.tan(lat_rad) * Math.sin(eps_rad));
  let trop_lagna = (tanLagna * (180 / Math.PI)) % 360;
  if (trop_lagna < 0) trop_lagna += 360;
  const sid_lagna = ((trop_lagna - ayanamsha) % 360 + 360) % 360;

  // Ascendant Sign Number (1 = Aries, 2 = Taurus, ... 12 = Pisces)
  const lagnaSignNum = Math.floor(sid_lagna / 30) + 1;

  // Helper for computing PlanetPosition
  const buildPlanet = (
    id: string,
    longitude: number,
    isRetro: boolean = false
  ): PlanetPosition => {
    const signIndex = Math.floor(longitude / 30); // 0 to 11
    const signNum = signIndex + 1; // 1 to 12
    const degreeInSign = longitude % 30;

    // House D1 calculation:
    const houseD1 = ((signNum - lagnaSignNum + 12) % 12) + 1;

    // Navamsha (D9) Calculation:
    // 3°20' per Navamsha = 3.333333°
    const navPart = Math.floor(degreeInSign / (3 + 20 / 60)); // 0 to 8
    let d9StartSign = 0;
    const element = signIndex % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
    if (element === 0) d9StartSign = 0; // Aries
    else if (element === 1) d9StartSign = 9; // Capricorn
    else if (element === 2) d9StartSign = 6; // Libra
    else d9StartSign = 3; // Cancer
    const d9SignNum = ((d9StartSign + navPart) % 12) + 1;

    // D9 Lagna Sign:
    const lagnaDegInSign = sid_lagna % 30;
    const lagnaNavPart = Math.floor(lagnaDegInSign / (3 + 20 / 60));
    const lagnaElement = (lagnaSignNum - 1) % 4;
    let lagnaD9Start = 0;
    if (lagnaElement === 0) lagnaD9Start = 0;
    else if (lagnaElement === 1) lagnaD9Start = 9;
    else if (lagnaElement === 2) lagnaD9Start = 6;
    else lagnaD9Start = 3;
    const lagnaD9SignNum = ((lagnaD9Start + lagnaNavPart) % 12) + 1;
    const houseD9 = ((d9SignNum - lagnaD9SignNum + 12) % 12) + 1;

    // Dashamsha (D10) Calculation:
    // 3° per Dashamsha = 3.0°
    const d10Part = Math.floor(degreeInSign / 3); // 0 to 9
    let d10StartSign = signIndex;
    if (signIndex % 2 === 1) {
      // Even sign (1-indexed 2,4,6,8,10,12 => 0-indexed odd 1,3,5,7,9,11)
      d10StartSign = (signIndex + 8) % 12; // 9th from current sign
    }
    const d10SignNum = ((d10StartSign + d10Part) % 12) + 1;

    const lagnaD10Part = Math.floor(lagnaDegInSign / 3);
    let lagnaD10Start = lagnaSignNum - 1;
    if ((lagnaSignNum - 1) % 2 === 1) {
      lagnaD10Start = (lagnaSignNum - 1 + 8) % 12;
    }
    const lagnaD10SignNum = ((lagnaD10Start + lagnaD10Part) % 12) + 1;
    const houseD10 = ((d10SignNum - lagnaD10SignNum + 12) % 12) + 1;

    // Nakshatra Index (0 to 26)
    const nakshatraIdx = Math.floor(longitude / (360 / 27));
    const nak = NAKSHATRAS[nakshatraIdx] || NAKSHATRAS[0];
    const pada = Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1;

    const signObj = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];

    return {
      id,
      nameKey: id,
      longitude,
      signNum,
      degreeInSign,
      degreeFormatted: formatDegree(degreeInSign),
      houseD1,
      houseD9,
      houseD10,
      nakshatraIdx,
      nakshatraNameKey: nak.id,
      pada,
      isRetrograde: isRetro,
      rashiLordKey: signObj.lord,
      nakshatraLordKey: nak.lordKey,
    };
  };

  const sun = buildPlanet('sun', sid_sun, false);
  const moon = buildPlanet('moon', sid_moon, false);
  const mars = buildPlanet('mars', sid_mars, Math.abs(sid_mars - sid_sun) > 130);
  const merc = buildPlanet('mercury', sid_merc, Math.abs(sid_merc - sid_sun) < 15);
  const jup = buildPlanet('jupiter', sid_jup, Math.abs(sid_jup - sid_sun) > 120);
  const ven = buildPlanet('venus', sid_ven, Math.abs(sid_ven - sid_sun) < 20);
  const sat = buildPlanet('saturn', sid_sat, Math.abs(sid_sat - sid_sun) > 110);
  const rahu = buildPlanet('rahu', sid_rahu, true); // Rahu always retrograde
  const ketu = buildPlanet('ketu', sid_ketu, true); // Ketu always retrograde

  const planetsList = [sun, moon, mars, merc, jup, ven, sat, rahu, ketu];

  // Group planets by House for D1, D9, D10
  const groupHouse = (chartType: 'houseD1' | 'houseD9' | 'houseD10', lagnaSign: number) => {
    const result: Record<number, { signNum: number; planets: PlanetPosition[] }> = {};
    for (let h = 1; h <= 12; h++) {
      const houseSignNum = ((lagnaSign - 1 + h - 1) % 12) + 1;
      result[h] = { signNum: houseSignNum, planets: [] };
    }
    planetsList.forEach((p) => {
      const hNum = p[chartType];
      if (result[hNum]) {
        result[hNum].planets.push(p);
      }
    });
    return result;
  };

  // D1 Lagna Sign
  const housesD1 = groupHouse('houseD1', lagnaSignNum);

  // D9 Lagna Sign
  const lagnaDegInSign = sid_lagna % 30;
  const lagnaNavPart = Math.floor(lagnaDegInSign / (3 + 20 / 60));
  const lagnaElement = (lagnaSignNum - 1) % 4;
  let lagnaD9Start = 0;
  if (lagnaElement === 0) lagnaD9Start = 0;
  else if (lagnaElement === 1) lagnaD9Start = 9;
  else if (lagnaElement === 2) lagnaD9Start = 6;
  else lagnaD9Start = 3;
  const lagnaD9SignNum = ((lagnaD9Start + lagnaNavPart) % 12) + 1;
  const housesD9 = groupHouse('houseD9', lagnaD9SignNum);

  // D10 Lagna Sign
  const lagnaD10Part = Math.floor(lagnaDegInSign / 3);
  let lagnaD10Start = lagnaSignNum - 1;
  if ((lagnaSignNum - 1) % 2 === 1) {
    lagnaD10Start = (lagnaSignNum - 1 + 8) % 12;
  }
  const lagnaD10SignNum = ((lagnaD10Start + lagnaD10Part) % 12) + 1;
  const housesD10 = groupHouse('houseD10', lagnaD10SignNum);

  // Manglik Check: Mars in House 1, 2, 4, 7, 8, or 12
  const isManglik = [1, 2, 4, 7, 8, 12].includes(mars.houseD1);

  const moonSignObj = ZODIAC_SIGNS[moon.signNum - 1];
  const sunSignObj = ZODIAC_SIGNS[sun.signNum - 1];
  const lagnaSignObj = ZODIAC_SIGNS[lagnaSignNum - 1];
  const moonNak = NAKSHATRAS[moon.nakshatraIdx];

  return {
    birthDetails: {
      name,
      dob,
      tob,
      pob,
      gender,
      lat,
      lng,
      tzOffset,
    },
    ayanamsha,
    ayanamshaFormatted: `${ayanamsha.toFixed(2)}° (Lahiri)`,
    lagnaLongitude: sid_lagna,
    lagnaSignNum,
    lagnaDegreeFormatted: formatDegree(sid_lagna % 30),
    lagnaNakshatraIdx: Math.floor(sid_lagna / (360 / 27)),
    lagnaPada: Math.floor((sid_lagna % (360 / 27)) / (360 / 108)) + 1,
    planets: planetsList,
    housesD1,
    housesD9,
    housesD10,
    summary: {
      lagnaSignKey: lagnaSignObj.en,
      moonSignKey: moonSignObj.en,
      sunSignKey: sunSignObj.en,
      nakshatraKey: moonNak.id,
      pada: moon.pada,
      nakshatraLordKey: moonNak.lordKey,
      rashiLordKey: moonSignObj.lord,
      isManglik,
    },
  };
}
