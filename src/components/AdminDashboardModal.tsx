import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Upload, FileText, Users, DollarSign, CheckCircle2, XCircle, Search, Sparkles, RefreshCw, UserCheck } from 'lucide-react';
import { Booking } from '../types';
import { RajanProfileAdminTab } from './RajanProfileAdminTab';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'rajanProfile' | 'hero' | 'media'>('rajanProfile');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Media Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [folder, setFolder] = useState('gallery');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Hero Banner Management State
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroTitle, setHeroTitle] = useState('राजन कैथवास जी');
  const [heroSubtitle, setHeroSubtitle] = useState('वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन');
  const [heroTagline, setHeroTagline] = useState('प्राचीन वैदिक ज्ञान के माध्यम से आपके जीवन का सही मार्गदर्शन');
  const [currentHeroUrl, setCurrentHeroUrl] = useState('');
  const [currentHeroPublicId, setCurrentHeroPublicId] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroSuccessMsg, setHeroSuccessMsg] = useState('');

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchHeroBanner = async () => {
    try {
      const res = await fetch('/api/hero');
      const data = await res.json();
      if (data.success && data.hero) {
        setCurrentHeroUrl(data.hero.secure_url);
        setCurrentHeroPublicId(data.hero.public_id);
        setHeroTitle(data.hero.title || 'राजन कैथवास जी');
        setHeroSubtitle(data.hero.subtitle || 'वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन');
        setHeroTagline(data.hero.tagline || 'प्राचीन वैदिक ज्ञान के माध्यम से आपके जीवन का सही मार्गदर्शन');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchHeroBanner();
  }, []);

  const handleHeroUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroFile && !heroTitle) return;

    setUploadingHero(true);
    setHeroSuccessMsg('');
    try {
      if (heroFile) {
        const formData = new FormData();
        formData.append('file', heroFile);
        formData.append('title', heroTitle);
        formData.append('subtitle', heroSubtitle);
        formData.append('tagline', heroTagline);

        const res = await fetch('/api/hero/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.hero) {
          setCurrentHeroUrl(data.hero.secure_url);
          setCurrentHeroPublicId(data.hero.public_id);
          setHeroSuccessMsg('✓ Hero Banner uploaded to Cloudinary (folder: hero/) & saved in database! Old asset deleted.');
          setHeroFile(null);
          // Trigger a global reload event or page event so HeroSection refreshes
          window.dispatchEvent(new Event('heroBannerUpdated'));
        }
      } else {
        // Update text details only
        const res = await fetch('/api/hero', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: heroTitle,
            subtitle: heroSubtitle,
            tagline: heroTagline,
          }),
        });
        const data = await res.json();
        if (data.success && data.hero) {
          setHeroSuccessMsg('✓ Hero Banner text content updated successfully!');
          window.dispatchEvent(new Event('heroBannerUpdated'));
        }
      }
    } catch (err: any) {
      console.error(err);
      setHeroSuccessMsg('Failed to update Hero Banner.');
    } finally {
      setUploadingHero(false);
    }
  };


  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadedUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', folder);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.result) {
        setUploadedUrl(data.result.secure_url || data.result.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.clientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.serviceTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#050B18] border border-[#D4AF37]/40 text-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <LayoutDashboard className="w-6 h-6 text-[#FF9933]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37]">
                एडमिन नियंत्रण कक्ष (Admin Panel)
              </h2>
              <p className="text-xs text-white/50">आचार्य राजन कैथवास जी कार्यालय पोर्टल</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-2xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white/50 block">कुल परामर्श बुकिंग</span>
            <span className="text-xl font-serif font-bold text-[#D4AF37]">{bookings.length}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white/50 block">सकल राजस्व (Gross Revenue)</span>
            <span className="text-xl font-serif font-bold text-emerald-400">₹{totalRevenue}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white/50 block">लंबित पुष्टिकरण (Pending)</span>
            <span className="text-xl font-serif font-bold text-[#FF9933]">
              {bookings.filter((b) => b.status === 'pending').length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white/50 block">संपन्न परामर्श (Completed)</span>
            <span className="text-xl font-serif font-bold text-cyan-400">
              {bookings.filter((b) => b.status === 'completed').length}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10 space-x-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('rajanProfile')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'rajanProfile'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>राजन कैथवास जी प्रोफाइल</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            परामर्श बुकिंग प्रबंधन
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hero'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            मुख्य बैनर (Hero Settings)
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'media'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            क्लाउडिनरी मीडिया अपलोड
          </button>
        </div>

        {/* TAB 0: Rajan Profile Management */}
        {activeTab === 'rajanProfile' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <RajanProfileAdminTab />
          </div>
        )}


        {/* TAB 1: Bookings List */}
        {activeTab === 'bookings' && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#D4AF37]" />
                <input
                  type="text"
                  placeholder="Search by client name or Ref ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                onClick={fetchBookings}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[#D4AF37] font-serif">
                    <th className="p-3 border-b border-white/10">Ref ID</th>
                    <th className="p-3 border-b border-white/10">Client Name</th>
                    <th className="p-3 border-b border-white/10">Service</th>
                    <th className="p-3 border-b border-white/10">Date & Slot</th>
                    <th className="p-3 border-b border-white/10">Status</th>
                    <th className="p-3 border-b border-white/10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-[#D4AF37]">{b.bookingRef}</td>
                      <td className="p-3">
                        <span className="font-semibold text-white block">{b.clientName}</span>
                        <span className="text-[10px] text-white/50">{b.clientEmail} • {b.clientPhone}</span>
                      </td>
                      <td className="p-3 text-white/70">{b.serviceTitle}</td>
                      <td className="p-3 text-white/60">{b.date} ({b.timeSlot})</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : b.status === 'completed'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-[#FF9933]/20 text-[#FF9933]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                          className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded hover:bg-emerald-400 text-[10px] cursor-pointer"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                          className="px-2 py-1 bg-rose-500/20 text-rose-400 font-bold rounded hover:bg-rose-500/30 text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Hero Banner Settings */}
        {activeTab === 'hero' && (
          <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-[#FF9933]" />
                  Hero Banner Image & Overlay Content
                </h3>
                <p className="text-xs text-white/60">
                  Upload & replace the homepage hero banner (Saved in Cloudinary folder <code className="text-[#D4AF37]">hero/</code>).
                </p>
              </div>

              <span className="text-[10px] uppercase font-mono px-2.5 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full">
                Database Synced
              </span>
            </div>

            {/* Current Active Banner Preview */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                Current Active Hero Banner Preview
              </span>
              <div className="relative rounded-xl overflow-hidden h-44 sm:h-52 border border-white/10 group">
                <img
                  src={currentHeroUrl}
                  alt="Current Hero Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end text-white">
                  <h4 className="text-xl font-bold font-serif text-[#D4AF37]">{heroTitle}</h4>
                  <p className="text-xs text-white/90 font-medium">{heroSubtitle}</p>
                  <p className="text-[11px] text-white/70 italic mt-0.5">{heroTagline}</p>
                </div>
              </div>

              <div className="text-[11px] text-white/50 flex flex-wrap justify-between gap-2 pt-1 font-mono">
                <span>Public ID: <strong className="text-white">{currentHeroPublicId || 'hero/rajan_kaithwas_main'}</strong></span>
                <span className="break-all max-w-md truncate">URL: {currentHeroUrl}</span>
              </div>
            </div>

            {/* Replace / Upload Form */}
            <form onSubmit={handleHeroUpload} className="space-y-4 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Update / Replace Banner</h4>

              <div>
                <label className="block text-white/80 mb-1 font-medium">
                  Select New Banner Image File (Auto-stored in Cloudinary <code className="text-[#D4AF37]">hero/</code>)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHeroFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-[#050B18] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-[10px] text-white/50 mt-1">
                  Uploading a new image will automatically delete the old image asset from Cloudinary and overwrite the database reference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 mb-1 font-medium">Hero Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Rajan Kaithwas Ji"
                    className="w-full bg-[#050B18] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-1 font-medium">Hero Subtitle</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Vedic Astrology & Spiritual Guidance"
                    className="w-full bg-[#050B18] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-1 font-medium">Tagline</label>
                <input
                  type="text"
                  value={heroTagline}
                  onChange={(e) => setHeroTagline(e.target.value)}
                  placeholder="Guiding Your Life Through Ancient Vedic Wisdom."
                  className="w-full bg-[#050B18] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingHero}
                className="w-full py-3 rounded-full font-bold uppercase tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] via-[#FF9933] to-[#B8860B] disabled:opacity-50 cursor-pointer shadow-lg hover:scale-[1.01] transition-transform"
              >
                {uploadingHero ? 'Uploading to Cloudinary & Overwriting Database...' : 'Save & Replace Hero Banner'}
              </button>
            </form>

            {heroSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                {heroSuccessMsg}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Cloudinary Media Upload */}

        {activeTab === 'media' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center">
              <Upload className="w-5 h-5 mr-2 text-[#FF9933]" />
              Upload Photos / Certificates to Cloudinary
            </h3>

            <form onSubmit={handleMediaUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Target Cloudinary Folder</label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full bg-[#050B18] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="gallery">Gallery Photos</option>
                  <option value="certificates">Certificates</option>
                  <option value="blog">Blog Banner Images</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Choose Media File</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-3 rounded-full font-bold uppercase tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] disabled:opacity-50 cursor-pointer"
              >
                {uploading ? 'Uploading to Cloudinary Cloud...' : 'Upload Asset Now'}
              </button>
            </form>

            {uploadedUrl && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs space-y-2">
                <span className="font-bold block">✓ Media Upload Successful!</span>
                <span className="text-[11px] text-white/70 break-all block">{uploadedUrl}</span>
                <img src={uploadedUrl} alt="Uploaded" className="h-32 object-cover rounded-xl border border-white/10" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
