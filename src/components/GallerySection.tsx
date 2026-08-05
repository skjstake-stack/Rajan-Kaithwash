import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Award, Video, Maximize2 } from 'lucide-react';
import { Language } from '../types';

interface GallerySectionProps {
  darkMode: boolean;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ darkMode }) => {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const galleryItems = [
    {
      id: 'g1',
      folder: 'temple_images',
      title: 'केदारनाथ धाम महायज्ञ एवं अनुष्ठान',
      url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'g2',
      folder: 'awards',
      title: 'स्वर्ण पदक विजेता ज्योतिष रत्न पुरस्कार 2024',
      url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'g3',
      folder: 'events',
      title: 'अंतर्राष्ट्रीय वैदिक ज्योतिष महासम्मेलन, यूके',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'g4',
      folder: 'certificates',
      title: 'आईएसओ 9001:2015 प्रमाणित वैदिक केंद्र',
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'g5',
      folder: 'temple_images',
      title: 'वाराणसी काशी विश्वनाथ विशेष पूजा',
      url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'g6',
      folder: 'events',
      title: 'नवग्रह शांति महायज्ञ एवं जाप',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const folders = [
    { id: 'all', label: 'सभी चित्र' },
    { id: 'temple_images', label: 'तीर्थ एवं मंदिर चित्र' },
    { id: 'awards', label: 'सम्मान एवं पुरस्कार' },
    { id: 'events', label: 'आयोजन एवं महासम्मेलन' },
    { id: 'certificates', label: 'प्रमाण पत्र' },
  ];

  const filteredItems =
    selectedFolder === 'all'
      ? galleryItems
      : galleryItems.filter((g) => g.folder === selectedFolder);

  return (
    <section id="gallery" className="py-20 relative bg-[#050B18] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 border border-[#D4AF37]/40 rounded-full bg-[#D4AF37]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">चित्र गैलरी एवं उपलब्धियाँ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
            फोटो एवं <span className="text-[#D4AF37] italic">मीडिया गैलरी</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            पवित्र तीर्थस्थलों के महायज्ञ, अंतर्राष्ट्रीय ज्योतिष सम्मेलनों, राष्ट्रीय सम्मान समारोहों एवं प्रमाण-पत्रों की झलकियाँ देखें।
          </p>
        </div>

        {/* Folder Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                selectedFolder === f.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-[#D4AF37]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item.url)}
              className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl cursor-pointer shadow-2xl h-64 hover:border-[#D4AF37]/50 transition-colors"
            >
              <img
                src={item.url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B18]/90 via-[#050B18]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                <p className="text-[#D4AF37] font-serif font-bold text-sm">{item.title}</p>
                <span className="text-[10px] text-white/70 flex items-center mt-1">
                  <Maximize2 className="w-3 h-3 mr-1 text-[#FF9933]" /> Click to enlarge
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/90 backdrop-blur-md cursor-pointer"
          >
            <div className="relative max-w-4xl w-full">
              <img
                src={lightboxImage}
                alt="Enlarged View"
                referrerPolicy="no-referrer"
                className="w-full max-h-[85vh] object-contain rounded-3xl border border-[#D4AF37]/40 shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
