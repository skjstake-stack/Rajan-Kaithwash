import React, { useState } from 'react';
import { Sparkles, Phone, Mail, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface ContactSectionProps {
  darkMode: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ darkMode }) => {
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Janam Kundli Consultation',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setFormData({ name: '', email: '', phone: '', service: 'Janam Kundli Consultation', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">प्रत्यक्ष मार्गदर्शन एवं कार्यालय अपॉइंटमेंट</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            संपर्क करें - <span className="text-[#D4AF37] italic">आचार्य राजन कैथवास जी</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            ऑनलाइन वीडियो परामर्श, नोएडा एनसीआर कार्यालय आगमन, अथवा आपातकालीन ज्योतिषीय जिज्ञासा हेतु संपर्क करें।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start">
          {/* Contact Details & Addresses */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5 shadow-2xl">
              <h3 className="text-xl font-serif font-bold text-[#D4AF37] border-b border-white/10 pb-3">
                मुख्य आश्रम एवं परामर्श कार्यालय
              </h3>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">कार्यालय पता:</span>
                  <span className="text-white/70">
                    सेक्टर 62, नोएडा एनसीआर, दिल्ली-एनसीआर, भारत 201309
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <Phone className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">हेल्पलाइन / व्हाट्सएप:</span>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">
                    +91 98765 43210 / +91 91234 56789
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <Mail className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">आधिकारिक ईमेल:</span>
                  <a href="mailto:rajan.kaithwas@gmail.com" className="text-[#D4AF37] hover:underline">
                    rajan.kaithwas@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs sm:text-sm">
                <Clock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">परामर्श का समय:</span>
                  <span className="text-white/70">सोमवार से शनिवार: प्रातः 09:30 से रात्रि 08:30 बजे तक</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Trigger Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-lg">तत्काल व्हाट्सएप सहायता</h4>
                <p className="text-xs text-emerald-100 mt-1">बुकिंग अथवा तत्काल कुण्डली समाधान हेतु संदेश भेजें।</p>
              </div>
              <a
                href="https://wa.me/919876543210?text=%E0%A4%B9%E0%A4%B0%E0%A4%BF%20%E0%A4%93%E0%A4%AE%20%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A4%A8%20%E0%A4%95%E0%A5%88%E0%A4%A5%E0%A4%B5%E0%A4%BE%E0%A4%B8%20%E0%A4%9C%E0%A5%80,%20%E0%A4%AE%E0%A5%88%E0%A4%82%20%E0%A4%AA%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%B0%E0%A5%8D%E0%A4%B6%20%E0%A4%AC%E0%A5%81%E0%A4%95%20%E0%A4%95%E0%A4%B0%E0%A4%A8%E0%A4%BE%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%AF%E0%A4%BE%20%E0%A4%B9%E0%A5%82%E0%A4%82%E0%A5%82%E0%A5%82%E0%A5%82।"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-white text-emerald-900 font-bold text-xs shadow-lg hover:bg-emerald-50 shrink-0 cursor-pointer"
              >
                व्हाट्सएप चैट करें
              </a>
            </div>
          </div>

          {/* Quick Enquiry Form */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-[#D4AF37] mb-2">
              परामर्श पूछताछ प्रपत्र
            </h3>
            <p className="text-xs text-white/60 mb-6">
              अपना विवरण नीचे भरें, आचार्य जी की टीम आपसे 2 घंटे के भीतर संपर्क करेगी।
            </p>

            {formSent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <h4 className="font-serif font-bold text-lg">पूछताछ संदेश प्राप्त हुआ!</h4>
                <p className="text-xs">हरि ॐ! हमारी टीम शीघ्र ही आपसे व्हाट्सएप या ईमेल द्वारा संपर्क करेगी।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">आपका पूरा नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. विक्रमादित्य सिंह"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">व्हाट्सएप नंबर *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">ईमेल पता *</label>
                    <input
                      type="email"
                      required
                      placeholder="vikram@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">इच्छित सेवा का चयन करें</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#050B18] border border-white/10 text-[#D4AF37] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Janam Kundli Consultation">जन्म कुंडली विस्तृत विश्लेषण</option>
                      <option value="36 Guna Marriage Matching">अष्टकूट 36 गुण विवाह मिलान</option>
                      <option value="Career & Business Growth">करियर एवं व्यापार उन्नति</option>
                      <option value="Vastu Shastra Audit">वास्तु शास्त्र निरीक्षण</option>
                      <option value="Gemstone Recommendation">प्रमाणित रत्न परामर्श</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">आपकी मुख्य समस्या / संदेश</label>
                  <textarea
                    rows={4}
                    placeholder="जन्म तिथि, समय, स्थान अथवा अपनी समस्या का विवरण लिखें..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4 mr-2" />
                  पूछताछ संदेश भेजें
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
