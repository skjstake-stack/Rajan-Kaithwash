import React, { useState, useEffect } from 'react';
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
import { SEOHead } from './components/SEOHead';

// Modals & Admin Pages
import { BookingModal } from './components/BookingModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

import { Language, AdminUser } from './types';
import { useBrowserLocale } from './hooks/useBrowserLocale';

export default function App() {
  const [currentLang, setCurrentLang] = useBrowserLocale();
  const [darkMode, setDarkMode] = useState(true);

  // Dynamic Site Settings for SEO
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // View Routing State: 'site' | 'admin-login' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState<'site' | 'admin-login' | 'admin-dashboard'>('site');

  // Admin Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string>('');

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Fetch website settings on load
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  // Sync state with URL path on load
  useEffect(() => {
    const path = window.location.pathname;
    const storedToken = localStorage.getItem('rajan_admin_token') || sessionStorage.getItem('rajan_admin_token');
    const storedUser = localStorage.getItem('rajan_admin_user') || sessionStorage.getItem('rajan_admin_user');

    if (storedToken && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setAdminUser(userObj);
        setAdminToken(storedToken);
      } catch (e) {
        console.warn('Error parsing stored admin user:', e);
      }
    }

    if (path === '/admin/login') {
      setCurrentView('admin-login');
    } else if (path === '/admin/dashboard') {
      if (storedToken && storedUser) {
        setCurrentView('admin-dashboard');
      } else {
        // Unauthenticated access to /admin/dashboard redirects to /admin/login
        window.history.pushState({}, '', '/admin/login');
        setCurrentView('admin-login');
      }
    }
  }, []);

  const handleOpenBooking = (serviceId?: string) => {
    setBookingServiceId(serviceId);
    setShowBookingModal(true);
  };

  const handleOpenAdminLogin = () => {
    window.history.pushState({}, '', '/admin/login');
    setCurrentView('admin-login');
  };

  const handleAdminLoginSuccess = (user: AdminUser, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
    window.history.pushState({}, '', '/admin/dashboard');
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('rajan_admin_token');
    localStorage.removeItem('rajan_admin_user');
    sessionStorage.removeItem('rajan_admin_token');
    sessionStorage.removeItem('rajan_admin_user');
    setAdminUser(null);
    setAdminToken('');
    window.history.pushState({}, '', '/');
    setCurrentView('site');
  };

  const handleGoToSite = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('site');
  };

  // Render Admin Login Page (/admin/login)
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLoginSuccess}
        onBackToSite={handleGoToSite}
      />
    );
  }

  // Render Admin Dashboard Page (/admin/dashboard - Protected Route)
  if (currentView === 'admin-dashboard') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToSite={handleGoToSite}
        />
      );
    }

    return (
      <AdminDashboard
        adminUser={adminUser}
        token={adminToken}
        onLogout={handleAdminLogout}
        onGoToSite={handleGoToSite}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#050B18] transition-colors duration-300 ${darkMode ? 'bg-[#050B18] text-white' : 'bg-[#0A1226] text-[#F8FAFC]'}`}>
      {/* Global SEO Head Management */}
      <SEOHead
        title={siteSettings?.seoTitle || 'राजन कैथवास (मंटू) | वैदिक ज्योतिष, जन्म कुंडली, वास्तु एवं हस्तरेखा - छिंदवाड़ा'}
        description={siteSettings?.seoDescription || 'आचार्य राजन कैथवास (मंटू) जी द्वारा प्रामाणिक वैदिक ज्योतिष, जन्म कुंडली फलादेश, कुंडली मिलान, वास्तु परामर्श, हस्तरेखा, अंक ज्योतिष एवं सटीक रत्न परामर्श। छिंदवाड़ा, परासिया, छांदामेटा (मध्य प्रदेश)।'}
        keywords={siteSettings?.seoKeywords || 'राजन कैथवास, मंटू, वैदिक ज्योतिष, जन्म कुंडली, कुंडली मिलान, विवाह ज्योतिष, करियर ज्योतिष, वास्तु परामर्श, हस्तरेखा, अंक ज्योतिष, रत्न परामर्श, छिंदवाड़ा ज्योतिष, परासिया ज्योतिष, Chhindwara Astrologer, Rajan Kaithwas Mantoo'}
        ogImage={siteSettings?.defaultOgImage || 'https://rajankaithwas.com/rajan_kaithwas.svg'}
        googleVerificationCode={siteSettings?.googleSearchConsoleCode || 'google-site-verification=rkj-astro-2026-verify-code'}
      />

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
          onOpenAdmin={handleOpenAdminLogin}
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
        onOpenAdmin={handleOpenAdminLogin}
      />

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          initialServiceId={bookingServiceId}
          onClose={() => setShowBookingModal(false)}
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
