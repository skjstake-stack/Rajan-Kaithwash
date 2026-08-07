import React, { useRef } from 'react';
import { Download, Printer, Share2, Bookmark, Check, ShieldAlert, Sparkles, FileText, Globe } from 'lucide-react';
import { KundliCalculationResult, PLANET_DETAILS, ZODIAC_SIGNS, NAKSHATRAS, HOUSE_NAMES } from '../utils/vedicKundliCalc';

interface KundliDetailsTableProps {
  kundliData: KundliCalculationResult;
  lang: string;
  onSaveProfile?: () => void;
}

export const KundliDetailsTable: React.FC<KundliDetailsTableProps> = ({
  kundliData,
  lang,
  onSaveProfile,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Validate language code
  const getLangCode = (l: string): 'hi' | 'en' | 'gu' | 'mr' | 'ta' | 'te' | 'pa' | 'bn' | 'ur' => {
    const valid = ['hi', 'en', 'gu', 'mr', 'ta', 'te', 'pa', 'bn', 'ur'];
    return (valid.includes(l) ? l : 'hi') as any;
  };
  const cLang = getLangCode(lang);

  // Table header dictionaries for 9 languages
  const TABLE_HEADERS: Record<string, {
    planet: string;
    sign: string;
    house: string;
    degree: string;
    nakshatra: string;
    pada: string;
    motion: string;
    direct: string;
    retrograde: string;
    keyInfoTitle: string;
    lagnaLabel: string;
    moonSignLabel: string;
    sunSignLabel: string;
    nakshatraLabel: string;
    padaLabel: string;
    nakshatraLordLabel: string;
    rashiLordLabel: string;
    manglikLabel: string;
    manglikYes: string;
    manglikNo: string;
    downloadPdf: string;
    printKundli: string;
    shareKundli: string;
    saveKundli: string;
    savedMsg: string;
  }> = {
    hi: {
      planet: 'ग्रह',
      sign: 'राशि',
      house: 'भाव',
      degree: 'डिग्री (° \' ")',
      nakshatra: 'नक्षत्र',
      pada: 'पाद',
      motion: 'गति',
      direct: 'मार्गी',
      retrograde: 'वक्री',
      keyInfoTitle: 'प्रमुख जन्म कुंडली विवरण',
      lagnaLabel: 'लग्न (Lagna)',
      moonSignLabel: 'चंद्र राशि (Moon Sign)',
      sunSignLabel: 'सूर्य राशि (Sun Sign)',
      nakshatraLabel: 'जन्म नक्षत्र',
      padaLabel: 'नक्षत्र पाद',
      nakshatraLordLabel: 'नक्षत्र स्वामी',
      rashiLordLabel: 'राशि स्वामी',
      manglikLabel: 'मांगलिक स्थिति',
      manglikYes: 'मांगलिक दोष (Manglik)',
      manglikNo: 'अन्-मांगलिक (Non-Manglik)',
      downloadPdf: 'PDF डाउनलोड करें',
      printKundli: 'प्रिंट (Print)',
      shareKundli: 'शेयर (Share)',
      saveKundli: 'कुंडली सेव करें',
      savedMsg: 'सेव हो गया!',
    },
    en: {
      planet: 'Planet',
      sign: 'Sign',
      house: 'House',
      degree: 'Degree (° \' ")',
      nakshatra: 'Nakshatra',
      pada: 'Pada',
      motion: 'Motion',
      direct: 'Direct',
      retrograde: 'Retrograde',
      keyInfoTitle: 'Key Birth Details Summary',
      lagnaLabel: 'Ascendant (Lagna)',
      moonSignLabel: 'Moon Sign (Rashi)',
      sunSignLabel: 'Sun Sign',
      nakshatraLabel: 'Birth Nakshatra',
      padaLabel: 'Nakshatra Pada',
      nakshatraLordLabel: 'Nakshatra Lord',
      rashiLordLabel: 'Rashi Lord',
      manglikLabel: 'Manglik Dosha',
      manglikYes: 'Manglik Present',
      manglikNo: 'Non-Manglik',
      downloadPdf: 'Download PDF',
      printKundli: 'Print Kundli',
      shareKundli: 'Share Kundli',
      saveKundli: 'Save Kundli',
      savedMsg: 'Saved!',
    },
    gu: {
      planet: 'ગ્રહ',
      sign: 'રાશિ',
      house: 'ભાવ',
      degree: 'અંશ (° \' ")',
      nakshatra: 'નક્ષત્ર',
      pada: 'પાદ',
      motion: 'ગતિ',
      direct: 'માર્ગી',
      retrograde: 'વક્રી',
      keyInfoTitle: 'મુખ્ય જન્મ કુંડળી વિગતો',
      lagnaLabel: 'લગ્ન (Lagna)',
      moonSignLabel: 'ચંદ્ર રાશિ',
      sunSignLabel: 'સૂર્ય રાશિ',
      nakshatraLabel: 'જન્મ નક્ષત્ર',
      padaLabel: 'નક્ષત્ર પાદ',
      nakshatraLordLabel: 'નક્ષત્ર સ્વામી',
      rashiLordLabel: 'રાશિ સ્વામી',
      manglikLabel: 'માંગલિક સ્થિતિ',
      manglikYes: 'માંગલિક દોષ',
      manglikNo: 'અન-માંગલિક',
      downloadPdf: 'PDF ડાઉનલોડ કરો',
      printKundli: 'પ્રિન્ટ કરો',
      shareKundli: 'શેર કરો',
      saveKundli: 'કુંડળી સેવ કરો',
      savedMsg: 'સેવ થઈ ગયું!',
    },
    mr: {
      planet: 'ग्रह',
      sign: 'राशी',
      house: 'भाव',
      degree: 'अंश (° \' ")',
      nakshatra: 'नक्षत्र',
      pada: 'पाद',
      motion: 'गती',
      direct: 'मार्गी',
      retrograde: 'वक्री',
      keyInfoTitle: 'प्रमुख जन्म कुंडली तपशील',
      lagnaLabel: 'लग्न (Lagna)',
      moonSignLabel: 'चंद्र राशी',
      sunSignLabel: 'सूर्य राशी',
      nakshatraLabel: 'जन्म नक्षत्र',
      padaLabel: 'नक्षत्र पाद',
      nakshatraLordLabel: 'नक्षत्र स्वामी',
      rashiLordLabel: 'राशी स्वामी',
      manglikLabel: 'मांगलिक स्थिती',
      manglikYes: 'मांगलिक दोष',
      manglikNo: 'अन्-मांगलिक',
      downloadPdf: 'PDF डाउनलोड करा',
      printKundli: 'प्रिंट करा',
      shareKundli: 'शेअर करा',
      saveKundli: 'कुंडली सेव्ह करा',
      savedMsg: 'सेव्ह झाले!',
    },
    ta: {
      planet: 'கிரகம்',
      sign: 'ராசி',
      house: 'பாவம்',
      degree: 'பாகை (° \' ")',
      nakshatra: 'நட்சத்திரம்',
      pada: 'பாதம்',
      motion: 'இயக்கம்',
      direct: 'நேர்',
      retrograde: 'வக்ரம்',
      keyInfoTitle: 'முக்கிய ஜாதக விவரங்கள்',
      lagnaLabel: 'லக்னம்',
      moonSignLabel: 'சந்திர ராசி',
      sunSignLabel: 'சூரிய ராசி',
      nakshatraLabel: 'ஜென்ம நட்சத்திரம்',
      padaLabel: 'நட்சத்திர பாதம்',
      nakshatraLordLabel: 'நட்சத்திர அதிபதி',
      rashiLordLabel: 'ராசி அதிபதி',
      manglikLabel: 'செவ்வாய் தோஷம்',
      manglikYes: 'செவ்வாய் தோஷம் உண்டு',
      manglikNo: 'தோஷம் இல்லை',
      downloadPdf: 'PDF பதிவிறக்கவும்',
      printKundli: 'அச்சிடுக',
      shareKundli: 'பகிருக',
      saveKundli: 'சேமிக்க',
      savedMsg: 'சேமிக்கப்பட்டது!',
    },
    te: {
      planet: 'గ్రహం',
      sign: 'రాశి',
      house: 'భావం',
      degree: 'డిగ్రీ (° \' ")',
      nakshatra: 'నక్షత్రం',
      pada: 'పాదం',
      motion: 'గతి',
      direct: 'రుజు',
      retrograde: 'వక్ర',
      keyInfoTitle: 'ప్రధాన జాతక వివరాలు',
      lagnaLabel: 'లగ్నం',
      moonSignLabel: 'చంద్ర రాశి',
      sunSignLabel: 'సూర్య రాశి',
      nakshatraLabel: 'జన్మ నక్షత్రం',
      padaLabel: 'నక్షత్ర పాదం',
      nakshatraLordLabel: 'నక్షత్ర అధిపతి',
      rashiLordLabel: 'రాశి అధిపతి',
      manglikLabel: 'మాంగలిక దోషం',
      manglikYes: 'మాంగలిక దోషం ఉంది',
      manglikNo: 'దోషం లేదు',
      downloadPdf: 'PDF డౌన్‌లోడ్',
      printKundli: 'ప్రింట్ చేయండి',
      shareKundli: 'షేర్ చేయండి',
      saveKundli: 'జాతకం సేవ్ చేయండి',
      savedMsg: 'సేవ్ అయ్యింది!',
    },
    pa: {
      planet: 'ਗ੍ਰਹਿ',
      sign: 'ਰਾਸ਼ੀ',
      house: 'ਭਾਵ',
      degree: 'ਡਿਗਰੀ (° \' ")',
      nakshatra: 'ਨਕਸ਼ਤਰ',
      pada: 'ਚਰਨ (ਪਾਦ)',
      motion: 'ਚਾਲ',
      direct: 'ਮਾਰਗੀ',
      retrograde: 'ਵਕਰੀ',
      keyInfoTitle: 'ਮੁੱਖ ਜਨਮ ਕੁੰਡਲੀ ਵੇਰਵੇ',
      lagnaLabel: 'ਲਗਨ',
      moonSignLabel: 'ਚੰਦਰ ਰਾਸ਼ੀ',
      sunSignLabel: 'ਸੂਰਜ ਰਾਸ਼ੀ',
      nakshatraLabel: 'ਜਨਮ ਨਕਸ਼ਤਰ',
      padaLabel: 'ਨਕਸ਼ਤਰ ਪਾਦ',
      nakshatraLordLabel: 'ਨਕਸ਼ਤਰ ਸੁਆਮੀ',
      rashiLordLabel: 'ਰਾਸ਼ੀ ਸੁਆਮੀ',
      manglikLabel: 'ਮਾਂਗਲਿਕ ਸਥਿਤੀ',
      manglikYes: 'ਮਾਂਗਲਿਕ ਦੋਸ਼',
      manglikNo: 'ਗੈਰ-ਮਾਂਗਲਿਕ',
      downloadPdf: 'PDF ਡਾਊਨਲੋਡ ਕਰੋ',
      printKundli: 'ਪ੍ਰਿੰਟ ਕਰੋ',
      shareKundli: 'ਸ਼ੇਅਰ ਕਰੋ',
      saveKundli: 'ਕੁੰਡਲੀ ਸੰਭਾਲੋ',
      savedMsg: 'ਸੰਭਾਲਿਆ ਗਿਆ!',
    },
    bn: {
      planet: 'গ্রহ',
      sign: 'রাশি',
      house: 'ভাব',
      degree: 'ডিগ্রি (° \' ")',
      nakshatra: 'নক্ষত্র',
      pada: 'পদ',
      motion: 'গতি',
      direct: 'মার্গী',
      retrograde: 'বক্রী',
      keyInfoTitle: 'প্রধান জন্ম কোষ্ঠী বিবরণ',
      lagnaLabel: 'লগ্ন',
      moonSignLabel: 'চন্দ্র রাশি',
      sunSignLabel: 'সূর্য রাশি',
      nakshatraLabel: 'জন্ম নক্ষত্র',
      padaLabel: 'নক্ষত্র পদ',
      nakshatraLordLabel: 'নক্ষত্র স্বামী',
      rashiLordLabel: 'রাশি স্বামী',
      manglikLabel: 'মাঙ্গলিক দশা',
      manglikYes: 'মাঙ্গলিক দোষ আছে',
      manglikNo: 'মাঙ্গলিক নয়',
      downloadPdf: 'PDF ডাউনলোড করুন',
      printKundli: 'প্রিন্ট করুন',
      shareKundli: 'শেয়ার করুন',
      saveKundli: 'কোষ্ঠী সেভ করুন',
      savedMsg: 'সেভ হয়েছে!',
    },
    ur: {
      planet: 'سیارہ',
      sign: 'برج',
      house: 'گھر',
      degree: 'ڈگری (° \' ")',
      nakshatra: 'نکشیتر',
      pada: 'پاڈ',
      motion: 'حرکت',
      direct: 'مستقیم',
      retrograde: 'راجع',
      keyInfoTitle: 'اہم جنم کنڈلی تفصیلات',
      lagnaLabel: 'لگن',
      moonSignLabel: 'قمر برج',
      sunSignLabel: 'شمس برج',
      nakshatraLabel: 'جنم نکشیتر',
      padaLabel: 'نکشیتر پاڈ',
      nakshatraLordLabel: 'نکشیتر لارڈ',
      rashiLordLabel: 'برج لارڈ',
      manglikLabel: 'مانگلک صورتحال',
      manglikYes: 'مانگلک دوش',
      manglikNo: 'غیر مانگلک',
      downloadPdf: 'PDF ڈاؤن لوڈ کریں',
      printKundli: 'پرنٹ کریں',
      shareKundli: 'شیئر کریں',
      saveKundli: 'کنڈلی محفوظ کریں',
      savedMsg: 'محفوظ ہو گیا!',
    },
  };

  const dict = TABLE_HEADERS[cLang] || TABLE_HEADERS['hi'];

  // Helper getters
  const getPlanetName = (pId: string) => {
    const detail = PLANET_DETAILS[pId];
    return detail ? (detail.full[cLang] || detail.full['en']) : pId;
  };

  const getSignName = (signNum: number) => {
    const s = ZODIAC_SIGNS[signNum - 1];
    return s ? ((s as any)[cLang] || s.hi || s.en) : `Sign ${signNum}`;
  };

  const getNakshatraName = (idx: number) => {
    const nak = NAKSHATRAS[idx];
    return nak ? (nak.name[cLang] || nak.name['hi'] || nak.name['en']) : `Nakshatra ${idx}`;
  };

  const { summary, planets, birthDetails } = kundliData;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${birthDetails.name} Janam Kundli`,
        text: `Vedic Birth Chart for ${birthDetails.name} (${birthDetails.dob}). Generated by AI Astrology Studio.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSave = () => {
    localStorage.setItem(`saved_kundli_${birthDetails.name}`, JSON.stringify(kundliData));
    setSaved(true);
    if (onSaveProfile) onSaveProfile();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div ref={printRef} className="w-full space-y-6 text-white">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{birthDetails.name} — Janam Kundli Report</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer text-white/90"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>{dict.printKundli}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer text-white/90"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{copied ? 'Copied!' : dict.shareKundli}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
            <span>{saved ? dict.savedMsg : dict.saveKundli}</span>
          </button>
        </div>
      </div>

      {/* Key Birth Details Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Lagna */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-white/60 mb-1">{dict.lagnaLabel}</div>
          <div className="text-base font-bold text-amber-400">{summary.lagnaSignKey}</div>
          <div className="text-[10px] text-white/50 mt-0.5">
            Degree: {kundliData.lagnaDegreeFormatted}
          </div>
        </div>

        {/* Moon Sign */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-white/60 mb-1">{dict.moonSignLabel}</div>
          <div className="text-base font-bold text-amber-400">{summary.moonSignKey}</div>
          <div className="text-[10px] text-white/50 mt-0.5">
            Lord: {summary.rashiLordKey}
          </div>
        </div>

        {/* Birth Nakshatra */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-white/60 mb-1">{dict.nakshatraLabel}</div>
          <div className="text-base font-bold text-amber-400">
            {getNakshatraName(kundliData.planets.find(p => p.id === 'moon')?.nakshatraIdx || 0)}
          </div>
          <div className="text-[10px] text-white/50 mt-0.5">
            Pada {summary.pada} • Lord: {summary.nakshatraLordKey}
          </div>
        </div>

        {/* Manglik Status */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-[11px] font-medium text-white/60 mb-1">{dict.manglikLabel}</div>
          <div className={`text-sm font-bold flex items-center gap-1 ${summary.isManglik ? 'text-red-400' : 'text-emerald-400'}`}>
            {summary.isManglik ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{summary.isManglik ? dict.manglikYes : dict.manglikNo}</span>
          </div>
          <div className="text-[10px] text-white/50 mt-0.5">
            Mars in House {planets.find(p => p.id === 'mars')?.houseD1}
          </div>
        </div>
      </div>

      {/* Comprehensive Planetary Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <table className="w-full text-left text-xs text-white/90">
          <thead className="bg-white/10 uppercase tracking-wider text-[11px] text-amber-300 font-bold border-b border-white/10">
            <tr>
              <th className="py-3 px-3.5">{dict.planet}</th>
              <th className="py-3 px-3.5">{dict.sign}</th>
              <th className="py-3 px-3.5 text-center">{dict.house}</th>
              <th className="py-3 px-3.5">{dict.degree}</th>
              <th className="py-3 px-3.5">{dict.nakshatra}</th>
              <th className="py-3 px-3.5 text-center">{dict.pada}</th>
              <th className="py-3 px-3.5 text-right">{dict.motion}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {planets.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3.5 font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.id === 'sun' || p.id === 'jupiter' ? 'bg-amber-400' : p.id === 'mars' ? 'bg-red-400' : 'bg-blue-400'}`} />
                  {getPlanetName(p.id)}
                </td>
                <td className="py-3 px-3.5 font-medium text-amber-200">
                  {getSignName(p.signNum)} ({p.signNum})
                </td>
                <td className="py-3 px-3.5 text-center font-bold text-amber-400">
                  H{p.houseD1}
                </td>
                <td className="py-3 px-3.5 font-mono text-[11px] text-white/80">
                  {p.degreeFormatted}
                </td>
                <td className="py-3 px-3.5 text-white/90">
                  {getNakshatraName(p.nakshatraIdx)}
                </td>
                <td className="py-3 px-3.5 text-center font-semibold text-white/80">
                  {p.pada}
                </td>
                <td className="py-3 px-3.5 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.isRetrograde
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {p.isRetrograde ? dict.retrograde : dict.direct}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
