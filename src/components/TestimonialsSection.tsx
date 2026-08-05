import React, { useState } from 'react';
import { Sparkles, Star, Quote, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { Testimonial, Language } from '../types';
import { TESTIMONIALS } from '../data/astrologyData';

interface TestimonialsSectionProps {
  darkMode: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ darkMode }) => {
  const [reviewsList, setReviewsList] = useState<Testimonial[]>(TESTIMONIALS);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    location: '',
    serviceUsed: 'Janam Kundli Analysis',
    comment: '',
    rating: 5,
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const review: Testimonial = {
      id: 't-' + Date.now(),
      name: newReview.name,
      location: newReview.location || 'India',
      rating: newReview.rating,
      date: 'Just now',
      serviceUsed: newReview.serviceUsed,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      comment: newReview.comment,
      verified: true,
    };

    setReviewsList([review, ...reviewsList]);
    setShowForm(false);
    setNewReview({ name: '', location: '', serviceUsed: 'Janam Kundli Analysis', comment: '', rating: 5 });
  };

  return (
    <section id="testimonials" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">5,000+ प्रमाणित 5-स्टार ग्राहक समीक्षाएं</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            प्रशंसापत्र एवं <span className="text-[#D4AF37] italic">सफलता की गाथाएँ</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            देश एवं विदेश के उन हजारों श्रद्धालुओं के विचार पढ़ें, जिनके जीवन में आचार्य राजन कैथवास जी के मार्गदर्शन से सकारात्मक बदलाव आया।
          </p>
        </div>

        {/* Top Google Rating Box & Write Review Button */}
        <div className="max-w-3xl mx-auto mb-10 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-serif font-bold text-[#D4AF37]">4.9 / 5.0</div>
            <div>
              <div className="flex text-[#D4AF37] space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-white/60 mt-0.5">5,000+ गूगल एवं प्रत्यक्ष समीक्षाओं पर आधारित</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-5 py-2.5 rounded-full text-xs font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5" />
            अपना अनुभव साझा करें
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviewsList.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4 hover:border-[#D4AF37]/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#D4AF37] space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-white/40">{t.date}</span>
                </div>

                <Quote className="w-8 h-8 text-[#D4AF37]/30" />

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center space-x-3">
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/40"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-serif font-bold text-[#D4AF37] text-xs">{t.name}</span>
                    {t.verified && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-white/50">{t.location} • <span className="text-[#FF9933]">{t.serviceUsed}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Write Review Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/80 backdrop-blur-md">
            <div className="bg-[#050B18] border border-[#D4AF37]/40 text-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

              <h3 className="text-xl font-serif font-bold text-[#D4AF37]">
                अपना अनुभव एवं समीक्षा लिखें
              </h3>

              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/70 mb-1">आपका नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राहुल शर्मा"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1">शहर / देश</label>
                  <input
                    type="text"
                    placeholder="उदा. दिल्ली, भारत"
                    value={newReview.location}
                    onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1">आपकी समीक्षा / अनुभव *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="आचार्य जी के परामर्श एवं उपायों से प्राप्त अनुभव का विवरण लिखें..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold hover:scale-105 transition-transform cursor-pointer"
                  >
                    समीक्षा प्रेषित करें
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
