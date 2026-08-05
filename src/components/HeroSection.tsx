import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MessageSquare, Phone, Compass } from 'lucide-react';
import { Language, HeroBannerData, RajanProfile } from '../types';
import { translations } from '../translations';

interface HeroSectionProps {
  currentLang: Language;
  onOpenBooking: (serviceId?: string) => void;
  onOpenAIStudio?: () => void;
  onOpenVoiceAssistant?: () => void;
  heroBannerData?: HeroBannerData;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onOpenBooking,
  onOpenAIStudio,
  onOpenVoiceAssistant,
  heroBannerData: initialHeroBannerData,
}) => {
  const t = translations[currentLang];

  const [rajanProfile, setRajanProfile] = useState<RajanProfile>({
    id: 'rajan_profile_1',
    name: 'राजन कैथवास जी',
    designation: 'वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक',
    short_bio: 'महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित २५+ वर्षों का प्रामाणिक अनुभव। ५०,०००+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।',
    image_url: '/rajan_kaithwas.svg',
    cloudinary_public_id: 'rajan_profile/default_avatar',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [heroData, setHeroData] = useState<HeroBannerData>({
    secure_url: '/rajan_kaithwas.svg',
    public_id: 'hero/rajan_kaithwas_main',
    title: 'राजन कैथवास जी',
    subtitle: 'वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन',
    tagline: 'प्राचीन वैदिक ज्ञान के माध्यम से आपके जीवन का सही मार्गदर्शन',
  });

  const [offsetY, setOffsetY] = useState(0);

  // Fetch Profile & Hero Banner configuration from API
  const fetchProfileAndHero = async () => {
    try {
      // Fetch Rajan Profile
      const profRes = await fetch('/api/rajan-profile');
      const profData = await profRes.json();
      if (profData.success && profData.profile) {
        setRajanProfile(profData.profile);
      }

      // Fetch Hero Banner
      const heroRes = await fetch('/api/hero');
      const heroDataRes = await heroRes.json();
      if (heroDataRes.success && heroDataRes.hero) {
        setHeroData(heroDataRes.hero);
      }
    } catch (err) {
      console.warn('Failed to load hero or profile data from API:', err);
    }
  };

  useEffect(() => {
    if (initialHeroBannerData && initialHeroBannerData.secure_url) {
      setHeroData(initialHeroBannerData);
    }
    fetchProfileAndHero();

    const handleUpdateEvent = () => {
      fetchProfileAndHero();
    };

    window.addEventListener('rajanProfileUpdated', handleUpdateEvent);
    window.addEventListener('heroBannerUpdated', handleUpdateEvent);
    return () => {
      window.removeEventListener('rajanProfileUpdated', handleUpdateEvent);
      window.removeEventListener('heroBannerUpdated', handleUpdateEvent);
    };
  }, [initialHeroBannerData]);

  // Parallax Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const floatingZodiacs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  // Apply Cloudinary automatic optimization parameters if it's a Cloudinary URL
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && !url.includes('q_auto')) {
      return url.replace('/upload/', '/upload/q_auto,f_auto/');
    }
    return url;
  };

  const optimizedHeroUrl = getOptimizedImageUrl(heroData.secure_url);
  const optimizedProfileUrl = getOptimizedImageUrl(rajanProfile.image_url);

  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen pt-28 sm:pt-36 pb-20 flex items-center overflow-hidden bg-[#050B18] text-white">
      {/* 1. Full-Width Hero Background Image with Cloudinary Optimization */}
      <img
        src={optimizedHeroUrl}
        alt={rajanProfile.name || 'Rajan Kaithwas Ji Hero Banner'}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-200 ease-out scale-105 opacity-40"
        style={{
          transform: `translateY(${offsetY * 0.25}px) scale(1.05)`,
        }}
      />

      {/* 2. Dark Gradient Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050B18]/95 via-[#050B18]/80 to-black/60 z-10" />
      <div className="absolute inset-0 bg-[#050B18]/40 backdrop-brightness-95 z-10" />

      {/* Immersive Background Glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 50%, #FF9933 0%, transparent 65%), radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 50%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Animated Floating Zodiac Constellations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-10">
        {floatingZodiacs.map((symbol, idx) => {
          const topPos = (idx * 8 + 5) % 90;
          const leftPos = (idx * 15 + 10) % 92;
          const duration = 14 + (idx % 5) * 3;
          return (
            <span
              key={idx}
              className="absolute text-[#D4AF37]/80 font-serif text-2xl sm:text-3xl animate-bounce"
              style={{
                top: `${topPos}%`,
                left: `${leftPos}%`,
                animationDuration: `${duration}s`,
              }}
            >
              {symbol}
            </span>
          );
        })}
      </div>

      {/* 3. Hero Overlay Content with Smooth Fade-in Animation */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Mobile First: Profile Image Frame appears ABOVE text on Mobile (order-1), Beside on Desktop (lg:order-2) */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center relative mb-4 lg:mb-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#FF9933] shadow-[0_0_50px_rgba(212,175,55,0.45)] transition-all hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#050B18] p-3 relative overflow-hidden flex items-center justify-center">
                {/* Kundli SVG Background Frame */}
                <svg className="absolute inset-0 w-full h-full text-[#D4AF37]/30" viewBox="0 0 200 200">
                  <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="10" x2="190" y2="190" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="190" y1="10" x2="10" y2="190" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="100,10 190,100 100,190 10,100" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>

                {/* Rajan Kaithwas Ji Profile Image */}
                <img
                  src={optimizedProfileUrl || '/rajan_kaithwas.svg'}
                  alt={rajanProfile.name || 'Rajan Kaithwas Ji'}
                  loading="eager"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full filter contrast-105 border-2 border-[#D4AF37]/60 relative z-10 shadow-2xl transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/rajan_kaithwas.svg';
                  }}
                />

                {/* Floating Experience Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold px-4 py-2 rounded-2xl shadow-2xl text-xs sm:text-sm z-20 border border-[#D4AF37]">
                  <div className="text-center">
                    <span className="text-base sm:text-lg block font-extrabold leading-none">25+ Yrs</span>
                    <span className="text-[10px] text-[#050B18] font-semibold uppercase tracking-wider">Vedic Master</span>
                  </div>
                </div>

                {/* Floating Global Consultations Badge */}
                <div className="absolute -top-2 -left-2 bg-[#050B18]/90 border border-[#D4AF37]/40 text-[#D4AF37] px-3.5 py-1.5 rounded-full shadow-2xl text-xs z-20 backdrop-blur-md">
                  <span className="font-bold text-white">50,000+</span> Consultations
                </div>
              </div>
            </div>
          </div>

          {/* Left Text Content: Beside image on Desktop (lg:order-1), Below image on Mobile (order-2) */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            {/* Live Indicator Badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#D4AF37]/40 rounded-full bg-[#050B18]/80 backdrop-blur-md self-center lg:self-start shadow-xl">
              <div className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse"></div>
              <span className="text-[10px] sm:text-xs tracking-wider text-[#D4AF37] font-semibold">
                आई.एस.ओ. प्रमाणित वैदिक संस्थान • ऑनलाइन सेवा उपलब्ध
              </span>
            </div>

            {/* Title: Name of Rajan Kaithwas Ji */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold leading-[1.1] text-white tracking-tight drop-shadow-lg mb-2">
              {rajanProfile.name || 'राजन कैथवास जी'}
            </h1>

            {/* Subtitle: Designation */}
            <h2 className="text-xl sm:text-3xl font-serif font-semibold text-[#D4AF37] tracking-wide drop-shadow mb-4">
              {rajanProfile.designation || 'वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक'}
            </h2>

            {/* Short Introduction */}
            <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-light drop-shadow">
              {rajanProfile.short_bio || 'महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित २५+ वर्षों का प्रामाणिक अनुभव। ५०,०००+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।'}
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
              {/* Button 1: परामर्श बुक करें */}
              <button
                onClick={() => onOpenBooking()}
                className="px-7 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>परामर्श बुक करें</span>
              </button>

              {/* Button 2: WhatsApp */}
              <a
                href="https://wa.me/919876543210?text=%E0%A4%B9%E0%A4%B0%E0%A4%BF%20%E0%A4%93%E0%A4%AE!%20%E0%A4%AE%E0%A5%88%E0%A4%82%20%E0%A4%86%E0%A4%9A%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%20%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%A8%20%E0%A4%95%E0%A5%88%E0%A4%A5%E0%A4%B5%E0%A4%BE%E0%A4%B8%20%E0%A4%9C%E0%A5%80%20%E0%A4%B8%E0%A5%87%20%E0%A4%AA%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%B0%E0%A5%8D%E0%A4%B6%20%E0%A4%AC%E0%A5%81%E0%A4%95%20%E0%A4%95%E0%A4%B0%E0%A4%A8%E0%A4%BE%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%A4%E0%A4%BE%20%E0%A4%B9%E0%A5%82%E0%A4%82%E0%A4%B8%E0%A5%8D।"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              {/* Button 3: अभी कॉल करें */}
              <a
                href="tel:+919876543210"
                className="px-6 py-3.5 border border-[#D4AF37]/50 bg-[#050B18]/70 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#FF9933]" />
                <span>अभी कॉल करें</span>
              </a>

              {/* Optional AI Assistant Quick Launch */}
              {onOpenVoiceAssistant && (
                <button
                  onClick={onOpenVoiceAssistant}
                  className="px-5 py-3.5 border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#FF9933]" />
                  <span>एआई वॉयस परामर्श</span>
                </button>
              )}
            </div>

            {/* Experience Stats Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 border-t border-white/20 pt-6">
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-3xl font-serif text-white font-bold drop-shadow">25+</span>
                <span className="text-[10px] uppercase tracking-wider text-white/70">Years Experience</span>
              </div>
              <div className="w-[1px] h-10 bg-white/20 hidden sm:block"></div>
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-3xl font-serif text-white font-bold drop-shadow">50,000+</span>
                <span className="text-[10px] uppercase tracking-wider text-white/70">Happy Clients</span>
              </div>
              <div className="w-[1px] h-10 bg-white/20 hidden sm:block"></div>
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-3xl font-serif text-[#D4AF37] font-bold drop-shadow">100%</span>
                <span className="text-[10px] uppercase tracking-wider text-white/70">Authentic Remedies</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Glassmorphism Stats Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-[#050B18]/60 backdrop-blur-xl border border-white/15 shadow-2xl">
          <div className="text-center p-2 border-r border-white/10 last:border-0">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">25+ Years</p>
            <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Vedic Experience</p>
          </div>
          <div className="text-center p-2 border-r border-white/10 last:border-0">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">50,000+</p>
            <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Kundli Predictions</p>
          </div>
          <div className="text-center p-2 border-r border-white/10 last:border-0">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">40+ Countries</p>
            <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Global Seekers</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">100% Pure</p>
            <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Vedic Wisdom</p>
          </div>
        </div>
      </div>
    </section>
  );
};
