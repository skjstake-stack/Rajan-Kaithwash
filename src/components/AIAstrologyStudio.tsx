import React, { useState } from 'react';
import { Sparkles, Bot, Heart, Gem, Compass, Send, User, Calendar, Clock, MapPin, Loader2, Volume2, Mic } from 'lucide-react';
import { Language } from '../types';
import { CleanFormattedText, cleanMarkdownSymbols } from '../utils/textUtils';

interface AIAstrologyStudioProps {
  currentLang: Language;
  darkMode: boolean;
  onOpenBooking: (serviceId?: string) => void;
  onOpenVoiceAssistant: () => void;
}

export const AIAstrologyStudio: React.FC<AIAstrologyStudioProps> = ({ currentLang, darkMode, onOpenBooking, onOpenVoiceAssistant }) => {
  const [activeTab, setActiveTab] = useState<'kundli' | 'matching' | 'chat' | 'remedy'>('kundli');

  // --- 1. Kundli State ---
  const [kundliForm, setKundliForm] = useState({
    name: '',
    dob: '1996-05-15',
    tob: '09:30',
    pob: 'New Delhi, India',
    gender: 'Male',
  });
  const [kundliResult, setKundliResult] = useState<string | null>(null);
  const [loadingKundli, setLoadingKundli] = useState(false);

  // --- 2. Matching State ---
  const [partner1, setPartner1] = useState({ name: 'Aarav Mehta', dob: '1995-03-12', tob: '08:15', pob: 'Mumbai, India' });
  const [partner2, setPartner2] = useState({ name: 'Ananya Sharma', dob: '1997-07-24', tob: '18:45', pob: 'Delhi, India' });
  const [matchingResult, setMatchingResult] = useState<string | null>(null);
  const [loadingMatching, setLoadingMatching] = useState(false);

  // --- 3. Chat State ---
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: 'हरि ॐ! मैं आचार्य राजन कैथवास जी का एआई वैदिक सहायक हूँ। आप अपनी कुंडली, ग्रह-दोष, करियर, विवाह मिलान, शुभ रत्न या वास्तु शास्त्र से संबंधित कोई भी प्रश्न पूछ सकते हैं।',
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
    try {
      const res = await fetch('/api/ai/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kundliForm, lang: currentLang }),
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
            तत्काल एआई जन्म कुंडली विश्लेषण, 36 गुण मिलान, शुभ रत्न परामर्श, अथवा आचार्य राजन कैथवास जी के एआई ज्योतिषी से 24x7 संवाद करें।
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleGenerateKundli} className="lg:col-span-5 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4 shadow-2xl">
              <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
                <Compass className="w-5 h-5 mr-2" />
                जन्म विवरण प्रविष्ट करें
              </h3>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">पूरा नाम</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                  <input
                    type="text"
                    required
                    placeholder="उदा. रमेश कुमार"
                    value={kundliForm.name}
                    onChange={(e) => setKundliForm({ ...kundliForm, name: e.target.value })}
                    className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">जन्म तिथि</label>
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
                  <label className="block text-xs font-semibold text-white/70 mb-1">जन्म समय</label>
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
                  <label className="block text-xs font-semibold text-white/70 mb-1">जन्म स्थान</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                    <input
                      type="text"
                      required
                      placeholder="उदा. जयपुर, राजस्थान"
                      value={kundliForm.pob}
                      onChange={(e) => setKundliForm({ ...kundliForm, pob: e.target.value })}
                      className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">लिंग</label>
                  <select
                    value={kundliForm.gender}
                    onChange={(e) => setKundliForm({ ...kundliForm, gender: e.target.value })}
                    className="w-full bg-[#050B18] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Male">पुरुष</option>
                    <option value="Female">महिला</option>
                    <option value="Other">अन्य</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingKundli}
                className="w-full py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform text-xs flex items-center justify-center cursor-pointer"
              >
                {loadingKundli ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ग्रह डिग्रियों की गणना हो रही है...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    एआई जन्म कुंडली निर्मित करें
                  </>
                )}
              </button>
            </form>

            {/* Kundli Output Panel */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 min-h-[420px] flex flex-col justify-between shadow-2xl">
              {kundliResult ? (
                <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed max-h-[500px] overflow-y-auto pr-2">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-serif font-bold text-[#D4AF37] text-lg">
                      वैदिक जन्म कुंडली विवरण: {kundliForm.name}
                    </span>
                    <button
                      onClick={() => onOpenBooking('janam-kundli')}
                      className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold rounded-full hover:scale-105 transition-transform cursor-pointer"
                    >
                      व्यक्तिगत परामर्श बुक करें
                    </button>
                  </div>
                  <CleanFormattedText content={kundliResult} className="text-white/80" />
                </div>
              ) : (
                <div className="text-center my-auto py-16 space-y-3 text-white/40">
                  <Compass className="w-16 h-16 mx-auto text-[#D4AF37]/40 animate-pulse" />
                  <p className="font-serif text-lg text-[#D4AF37]">आपकी एआई जन्म कुंडली रिपोर्ट यहाँ प्रदर्शित होगी</p>
                  <p className="text-xs max-w-sm mx-auto text-white/50">
                    बाईं ओर अपनी जन्म तिथि, सटीक समय एवं नगर प्रविष्ट करें। लग्न, चंद्र राशि, महादशा एवं योगों का त्वरित विश्लेषण प्राप्त करें।
                  </p>
                </div>
              )}
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
      </div>
    </section>
  );
};
