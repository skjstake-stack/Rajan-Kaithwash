import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Sparkles, BookOpen, CheckCircle2, Globe, Heart } from 'lucide-react';
import { Language, RajanProfile } from '../types';

interface AboutSectionProps {
  darkMode: boolean;
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ darkMode, onOpenBooking }) => {
  const [profile, setProfile] = useState<RajanProfile>({
    id: 'rajan_profile_1',
    name: 'राजन कैथवास (मंटू)',
    full_name: 'पं. राजन कैथवास (मंटू)',
    display_name: 'राजन कैथवास (मंटू)',
    designation: 'वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक',
    short_bio: 'महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित २५+ वर्षों का प्रामाणिक अनुभव। ५०,०००+ संतुष्ट जातक।',
    biography: 'राजन कैथवास (मंटू) 25 से अधिक वर्षों के गहन अनुभव के साथ अंतरराष्ट्रीय स्तर पर ख्याति प्राप्त वैदिक ज्योतिषाचार्य, वास्तु विशेषज्ञ एवं आध्यात्मिक मार्गदर्शक हैं। महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित उनकी सटीक भविष्यवाणियों से विश्व भर के 50,000 से अधिक जातक लाभान्वित हो चुके हैं।',
    mission: 'प्राचीन वैदिक ज्ञान के माध्यम से भयमुक्त, समृद्ध एवं धर्ममय जीवन जीने का सही मार्ग दिखाना।',
    vision: 'शुद्ध वैदिक ज्योतिषीय मार्गदर्शन को आधुनिक तकनीक द्वारा पूरे विश्व में सुलभ बनाना।',
    image_url: '/rajan_kaithwas.svg',
    profile_image_url: '/rajan_kaithwas.svg',
    cloudinary_public_id: 'rajan_profile/default_avatar',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/rajan-profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.warn('Could not fetch Rajan Profile in AboutSection:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    window.addEventListener('rajanProfileUpdated', fetchProfile);
    return () => {
      window.removeEventListener('rajanProfileUpdated', fetchProfile);
    };
  }, []);

  const achievements = [
    { title: 'ज्योतिष रत्न स्वर्ण पदक विजेता 2024', issuer: 'अखिल भारतीय ज्योतिष संघ' },
    { title: 'वैश्विक वैदिक उत्कृष्टता सम्मान', issuer: 'अंतर्राष्ट्रीय वैदिक सम्मेलन, यूके' },
    { title: 'वास्तु सम्राट सम्मान', issuer: 'वास्तु अनुसंधान संस्थान, नई दिल्ली' },
    { title: '25+ वर्षों का सफल अनुभव', issuer: '50,000+ संतुष्ट जातक एवं परामर्श' },
  ];

  return (
    <section id="about" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image & Award Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-[#D4AF37] via-[#FF9933]/50 to-[#B8860B] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <img
                src={profile.profile_image_url || profile.image_url || '/rajan_kaithwas.svg'}
                alt={profile.display_name || profile.name || 'राजन कैथवास (मंटू)'}
                referrerPolicy="no-referrer"
                className="w-full h-[450px] object-cover rounded-2xl filter contrast-105"
              />
            </div>

            {/* Floating Gold Award Seal */}
            <div className="absolute -bottom-6 -right-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] p-4 rounded-2xl shadow-2xl border border-white/20 max-w-[220px]">
              <Award className="w-8 h-8 mb-1 text-[#050B18]" />
              <p className="font-serif font-bold text-sm leading-tight">स्वर्ण पदक सम्मानित ज्योतिषाचार्य</p>
              <p className="text-[10px] text-[#050B18]/80 font-semibold mt-0.5">पाराशरी सिद्धि हेतु सम्मानित</p>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">पूज्य आध्यात्मिक गुरु</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              हमारे बारे में <span className="text-[#D4AF37] italic">{profile.display_name || profile.name || 'राजन कैथवास (मंटू)'}</span>
            </h2>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans whitespace-pre-line">
              {profile.biography || profile.short_bio}
            </p>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-1">
                <div className="flex items-center space-x-2 text-[#D4AF37] font-serif font-bold text-base">
                  <Globe className="w-4 h-4 text-[#D4AF37]" />
                  <span>हमारा उद्देश्य (Mission)</span>
                </div>
                <p className="text-xs text-white/70">
                  {profile.mission || 'प्राचीन वैदिक ज्ञान के माध्यम से भयमुक्त, समृद्ध एवं धर्ममय जीवन जीने का सही मार्ग दिखाना।'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-1">
                <div className="flex items-center space-x-2 text-[#D4AF37] font-serif font-bold text-base">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>हमारा संकल्प (Vision)</span>
                </div>
                <p className="text-xs text-white/70">
                  {profile.vision || 'शुद्ध वैदिक ज्योतिषीय मार्गदर्शन को आधुनिक तकनीक द्वारा पूरे विश्व में सुलभ बनाना।'}
                </p>
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">सम्मान एवं उपलब्धियां</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
                {achievements.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#D4AF37] block">{item.title}</span>
                      <span className="text-[10px] text-white/50">{item.issuer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform text-xs cursor-pointer"
              >
                राजन जी से व्यक्तिगत परामर्श बुक करें
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
