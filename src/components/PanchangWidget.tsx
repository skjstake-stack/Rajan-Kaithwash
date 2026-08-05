import React, { useState } from 'react';
import { Sun, Moon, Calendar, MapPin, Clock, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PanchangData, Language } from '../types';
import { DEFAULT_PANCHANG } from '../data/astrologyData';
import { CleanFormattedText, cleanMarkdownSymbols } from '../utils/textUtils';

interface PanchangWidgetProps {
  currentLang: Language;
  darkMode: boolean;
}

export const PanchangWidget: React.FC<PanchangWidgetProps> = ({ currentLang, darkMode }) => {
  const [selectedCity, setSelectedCity] = useState('New Delhi, India');
  const [selectedDate, setSelectedDate] = useState('2026-08-05');
  const [panchang, setPanchang] = useState<PanchangData>(DEFAULT_PANCHANG);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const handleFetchAIPanchang = async () => {
    setLoadingAI(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/ai/panchang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          location: selectedCity,
          lang: currentLang,
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
    <section id="panchang" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">दैनिक वैदिक पंचांग</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            आज का <span className="text-[#D4AF37] italic">पंचांग</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            पाराशरी सिद्धान्त अनुसार तिथि, नक्षत्र, अभिजीत मुहूर्त, चंद्रमा की वर्तमान स्थिति एवं राहुकाल।
          </p>
        </div>

        {/* Location & Date Controls */}
        <div className="max-w-3xl mx-auto mb-10 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#050B18] border border-[#D4AF37]/40 text-[#D4AF37] text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="New Delhi, India">New Delhi, India</option>
              <option value="Mumbai, India">Mumbai, India</option>
              <option value="Varanasi, India">Varanasi, India</option>
              <option value="London, UK">London, UK</option>
              <option value="Dubai, UAE">Dubai, UAE</option>
              <option value="New York, USA">New York, USA</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#050B18] border border-[#D4AF37]/40 text-[#D4AF37] text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none"
            />
          </div>

          <button
            onClick={handleFetchAIPanchang}
            disabled={loadingAI}
            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingAI ? 'Calculating...' : 'Recalculate AI Panchang'}</span>
          </button>
        </div>

        {/* Main Panchang Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: संवत एवं सूर्य-चंद्रमा स्थिति */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#D4AF37]">संवत एवं सूर्य-चंद्रमा</h3>
                <p className="text-xs text-white/40">{panchang.date}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">विक्रम संवत:</span>
                <span className="font-medium text-white">{panchang.vikramSamvat}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">शक संवत:</span>
                <span className="font-medium text-white">{panchang.sakaSamvat}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">सूर्योदय / सूर्यास्त:</span>
                <span className="font-medium text-white">{panchang.sunrise} / {panchang.sunset}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">चंद्रोदय / चंद्रास्त:</span>
                <span className="font-medium text-white">{panchang.moonrise} / {panchang.moonset}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/60 font-semibold text-[#D4AF37]">चंद्रमा की वर्तमान स्थिति:</span>
                <span className="font-medium text-[#FF9933]">वृषभ राशि (उच्चस्थ)</span>
              </div>
            </div>
          </div>

          {/* Card 2: पंचांग के मुख्य 5 अंग */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#D4AF37]">पंचांग के मुख्य 5 अंग</h3>
                <p className="text-xs text-white/40">{panchang.paksha}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60 font-medium">तिथि:</span>
                <span className="font-medium text-white">{panchang.tithi}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60 font-medium">नक्षत्र:</span>
                <span className="font-medium text-white">{panchang.nakshatra}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60 font-medium">योग:</span>
                <span className="font-medium text-white">{panchang.yoga}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/60 font-medium">करण:</span>
                <span className="font-medium text-white">{panchang.karana}</span>
              </div>
            </div>
          </div>

          {/* Card 3: शुभ एवं अशुभ मुहूर्त */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#D4AF37]">शुभ एवं अशुभ मुहूर्त</h3>
                <p className="text-xs text-white/40">दैनिक मुहूर्त मार्गदर्शन</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300 block text-[11px]">अभिजीत मुहूर्त (अत्यंत शुभ):</span>
                  <span className="text-white">{panchang.abhijitMuhurat}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-rose-300 block text-[11px]">राहुकाल (अशुभ समय):</span>
                  <span className="text-white">{panchang.rahuKalam}</span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-white/60">
                <span className="text-[#D4AF37] font-semibold">दिशा शूल:</span> {panchang.dishaShool}
              </div>
            </div>
          </div>
        </div>

        {/* AI Detailed Panchang Commentary Box */}
        {aiReport && (
          <div className="mt-8 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-[#D4AF37]/40 text-xs sm:text-sm text-white/80 leading-relaxed shadow-2xl">
            <div className="flex items-center space-x-2 mb-3 text-[#D4AF37] font-serif font-bold text-lg border-b border-white/10 pb-2">
              <Sparkles className="w-5 h-5 text-[#FF9933]" />
              <span>Rajan Kaithwas Ji's AI Panchang Interpretation ({selectedCity})</span>
            </div>
            <CleanFormattedText content={aiReport} className="text-white/80 font-sans" />
          </div>
        )}
      </div>
    </section>
  );
};
