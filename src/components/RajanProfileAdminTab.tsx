import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  User,
  Sparkles,
  Image as ImageIcon,
  Award,
  FileText,
  Globe,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  ShieldCheck,
  Layers,
  Download,
  Plus,
  Star,
  Share2,
  History,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { RajanProfile, RajanGalleryItem, RajanCertificateItem, RajanDocumentItem, RajanActivityLog } from '../types';

export const RajanProfileAdminTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'basic' | 'contact' | 'social' | 'professional' | 'image' | 'gallery' | 'certificates' | 'logs'
  >('basic');

  const [profile, setProfile] = useState<RajanProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<RajanActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State: Basic Info
  const [fullName, setFullName] = useState('पं. राजन कैथवास (मंटू)');
  const [displayName, setDisplayName] = useState('राजन कैथवास (मंटू)');
  const [designation, setDesignation] = useState('अंतरराष्ट्रीय ख्याति प्राप्त वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक');
  const [shortBio, setShortBio] = useState('महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित 33+ वर्षों का प्रामाणिक अनुभव। 50,000+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।');
  const [biography, setBiography] = useState('');
  const [experience, setExperience] = useState('33+ वर्ष');
  const [qualification, setQualification] = useState('ज्योतिष भास्कर, वैदिक शास्त्री, वास्तु विशारद');
  const [specialization, setSpecialization] = useState('जन्मकुण्डली फलादेश, मांगलिक दोष निवारण, कालसर्प दोष शांति, वास्तु दोष निवारण');
  const [languages, setLanguages] = useState('हिंदी, संस्कृत, अंग्रेजी');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Form State: Contact Info
  const [mobile, setMobile] = useState('8319885134');
  const [whatsapp, setWhatsapp] = useState('8319885134');
  const [helpline, setHelpline] = useState('8319885134');
  const [email, setEmail] = useState('contact@rajankaithwas.com');
  const [website, setWebsite] = useState('https://rajankaithwas.com');
  const [officeAddress, setOfficeAddress] = useState('Smart Point के सामने, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India');
  const [pincode, setPincode] = useState('480447');
  const [googleMap, setGoogleMap] = useState('https://maps.google.com/?q=Chhindwara+Madhya+Pradesh+480447');

  // Form State: Social Links
  const [facebook, setFacebook] = useState('https://facebook.com/rajankaithwas.official');
  const [instagram, setInstagram] = useState('https://instagram.com/rajankaithwas.official');
  const [youtube, setYoutube] = useState('https://youtube.com/@rajankaithwasjyotish');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/rajankaithwas');
  const [twitter, setTwitter] = useState('https://x.com/rajankaithwas');

  // Form State: Professional Info
  const [awards, setAwards] = useState('');
  const [achievements, setAchievements] = useState('');
  const [publications, setPublications] = useState('');
  const [memberships, setMemberships] = useState('');
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');

  // Image & Crop State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Sub-form State
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryFeatured, setGalleryFeatured] = useState(false);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Certificate Sub-form State
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('2026');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rajan-profile');
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        setProfile(p);
        setStats(data.stats);
        setLogs(data.logs || []);

        setFullName(p.full_name || 'पं. राजन कैथवास (मंटू)');
        setDisplayName(p.display_name || p.name || 'राजन कैथवास (मंटू)');
        setDesignation(p.designation || '');
        setShortBio(p.short_bio || '');
        setBiography(p.biography || '');
        setExperience(p.experience || '33+ वर्ष');
        setQualification(p.qualification || '');
        setSpecialization(p.specialization || '');
        setLanguages(p.languages || 'हिंदी, संस्कृत, अंग्रेजी');
        setStatus(p.status || 'active');

        setMobile(p.mobile || '8319885134');
        setWhatsapp(p.whatsapp || '8319885134');
        setHelpline(p.helpline || '8319885134');
        setEmail(p.email || 'contact@rajankaithwas.com');
        setWebsite(p.website || 'https://rajankaithwas.com');
        setOfficeAddress(p.office_address || 'Smart Point के सामने, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India');
        setPincode(p.pincode || '480447');
        setGoogleMap(p.google_map || 'https://maps.google.com/?q=Chhindwara+Madhya+Pradesh+480447');

        setFacebook(p.facebook || '');
        setInstagram(p.instagram || '');
        setYoutube(p.youtube || '');
        setLinkedin(p.linkedin || '');
        setTwitter(p.twitter || '');

        setAwards(p.awards || '');
        setAchievements(p.achievements || '');
        setPublications(p.publications || '');
        setMemberships(p.memberships || '');
        setMission(p.mission || '');
        setVision(p.vision || '');

        setPreviewUrl(p.profile_image_url || p.image_url || '/rajan_kaithwas.svg');
      }
    } catch (err) {
      console.error('Failed to load Rajan Profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMessage(null);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (selectedFile) {
        // Form with profile photo upload directly to Cloudinary rajan_profile/
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('full_name', fullName);
        formData.append('display_name', displayName);
        formData.append('designation', designation);
        formData.append('short_bio', shortBio);
        formData.append('biography', biography);
        formData.append('experience', experience);
        formData.append('qualification', qualification);
        formData.append('specialization', specialization);
        formData.append('languages', languages);
        formData.append('status', status);

        formData.append('mobile', mobile);
        formData.append('whatsapp', whatsapp);
        formData.append('email', email);
        formData.append('website', website);
        formData.append('office_address', officeAddress);
        formData.append('google_map', googleMap);

        formData.append('facebook', facebook);
        formData.append('instagram', instagram);
        formData.append('youtube', youtube);
        formData.append('linkedin', linkedin);
        formData.append('twitter', twitter);

        formData.append('awards', awards);
        formData.append('achievements', achievements);
        formData.append('publications', publications);
        formData.append('memberships', memberships);
        formData.append('mission', mission);
        formData.append('vision', vision);

        const res = await fetch('/api/rajan-profile/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setPreviewUrl(data.profile.profile_image_url);
          setSelectedFile(null);
          setMessage({
            type: 'success',
            text: '✓ प्रोफाइल फोटो क्लाउडिनरी (rajan_profile/) पर अपलोड हुई एवं विवरण सफलतापूर्वक सहेजा गया!',
          });
          window.dispatchEvent(new Event('rajanProfileUpdated'));
          fetchProfile();
        } else {
          throw new Error(data.error || 'अपलोड में त्रुटि आई');
        }
      } else {
        // Update JSON fields
        const res = await fetch('/api/rajan-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            display_name: displayName,
            designation,
            short_bio: shortBio,
            biography,
            experience,
            qualification,
            specialization,
            languages,
            status,

            mobile,
            whatsapp,
            email,
            website,
            office_address: officeAddress,
            google_map: googleMap,

            facebook,
            instagram,
            youtube,
            linkedin,
            twitter,

            awards,
            achievements,
            publications,
            memberships,
            mission,
            vision,
          }),
        });

        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setMessage({
            type: 'success',
            text: '✓ राजन कैथवास (मंटू) की संपूर्ण प्रोफाइल सफलतापूर्वक अपडेट हो गई!',
          });
          window.dispatchEvent(new Event('rajanProfileUpdated'));
          fetchProfile();
        } else {
          throw new Error(data.error || 'अपडेट में त्रुटि आई');
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'प्रोफाइल सहेजने में विफल।' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm('क्या आप प्रोफाइल चित्र हटाकर डिफ़ॉल्ट फोटो सेट करना चाहते हैं? पुराना चित्र क्लाउडिनरी से हट जाएगा।')) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/rajan-profile', { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setPreviewUrl(data.profile.profile_image_url);
        setSelectedFile(null);
        setMessage({
          type: 'success',
          text: '✓ प्रोफाइल चित्र क्लाउडिनरी से हट गया एवं डिफ़ॉल्ट SVG सेट हो गया!',
        });
        window.dispatchEvent(new Event('rajanProfileUpdated'));
        fetchProfile();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'चित्र हटाने में त्रुटि आई।' });
    } finally {
      setDeleting(false);
    }
  };

  // Add Gallery Image
  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFile) {
      setMessage({ type: 'error', text: 'कृपया गैलरी हेतु चित्र चुनें।' });
      return;
    }
    setGalleryUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', galleryFile);
      formData.append('title', galleryTitle || 'गैलरी छायाचित्र');
      formData.append('featured', String(galleryFeatured));

      const res = await fetch('/api/rajan-profile/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setGalleryTitle('');
        setGalleryFile(null);
        setGalleryFeatured(false);
        if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
        setMessage({
          type: 'success',
          text: '✓ गैलरी चित्र सफलतापूर्वक क्लाउडिनरी (rajan_profile/gallery/) में अपलोड हुआ!',
        });
        fetchProfile();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'गैलरी अपलोड विफल।' });
    } finally {
      setGalleryUploading(false);
    }
  };

  // Delete Gallery Image
  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!window.confirm('क्या आप यह गैलरी चित्र क्लाउडिनरी से हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/rajan-profile/gallery/${imageId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '✓ गैलरी चित्र सफलतापूर्वक हटा दिया गया।' });
        fetchProfile();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'गैलरी फ़ाइल हटाने में त्रुटि।' });
    }
  };

  // Add Certificate
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certFile) {
      setMessage({ type: 'error', text: 'कृपया प्रमाण पत्र (Image/PDF) चुनें।' });
      return;
    }
    setCertUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', certFile);
      formData.append('title', certTitle || 'नवीन प्रमाण पत्र');
      formData.append('issuer', certIssuer || 'ज्योतिष संस्थान');
      formData.append('year', certYear || '2026');

      const res = await fetch('/api/rajan-profile/certificates', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setCertTitle('');
        setCertIssuer('');
        setCertFile(null);
        if (certFileInputRef.current) certFileInputRef.current.value = '';
        setMessage({
          type: 'success',
          text: '✓ प्रमाण पत्र क्लाउडिनरी (rajan_profile/certificates/) में सहेजा गया!',
        });
        fetchProfile();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'प्रमाण पत्र अपलोड विफल।' });
    } finally {
      setCertUploading(false);
    }
  };

  // Delete Certificate
  const handleDeleteCertificate = async (certId: string) => {
    if (!window.confirm('क्या आप यह प्रमाण पत्र हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/rajan-profile/certificates/${certId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: '✓ प्रमाण पत्र सफलतापूर्वक हटाया गया।' });
        fetchProfile();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'प्रमाण पत्र हटाने में त्रुटि।' });
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#D4AF37] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="text-sm font-semibold">राजन जी का प्रोफाइल डेटा लोड हो रहा है...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#FF9933] font-bold block">
            Super Admin Panel ➔ Rajan Kaithwas Ji Profile Module
          </span>
          <h2 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center space-x-2">
            <span>राजन जी प्रोफाइल प्रबंधन</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
              v2026.1
            </span>
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="/#about"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs flex items-center space-x-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>लाइव व्यू देखें</span>
          </a>
          <button
            onClick={fetchProfile}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer text-xs flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश</span>
          </button>
        </div>
      </div>

      {/* 2. Dashboard Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-2xl bg-[#050B18]/80 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-white/50 block">प्रोफाइल स्थिति</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  stats.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-white capitalize">
                {stats.status === 'active' ? 'सक्रिय (Active)' : 'निष्क्रिय'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B18]/80 border border-white/10">
            <span className="text-[10px] text-white/50 block">पूर्णता (Completion)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-[#D4AF37]">
                {stats.completionPercentage}%
              </span>
              <div className="w-12 bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full rounded-full"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B18]/80 border border-white/10">
            <span className="text-[10px] text-white/50 block">कुल व्यूज</span>
            <span className="text-sm font-extrabold text-white mt-1 block">
              {(stats.totalViews || 0).toLocaleString('hi-IN')}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B18]/80 border border-white/10">
            <span className="text-[10px] text-white/50 block">गैलरी तस्वीरें</span>
            <span className="text-sm font-extrabold text-[#FF9933] mt-1 block">
              {stats.galleryImagesCount || 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B18]/80 border border-white/10">
            <span className="text-[10px] text-white/50 block">प्रमाण पत्र संख्या</span>
            <span className="text-sm font-extrabold text-sky-400 mt-1 block">
              {stats.certificatesCount || 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B18]/80 border border-white/10 col-span-2 sm:col-span-2">
            <span className="text-[10px] text-white/50 block">अंतिम अपडेट</span>
            <span className="text-xs font-semibold text-white/90 mt-1 truncate block">
              {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('hi-IN') : 'अभी'}
            </span>
          </div>
        </div>
      )}

      {/* Message Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/70 border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          )}
          <span className="flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-white/50 hover:text-white text-xs cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
        {[
          { id: 'basic', label: '1. मूलभूत विवरण', icon: User },
          { id: 'contact', label: '2. संपर्क सूत्र', icon: Phone },
          { id: 'social', label: '3. सोशल मीडिया', icon: Share2 },
          { id: 'professional', label: '4. उपलब्धि व मिशन', icon: Award },
          { id: 'image', label: '5. प्रोफाइल फोटो (Cloudinary)', icon: ImageIcon },
          { id: 'gallery', label: '6. गैलरी चित्र', icon: Layers },
          { id: 'certificates', label: '7. प्रमाण पत्र', icon: ShieldCheck },
          { id: 'logs', label: '8. गतिविधि लॉग व रिपोर्ट', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] shadow-[0_0_15px_rgba(212,175,55,0.3)] font-bold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#050B18]' : 'text-[#FF9933]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Main Form & Section Views */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'basic' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                <User className="w-4 h-4 text-[#FF9933]" />
                <span>मूलभूत जानकारी (Basic Information)</span>
              </h3>
              <span className="text-[10px] text-white/40">Home Page & About Page ऑटो सिंक</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="पं. राजन कैथवास"
                  required
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  प्रदर्शन नाम (Display Name) *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="राजन कैथवास (मंटू)"
                  required
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  पद / उपाधि (Designation) *
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="अंतरराष्ट्रीय ख्याति प्राप्त वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक"
                  required
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  अनुभव (Years of Experience)
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="33+ वर्ष"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  योग्यता / शैक्षणिक उपाधियाँ (Qualification)
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="ज्योतिष भास्कर, वैदिक शास्त्री, वास्तु विशारद"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  ज्ञाता भाषाएँ (Languages Known)
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="हिंदी, संस्कृत, अंग्रेजी"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                विशेषज्ञता (Specialization)
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="जन्मकुण्डली फलादेश, मांगलिक दोष निवारण, कालसर्प दोष शांति, वास्तु दोष निवारण"
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                संक्षिप्त परिचय (Short Introduction)
              </label>
              <textarea
                rows={2}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                placeholder="महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित 33+ वर्षों का प्रामाणिक अनुभव..."
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                विस्तृत जीवनी (Full Biography)
              </label>
              <textarea
                rows={5}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="राजन कैथवास (मंटू) 33 से अधिक वर्षों के गहन अनुभव के साथ अंतरराष्ट्रीय स्तर पर..."
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT INFORMATION */}
        {activeTab === 'contact' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-[#FF9933]" />
                <span>संपर्क सूत्र (Contact Information)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  मोबाइल नंबर (Mobile Number)
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="8319885134"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  व्हाट्सएप नंबर (WhatsApp Number)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="8319885134"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  ईमेल पता (Email Address)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@rajankaithwas.com"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  वेबसाइट (Website URL)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://rajankaithwas.com"
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                कार्यालय का पता (Office Address)
              </label>
              <textarea
                rows={2}
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="राजन कैथवास आध्यात्मिक केंद्र, सेक्टर 18, नोएडा..."
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                गूगल मैप लिंक (Google Map Location Link)
              </label>
              <input
                type="url"
                value={googleMap}
                onChange={(e) => setGoogleMap(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL MEDIA LINKS */}
        {activeTab === 'social' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                <Share2 className="w-4 h-4 text-[#FF9933]" />
                <span>सोशल मीडिया लिंक (Social Media Handles)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">Twitter / X Handle URL</label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFESSIONAL INFORMATION & MISSION */}
        {activeTab === 'professional' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-[#FF9933]" />
                <span>पेशेवर उपलब्धियां व मिशन (Professional Info & Mission)</span>
              </h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                पुरस्कार एवं सम्मान (Awards & Honors)
              </label>
              <textarea
                rows={2}
                value={awards}
                onChange={(e) => setAwards(e.target.value)}
                placeholder="ज्योतिष रत्न स्वर्ण पदक विजेता 2024, वैश्विक वैदिक उत्कृष्टता सम्मान..."
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                मुख्य उपलब्धियां (Major Achievements)
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="50,000+ संतुष्ट जातक, 33+ वर्षों का अनुभव, 100+ राष्ट्रीय व अंतर्राष्ट्रीय सेमिनार संबोधन..."
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  प्रकाशन एवं पुस्तकें (Publications)
                </label>
                <textarea
                  rows={2}
                  value={publications}
                  onChange={(e) => setPublications(e.target.value)}
                  placeholder="वैदिक ज्योतिष सिद्धान्त (पुस्तक), दैनिक समाचार पत्रों में नियमित स्तंभ लेखन..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  सदस्यताएँ (Memberships & Associations)
                </label>
                <textarea
                  rows={2}
                  value={memberships}
                  onChange={(e) => setMemberships(e.target.value)}
                  placeholder="अखिल भारतीय ज्योतिष अनुसंधान परिषद (आजीवन सदस्य)..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  लक्ष्य / उद्देश्य (Mission Statement)
                </label>
                <textarea
                  rows={2}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="प्राचीन वैदिक ज्ञान के माध्यम से भयमुक्त, समृद्ध एवं धर्ममय जीवन जीने का सही मार्ग दिखाना..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                  दूरदृष्टि (Vision Statement)
                </label>
                <textarea
                  rows={2}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="शुद्ध वैदिक ज्योतिषीय मार्गदर्शन को आधुनिक तकनीक द्वारा पूरे विश्व में सुलभ बनाना..."
                  className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE IMAGE & CLOUDINARY MANAGEMENT */}
        {activeTab === 'image' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FF9933]" />
                  <span>प्रोफाइल फोटो प्रबंधन (Cloudinary: rajan_profile/)</span>
                </h3>
                <p className="text-[10px] text-white/50">
                  सभी फाइलें सीधे Cloudinary के `rajan_profile/` फ़ोल्डर में अपलोड होती हैं।
                </p>
              </div>

              {profile?.cloudinary_public_id && (
                <span className="text-[9px] px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] font-mono">
                  {profile.cloudinary_public_id}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Drag & Drop Upload Zone */}
              <div className="lg:col-span-6 space-y-3">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#050B18]/60 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-[#D4AF37] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-white/90 font-bold">
                    नवीन फोटो यहाँ ड्रॉप करें अथवा ब्राउज करें
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    PNG, JPG, WEBP, SVG • ऑटो q_auto, f_auto ऑप्टिमाइजेशन
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 space-y-1">
                  <span className="text-[#FF9933] font-bold block">✓ ऑटोमेटेड क्लाउडिनरी सिंक नीतियाँ:</span>
                  <p>• नई फोटो अपलोड करने पर पुरानी Cloudinary फोटो स्वतः डिलीट हो जाएगी।</p>
                  <p>• री-डिप्लॉयमेंट (re-deployment) के बाद भी फोटो कभी नष्ट नहीं होगी।</p>
                  <p>• Home Page और About Page पर तुरंत अद्यतन प्रतिबिंबित होगा।</p>
                </div>
              </div>

              {/* Crop, Rotate & Preview Frame */}
              <div className="lg:col-span-6 space-y-3 text-center">
                <div className="flex items-center justify-between text-xs text-white/60 px-2">
                  <span>लाइव जूम व रोटेशन समायोजन:</span>
                  <span className="text-[#D4AF37] font-bold">{zoom}x Zoom</span>
                </div>

                <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#FF9933] shadow-[0_0_35px_rgba(212,175,55,0.35)] overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#050B18] p-2 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={previewUrl || '/rajan_kaithwas.svg'}
                      alt="Rajan Kaithwas Ji"
                      className="w-full h-full object-cover rounded-full transition-transform duration-200"
                      style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10 max-w-xs mx-auto">
                  <ZoomOut className="w-4 h-4 text-white/50" />
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-[#D4AF37]" />
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>घूमाएँ (90°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteProfileImage}
                    disabled={deleting}
                    className="py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-xs text-red-300 flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>{deleting ? 'हटाया जा रहा है...' : 'चित्र हटाएँ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GALLERY IMAGES (`rajan_profile/gallery/`) */}
        {activeTab === 'gallery' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-[#FF9933]" />
                  <span>गैलरी चित्र प्रबंधन (Cloudinary: rajan_profile/gallery/)</span>
                </h3>
                <p className="text-[10px] text-white/50">
                  राजन कैथवास के कार्यक्रमों, पुरस्कारों व दर्शन यात्राओं के चित्र।
                </p>
              </div>
            </div>

            {/* Upload New Gallery Form */}
            <div className="p-4 rounded-xl bg-[#050B18]/80 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-[#D4AF37] block">नवीन गैलरी फ़ाइल अपलोड करें</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="छायाचित्र का शीर्षक (जैसे: महाकालेश्वर मंदिर दर्शन)"
                    className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGalleryFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-white/70 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-[#D4AF37]/20 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/30 cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center space-x-2">
                  <label className="flex items-center space-x-1 text-xs text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={galleryFeatured}
                      onChange={(e) => setGalleryFeatured(e.target.checked)}
                      className="accent-[#D4AF37]"
                    />
                    <span>मुख्य चित्र</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    disabled={galleryUploading}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    {galleryUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>अपलोड</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Gallery List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/80 block">
                वर्तमान गैलरी चित्र ({(profile?.gallery_images || []).length}):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(profile?.gallery_images || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#050B18] border border-white/10 flex items-center space-x-3 group relative"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white truncate block">{item.title}</span>
                      <span className="text-[9px] text-[#D4AF37] truncate block font-mono">
                        {item.cloudinary_public_id}
                      </span>
                      {item.featured && (
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-[#FF9933]/20 text-[#FF9933] font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(item.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/30 cursor-pointer"
                      title="हटाएँ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CERTIFICATES & DOCUMENTS (`rajan_profile/certificates/`) */}
        {activeTab === 'certificates' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                  <span>प्रमाण पत्र व दस्तावेज (Cloudinary: rajan_profile/certificates/)</span>
                </h3>
                <p className="text-[10px] text-white/50">
                  ज्योतिष रत्न, स्वर्ण पदक प्रमाण पत्र एवं आधिकारिक दस्तावेज (Image / PDF)।
                </p>
              </div>
            </div>

            {/* Upload New Certificate Form */}
            <div className="p-4 rounded-xl bg-[#050B18]/80 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-[#D4AF37] block">नवीन प्रमाण पत्र अपलोड करें</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="प्रमाण पत्र शीर्षक (जैसे: ज्योतिष रत्न स्वर्ण पदक)"
                    className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    placeholder="जारीकर्ता (जैसे: अखिल भारतीय ज्योतिष संघ)"
                    className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={certYear}
                    onChange={(e) => setCertYear(e.target.value)}
                    placeholder="वर्ष (2026)"
                    className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center space-x-2">
                  <input
                    ref={certFileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setCertFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-white/70 file:mr-2 file:py-1.5 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:bg-[#D4AF37]/20 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/30 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    disabled={certUploading}
                    className="py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    {certUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* List of Certificates */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/80 block">
                सहेजे गए प्रमाण पत्र ({(profile?.certificates || []).length}):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile?.certificates || []).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[#050B18] border border-white/10 flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.file_type === 'pdf' ? (
                        <FileText className="w-6 h-6 text-[#FF9933]" />
                      ) : (
                        <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white truncate block">{c.title}</span>
                      <span className="text-[10px] text-white/60 block truncate">
                        {c.issuer} ({c.year})
                      </span>
                      <span className="text-[9px] text-[#D4AF37] font-mono block truncate">
                        {c.cloudinary_public_id}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCertificate(c.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/30 cursor-pointer"
                      title="हटाएँ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ACTIVITY LOGS & REPORT SUMMARY */}
        {activeTab === 'logs' && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-[#FF9933]" />
                  <span>गतिविधि लॉग व रिपोर्ट (Audit Activity Logs & Report)</span>
                </h3>
                <p className="text-[10px] text-white/50">
                  प्रोफाइल अद्यतन, इमेज अपलोड एवं क्लाउडिनरी सिंक की समय-वार जानकारी।
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#050B18]/70 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold">
                      {log.action}
                    </span>
                    <span className="text-white/90 font-medium">{log.details}</span>
                  </div>

                  <div className="text-right text-[10px] text-white/50">
                    <span className="block text-white/70">{log.performedBy}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Submit / Action Bar */}
        <div className="p-4 rounded-2xl bg-[#050B18]/90 border border-[#D4AF37]/30 flex items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/80 font-medium hidden sm:inline">
              क्लाउडिनरी लाइव ऑटो-सिंक सक्रिय
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 bg-gradient-to-r from-[#D4AF37] via-[#FF9933] to-[#B8860B] hover:from-[#e5bd47] hover:to-[#c79212] text-[#050B18] text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>सहेजा जा रहा है...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>प्रोफाइल सहेजें एवं क्लाउडिनरी सिंक करें</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
