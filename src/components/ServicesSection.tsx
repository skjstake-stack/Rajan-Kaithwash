import React, { useState } from 'react';
import { Sparkles, HeartHandshake, Briefcase, ShieldAlert, Home, Gem, Hash, CalendarCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { AstrologyService, Language } from '../types';
import { ASTROLOGY_SERVICES } from '../data/astrologyData';

interface ServicesSectionProps {
  currentLang: Language;
  darkMode: boolean;
  onOpenBooking: (serviceId?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ darkMode, onOpenBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalService, setActiveModalService] = useState<AstrologyService | null>(null);

  const categories = [
    { id: 'all', label: 'सभी वैदिक सेवाएँ' },
    { id: 'kundli', label: 'जन्म कुंडली' },
    { id: 'marriage', label: 'विवाह एवं मिलान' },
    { id: 'career', label: 'करियर एवं व्यापार' },
    { id: 'dosha', label: 'दोष निवारण' },
    { id: 'vastu', label: 'वास्तु शास्त्र' },
    { id: 'gemstone', label: 'रत्न परामर्श' },
    { id: 'numerology', label: 'अंक ज्योतिष' },
  ];

  const filteredServices =
    selectedCategory === 'all'
      ? ASTROLOGY_SERVICES
      : ASTROLOGY_SERVICES.filter((s) => s.category === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-rose-400" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-blue-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-amber-500" />;
      case 'Home':
        return <Home className="w-6 h-6 text-emerald-400" />;
      case 'Gem':
        return <Gem className="w-6 h-6 text-cyan-400" />;
      case 'Hash':
        return <Hash className="w-6 h-6 text-purple-400" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-6 h-6 text-emerald-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <section id="services" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">प्रामाणिक वैदिक समाधान एवं अचूक उपाय</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            वैदिक ज्योतिष एवं <span className="text-[#D4AF37] italic">आध्यात्मिक सेवाएँ</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            राजन कैथवास (मंटू) द्वारा व्यक्तिगत परामर्श: वीडियो कॉल, ऑडियो, व्हाट्सऐप या व्यक्तिगत भेंट।
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`relative rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between border bg-white/5 backdrop-blur-xl shadow-2xl ${
                service.popular
                  ? 'border-[#D4AF37]/60 shadow-[0_0_25px_rgba(212,175,55,0.15)]'
                  : 'border-white/10'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-lg tracking-wider">
                  सर्वाधिक लोकप्रिय
                </div>
              )}

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4">
                  {getIcon(service.iconName)}
                </div>

                <h3 className="text-xl font-serif font-bold text-[#D4AF37] mb-1">
                  {service.title}
                </h3>
                <p className="text-xs text-white/60 line-clamp-3 mb-4 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-start text-xs text-white/70">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                    ₹{service.priceINR}
                  </span>
                  <span className="text-xs text-white/40 ml-1 font-sans">
                    (${service.priceUSD})
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveModalService(service)}
                    className="px-3 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 cursor-pointer"
                  >
                    विवरण
                  </button>
                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className="px-4 py-2 rounded-full text-xs font-bold text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    <span>बुक करें</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal View for Service Details */}
        {activeModalService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/80 backdrop-blur-md">
            <div className="bg-[#050B18] border border-[#D4AF37]/40 text-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setActiveModalService(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  {getIcon(activeModalService.iconName)}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#D4AF37]">
                    {activeModalService.title}
                  </h3>
                  <p className="text-xs text-[#FF9933]">{activeModalService.hindiTitle}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                {activeModalService.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">What is Included:</h4>
                <ul className="space-y-2">
                  {activeModalService.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start text-xs text-white/80">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                    ₹{activeModalService.priceINR}
                  </span>
                  <span className="text-xs text-white/40 ml-1">
                    (${activeModalService.priceUSD})
                  </span>
                </div>

                <button
                  onClick={() => {
                    onOpenBooking(activeModalService.id);
                    setActiveModalService(null);
                  }}
                  className="px-6 py-3 rounded-full font-bold uppercase tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform text-xs cursor-pointer"
                >
                  Confirm & Book Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
