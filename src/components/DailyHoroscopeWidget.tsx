import React, { useState } from 'react';
import { Sparkles, Heart, Briefcase, DollarSign, Activity, Compass } from 'lucide-react';
import { ZodiacSign, Language } from '../types';
import { ZODIAC_SIGNS } from '../data/astrologyData';
import { CleanFormattedText, cleanMarkdownSymbols } from '../utils/textUtils';

interface DailyHoroscopeWidgetProps {
  currentLang: Language;
  darkMode: boolean;
  onOpenBooking: (serviceId?: string) => void;
}

export const DailyHoroscopeWidget: React.FC<DailyHoroscopeWidgetProps> = ({ darkMode, onOpenBooking }) => {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'love' | 'career' | 'finance' | 'health'>('overview');
  const [customName, setCustomName] = useState('');
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateAIHoroscope = async () => {
    setLoadingAI(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/ai/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sign: selectedSign.name,
          timeframe,
          name: customName || 'Seeker',
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiReport(cleanMarkdownSymbols(data.result));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <section id="horoscope" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">दैनिक ग्रह नक्षत्र फलादेश</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            दैनिक <span className="text-[#D4AF37] italic">राशिफल एवं भविष्यफल</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            अपनी चंद्र राशि या नाम राशि का चयन कर प्रेम, करियर, धन-संपदा एवं स्वास्थ्य का संपूर्ण फलादेश जानें।
          </p>
        </div>

        {/* 12 Zodiac Sign Selector Badges */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
          {ZODIAC_SIGNS.map((sign) => {
            const isSelected = selectedSign.id === sign.id;
            return (
              <button
                key={sign.id}
                onClick={() => {
                  setSelectedSign(sign);
                  setAiReport(null);
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-105'
                    : 'bg-white/5 backdrop-blur-md border-white/10 text-white/80 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40'
                }`}
              >
                <span className="text-2xl block mb-1">{sign.symbol}</span>
                <span className="text-xs font-semibold block uppercase tracking-wider">{sign.name}</span>
                <span className="text-[10px] opacity-70 block truncate">{sign.hindiName}</span>
              </button>
            );
          })}
        </div>

        {/* Main Horoscope Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-white">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-4xl text-[#D4AF37] shadow-inner">
                {selectedSign.symbol}
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#D4AF37]">
                  {selectedSign.name} <span className="text-base text-white/50 font-sans font-normal">({selectedSign.hindiName})</span>
                </h3>
                <p className="text-xs text-white/60">
                  Ruler: <span className="text-[#D4AF37] font-semibold">{selectedSign.ruler}</span> | Dates: {selectedSign.dates} | Element: {selectedSign.element}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37]">
                शुभ रंग: <span className="font-bold text-white">{selectedSign.luckyColor}</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37]">
                लकी नंबर: <span className="font-bold text-white">{selectedSign.luckyNumber}</span>
              </div>
            </div>
          </div>

          {/* Subtabs for Overview, Love, Career, Finance, Health */}
          <div className="flex flex-wrap gap-2 my-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              सामान्य अवलोकन
            </button>
            <button
              onClick={() => setActiveTab('love')}
              className={`flex items-center px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all cursor-pointer ${
                activeTab === 'love'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              प्रेम एवं दांपत्य
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`flex items-center px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all cursor-pointer ${
                activeTab === 'career'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              करियर एवं व्यापार
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all cursor-pointer ${
                activeTab === 'finance'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              धन एवं समृद्धि
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              स्वास्थ्य एवं ऊर्जा
            </button>
          </div>

          {/* Active Tab Text */}
          <div className="p-5 rounded-2xl bg-[#050B18]/60 border border-white/10 text-sm sm:text-base text-white/80 leading-relaxed italic">
            "{activeTab === 'overview' && selectedSign.overview}
            {activeTab === 'love' && selectedSign.love}
            {activeTab === 'career' && selectedSign.career}
            {activeTab === 'finance' && selectedSign.finance}
            {activeTab === 'health' && selectedSign.health}"
          </div>

          {/* AI Custom Personal Prediction Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-[#D4AF37] mb-1">
                  {selectedSign.hindiName} राशि के लिए व्यक्तिगत भविष्यफल:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="अपना नाम दर्ज करें (ऐच्छिक)"
                  className="w-full bg-[#050B18] border border-[#D4AF37]/40 text-[#D4AF37] text-xs rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="bg-[#050B18] border border-[#D4AF37]/40 text-[#D4AF37] text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="daily">दैनिक राशिफल</option>
                  <option value="monthly">मासिक भविष्यफल</option>
                  <option value="yearly">वार्षिक 2026 भविष्यफल</option>
                </select>

                <button
                  onClick={handleGenerateAIHoroscope}
                  disabled={loadingAI}
                  className="px-5 py-2 rounded-full text-xs font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loadingAI ? 'एआई फलादेश बन रहा है...' : 'एआई विश्लेषण प्राप्त करें'}</span>
                </button>
              </div>
            </div>

            {aiReport && (
              <div className="mt-6 p-6 rounded-3xl bg-[#050B18]/90 border border-[#D4AF37]/40 text-xs sm:text-sm text-white/80 leading-relaxed shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="font-serif font-bold text-[#D4AF37] text-base flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-[#FF9933]" />
                    Rajan Kaithwas Ji AI Horoscope ({selectedSign.name} - {timeframe.toUpperCase()})
                  </span>
                  <button
                    onClick={() => onOpenBooking()}
                    className="text-xs text-[#D4AF37] hover:underline font-semibold"
                  >
                    1-on-1 Consultation →
                  </button>
                </div>
                <CleanFormattedText content={aiReport} className="text-white/80 font-sans" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
