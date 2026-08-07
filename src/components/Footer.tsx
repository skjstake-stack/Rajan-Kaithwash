import React, { useEffect } from 'react';
import { ArrowUp, Sparkles, Phone, Mail, MapPin, ShieldCheck, Heart, Youtube, Instagram, Facebook, MessageSquare, Share2 } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../translations';

interface FooterProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onLanguageChange, onOpenAdmin }) => {
  const clickCountRef = React.useRef<number>(0);
  const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [footerSettings, setFooterSettings] = React.useState({
    helpline: '8319885134',
    whatsapp: '8319885134',
    address: 'In front of Smart Point, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India',
    pincode: '480447',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setFooterSettings({
            helpline: data.settings.helplineNumber || data.settings.contactPhone || '8319885134',
            whatsapp: data.settings.whatsappNumber || '8319885134',
            address: 'In front of Smart Point, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India',
            pincode: data.settings.pincode || '480447',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        clickTimerRef.current = null;
      }, 3000);
    }

    if (clickCountRef.current >= 5) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      clickCountRef.current = 0;
      onOpenAdmin();
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'YouTube',
      handle: '@rajankaithwasji',
      label: 'YouTube (50K+ Subscribers)',
      url: 'https://youtube.com/@rajankaithwasji',
      icon: Youtube,
      hoverClass: 'hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    },
    {
      name: 'Instagram',
      handle: '@rajankaithwasji',
      label: 'Instagram (Daily Horoscope Reels)',
      url: 'https://instagram.com/rajankaithwasji',
      icon: Instagram,
      hoverClass: 'hover:bg-pink-600/20 hover:border-pink-500/50 hover:text-pink-400',
      badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    },
    {
      name: 'Facebook',
      handle: 'Rajan Kaithwas (Mantoo)',
      label: 'Facebook (Live Satsang & Astrology)',
      url: 'https://facebook.com/rajankaithwasji',
      icon: Facebook,
      hoverClass: 'hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
  ];

  return (
    <footer className="bg-[#030712] text-white border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand, Bio & Social Links */}
          <div className="lg:col-span-2 space-y-5">
            <div
              onClick={handleLogoClick}
              className="flex items-center space-x-3 cursor-pointer group select-none"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#FF9933] to-[#B8860B] p-0.5 shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#050B18] rounded-[14px] flex items-center justify-center font-serif text-[#D4AF37] font-bold text-lg">
                  ॐ
                </div>
              </div>
              <div>
                <span className="font-serif text-base font-bold tracking-tight text-[#D4AF37] block">
                  Rajan Kaithwas (Mantoo)
                </span>
                <span className="text-[10px] text-[#FF9933] font-semibold tracking-wider block">
                  Vedic Astrology & Spiritual Guidance
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              "Authentic life guidance through ancient Vedic wisdom." International Gold Medalist Astrologer — Horoscope Analysis, Matchmaking, Vastu Shastra & Gemstone Consultation.
            </p>

            {/* Social Media Integration Component */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#D4AF37]">
                <Share2 className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>Connect on Social Media:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 text-xs transition-all duration-200 hover:scale-105 cursor-pointer ${s.hoverClass}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-[11px]">{s.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-[#D4AF37] pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Confidential & Authentic Vedic Astrology Institute</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#D4AF37] text-sm border-b border-white/10 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><a href="#hero" className="hover:text-[#D4AF37] transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-[#D4AF37] transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-[#D4AF37] transition-colors">Astrology Services</a></li>
              <li><a href="#ai-studio" className="hover:text-[#D4AF37] transition-colors">AI Horoscope</a></li>
              <li><a href="#horoscope" className="hover:text-[#D4AF37] transition-colors">Daily Horoscope</a></li>
              <li><a href="#panchang" className="hover:text-[#D4AF37] transition-colors">Today's Panchang</a></li>
              <li><a href="#blog" className="hover:text-[#D4AF37] transition-colors">Vedic Blog</a></li>
            </ul>
          </div>

          {/* Col 3: Official Contact Information */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#D4AF37] text-sm border-b border-white/10 pb-2">
              Contact Information
            </h4>
            <div className="space-y-2.5 text-xs text-white/80">
              <div className="flex items-start space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/60 block text-[11px]">Helpline Number:</span>
                  <a href={`tel:${footerSettings.helpline}`} className="text-[#D4AF37] font-semibold hover:underline">
                    {footerSettings.helpline}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/60 block text-[11px]">WhatsApp Number:</span>
                  <a href={`https://wa.me/91${footerSettings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold hover:underline">
                    {footerSettings.whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/60 block text-[11px]">Office Address:</span>
                  <span className="text-white/80 leading-relaxed block text-[11px]">
                    {footerSettings.address}
                  </span>
                  <span className="text-[#D4AF37] font-semibold block text-[11px] mt-0.5">
                    PIN Code: {footerSettings.pincode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Social Channels Bar, Language & Admin */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-[#D4AF37] text-sm border-b border-white/10 pb-2">
              Official Social Channels
            </h4>

            {/* Detailed Social Channel Cards */}
            <div className="space-y-2 text-xs">
              <a
                href="https://youtube.com/@rajankaithwasji"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-950/20 transition-all text-white/80 hover:text-white"
              >
                <div className="flex items-center space-x-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-xs">YouTube Channel</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                  Subscribe
                </span>
              </a>

              <a
                href="https://instagram.com/rajankaithwasji"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40 hover:bg-pink-950/20 transition-all text-white/80 hover:text-white"
              >
                <div className="flex items-center space-x-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span className="font-medium text-xs">Instagram Profile</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">
                  Follow
                </span>
              </a>

              <a
                href="https://facebook.com/rajankaithwasji"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-blue-950/20 transition-all text-white/80 hover:text-white"
              >
                <div className="flex items-center space-x-2">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-xs">Facebook Page</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  Like
                </span>
              </a>
            </div>

            <div>
              <label className="block text-[11px] text-white/50 mb-1">Select Language:</label>
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="w-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#050B18] text-white">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Rajan Kaithwas (Mantoo) Vedic Astrology & Spiritual Guidance. All rights reserved.</p>
          <p className="text-center sm:text-right max-w-md">
            Disclaimer: Astrological predictions are provided based on traditional Vedic calculations and spiritual guidance.
          </p>
        </div>
      </div>

      {/* Back to Top Floating Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform cursor-pointer"
        title="Back to Top"
      >
        <ArrowUp className="w-5 h-5 font-bold" />
      </button>
    </footer>
  );
};

