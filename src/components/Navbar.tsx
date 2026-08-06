import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, MessageSquare, Calendar, Menu, X, Sun, Moon, Globe, Shield, Lock } from 'lucide-react';
import { Language } from '../types';
import { languageNames, translations } from '../translations';


interface NavbarProps {
  currentLang: Language;
  onLanguageChange?: (lang: Language) => void;
  onSelectLang?: (lang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBooking: (serviceId?: string) => void;
  onOpenAdmin: () => void;
  activeSection?: string;
  setActiveSection?: (sec: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  onSelectLang,
  darkMode,
  onToggleDarkMode,
  onOpenBooking,
  onOpenAdmin,
  activeSection = 'hero',
  setActiveSection,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = translations[currentLang];
  const handleLanguageSelect = (lang: Language) => {
    if (onLanguageChange) onLanguageChange(lang);
    if (onSelectLang) onSelectLang(lang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: t.home || 'Home' },
    { id: 'panchang', label: t.panchang || 'Panchang' },
    { id: 'horoscope', label: t.dailyHoroscope || 'Horoscope' },
    { id: 'ai-studio', label: t.aiStudio || 'AI Studio' },
    { id: 'services', label: t.services || 'Services' },
    { id: 'about', label: t.about || 'About' },
    { id: 'blog', label: t.blog || 'Blog' },
    { id: 'testimonials', label: t.testimonials || 'Testimonials' },
    { id: 'contact', label: t.contact || 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    if (setActiveSection) setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050B18]/90 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-2xl'
          : 'bg-[#050B18]/70 backdrop-blur-md border-b border-white/10'
      }`}
    >
      {/* Top Banner Bar */}
      <div className="bg-[#030712]/90 border-b border-white/10 text-xs py-1.5 px-4 hidden md:flex justify-between items-center text-white/70">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-[#D4AF37] font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse text-[#FF9933]" />
            वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन केंद्र
          </span>
          <span className="text-white/20">|</span>
          <span className="text-white/60 tracking-wider">आई.एस.ओ. 9001:2015 प्रमाणित वैदिक संस्थान</span>
        </div>
        <div className="flex items-center space-x-5">
          <a href="tel:+919876543210" className="flex items-center hover:text-[#D4AF37] transition-colors">
            <Phone className="w-3 h-3 mr-1 text-[#D4AF37]" />
            +91 98765 43210
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-[#D4AF37] transition-colors"
          >
            <MessageSquare className="w-3 h-3 mr-1 text-emerald-400" />
            WhatsApp
          </a>
          <button
            onClick={onOpenAdmin}
            className="flex items-center text-[#D4AF37] hover:text-white text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] cursor-pointer"
          >
            <Shield className="w-3 h-3 mr-1 text-[#D4AF37]" />
            <Lock className="w-2.5 h-2.5 mr-1 text-[#FF9933]" />
            Admin Login
          </button>
        </div>

      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('hero')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#FF9933] p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#050B18] rounded-full flex items-center justify-center">
                <span className="text-xl font-serif text-[#D4AF37] font-bold">ॐ</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-serif font-bold tracking-wide text-[#D4AF37]">
                राजन कैथवास (मंटू)
              </h1>
              <p className="text-[10px] tracking-wider text-white/70">
                वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-5 text-xs font-medium tracking-wide">
            {[
              { id: 'hero', label: t.home || 'मुखपृष्ठ' },
              { id: 'about', label: t.about || 'हमारे बारे में' },
              { id: 'services', label: t.services || 'ज्योतिष सेवाएँ' },
              { id: 'ai-studio', label: t.kundli || 'कुंडली' },
              { id: 'horoscope', label: t.dailyHoroscope || 'राशिफल' },
              { id: 'panchang', label: t.panchang || 'पंचांग' },
              { id: 'blog', label: t.blog || 'ब्लॉग' },
              { id: 'gallery', label: 'गैलरी' },
              { id: 'testimonials', label: t.testimonials || 'प्रशंसापत्र' },
              { id: 'contact', label: t.contact || 'संपर्क करें' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors py-1 cursor-pointer ${
                  activeSection === link.id
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold'
                    : 'text-white/80 hover:text-[#D4AF37]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Controls: Language, Theme, CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-white/90 hover:border-[#D4AF37]/50 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{languageNames[currentLang]?.native || 'English'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl shadow-2xl py-2 z-50 bg-[#050B18]/95 backdrop-blur-xl border border-[#D4AF37]/40 text-white">
                  {Object.entries(languageNames).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => {
                        handleLanguageSelect(code as Language);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-[#D4AF37]/20 flex items-center justify-between transition-colors ${
                        currentLang === code ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-white/80'
                      }`}
                    >
                      <span>{info.native}</span>
                      <span className="text-[10px] text-white/40">({info.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#D4AF37] transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-white" />}
            </button>

            {/* Admin Login Button */}
            <button
              onClick={onOpenAdmin}
              className="px-3.5 py-1.5 rounded-full border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/15 to-[#B8860B]/15 text-[#D4AF37] hover:text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:scale-105 transition-all cursor-pointer"
              title="Admin Login Control Panel"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <Lock className="w-3 h-3 text-[#FF9933]" />
              <span>Admin Login</span>
            </button>

            {/* CTA Book Button */}
            <button
              onClick={() => onOpenBooking()}
              className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold uppercase rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.bookNow || 'Book Appointment'}</span>
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-[#D4AF37]"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-[#D4AF37]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#050B18]/95 backdrop-blur-2xl border-b border-[#D4AF37]/30 px-6 pt-4 pb-8 space-y-4 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-[#D4AF37]">Language:</span>
            <select
              value={currentLang}
              onChange={(e) => handleLanguageSelect(e.target.value as Language)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#050B18] text-[#D4AF37]"
            >
              {Object.entries(languageNames).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.native} ({info.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-medium ${
                  activeSection === link.id
                    ? 'text-[#D4AF37] bg-[#D4AF37]/20 border border-[#D4AF37]/40 font-bold'
                    : 'text-white/80 hover:text-[#D4AF37]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-xs font-bold uppercase rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.bookNow || 'Book Appointment'}</span>
            </button>
            <div className="flex justify-between items-center pt-2 text-xs text-white/60">
              <button onClick={onOpenAdmin} className="text-[#D4AF37] underline font-medium">
                Admin Panel
              </button>
              <a href="tel:+919876543210" className="text-emerald-400 font-medium">
                📞 +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
