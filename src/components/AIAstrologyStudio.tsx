import React, { useState } from 'react';
import { Sparkles, Bot, Heart, Gem, Compass, Send, User, Calendar, Clock, MapPin, Loader2, Volume2, Mic, Globe } from 'lucide-react';
import { Language } from '../types';
import { CleanFormattedText, cleanMarkdownSymbols } from '../utils/textUtils';
import { KUNDLI_LANGUAGES, KUNDLI_TRANSLATIONS } from '../data/kundliTranslations';
import { calculateVedicKundli, KundliCalculationResult } from '../utils/vedicKundliCalc';
import { saveKundliToFirestore } from '../lib/firebase';
import { NorthIndianKundliChart } from './NorthIndianKundliChart';
import { KundliDetailsTable } from './KundliDetailsTable';

interface AIAstrologyStudioProps {
  currentLang: Language;
  darkMode: boolean;
  onOpenBooking: (serviceId?: string) => void;
  onOpenVoiceAssistant: () => void;
}

export const AIAstrologyStudio: React.FC<AIAstrologyStudioProps> = ({ currentLang, darkMode, onOpenBooking, onOpenVoiceAssistant }) => {
  const [activeTab, setActiveTab] = useState<'kundli' | 'matching' | 'chat' | 'remedy'>('kundli');

  // --- 1. Multilingual Kundli State (Default: Hindi) ---
  const [kundliLang, setKundliLang] = useState<string>(() => {
    return localStorage.getItem('kundli_section_lang') || 'hi';
  });

  const kDict = KUNDLI_TRANSLATIONS[kundliLang] || KUNDLI_TRANSLATIONS['hi'];

  const [kundliForm, setKundliForm] = useState({
    name: '',
    dob: '1996-05-15',
    tob: '09:30',
    pob: 'New Delhi, India',
    gender: 'Male',
  });
  const [kundliResult, setKundliResult] = useState<string | null>(null);
  const [calcKundliData, setCalcKundliData] = useState<KundliCalculationResult | null>(null);
  const [chartType, setChartType] = useState<'D1' | 'D9' | 'D10'>('D1');
  const [loadingKundli, setLoadingKundli] = useState(false);

  const handleKundliLangChange = (newLang: string) => {
    setKundliLang(newLang);
    localStorage.setItem('kundli_section_lang', newLang);

    // Save preference for logged-in users to profile/DB
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    if (token) {
      fetch('/api/user/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ kundli_lang: newLang }),
      }).catch(() => {});
    }

    if (kundliResult && kundliForm.name) {
      reGenerateKundliWithLang(newLang);
    }
  };

  const reGenerateKundliWithLang = async (langToUse: string) => {
    setLoadingKundli(true);
    const computed = calculateVedicKundli(
      kundliForm.dob,
      kundliForm.tob,
      kundliForm.pob,
      kundliForm.name || 'User',
      kundliForm.gender
    );
    setCalcKundliData(computed);

    try {
      const res = await fetch('/api/ai/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kundliForm, lang: langToUse }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setKundliResult(cleanMarkdownSymbols(data.result));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingKundli(false);
    }
  };

  // --- 2. Matching State ---
  const [partner1, setPartner1] = useState({ name: 'Aarav Mehta', dob: '1995-03-12', tob: '08:15', pob: 'Mumbai, India' });
  const [partner2, setPartner2] = useState({ name: 'Ananya Sharma', dob: '1997-07-24', tob: '18:45', pob: 'Delhi, India' });
  const [matchingResult, setMatchingResult] = useState<string | null>(null);
  const [loadingMatching, setLoadingMatching] = useState(false);

  // --- 3. Chat State ---
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: 'हरि ॐ! मैं राजन कैथवास (मंटू) का एआई वैदिक सहायक हूँ। आप अपनी कुंडली, ग्रह-दोष, करियर, विवाह मिलान, शुभ रत्न या वास्तु शास्त्र से संबंधित कोई भी प्रश्न पूछ सकते हैं।',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // --- 4. Remedy State ---
  const [remedyForm, setRemedyForm] = useState({
    problemArea: 'Career promotion delay & financial instability',
    Rashi: 'Leo (Simha)',
    birthStar: 'Purva Phalguni',
  });
  const [remedyResult, setRemedyResult] = useState<string | null>(null);
  const [loadingRemedy, setLoadingRemedy] = useState(false);

  // Handlers
  const handleGenerateKundli = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingKundli(true);
    setKundliResult(null);

    const computed = calculateVedicKundli(
      kundliForm.dob,
      kundliForm.tob,
      kundliForm.pob,
      kundliForm.name || 'User',
      kundliForm.gender
    );
    setCalcKundliData(computed);

    // Save Kundli record to Firebase Firestore
    saveKundliToFirestore({
      name: kundliForm.name || 'User',
      gender: kundliForm.gender.toLowerCase() === 'female' ? 'female' : 'male',
      dob: kundliForm.dob,
      tob: kundliForm.tob,
      pob: kundliForm.pob,
      lagna: computed.summary.lagnaSignKey,
      rashi: computed.summary.moonSignKey,
      nakshatra: computed.summary.nakshatraKey
    }).catch((err) => console.warn('Firestore Kundli sync note:', err));

    try {
      const res = await fetch('/api/ai/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kundliForm, lang: kundliLang }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setKundliResult(cleanMarkdownSymbols(data.result));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingKundli(false);
    }
  };

  const handleResetKundli = () => {
    setKundliForm({
      name: '',
      dob: '1996-05-15',
      tob: '09:30',
      pob: 'New Delhi, India',
      gender: 'Male',
    });
    setKundliResult(null);
    setCalcKundliData(null);
  };

  const handleGenerateMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMatching(true);
    setMatchingResult(null);
    try {
      const res = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner1, partner2, lang: currentLang }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setMatchingResult(cleanMarkdownSymbols(data.result));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatching(false);
    }
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const updatedMessages = [...chatMessages, { role: 'user' as const, text: query }];
    setChatMessages(updatedMessages);
    if (!textToSend) setChatInput('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile: { name: kundliForm.name, dob: kundliForm.dob, pob: kundliForm.pob },
          lang: currentLang,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages([...updatedMessages, { role: 'bot', text: cleanMarkdownSymbols(data.reply) }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleGenerateRemedy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRemedy(true);
    setRemedyResult(null);
    try {
      const res = await fetch('/api/ai/remedy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...remedyForm, lang: currentLang }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setRemedyResult(cleanMarkdownSymbols(data.result));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRemedy(false);
    }
  };

  return (
    <section id="ai-studio" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">सर्वर-साइड जेमिनी एआई एवं पाराशरी सिद्धान्त</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            एआई वैदिक ज्योतिष <span className="text-[#D4AF37] italic">स्टूडियो</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            तत्काल एआई जन्म कुंडली विश्लेषण, 36 गुण मिलान, शुभ रत्न परामर्श, अथवा राजन कैथवास (मंटू) के एआई ज्योतिषी से 24x7 संवाद करें।
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('kundli')}
            className={`flex items-center px-6 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
              activeTab === 'kundli'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-105 font-bold'
                : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
            }`}
          >
            <Compass className="w-4 h-4 mr-2" />
            एआई जन्म कुंडली सार
          </button>

          <button
            onClick={() => setActiveTab('matching')}
            className={`flex items-center px-6 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-105 font-bold'
                : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
            }`}
          >
            <Heart className="w-4 h-4 mr-2 text-rose-400" />
            एआई 36 गुण विवाह मिलान
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center px-6 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-105 font-bold'
                : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
            }`}
          >
            <Bot className="w-4 h-4 mr-2 text-cyan-400" />
            एआई ज्योतिषी से प्रश्न पूछें
          </button>

          <button
            onClick={() => setActiveTab('remedy')}
            className={`flex items-center px-6 py-3 rounded-full font-semibold text-xs sm:text-sm tracking-wider transition-all cursor-pointer ${
              activeTab === 'remedy'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-105 font-bold'
                : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
            }`}
          >
            <Gem className="w-4 h-4 mr-2 text-[#D4AF37]" />
            एआई उपाय एवं रत्न परामर्श
          </button>
        </div>

        {/* TAB 1: AI Kundli Summary */}
        {activeTab === 'kundli' && (
          <div className="space-y-6">
            {/* Language Selector Toolbar */}
            <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-[#FF9933]" />
                  <span className="font-serif font-bold text-sm sm:text-base text-[#D4AF37] tracking-wider">
                    {kDict.selectLangLabel}
                  </span>
                </div>
                <span className="text-[11px] text-white/50">
                  (Default: हिंदी • Preference saved automatically)
                </span>
              </div>

              {/* 9 Languages Selection Pills */}
              <div className="flex flex-wrap gap-2 items-center">
                {KUNDLI_LANGUAGES.map((langOpt) => {
                  const isActive = kundliLang === langOpt.code;
                  return (
                    <button
                      key={langOpt.code}
                      type="button"
                      onClick={() => handleKundliLangChange(langOpt.code)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37] hover:bg-white/10'
                      }`}
                    >
                      <span>{langOpt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form and Output Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <form onSubmit={handleGenerateKundli} className="lg:col-span-5 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4 shadow-2xl">
                <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
                  <Compass className="w-5 h-5 mr-2" />
                  {kDict.formTitle}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">{kDict.fullNameLabel}</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                    <input
                      type="text"
                      required
                      placeholder={kDict.fullNamePlaceholder}
                      value={kundliForm.name}
                      onChange={(e) => setKundliForm({ ...kundliForm, name: e.target.value })}
                      className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">{kDict.dobLabel}</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                      <input
                        type="date"
                        required
                        value={kundliForm.dob}
                        onChange={(e) => setKundliForm({ ...kundliForm, dob: e.target.value })}
                        className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">{kDict.tobLabel}</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                      <input
                        type="time"
                        required
                        value={kundliForm.tob}
                        onChange={(e) => setKundliForm({ ...kundliForm, tob: e.target.value })}
                        className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">{kDict.pobLabel}</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                      <input
                        type="text"
                        required
                        placeholder={kDict.pobPlaceholder}
                        value={kundliForm.pob}
                        onChange={(e) => setKundliForm({ ...kundliForm, pob: e.target.value })}
                        className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">{kDict.genderLabel}</label>
                    <select
                      value={kundliForm.gender}
                      onChange={(e) => setKundliForm({ ...kundliForm, gender: e.target.value })}
                      className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Male">{kDict.genderMale}</option>
                      <option value="Female">{kDict.genderFemale}</option>
                      <option value="Other">{kDict.genderOther}</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loadingKundli}
                    className="flex-1 py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform text-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {loadingKundli ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {kDict.calculatingBtn}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {kDict.generateBtn}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetKundli}
                    className="px-5 py-3.5 rounded-full font-semibold text-xs tracking-wider text-white/80 bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
                  >
                    {kDict.resetBtn}
                  </button>
                </div>
              </form>

              {/* Kundli Output Panel */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 min-h-[420px] flex flex-col justify-between shadow-2xl">
                {calcKundliData ? (
                  <div className="space-y-6">
                    {/* Header with Consultation button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-serif font-bold text-[#D4AF37] text-lg sm:text-xl">
                          {kDict.resultHeader}: {kundliForm.name || 'Janam Kundli'}
                        </h3>
                        <p className="text-xs text-white/60">
                          DOB: {kundliForm.dob} | TOB: {kundliForm.tob} | POB: {kundliForm.pob}
                        </p>
                      </div>
                      <button
                        onClick={() => onOpenBooking('janam-kundli')}
                        className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold rounded-full hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-[#D4AF37]/20 shrink-0"
                      >
                        {kDict.bookConsultationBtn}
                      </button>
                    </div>

                    {/* 1. Traditional North Indian Vedic Kundli Chart Visualizer */}
                    <div className="p-4 rounded-2xl bg-[#050B18]/70 border border-[#D4AF37]/30">
                      <NorthIndianKundliChart
                        kundliData={calcKundliData}
                        lang={kundliLang}
                        chartType={chartType}
                        onChartTypeChange={setChartType}
                      />
                    </div>

                    {/* 2. Key Birth Summary & Planetary Table & Actions */}
                    <KundliDetailsTable
                      kundliData={calcKundliData}
                      lang={kundliLang}
                    />

                    {/* 3. Detailed AI Interpretation Analysis */}
                    {kundliResult && (
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <h4 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2 border-b border-white/10 pb-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>पाराशरी एआई विश्लेषण एवं उपाय रिपोर्ट</span>
                        </h4>
                        <div className="text-xs sm:text-sm text-white/80 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                          <CleanFormattedText content={kundliResult} className="text-white/80" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center my-auto py-16 space-y-3 text-white/40">
                    <Compass className="w-16 h-16 mx-auto text-[#D4AF37]/40 animate-pulse" />
                    <p className="font-serif text-lg text-[#D4AF37]">{kDict.emptyStateTitle}</p>
                    <p className="text-xs max-w-sm mx-auto text-white/50">
                      {kDict.emptyStateDesc}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Reference Panel in Selected Language */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-2">
              <span className="font-serif font-bold text-[#D4AF37] text-sm block">
                {kDict.quickReferenceTitle}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-[#050B18]/60 border border-white/5">
                  <span className="text-[#FF9933] font-semibold block mb-1">12 Rashi / Zodiacs:</span>
                  <p className="text-white/80 leading-snug">{kDict.zodiacSigns.join(' • ')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#050B18]/60 border border-white/5">
                  <span className="text-[#D4AF37] font-semibold block mb-1">9 Navagraha / Planets:</span>
                  <p className="text-white/80 leading-snug">{kDict.planets.join(' • ')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#050B18]/60 border border-white/5">
                  <span className="text-emerald-400 font-semibold block mb-1">Numeral Format:</span>
                  <p className="text-white/80 leading-snug">0, 1, 2, 3, 4, 5, 6, 7, 8, 9 (English)</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#050B18]/60 border border-white/5">
                  <span className="text-cyan-400 font-semibold block mb-1">Active Kundli Language:</span>
                  <p className="text-[#D4AF37] font-bold">
                    {KUNDLI_LANGUAGES.find((l) => l.code === kundliLang)?.native || 'हिंदी (Hindi)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI 36 Guna Matchmaking */}
        {activeTab === 'matching' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleGenerateMatching} className="lg:col-span-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 shadow-2xl">
              <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
                <Heart className="w-5 h-5 mr-2 text-rose-400" />
                अष्टकूट 36 गुण विवाह मिलान प्रविष्टि
              </h3>

              {/* Partner 1 Details */}
              <div className="p-4 rounded-2xl bg-[#050B18]/60 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">वर (वर पक्ष विवरण)</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="वर का नाम"
                    value={partner1.name}
                    onChange={(e) => setPartner1({ ...partner1, name: e.target.value })}
                    className="col-span-2 bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    required
                    value={partner1.dob}
                    onChange={(e) => setPartner1({ ...partner1, dob: e.target.value })}
                    className="bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="time"
                    required
                    value={partner1.tob}
                    onChange={(e) => setPartner1({ ...partner1, tob: e.target.value })}
                    className="bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="जन्म स्थान (शहर)"
                    value={partner1.pob}
                    onChange={(e) => setPartner1({ ...partner1, pob: e.target.value })}
                    className="col-span-2 bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Partner 2 Details */}
              <div className="p-4 rounded-2xl bg-[#050B18]/60 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">वधू (कन्या पक्ष विवरण)</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="वधू का नाम"
                    value={partner2.name}
                    onChange={(e) => setPartner2({ ...partner2, name: e.target.value })}
                    className="col-span-2 bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    required
                    value={partner2.dob}
                    onChange={(e) => setPartner2({ ...partner2, dob: e.target.value })}
                    className="bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="time"
                    required
                    value={partner2.tob}
                    onChange={(e) => setPartner2({ ...partner2, tob: e.target.value })}
                    className="bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="जन्म स्थान (शहर)"
                    value={partner2.pob}
                    onChange={(e) => setPartner2({ ...partner2, pob: e.target.value })}
                    className="col-span-2 bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingMatching}
                className="w-full py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform text-xs flex items-center justify-center cursor-pointer"
              >
                {loadingMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    गुणों का मिलान किया जा रहा है...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2 text-rose-600" />
                    एआई 36 गुण विवाह मिलान गणना करें
                  </>
                )}
              </button>
            </form>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 min-h-[480px] flex flex-col justify-between shadow-2xl">
              {matchingResult ? (
                <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed max-h-[520px] overflow-y-auto pr-2">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-serif font-bold text-[#D4AF37] text-lg">
                      36 गुण विवाह मिलान रिपोर्ट
                    </span>
                    <button
                      onClick={() => onOpenBooking('kundli-matching')}
                      className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold rounded-full hover:scale-105 transition-transform cursor-pointer"
                    >
                      विवाह परामर्श बुक करें
                    </button>
                  </div>
                  <CleanFormattedText content={matchingResult} className="text-white/80" />
                </div>
              ) : (
                <div className="text-center my-auto py-16 space-y-3 text-white/40">
                  <Heart className="w-16 h-16 mx-auto text-rose-500/40 animate-pulse" />
                  <p className="font-serif text-lg text-[#D4AF37]">गुण मिलान फलादेश यहाँ प्रदर्शित होगा</p>
                  <p className="text-xs max-w-sm mx-auto text-white/50">
                    वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी (36 गुण) का विस्तृत विश्लेषण प्राप्त करने हेतु दोनों पक्षों का जन्म विवरण भरें।
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AI Astrologer Assistant Chat */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 bg-[#050B18] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] p-0.5">
                  <div className="w-full h-full bg-[#050B18] rounded-full flex items-center justify-center font-serif text-[#D4AF37] font-bold text-lg">
                    ॐ
                  </div>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#D4AF37] text-base">राजन कैथवास जी एआई सहायक</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    ऑनलाइन | 24x7 वैदिक मार्गदर्शन
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenVoiceAssistant}
                  className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/20 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[#FF9933]" />
                  वॉइस मोड (बोलकर पूछें)
                </button>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#050B18]/60">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-semibold rounded-tr-none'
                        : 'bg-white/10 border border-white/10 text-white/90 rounded-tl-none shadow-md'
                    }`}
                  >
                    <CleanFormattedText content={msg.text} />
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl text-xs text-[#D4AF37] flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF9933]" />
                    <span>राजन कैथवास जी एआई गृह-गणना कर रहा है...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Starters */}
            <div className="p-2.5 bg-[#050B18] border-t border-white/10 flex overflow-x-auto space-x-2 text-[11px]">
              <button
                onClick={() => handleSendChatMessage('मेरी पदोन्नति या करियर बदलाव का शुभ समय कब आएगा?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer"
              >
                💼 करियर व नौकरी में पदोन्नति
              </button>
              <button
                onClick={() => handleSendChatMessage('मांगलिक एवं कालसर्प दोष निवारण हेतु सर्वोत्तम वैदिक उपाय क्या हैं?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer"
              >
                🐍 कालसर्प व मांगलिक दोष उपाय
              </button>
              <button
                onClick={() => handleSendChatMessage('धन वृद्धि एवं मानसिक शांति के लिए मेरी राशि अनुसार कौन सा रत्न उपयुक्त है?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer"
              >
                💎 धन व शांति हेतु शुभ रत्न
              </button>
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-[#050B18] border-t border-white/10 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="अपना ज्योतिषीय प्रश्न यहाँ लिखें..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={loadingChat || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: AI Remedy & Gemstone Finder */}
        {activeTab === 'remedy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleGenerateRemedy} className="lg:col-span-5 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4 shadow-2xl">
              <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
                <Gem className="w-5 h-5 mr-2 text-[#D4AF37]" />
                वैदिक उपाय एवं निदान
              </h3>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">समस्या / मुख्य चिंता का क्षेत्र</label>
                <textarea
                  rows={3}
                  required
                  value={remedyForm.problemArea}
                  onChange={(e) => setRemedyForm({ ...remedyForm, problemArea: e.target.value })}
                  placeholder="अपनी वर्तमान समस्या का वर्णन करें (जैसे व्यापार में घाटा, विवाह में विलंब, स्वास्थ्य समस्या)..."
                  className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">चंद्र राशि</label>
                  <input
                    type="text"
                    required
                    value={remedyForm.Rashi}
                    onChange={(e) => setRemedyForm({ ...remedyForm, Rashi: e.target.value })}
                    className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">जन्म नक्षत्र</label>
                  <input
                    type="text"
                    required
                    value={remedyForm.birthStar}
                    onChange={(e) => setRemedyForm({ ...remedyForm, birthStar: e.target.value })}
                    className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingRemedy}
                className="w-full py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform text-xs flex items-center justify-center cursor-pointer"
              >
                {loadingRemedy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    उपाय तैयार किए जा रहे हैं...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    एआई रत्न एवं मंत्र उपाय प्राप्त करें
                  </>
                )}
              </button>
            </form>

            <div className="lg:col-span-7 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 min-h-[420px] flex flex-col justify-between shadow-2xl">
              {remedyResult ? (
                <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed max-h-[500px] overflow-y-auto pr-2">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-serif font-bold text-[#D4AF37] text-lg">
                      व्यक्तिगत वैदिक उपाय
                    </span>
                    <button
                      onClick={() => onOpenBooking('gemstone-recommendation')}
                      className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold rounded-full hover:scale-105 transition-transform cursor-pointer"
                    >
                      प्रमाणित सिद्ध रत्न ऑर्डर करें
                    </button>
                  </div>
                  <CleanFormattedText content={remedyResult} className="text-white/80" />
                </div>
              ) : (
                <div className="text-center my-auto py-16 space-y-3 text-white/40">
                  <Gem className="w-16 h-16 mx-auto text-[#D4AF37]/40 animate-pulse" />
                  <p className="font-serif text-lg text-[#D4AF37]">एआई उपाय परामर्श यहाँ प्रदर्शित होगा</p>
                  <p className="text-xs max-w-sm mx-auto text-white/50">
                    बाईं ओर अपनी मुख्य समस्या का चयन करें। सिद्ध रत्न, बीज मंत्र, दान एवं पूजा विधान हेतु सटीक मार्गदर्शन प्राप्त करें।
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RICH SEO EXPLANATORY GUIDE ON KUNDLI & VEDIC ASTROLOGY */}
        <article className="mt-16 pt-12 border-t border-white/10 space-y-10">
          <header className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#D4AF37]">
              वैदिक जन्म कुंडली, ग्रह एवं ३६ गुण मिलान: संपूर्ण मार्गदर्शिका
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              आचार्य राजन कैथवास (मंटू) जी द्वारा पराशर सिद्धांत के अनुसार जन्म कुंडली फलादेश एवं वैदिक ज्योतिष ज्ञानवर्धक संदर्भ।
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-white/80">
            {/* 1. What is Janam Kundli */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                १. जन्म कुंडली क्या है? (Janam Kundli)
              </h3>
              <p className="leading-relaxed text-white/70">
                वैदिक ज्योतिष के अनुसार, व्यक्ति के जन्म के सटीक समय, तिथि एवं स्थान पर आकाशमंडल में स्थित ९ नवग्रहों, १२ राशियों एवं २७ नक्षत्रों की सटीक खगोलीय स्थिति का मानचित्र ही <strong className="text-white">जन्म कुंडली (Janam Kundli)</strong> कहलाता है। यह मनुष्य के पूर्व जन्म के कर्मों एवं इस जन्म के प्रारब्ध का दर्पण है।
              </p>
            </section>

            {/* 2. Lagna */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                २. लग्न क्या है? (Lagna / Ascendant)
              </h3>
              <p className="leading-relaxed text-white/70">
                जन्म के समय पूर्वी क्षितिज पर जो राशि उदित हो रही होती है, उसे <strong className="text-white">लग्न (Lagna)</strong> या प्रथम भाव कहा जाता है। लग्न व्यक्ति के शरीर, स्वास्थ्य, स्वभाव, आत्मविश्वास, शारीरिक बनावट एवं जीवन के समग्र दृष्टिकोण का निर्धारण करता है।
              </p>
            </section>

            {/* 3. Grahas */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                ३. नवग्रहों का महत्व (9 Grahas)
              </h3>
              <p className="leading-relaxed text-white/70">
                वैदिक ज्योतिष में ९ मुख्य ग्रह माने गए हैं: सूर्य (आत्मा, आत्मा), चंद्रमा (मन), मंगल (पराक्रम), बुध (बुद्धि), गुरु (ज्ञान, भाग्य), शुक्र (सुख, दांपत्य), शनि (कर्म, न्याय), राहु एवं केतु (छाया ग्रह)। प्रत्येक ग्रह अपनी स्थिति एवं दृष्टि से मानव जीवन को गहराई से प्रभावित करता है।
              </p>
            </section>

            {/* 4. 12 Houses */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                ४. १२ भाव (12 Houses in Kundli)
              </h3>
              <p className="leading-relaxed text-white/70">
                कुंडली के १२ भाव जीवन के विभिन्न क्षेत्रों का प्रतिनिधित्व करते हैं: तनु (स्वयं), धन (संपत्ति), सहज (भाई-बहन), सुख (माता, मकान), पुत्र (शिक्षा, संतान), रिपु (रोग, ऋण), युवती (विवाह, पार्टनर), रंध्रा (आयु, गुप्त विद्या), धर्म (भाग्य, पिता), कर्म (करियर), लाभ (आवक) एवं व्यय (विदेश, मोक्ष)।
              </p>
            </section>

            {/* 5. 27 Nakshatras */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-400" />
                ५. २७ नक्षत्र (27 Nakshatras)
              </h3>
              <p className="leading-relaxed text-white/70">
                ३६० डिग्री के आकाश चक्र को २७ नक्षत्रों में विभाजित किया गया है, जिसकी शुरुआत अश्विनी से होकर रेवती पर समाप्त होती है। जन्म के समय चंद्रमा जिस नक्षत्र चरण में स्थित होता है, वही व्यक्ति का <strong className="text-white">जन्म नक्षत्र</strong> कहलाता है।
              </p>
            </section>

            {/* 6. Dasha & Navamsha */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                ६. विंशोत्तरी दशा एवं नवमांश (D9)
              </h3>
              <p className="leading-relaxed text-white/70">
                १२० वर्षों की विंशोत्तरी महादशा यह निर्धारित करती है कि कौन से ग्रह का फल किस समय प्राप्त होगा। वहीं <strong className="text-white">नवमांश कुंडली (D9 Chart)</strong> सूक्ष्म फलादेश, वैवाहिक सुख एवं अंतर्निहित भाग्य का आंकलन करने हेतु अत्यंत अनिवार्य मानी जाती है।
              </p>
            </section>
          </div>

          {/* Kundli Milan & Internal Links */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#D4AF37]/10 via-white/5 to-[#D4AF37]/10 border border-[#D4AF37]/30 space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#D4AF37]">
              अष्टकूट ३६ गुण कुंडली मिलान (Kundli Milan for Marriage)
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              वर एवं वधू के सुखी वैवाहिक जीवन हेतु वैदिक ज्योतिष में अष्टकूट मिलान (वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी) का विधान है। ३६ में से १८ या अधिक गुण मिलने पर विवाह शुभ माना जाता है। इसके अतिरिक्त मांगलिक दोष एवं नाड़ी दोष का परिहार देखना अत्यंत आवश्यक है।
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenBooking('janam-kundli')}
                className="px-5 py-2.5 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-full hover:bg-[#b89428] transition-all cursor-pointer shadow-md"
              >
                1-on-1 व्यक्तिगत जन्म कुंडली परामर्श लें
              </button>
              <button
                onClick={() => onOpenBooking('kundli-matching')}
                className="px-5 py-2.5 bg-white/10 text-white font-bold text-xs rounded-full border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                ३६ गुण मिलान एवं मांगलिक रिपोर्ट
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
