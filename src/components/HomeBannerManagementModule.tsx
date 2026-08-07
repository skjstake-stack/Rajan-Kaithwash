import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MousePointer,
  Sparkles,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Layers,
  Settings,
  Image as ImageIcon,
  Crop,
  ShieldAlert,
  BarChart2,
  Activity,
  Zap,
  Maximize2
} from 'lucide-react';
import { HomeBannerItem, HomeBannerSettings, AdminUser, PermissionAction } from '../types';

interface HomeBannerManagementModuleProps {
  adminUser: AdminUser;
  token: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  hasPermission: (module: string, action: PermissionAction) => boolean;
}

export const HomeBannerManagementModule: React.FC<HomeBannerManagementModuleProps> = ({
  adminUser,
  token,
  showToast,
  hasPermission,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'banners' | 'settings' | 'reports' | 'logs'>('banners');
  
  // Data State
  const [banners, setBanners] = useState<HomeBannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Stats
  const [stats, setStats] = useState<{
    totalBanners: number;
    activeBannersCount: number;
    scheduledBanners: number;
    draftBanners: number;
    totalViews: number;
    totalClicks: number;
    lastUpdatedBanner?: HomeBannerItem | null;
  }>({
    totalBanners: 0,
    activeBannersCount: 0,
    scheduledBanners: 0,
    draftBanners: 0,
    totalViews: 0,
    totalClicks: 0,
    lastUpdatedBanner: null,
  });

  // Settings State
  const [settings, setSettings] = useState<HomeBannerSettings>({
    autoRotation: true,
    sliderMode: 'auto',
    autoRotationIntervalSec: 5,
    overlayOpacity: 50,
    textAlignment: 'left',
    darkOverlay: true,
    animationEffect: 'fade',
  });

  // Activity Logs
  const [logs, setLogs] = useState<Array<{
    id: string;
    action: string;
    bannerTitle: string;
    createdBy: string;
    timestamp: string;
    details?: string;
  }>>([]);

  // Modal Controls
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<HomeBannerItem | null>(null);

  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewBanner, setPreviewBanner] = useState<HomeBannerItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [cropTarget, setCropTarget] = useState<'hero' | 'mobile'>('hero');
  const [cropRatio, setCropRatio] = useState<string>('16:9');

  // Form Fields
  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    description: string;
    hero_image_url: string;
    mobile_image_url: string;
    cloudinary_public_id: string;
    button_text: string;
    button_url: string;
    second_button_text: string;
    second_button_url: string;
    status: 'active' | 'draft' | 'scheduled';
    display_order: number;
    start_date: string;
    end_date: string;
  }>({
    title: '',
    subtitle: '',
    description: '',
    hero_image_url: '',
    mobile_image_url: '',
    cloudinary_public_id: '',
    button_text: 'परामर्श बुक करें',
    button_url: '#booking',
    second_button_text: 'WhatsApp परामर्श',
    second_button_url: 'https://wa.me/918319885134',
    status: 'active',
    display_order: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '2028-12-31',
  });

  // Fetch Banners from API
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchQuery) query.append('search', searchQuery);
      if (statusFilter !== 'all') query.append('status', statusFilter);

      const res = await fetch(`/api/home-banner?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        setBanners(data.banners || []);
        if (data.settings) setSettings(data.settings);
        if (data.stats) setStats(data.stats);
        if (data.logs) setLogs(data.logs);
      } else {
        showToast(data.error || 'होम बैनर लोड करने में विफल।', 'error');
      }
    } catch (err) {
      console.error('Fetch home banners error:', err);
      showToast('सर्वर से जुड़ने में त्रुटि।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [statusFilter]);

  // Handle Search Debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBanners();
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    if (!hasPermission('home_banner', 'create')) {
      showToast('आपको बैनर बनाने की अनुमति नहीं है।', 'error');
      return;
    }
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      hero_image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1600&q=80',
      mobile_image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
      cloudinary_public_id: `hero/banner_${Date.now()}`,
      button_text: 'परामर्श बुक करें',
      button_url: '#booking',
      second_button_text: 'WhatsApp परामर्श',
      second_button_url: 'https://wa.me/918319885134',
      status: 'active',
      display_order: banners.length + 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2028-12-31',
    });
    setShowFormModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (banner: HomeBannerItem) => {
    if (!hasPermission('home_banner', 'edit')) {
      showToast('आपको बैनर संपादित करने की अनुमति नहीं है।', 'error');
      return;
    }
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      hero_image_url: banner.hero_image_url || '',
      mobile_image_url: banner.mobile_image_url || banner.hero_image_url || '',
      cloudinary_public_id: banner.cloudinary_public_id || '',
      button_text: banner.button_text || '',
      button_url: banner.button_url || '',
      second_button_text: banner.second_button_text || '',
      second_button_url: banner.second_button_url || '',
      status: banner.status || 'active',
      display_order: banner.display_order || 1,
      start_date: banner.start_date || new Date().toISOString().split('T')[0],
      end_date: banner.end_date || '2028-12-31',
    });
    setShowFormModal(true);
  };

  // Process File Upload with 10MB limit and format validation
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'hero' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB)
    const maxSizeMb = 10;
    if (file.size > maxSizeMb * 1024 * 1024) {
      showToast(`फाइल साइज़ ${maxSizeMb}MB से कम होना चाहिए।`, 'error');
      return;
    }

    // Check allowed formats (JPG, JPEG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('केवल JPG, JPEG, PNG एवं WEBP फॉर्मैट समर्थित हैं।', 'error');
      return;
    }

    // Convert file to Base64 data URL for instant Cloudinary preview/upload
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
      const generatedPublicId = `hero/${cleanName}_${Date.now()}`;

      if (targetField === 'hero') {
        setFormData(prev => ({
          ...prev,
          hero_image_url: base64Url,
          cloudinary_public_id: generatedPublicId,
          mobile_image_url: prev.mobile_image_url || base64Url,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          mobile_image_url: base64Url,
        }));
      }
      showToast('इमेज लोड हो गई एवं Cloudinary (hero/) फ़ोल्डर में सिंक हेतु तैयार है!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop upload handler
  const handleDropUpload = (e: React.DragEvent<HTMLDivElement>, targetField: 'hero' | 'mobile') => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageFileUpload(fakeEvent, targetField);
    }
  };

  // Submit Banner Form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('कृपया बैनर शीर्षक दर्ज करें।', 'error');
      return;
    }
    if (!formData.hero_image_url.trim()) {
      showToast('कृपया मुख्य हीरो बैनर इमेज चुनें या URL दर्ज करें।', 'error');
      return;
    }

    try {
      const url = editingBanner ? `/api/home-banner/${editingBanner.id}` : '/api/home-banner';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by: adminUser.name || 'पं. राजन कैथवास',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'बैनर सफलतापूर्वक सहेजा गया!', 'success');
        setShowFormModal(false);
        fetchBanners();
        // Trigger event to notify HeroSection component
        window.dispatchEvent(new Event('heroBannerUpdated'));
      } else {
        showToast(data.error || 'बैनर सहेजने में विफल।', 'error');
      }
    } catch (err) {
      console.error('Submit banner error:', err);
      showToast('बैनर सेव करने में त्रुटि।', 'error');
    }
  };

  // Toggle Banner Status (Active / Draft / Scheduled)
  const handleToggleStatus = async (banner: HomeBannerItem, newStatus: 'active' | 'draft' | 'scheduled') => {
    if (!hasPermission('home_banner', 'publish')) {
      showToast('आपको बैनर स्टेटस बदलने की अनुमति नहीं है।', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/home-banner/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`बैनर स्थिति '${newStatus}' में परिवर्तित की गई।`, 'success');
        fetchBanners();
        window.dispatchEvent(new Event('heroBannerUpdated'));
      } else {
        showToast(data.error || 'स्टेटस बदलने में विफल।', 'error');
      }
    } catch (err) {
      showToast('सर्वर त्रुटि।', 'error');
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (banner: HomeBannerItem) => {
    if (!hasPermission('home_banner', 'delete')) {
      showToast('आपको बैनर हटाने की अनुमति नहीं है।', 'error');
      return;
    }
    if (!window.confirm(`क्या आप बैनर "${banner.title}" को निश्चित ही हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/home-banner/${banner.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('बैनर हटा दिया गया एवं Cloudinary से साफ़ किया गया।', 'success');
        fetchBanners();
        window.dispatchEvent(new Event('heroBannerUpdated'));
      } else {
        showToast(data.error || 'बैनर हटाने में विफल।', 'error');
      }
    } catch (err) {
      showToast('हटाने में त्रुटि।', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('home_banner', 'manage_settings')) {
      showToast('आपको सेटिंग्स बदलने का अधिकार नहीं है।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/home-banner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('बैनर सेटिंग्स सफलतापूर्वक सहेजी गईं!', 'success');
        if (data.settings) setSettings(data.settings);
        window.dispatchEvent(new Event('heroBannerUpdated'));
      } else {
        showToast(data.error || 'सेटिंग्स सेव करने में विफल।', 'error');
      }
    } catch (err) {
      showToast('सेटिंग्स सेव करने में त्रुटि।', 'error');
    }
  };

  // Export Reports
  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Banner ID,Title,Status,Display Order,Views,Clicks,Created By,Start Date,End Date\n' +
      banners
        .map(
          b =>
            `"${b.id}","${b.title}","${b.status}","${b.display_order}","${b.views || 0}","${b.clicks || 0}","${
              b.created_by || ''
            }","${b.start_date || ''}","${b.end_date || ''}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Home_Banners_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('होम बैनर रिपोर्ट एक्सेल (CSV) में एक्सपोर्ट की गई।', 'success');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1">
            <Sliders className="w-4 h-4" />
            <span>एडमिन पैनल • वेबसाइट कंटेंट</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            होम बैनर प्रबंधन (Home Banner Management)
          </h1>
          <p className="text-xs text-white/60 mt-1">
            वेबसाइट के मुख्य होमपेज स्लाइडर, हीरो इमेज, टेक्स्ट, कॉल-टू-एक्शन एवं क्लाउडिनरी सिंक कंट्रोल।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {hasPermission('home_banner', 'create') && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>नया बैनर जोड़ें</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Banners */}
        <div className="p-4 rounded-2xl bg-[#030712]/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>कुल बैनर</span>
            <Layers className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-serif font-bold text-white mt-2">{stats.totalBanners}</p>
          <span className="text-[10px] text-white/40 mt-1">डेटाबेस रिकॉर्ड्स</span>
        </div>

        {/* Active Banners */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>सक्रिय (Active)</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-300 mt-2">{stats.activeBannersCount}</p>
          <span className="text-[10px] text-emerald-400/60 mt-1">होमपेज पर प्रदर्शित</span>
        </div>

        {/* Scheduled Banners */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>अनुसूचित</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-amber-300 mt-2">{stats.scheduledBanners}</p>
          <span className="text-[10px] text-amber-400/60 mt-1">तय तिथि पर प्रकाशित</span>
        </div>

        {/* Draft Banners */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>ड्राफ्ट</span>
            <FileText className="w-4 h-4 text-white/50" />
          </div>
          <p className="text-2xl font-serif font-bold text-white/90 mt-2">{stats.draftBanners}</p>
          <span className="text-[10px] text-white/40 mt-1">अप्रकाशित</span>
        </div>

        {/* Total Views */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-cyan-400">
            <span>कुल व्यूज</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-cyan-300 mt-2">{stats.totalViews}</p>
          <span className="text-[10px] text-cyan-400/60 mt-1">इम्प्रेशन संख्या</span>
        </div>

        {/* Total Clicks */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-purple-400">
            <span>कुल क्लिक्स</span>
            <MousePointer className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-purple-300 mt-2">{stats.totalClicks}</p>
          <span className="text-[10px] text-purple-400/60 mt-1">सीटीए बटन सहभागिता</span>
        </div>

        {/* Last Updated */}
        <div className="p-4 rounded-2xl bg-[#030712]/80 border border-white/10 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>अंतिम अपडेट</span>
            <Activity className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-xs font-semibold text-[#D4AF37] mt-2 truncate">
            {stats.lastUpdatedBanner ? stats.lastUpdatedBanner.title : 'N/A'}
          </p>
          <span className="text-[10px] text-white/40 mt-1">
            {stats.lastUpdatedBanner?.updated_at
              ? new Date(stats.lastUpdatedBanner.updated_at).toLocaleDateString('hi-IN')
              : '-'}
          </span>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'banners'
              ? 'bg-[#D4AF37] text-[#050B18] shadow-lg font-bold'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>बैनर सूची (Banners List)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-[#D4AF37] text-[#050B18] shadow-lg font-bold'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>बैनर सेटिंग्स (Slider & Rotation)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'reports'
              ? 'bg-[#D4AF37] text-[#050B18] shadow-lg font-bold'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>परफॉर्मेंस रिपोर्ट्स (Reports & Analytics)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-[#D4AF37] text-[#050B18] shadow-lg font-bold'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>गतिविधि लॉग्स (Activity Logs)</span>
        </button>
      </div>

      {/* SUB-TAB 1: BANNERS LIST */}
      {activeSubTab === 'banners' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="बैनर शीर्षक, सबटायटल खोजें..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>फ़िल्टर:</span>
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all" className="bg-[#050B18]">सभी स्टेटस</option>
                <option value="active" className="bg-[#050B18]">सक्रिय (Active)</option>
                <option value="scheduled" className="bg-[#050B18]">अनुसूचित (Scheduled)</option>
                <option value="draft" className="bg-[#050B18]">ड्राफ्ट (Draft)</option>
              </select>
            </div>
          </div>

          {/* Banners Table */}
          <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-white/60 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
                <p className="text-xs">बैनर डेटा लोड हो रहा है...</p>
              </div>
            ) : banners.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-white/20" />
                <p className="text-sm font-semibold text-white/70">कोई बैनर उपलब्ध नहीं है।</p>
                <p className="text-xs text-white/40">नया होम बैनर जोड़ने के लिए ऊपर दिए गए 'नया बैनर जोड़ें' बटन पर क्लिक करें।</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-[#D4AF37]">
                    <th className="py-3 px-3">बैनर प्रीव्यू</th>
                    <th className="py-3 px-3">शीर्षक एवं विवरण</th>
                    <th className="py-3 px-3">सीटीए बटन</th>
                    <th className="py-3 px-3">स्टेटस</th>
                    <th className="py-3 px-3">क्रम (Order)</th>
                    <th className="py-3 px-3">सक्रियता अवधि</th>
                    <th className="py-3 px-3">निर्माता</th>
                    <th className="py-3 px-3">अपडेट तिथि</th>
                    <th className="py-3 px-3 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-white/90">
                  {banners.map(banner => (
                    <tr key={banner.id} className="hover:bg-white/5 transition-colors">
                      {/* Banner Preview */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => {
                            setPreviewBanner(banner);
                            setShowPreviewModal(true);
                          }}
                          className="relative w-28 h-16 rounded-xl overflow-hidden border border-white/15 bg-black/40 group cursor-pointer"
                        >
                          <img
                            src={banner.hero_image_url}
                            alt={banner.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Title & Subtitle */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-bold text-white text-sm line-clamp-1">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-[11px] text-[#D4AF37] line-clamp-1">{banner.subtitle}</p>
                        )}
                        <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                          Folder: {banner.cloudinary_public_id || 'hero/'}
                        </p>
                      </td>

                      {/* Button Text */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-[10px] font-semibold">
                          {banner.button_text || 'परामर्श'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {banner.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            सक्रिय
                          </span>
                        )}
                        {banner.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 rounded-full text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            अनुसूचित
                          </span>
                        )}
                        {banner.status === 'draft' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/20 text-white/70 rounded-full text-[10px] font-semibold">
                            ड्राफ्ट
                          </span>
                        )}
                      </td>

                      {/* Display Order */}
                      <td className="py-3 px-3 font-bold text-[#D4AF37]">
                        #{banner.display_order}
                      </td>

                      {/* Start/End Date */}
                      <td className="py-3 px-3 text-[11px] text-white/70">
                        <div>{banner.start_date || 'असीमित'}</div>
                        <div className="text-white/40">से {banner.end_date || 'असीमित'}</div>
                      </td>

                      {/* Created By */}
                      <td className="py-3 px-3 text-[11px] text-white/70">
                        {banner.created_by || 'एडमिन'}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-3 text-[10px] text-white/50">
                        {banner.updated_at
                          ? new Date(banner.updated_at).toLocaleDateString('hi-IN')
                          : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right space-x-1">
                        {/* Preview */}
                        <button
                          onClick={() => {
                            setPreviewBanner(banner);
                            setShowPreviewModal(true);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-white/80 transition-colors cursor-pointer"
                          title="लाइव प्रीव्यू"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        {hasPermission('home_banner', 'edit') && (
                          <button
                            onClick={() => handleOpenEditModal(banner)}
                            className="p-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Toggle Status */}
                        {hasPermission('home_banner', 'publish') && (
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                banner,
                                banner.status === 'active' ? 'draft' : 'active'
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              banner.status === 'active'
                                ? 'bg-emerald-950/80 text-emerald-400 hover:bg-emerald-900'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                            title={banner.status === 'active' ? 'अप्रकाशित करें' : 'प्रकाशित करें'}
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        {hasPermission('home_banner', 'delete') && (
                          <button
                            onClick={() => handleDeleteBanner(banner)}
                            className="p-1.5 bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 rounded-lg transition-colors cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SETTINGS (SLIDER & ROTATION) */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="text-base font-serif font-bold text-white">होम बैनर स्लाइडर एवं डिस्प्ले सेटिंग्स</h3>
              <p className="text-xs text-white/60">ऑटो-रोटेशन, स्लाइडर मोड, ओवरले रंग एवं एनिमिनेशन इफ़ेक्ट बदलें।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Rotation Toggle */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>ऑटो रोटेशन (Auto Rotation)</span>
                <input
                  type="checkbox"
                  checked={settings.autoRotation}
                  onChange={e => setSettings(prev => ({ ...prev, autoRotation: e.target.checked }))}
                  className="w-4 h-4 accent-[#D4AF37]"
                />
              </label>
              <p className="text-[11px] text-white/50">सक्रिय बैनरों को स्वतः बदलें।</p>
            </div>

            {/* Slider Mode */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white">स्लाइडर मोड (Slider Mode)</label>
              <select
                value={settings.sliderMode}
                onChange={e => setSettings(prev => ({ ...prev, sliderMode: e.target.value as any }))}
                className="w-full p-2.5 bg-[#050B18] border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="auto">ऑटो स्लाइडर (Auto Slider)</option>
                <option value="manual">मैनुअल स्लाइडर (Manual Slider)</option>
                <option value="disabled">स्लाइडर बंद (Single Banner Mode)</option>
              </select>
            </div>

            {/* Auto Rotation Interval */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white">
                स्लाइड बदलने का अंतराल (Seconds): {settings.autoRotationIntervalSec}s
              </label>
              <input
                type="range"
                min={2}
                max={20}
                value={settings.autoRotationIntervalSec}
                onChange={e => setSettings(prev => ({ ...prev, autoRotationIntervalSec: Number(e.target.value) }))}
                className="w-full accent-[#D4AF37]"
              />
            </div>

            {/* Overlay Opacity */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white">
                डार्क ओवरले ओपेसिटी (Overlay Opacity): {settings.overlayOpacity}%
              </label>
              <input
                type="range"
                min={0}
                max={90}
                value={settings.overlayOpacity}
                onChange={e => setSettings(prev => ({ ...prev, overlayOpacity: Number(e.target.value) }))}
                className="w-full accent-[#D4AF37]"
              />
            </div>

            {/* Text Alignment */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white">टेक्स्ट अलाइनमेंट (Text Alignment)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    type="button"
                    key={align}
                    onClick={() => setSettings(prev => ({ ...prev, textAlignment: align }))}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      settings.textAlignment === align
                        ? 'bg-[#D4AF37] text-[#050B18] border-[#D4AF37] font-bold'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {align === 'left' ? 'बायें (Left)' : align === 'center' ? 'मध्य (Center)' : 'दाएँ (Right)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Effect */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-white">एनिमेशन इफ़ेक्ट (Animation Effect)</label>
              <select
                value={settings.animationEffect}
                onChange={e => setSettings(prev => ({ ...prev, animationEffect: e.target.value as any }))}
                className="w-full p-2.5 bg-[#050B18] border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="fade">स्मूथ फ़ेड (Smooth Fade)</option>
                <option value="slide">हॉरिजॉन्टल स्लाइड (Slide)</option>
                <option value="zoom">ज़ूम इन/आउट (Zoom)</option>
                <option value="none">कोई एनिमेशन नहीं</option>
              </select>
            </div>
          </div>

          {hasPermission('home_banner', 'manage_settings') && (
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                सेटिंग्स सहेजें
              </button>
            </div>
          )}
        </form>
      )}

      {/* SUB-TAB 3: REPORTS & ANALYTICS */}
      {activeSubTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-white">होम बैनर परफॉर्मेंस एवं क्लिक रिपोर्ट</h3>
              <p className="text-xs text-white/60">व्यूज, क्लिक-थ्रू-रेट (CTR) एवं सीटीए बटन सहभागिता डेटा।</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>एक्सेल (Excel)</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट / PDF</span>
              </button>
            </div>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">कुल होमपेज इम्प्रेशन्स</span>
              <p className="text-3xl font-serif font-bold text-[#D4AF37] mt-1">{stats.totalViews}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">कुल सीटीए क्लिक्स</span>
              <p className="text-3xl font-serif font-bold text-emerald-400 mt-1">{stats.totalClicks}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">औसत CTR (क्लिक दर)</span>
              <p className="text-3xl font-serif font-bold text-purple-400 mt-1">
                {stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Banner Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-[#D4AF37]">
                  <th className="py-2.5 px-3">बैनर</th>
                  <th className="py-2.5 px-3">स्टेटस</th>
                  <th className="py-2.5 px-3">व्यूज (Views)</th>
                  <th className="py-2.5 px-3">क्लिक्स (Clicks)</th>
                  <th className="py-2.5 px-3">CTR (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/90">
                {banners.map(b => {
                  const views = b.views || 0;
                  const clicks = b.clicks || 0;
                  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={b.id}>
                      <td className="py-2.5 px-3 font-semibold text-white">{b.title}</td>
                      <td className="py-2.5 px-3 capitalize">{b.status}</td>
                      <td className="py-2.5 px-3 font-mono">{views}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{clicks}</td>
                      <td className="py-2.5 px-3 font-mono text-[#D4AF37]">{ctr}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ACTIVITY LOGS */}
      {activeSubTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-serif font-bold text-white">होम बैनर गतिविधि लॉग्स (Audit Trail)</h3>
            <p className="text-xs text-white/60">बैनर प्रकाशन, संपादन, विलोपन एवं अपडेट का संपूर्ण इतिहास।</p>
          </div>

          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-xs text-white/40 py-8 text-center">कोई एक्टिविटी लॉग रिकॉर्ड उपलब्ध नहीं है।</p>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#D4AF37]">{log.action}</span>
                    <p className="text-white font-medium">{log.bannerTitle}</p>
                    {log.details && <p className="text-[10px] text-white/40">{log.details}</p>}
                  </div>
                  <div className="text-right text-[11px] text-white/50 space-y-0.5">
                    <div>{log.createdBy}</div>
                    <div className="text-[10px] text-white/30">{log.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT BANNER */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#050B18] border border-white/15 rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-serif font-bold text-white">
                  {editingBanner ? 'होम बैनर संपादित करें (Edit Banner)' : 'नया होम बैनर जोड़ें (Create Banner)'}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 text-white/60 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5 text-xs text-white/90">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/80">बैनर शीर्षक (Banner Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: राजन कैथवास (मंटू)"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white mt-1 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">उप-शीर्षक (Subtitle)</label>
                  <input
                    type="text"
                    placeholder="उदा: वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white mt-1 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-white/80">विवरण (Description / Tagline)</label>
                <textarea
                  rows={2}
                  placeholder="उदा: महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित 33+ वर्षों का प्रामाणिक अनुभव..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white mt-1 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Hero Image Upload / URL (With Cloudinary folder hero/) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>डेस्कटॉप हीरो बैनर इमेज (Hero Image - Cloudinary Folder: hero/) *</span>
                  </label>
                  <span className="text-[10px] text-white/40">मैक्स 10 MB (JPG, PNG, WEBP)</span>
                </div>

                {/* Drag & Drop Box */}
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDropUpload(e, 'hero')}
                  className="border-2 border-dashed border-white/20 hover:border-[#D4AF37]/60 rounded-2xl p-4 text-center transition-all bg-black/20"
                >
                  <Upload className="w-6 h-6 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-xs font-medium text-white/80">फाइल यहाँ ड्रैग व ड्रॉप करें अथवा क्लिक कर चुनें</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={e => handleImageFileUpload(e, 'hero')}
                    className="mt-2 text-xs text-white/60 cursor-pointer block mx-auto"
                  />
                </div>

                {/* Or Direct Image URL */}
                <div className="pt-2">
                  <label className="text-[11px] text-white/60">अथवा सीधे इमेज URL दर्ज करें:</label>
                  <input
                    type="text"
                    placeholder="https://res.cloudinary.com/..."
                    value={formData.hero_image_url}
                    onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1"
                  />
                </div>

                {/* Preview Box */}
                {formData.hero_image_url && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 mt-2 bg-black">
                    <img src={formData.hero_image_url} alt="Hero Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-[10px] text-[#D4AF37] rounded">
                      Hero Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Image Upload / URL */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>मोबाइल बैनर इमेज (Mobile Banner Image - Optional)</span>
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={e => handleImageFileUpload(e, 'mobile')}
                  className="text-xs text-white/60 cursor-pointer block"
                />

                <input
                  type="text"
                  placeholder="मोबाइल बैनर URL (खाली छोड़ने पर डेस्कटॉप इमेज का उपयोग होगा)"
                  value={formData.mobile_image_url}
                  onChange={e => setFormData({ ...formData, mobile_image_url: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              {/* Buttons Row Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/80">बटन 1 टेक्स्ट (Button Text)</label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">बटन 1 URL</label>
                  <input
                    type="text"
                    value={formData.button_url}
                    onChange={e => setFormData({ ...formData, button_url: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">द्वितीय बटन टेक्स्ट (Second Button Text)</label>
                  <input
                    type="text"
                    value={formData.second_button_text}
                    onChange={e => setFormData({ ...formData, second_button_text: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">द्वितीय बटन URL</label>
                  <input
                    type="text"
                    value={formData.second_button_url}
                    onChange={e => setFormData({ ...formData, second_button_url: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white mt-1"
                  />
                </div>
              </div>

              {/* Status & Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/80">स्टेटस (Status)</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-[#050B18] border border-white/15 rounded-xl text-white mt-1"
                  >
                    <option value="active">सक्रिय (Active)</option>
                    <option value="scheduled">अनुसूचित (Scheduled)</option>
                    <option value="draft">ड्राफ्ट (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">प्रदर्शन क्रम (Display Order)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">प्रारंभ तिथि (Start Date)</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/15 rounded-xl text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  {editingBanner ? 'बैनर अपडेट करें' : 'बैनर सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LIVE PREVIEW MODAL (DESKTOP / MOBILE RESPONSIVE PREVIEW) */}
      {showPreviewModal && previewBanner && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#050B18] border border-white/15 rounded-3xl max-w-5xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-serif font-bold text-white">
                  लाइव बैनर प्रीव्यू: {previewBanner.title}
                </h3>
              </div>

              {/* Desktop / Mobile Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-[#D4AF37] text-[#050B18] font-bold'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>डेस्कटॉप</span>
                </button>

                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-[#D4AF37] text-[#050B18] font-bold'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>मोबाइल</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg bg-white/5 cursor-pointer ml-2"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulated Live Website Header + Banner */}
            <div
              className={`mx-auto rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative transition-all bg-[#050B18] ${
                previewDevice === 'mobile' ? 'max-w-sm h-[580px]' : 'w-full h-[420px]'
              }`}
            >
              {/* Image */}
              <img
                src={
                  previewDevice === 'mobile' && previewBanner.mobile_image_url
                    ? previewBanner.mobile_image_url
                    : previewBanner.hero_image_url
                }
                alt={previewBanner.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dark Overlay according to opacity setting */}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: settings.overlayOpacity / 100 }}
              />

              {/* Banner Text Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white space-y-3">
                <span className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full text-[10px] font-bold self-start">
                  {previewBanner.subtitle || 'वैदिक ज्योतिष एवं महायज्ञ'}
                </span>
                <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">
                  {previewBanner.title}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg">
                  {previewBanner.description}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={previewBanner.button_url || '#'}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs rounded-full shadow-lg"
                  >
                    {previewBanner.button_text || 'परामर्श बुक करें'}
                  </a>
                  {previewBanner.second_button_text && (
                    <a
                      href={previewBanner.second_button_url || '#'}
                      className="px-5 py-2.5 bg-white/10 border border-white/20 text-white font-bold text-xs rounded-full"
                    >
                      {previewBanner.second_button_text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
