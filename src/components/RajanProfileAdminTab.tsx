import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ZoomIn, ZoomOut, User, Sparkles, Image as ImageIcon } from 'lucide-react';
import { RajanProfile } from '../types';

export const RajanProfileAdminTab: React.FC = () => {
  const [profile, setProfile] = useState<RajanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState('राजन कैथवास जी');
  const [designation, setDesignation] = useState('वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक');
  const [shortBio, setShortBio] = useState('महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित २५+ वर्षों का प्रामाणिक अनुभव। ५०,०००+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Image & Crop State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rajan-profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setName(data.profile.name || 'राजन कैथवास जी');
        setDesignation(data.profile.designation || 'वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक');
        setShortBio(data.profile.short_bio || '');
        setStatus(data.profile.status || 'active');
        setPreviewUrl(data.profile.image_url || '/rajan_kaithwas.svg');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (selectedFile) {
        // Upload with file to Cloudinary rajan_profile/ folder
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', name);
        formData.append('designation', designation);
        formData.append('short_bio', shortBio);
        formData.append('status', status);

        const res = await fetch('/api/rajan-profile/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setPreviewUrl(data.profile.image_url);
          setSelectedFile(null);
          setMessage({
            type: 'success',
            text: '✓ प्रोफाइल चित्र क्लाउडिनरी (rajan_profile/) पर अपलोड हो गया एवं डेटाबेस में सहेज दिया गया!',
          });
          window.dispatchEvent(new Event('rajanProfileUpdated'));
        } else {
          throw new Error(data.error || 'अपलोड में त्रुटि आई');
        }
      } else {
        // Update text details only
        const res = await fetch('/api/rajan-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            designation,
            short_bio: shortBio,
            status,
          }),
        });

        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setMessage({
            type: 'success',
            text: '✓ प्रोफाइल जानकारी सफलतापूर्वक अपडेट हो गई!',
          });
          window.dispatchEvent(new Event('rajanProfileUpdated'));
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

  const handleDeleteImage = async () => {
    if (!window.confirm('क्या आप प्रोफाइल चित्र हटाकर डिफ़ॉल्ट फोटो सेट करना चाहते हैं?')) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/rajan-profile', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setPreviewUrl(data.profile.image_url);
        setSelectedFile(null);
        setMessage({
          type: 'success',
          text: '✓ प्रोफाइल चित्र हटा दिया गया एवं डिफ़ॉल्ट चित्र सेट हो गया!',
        });
        window.dispatchEvent(new Event('rajanProfileUpdated'));
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'चित्र हटाने में त्रुटि आई।' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#D4AF37] flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>प्रोफाइल डेटा लोड हो रहा है...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header breadcrumb & info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#FF9933] font-bold block">
            Content Management ➔ Rajan Kaithwas Ji Profile
          </span>
          <h3 className="text-lg font-serif font-bold text-[#D4AF37]">
            आचार्य राजन कैथवास जी प्रोफाइल प्रबंधन
          </h3>
        </div>
        <button
          onClick={fetchProfile}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 cursor-pointer text-xs flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>रिफ्रेश</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload, Zoom/Crop & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#D4AF37] flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-[#FF9933]" />
                <span>प्रोफाइल फोटो (Cloudinary: rajan_profile/)</span>
              </label>
              {profile?.cloudinary_public_id && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                  {profile.cloudinary_public_id}
                </span>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#050B18]/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs text-white/80 font-medium">
                नवीन फोटो यहाँ ड्रॉप करें अथवा ब्राउज करें
              </p>
              <p className="text-[10px] text-white/40 mt-1">
                PNG, JPG, WEBP, SVG • ऑटो q_auto, f_auto ऑप्टिमाइजेशन
              </p>
            </div>

            {/* Interactive Preview & Crop Zoom Frame */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>लाइव प्रीव्यू एवं क्रॉप एडजस्टमेंट:</span>
                <span className="text-[#D4AF37] font-semibold">{zoom}x Zoom</span>
              </div>

              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#FF9933] shadow-[0_0_30px_rgba(212,175,55,0.3)] overflow-hidden">
                <div className="w-full h-full rounded-full bg-[#050B18] p-2 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={previewUrl || '/rajan_kaithwas.svg'}
                    alt="Rajan Kaithwas Ji Preview"
                    className="w-full h-full object-cover rounded-full transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  />
                </div>
              </div>

              {/* Zoom & Rotate Controls */}
              <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
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

              {/* Action Buttons for Image */}
              <div className="flex items-center justify-between gap-2 pt-1">
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
                  onClick={handleDeleteImage}
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

        {/* Right Column: Name, Designation, Bio & Display Settings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            {/* Display Status Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#050B18]/60 border border-white/10">
              <div className="flex items-center space-x-2">
                {status === 'active' ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-white block">होमपेज पर प्रदर्शन (Display Status)</span>
                  <span className="text-[10px] text-white/50">
                    {status === 'active' ? 'सक्रिय (Home Page Hero में दिखेगा)' : 'निष्क्रिय (Home Page Hero से छिपेगा)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  status === 'active' ? 'bg-[#D4AF37]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#050B18] transition-transform ${
                    status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                नाम (Astrologer Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="राजन कैथवास जी"
                required
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Designation Input */}
            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                पद / उपाधि (Designation & Title)
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक"
                required
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Short Introduction TextArea */}
            <div>
              <label className="text-xs font-semibold text-[#D4AF37] block mb-1">
                संक्षिप्त परिचय (Short Introduction)
              </label>
              <textarea
                rows={4}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                placeholder="महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित २५+ वर्षों का प्रामाणिक अनुभव..."
                required
                className="w-full bg-[#050B18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Submit Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#e5bd47] hover:to-[#c79212] text-[#050B18] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>क्लाउडिनरी पर सहेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>प्रोफाइल सहेजें एवं क्लाउडिनरी पर अपलोड करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
