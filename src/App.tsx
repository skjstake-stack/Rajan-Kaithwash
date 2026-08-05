import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PanchangWidget } from './components/PanchangWidget';
import { DailyHoroscopeWidget } from './components/DailyHoroscopeWidget';
import { AIAstrologyStudio } from './components/AIAstrologyStudio';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { BlogSection } from './components/BlogSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

// Modals
import { BookingModal } from './components/BookingModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';

import { Language } from './types';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('hi');
  const [darkMode, setDarkMode] = useState(true);

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleOpenBooking = (serviceId?: string) => {
    setBookingServiceId(serviceId);
    setShowBookingModal(true);
  };

  return (
    <div className={`min-h-screen font-sans relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#050B18] transition-colors duration-300 ${darkMode ? 'bg-[#050B18] text-white' : 'bg-[#0A1226] text-[#F8FAFC]'}`}>
      {/* Immersive Cosmic Background Ambient Glow */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none z-0" 
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 20%, #FF9933 0%, transparent 55%), radial-gradient(circle at 10% 60%, #D4AF37 0%, transparent 45%), radial-gradient(circle at 85% 85%, #B8860B 0%, transparent 50%)',
          filter: 'blur(90px)'
        }}
      />

      {/* Header Navigation */}
      <div className="relative z-20">
        <Navbar
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenBooking={() => handleOpenBooking()}
          onOpenAdmin={() => setShowAdminModal(true)}
        />
      </div>

      {/* Main Content Layout */}
      <main className="relative z-10 space-y-0">
        <HeroSection
          currentLang={currentLang}
          onOpenBooking={() => handleOpenBooking()}
          onOpenVoiceAssistant={() => setShowVoiceModal(true)}
        />

        <PanchangWidget
          currentLang={currentLang}
          darkMode={darkMode}
        />

        <DailyHoroscopeWidget
          currentLang={currentLang}
          darkMode={darkMode}
          onOpenBooking={handleOpenBooking}
        />

        <AIAstrologyStudio
          currentLang={currentLang}
          darkMode={darkMode}
          onOpenBooking={handleOpenBooking}
          onOpenVoiceAssistant={() => setShowVoiceModal(true)}
        />

        <ServicesSection
          currentLang={currentLang}
          darkMode={darkMode}
          onOpenBooking={handleOpenBooking}
        />

        <AboutSection
          darkMode={darkMode}
          onOpenBooking={() => handleOpenBooking()}
        />

        <TestimonialsSection
          darkMode={darkMode}
        />

        <BlogSection
          darkMode={darkMode}
        />

        <GallerySection
          darkMode={darkMode}
        />

        <ContactSection
          darkMode={darkMode}
        />
      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          initialServiceId={bookingServiceId}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminDashboardModal
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {showVoiceModal && (
        <VoiceAssistantModal
          currentLang={currentLang}
          onClose={() => setShowVoiceModal(false)}
        />
      )}
    </div>
  );
}
