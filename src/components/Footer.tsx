import React from 'react';
import { ArrowUp, Sparkles, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../translations';

interface FooterProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onLanguageChange, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#030712] text-white border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#FF9933] to-[#B8860B] p-0.5 shadow-lg shadow-[#D4AF37]/20">
                <div className="w-full h-full bg-[#050B18] rounded-[14px] flex items-center justify-center font-serif text-[#D4AF37] font-bold text-lg">
                  ॐ
                </div>
              </div>
              <div>
                <span className="font-serif text-base font-bold tracking-tight text-[#D4AF37] block">
                  राजन कैथवास जी
                </span>
                <span className="text-[10px] text-[#FF9933] font-semibold tracking-wider block">
                  वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              "प्राचीन वैदिक ज्ञान के माध्यम सेआपके जीवन का सही मार्गदर्शन।" अंतरराष्ट्रीय स्वर्ण पदक प्राप्त ज्योतिषाचार्य - जन्म कुंडली विश्लेषण, विवाह मिलान, वास्तु शास्त्र एवं रत्न परामर्श।
            </p>

            <div className="flex items-center space-x-2 text-xs text-[#D4AF37] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% गोपनीय एवं प्रामाणिक वैदिक परामर्श संस्थान</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#D4AF37] text-sm border-b border-white/10 pb-2">
              त्वरित लिंक
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><a href="#hero" className="hover:text-[#D4AF37] transition-colors">मुखपृष्ठ</a></li>
              <li><a href="#about" className="hover:text-[#D4AF37] transition-colors">हमारे बारे में</a></li>
              <li><a href="#services" className="hover:text-[#D4AF37] transition-colors">ज्योतिष सेवाएँ</a></li>
              <li><a href="#ai-studio" className="hover:text-[#D4AF37] transition-colors">एआई जन्म कुंडली</a></li>
              <li><a href="#horoscope" className="hover:text-[#D4AF37] transition-colors">दैनिक राशिफल</a></li>
              <li><a href="#panchang" className="hover:text-[#D4AF37] transition-colors">आज का पंचांग</a></li>
              <li><a href="#blog" className="hover:text-[#D4AF37] transition-colors">वैदिक ब्लॉग</a></li>
            </ul>
          </div>

          {/* Col 3: Services Offered */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#D4AF37] text-sm border-b border-white/10 pb-2">
              मुख्य विशेषताएँ
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>कुंडली मिलान (36 गुण)</li>
              <li>करियर एवं व्यापार ज्योतिष</li>
              <li>कालसर्प एवं मांगलिक दोष शांति</li>
              <li>बिना तोड़-फोड़ वास्तु परामर्श</li>
              <li>प्रमाणित रत्न एवं रुद्राक्ष मार्गदर्शन</li>
              <li>नवग्रह शांति एवं महामृत्युंजय पूजा</li>
            </ul>
          </div>

          {/* Col 4: Language & Admin */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-[#D4AF37] text-sm border-b border-white/10 pb-2">
              भाषा एवं पोर्टल
            </h4>

            <div>
              <label className="block text-[11px] text-white/50 mb-1">भाषा चुनें (Select Language):</label>
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

            <button
              onClick={onOpenAdmin}
              className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
            >
              🔐 कार्यालय एडमिन पोर्टल
            </button>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© {new Date().getFullYear()} राजन कैथवास जी वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन। सर्वाधिकार सुरक्षित।</p>
          <p className="text-center sm:text-right max-w-md">
            अस्वीकरण: ज्योतिषीय फलादेश पारंपरिक वैदिक गणनाओं एवं आध्यात्मिक मार्गदर्शन हेतु प्रदान किए जाते हैं।
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
