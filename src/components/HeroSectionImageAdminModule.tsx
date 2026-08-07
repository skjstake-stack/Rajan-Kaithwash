import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Crop,
  Sparkles,
  Image as ImageIcon,
  Shield,
  Layers,
  Sliders,
  Maximize2,
  Check,
  X,
  Clock,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move
} from 'lucide-react';
import { HeroSectionImage, AdminUser, PermissionAction } from '../types';

interface HeroSectionImageAdminModuleProps {
  adminUser: AdminUser;
  token: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  hasPermission?: (module: string, action: PermissionAction) => boolean;
}

export const HeroSectionImageAdminModule: React.FC<HeroSectionImageAdminModuleProps> = ({
  adminUser,
  token,
  showToast,
  hasPermission,
}) => {
  const [images, setImages] = useState<HeroSectionImage[]>([]);
  const [activeImage, setActiveImage] = useState<HeroSectionImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<'active' | 'disabled'>('active');

  // Replace Modal / Action State
  const [replacingItem, setReplacingItem] = useState<HeroSectionImage | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);

  // Preview Modal State
  const [previewModalImage, setPreviewModalImage] = useState<HeroSectionImage | null>(null);

  // Crop / Canvas Adjustment State
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [cropImageSource, setCropImageSource] = useState<string | null>(null);
  const [cropTargetItemId, setCropTargetItemId] = useState<string | number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetPos, setOffsetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Hero Section Images
  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero-section-images');
      const data = await res.json();
      if (res.ok && data.success) {
        setImages(data.images || []);
        setActiveImage(data.activeImage || null);
      } else {
        showToast(data.error || 'चित्र लोड करने में असमर्थ।', 'error');
      }
    } catch (err) {
      console.error('Error fetching hero section images:', err);
      showToast('चित्र लोड करने में कनेक्शन त्रुटि।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  // Dispatch update event so Home Page updates instantly
  const notifyHomepageUpdate = () => {
    window.dispatchEvent(new Event('heroSectionImageUpdated'));
  };

  // Handle File Selection for New Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload New Hero Image Handler
  const handleUploadNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('कृपया पहले एक चित्र फ़ाइल चुनें!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('status', initialStatus);

      const res = await fetch('/api/hero-section-images/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('हीरो इमेज क्लाउडिनरी (hero_section/) में सफलतापूर्वक अपलोड की गई!', 'success');
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchHeroImages();
        notifyHomepageUpdate();
      } else {
        showToast(data.error || 'अपलोड करने में असमर्थ।', 'error');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      showToast('इमेज अपलोड करते समय त्रुटि आई।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Replace File Selection
  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReplaceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplacePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Replacement Image
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingItem || !replaceFile) {
      showToast('कृपया एक नई प्रतिस्थापन इमेज चुनें!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', replaceFile);

      const res = await fetch(`/api/hero-section-images/${replacingItem.id}/replace`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('पुराने चित्र को क्लाउडिनरी से हटाकर नया चित्र रिप्लेस कर दिया गया!', 'success');
        setReplacingItem(null);
        setReplaceFile(null);
        setReplacePreview(null);
        if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
        fetchHeroImages();
        notifyHomepageUpdate();
      } else {
        showToast(data.error || 'रिप्लेस करने में असमर्थ।', 'error');
      }
    } catch (err: any) {
      console.error('Replace Error:', err);
      showToast('चित्र रिप्लेस करने में त्रुटि आई।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Enable / Disable Status Toggle Handler
  const handleToggleStatus = async (item: HeroSectionImage) => {
    const newStatus = item.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/hero-section-images/${item.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`चित्र की स्थिति बदलकर ${newStatus === 'active' ? 'एक्टिव' : 'डिसेबल्ड'} कर दी गई!`, 'success');
        fetchHeroImages();
        notifyHomepageUpdate();
      } else {
        showToast(data.error || 'स्थिति बदलने में विफल।', 'error');
      }
    } catch (err) {
      showToast('स्थिति बदलने में त्रुटि।', 'error');
    }
  };

  // Delete Hero Image Handler
  const handleDeleteImage = async (item: HeroSectionImage) => {
    if (!window.confirm(`क्या आप निश्चित रूप से इस हीरो इमेज को क्लाउडिनरी तथा डेटाबेस से हटाना चाहते हैं?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/hero-section-images/${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('इमेज क्लाउडिनरी तथा डेटाबेस (hero_section_images) से सफलतापूर्वक हटा दी गई!', 'success');
        fetchHeroImages();
        notifyHomepageUpdate();
      } else {
        showToast(data.error || 'इमेज हटाने में असमर्थ।', 'error');
      }
    } catch (err) {
      showToast('इमेज डिलीट करते समय त्रुटि आई।', 'error');
    }
  };

  // Open Crop / Position Adjustment Tool
  const openCropTool = (item: HeroSectionImage) => {
    setCropTargetItemId(item.id);
    setCropImageSource(item.image_url);
    setZoomLevel(1);
    setRotation(0);
    setOffsetPos({ x: 0, y: 0 });
    setShowCropModal(true);
  };

  // Apply Cropped / Canvas Image and upload back as replacement
  const applyCropAndSave = async () => {
    if (!canvasRef.current || !cropTargetItemId) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `hero_cropped_${Date.now()}.png`, { type: 'image/png' });

        setSubmitting(true);
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/hero-section-images/${cropTargetItemId}/replace`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast('कॉप / एडजस्ट किया गया चित्र रिप्लेस कर सहेजा गया!', 'success');
          setShowCropModal(false);
          fetchHeroImages();
          notifyHomepageUpdate();
        } else {
          showToast(data.error || 'चित्र सहेजने में विफल।', 'error');
        }
        setSubmitting(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('क्रॉप प्रक्रिया में त्रुटि आई।', 'error');
      setSubmitting(false);
    }
  };

  // Draw on Canvas when Crop Modal or Controls change
  useEffect(() => {
    if (!showCropModal || !cropImageSource || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cropImageSource;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2 + offsetPos.x, canvas.height / 2 + offsetPos.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoomLevel, zoomLevel);

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    };
  }, [showCropModal, cropImageSource, zoomLevel, rotation, offsetPos]);

  return (
    <div className="space-y-8 text-white font-sans">
      {/* Header Breadcrumb & Title */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#B8860B]/10 to-[#050B18] border border-[#D4AF37]/40 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
              <span>सामग्री प्रबंधन (Content Management)</span>
              <span>→</span>
              <span className="text-white">हीरो सेक्शन इमेज (Hero Section Image)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1.5 flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-[#D4AF37]" />
              होमपेज हीरो फ्रेम इमेज प्रबंधन
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-2xl">
              होमपेज हीरो सेक्शन में केवल स्थिर गोल फोटो बदली जाएगी। कुण्डली फ्रेम, बॉर्डर, ग्लो, बैकग्राउंड, शैडो, एनिमेशन तथा ग्लासमोर्फिज्म डिज़ाइन यथावत रहेगा।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchHeroImages}
              className="p-2.5 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
              title="रीफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="/#hero"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <span>लाइव हीरो सेक्शन देखें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Database & Cloudinary Metadata Badges */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-white/50 block">डेटाबेस तालिका:</span>
            <span className="font-mono text-[#D4AF37] font-bold">hero_section_images</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-white/50 block">क्लाउडिनरी फ़ोल्डर:</span>
            <span className="font-mono text-emerald-400 font-bold">hero_section/</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-white/50 block">कुल इमेज रिकॉर्ड्स:</span>
            <span className="font-mono text-white font-bold">{images.length}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
            <span className="text-white/50 block">एक्टिव डिस्प्ले इमेज:</span>
            <span className="font-mono text-[#FF9933] font-bold">
              {activeImage ? `#${activeImage.id}` : 'डिफ़ॉल्ट'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column = Upload Form, Right Column = Live Hero Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload New Hero Image Form */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
              <Upload className="w-5 h-5" /> नई हीरो इमेज अपलोड करें (Upload Hero Image)
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              Direct to hero_section/
            </span>
          </div>

          <form onSubmit={handleUploadNew} className="space-y-4">
            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/80">
                हीरो पोर्ट्रेट चित्र चुनें (Select Image):
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] bg-white/5 hover:bg-white/10 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
              >
                {filePreview ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-[#D4AF37] shadow-xl"
                    />
                    <p className="text-xs text-[#D4AF37] font-semibold">
                      {selectedFile?.name} ({(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <span className="text-[10px] text-white/60">बदलने के लिए यहाँ क्लिक करें</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37] group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-white">
                      यहाँ चित्र ड्रैग करें या क्लिक करके चुनें
                    </p>
                    <p className="text-[10px] text-white/50">
                      उच्च गुणवत्ता (JPG, PNG, WEBP) • स्वतः ही hero_section/ फ़ोल्डर में क्लाउडिनरी पर अपलोड होगा।
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Status Option */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/80">
                प्राथमिक स्थिति (Initial Status):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInitialStatus('active')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    initialStatus === 'active'
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>तुरंत एक्टिव करें (Active)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInitialStatus('disabled')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    initialStatus === 'disabled'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>डिसेबल्ड रखें (Disabled)</span>
                </button>
              </div>
            </div>

            {/* Submit Upload Button */}
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{submitting ? 'अपलोड हो रहा है...' : 'हीरो इमेज अपलोड एवं सहेजें (Save Image)'}</span>
            </button>
          </form>
        </div>

        {/* Live Active Hero Circular Frame Preview */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/40 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9933]" />
                लाइव हीरो फ्रेम प्रीव्यू (Live Frame Preview)
              </h3>
              <span className="text-[10px] text-white/60">वेबसाइट का वास्तविक लुक</span>
            </div>
            <p className="text-xs text-white/60 mt-2">
              नीचे देखें कि वर्तमान में एक्टिव हीरो इमेज कुण्डली फ्रेम, गोल्ड बॉर्डर एवं शैडो प्रभाव के साथ कैसी दिखती है:
            </p>
          </div>

          {/* Actual Website Hero Frame Mockup */}
          <div className="py-6 flex justify-center items-center bg-[#050B18] rounded-2xl border border-white/10 relative overflow-hidden my-auto shadow-inner">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#FF9933] shadow-[0_0_40px_rgba(212,175,55,0.45)]">
              <div className="w-full h-full rounded-full bg-[#050B18] p-2.5 relative overflow-hidden flex items-center justify-center">
                {/* Kundli SVG Background Frame */}
                <svg className="absolute inset-0 w-full h-full text-[#D4AF37]/30" viewBox="0 0 200 200">
                  <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="10" x2="190" y2="190" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="190" y1="10" x2="10" y2="190" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="100,10 190,100 100,190 10,100" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>

                {/* Dynamic Hero Image */}
                <img
                  src={activeImage?.image_url || '/rajan_kaithwas.svg'}
                  alt="Active Hero Preview"
                  className="w-full h-full object-cover rounded-full filter contrast-105 border-2 border-[#D4AF37]/60 relative z-10 shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/rajan_kaithwas.svg';
                  }}
                />

                {/* Floating Experience Badge */}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold px-3 py-1 rounded-xl shadow-2xl text-[10px] z-20 border border-[#D4AF37]">
                  <div className="text-center">
                    <span className="text-xs block font-extrabold leading-none">33+ Yrs</span>
                    <span className="text-[8px] text-[#050B18] font-semibold uppercase">Vedic Master</span>
                  </div>
                </div>

                {/* Floating Global Consultations Badge */}
                <div className="absolute -top-1 -left-1 bg-[#050B18]/90 border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-1 rounded-full shadow-2xl text-[9px] z-20 backdrop-blur-md">
                  <span className="font-bold text-white">50,000+</span> Consultations
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-white/60 block text-[10px]">सक्रिय इमेज पब्लिश आईडी:</span>
              <p className="font-mono text-[#D4AF37] font-semibold truncate max-w-[200px]">
                {activeImage?.cloudinary_public_id || 'hero_section/rajan_kaithwas_main'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
              ● लाइव सक्रिय (Active)
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section Images Table / Gallery Grid */}
      <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
              <Layers className="w-5 h-5" /> अपलोड किए गए हीरो इमेज संग्रह (Uploaded Hero Section Images)
            </h3>
            <p className="text-xs text-white/60">
              सभी अपलोड की गई इमेज की सूची। आप किसी भी चित्र को रिप्लेस (Replace), डिलीट (Delete), क्रॉप (Crop) या इनेबल/डिसेबल कर सकते हैं।
            </p>
          </div>
          <span className="text-xs text-white/50 font-mono">
            कुल: {images.length} फ़ाइलें
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-white/60 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span className="text-xs">हीरो इमेज डेटाबेस लोड हो रहा है...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="py-12 text-center text-white/50 border border-dashed border-white/15 rounded-2xl">
            <p className="text-sm font-semibold">कोई हीरो इमेज उपलब्ध नहीं है।</p>
            <p className="text-xs text-white/40 mt-1">ऊपर दिए गए फॉर्म से नई इमेज अपलोड करें।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item) => {
              const isActive = item.status === 'active';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl bg-white/5 border transition-all space-y-4 relative ${
                    isActive
                      ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-gradient-to-b from-[#D4AF37]/10 to-transparent'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Status Ribbon */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/10 text-white/50 border-white/15'
                      }`}
                    >
                      {isActive ? '● लाइव एक्टिव' : '○ डिसेबल्ड'}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      ID: #{item.id}
                    </span>
                  </div>

                  {/* Circular Preview Thumbnail inside Kundli Frame */}
                  <div className="flex justify-center my-2">
                    <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#D4AF37] to-[#FF9933] shadow-md">
                      <div className="w-full h-full rounded-full bg-[#050B18] p-1.5 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={item.image_url}
                          alt={`Hero Image ${item.id}`}
                          className="w-full h-full object-cover rounded-full filter contrast-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/rajan_kaithwas.svg';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-[11px] text-white/70 border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white/40">Public ID:</span>
                      <span className="font-mono text-[#D4AF37] truncate max-w-[150px]">
                        {item.cloudinary_public_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">अपलोड तिथि:</span>
                      <span>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('hi-IN') : 'हाल ही में'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                      title={isActive ? 'डिसेबल करें' : 'एक्टिव करें'}
                    >
                      {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      <span>{isActive ? 'डिसेबल' : 'एक्टिव बनाएँ'}</span>
                    </button>

                    {/* Replace Button */}
                    <button
                      onClick={() => setReplacingItem(item)}
                      className="py-2 px-2 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="रिप्लेस करें"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>रिप्लेस</span>
                    </button>

                    {/* Crop / Position Adjust Button */}
                    <button
                      onClick={() => openCropTool(item)}
                      className="py-2 px-2 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="क्रॉप / एडजस्ट करें"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>क्रॉप / एडजस्ट</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteImage(item)}
                      className="py-2 px-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="डिलीट करें"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाएँ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: REPLACE IMAGE MODAL */}
      {replacingItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#050B18] border border-[#D4AF37]/50 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> इमेज रिप्लेस करें (Replace Hero Image)
              </h3>
              <button
                onClick={() => {
                  setReplacingItem(null);
                  setReplaceFile(null);
                  setReplacePreview(null);
                }}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/70">
              इस क्रिया से वर्तमान में स्थित चित्र को क्लाउडिनरी (<span className="text-[#D4AF37] font-mono">{replacingItem.cloudinary_public_id}</span>) से हटा दिया जाएगा तथा उसके स्थान पर नया चित्र अपलोड होगा।
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div
                onClick={() => replaceFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] bg-white/5 rounded-2xl p-4 text-center cursor-pointer space-y-2"
              >
                {replacePreview ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={replacePreview}
                      alt="Replacement Preview"
                      className="w-28 h-28 rounded-full object-cover border-2 border-[#D4AF37]"
                    />
                    <p className="text-xs text-[#D4AF37] font-semibold">{replaceFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-[#D4AF37] mx-auto" />
                    <p className="text-xs font-semibold text-white">क्लिक करके नया प्रतिस्थापन चित्र चुनें</p>
                  </div>
                )}
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReplaceFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplacingItem(null);
                    setReplaceFile(null);
                    setReplacePreview(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={submitting || !replaceFile}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#050B18] font-bold text-xs uppercase disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {submitting ? 'रिप्लेस हो रहा है...' : 'रिप्लेस एवं सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CROP / CANVAS POSITION ADJUSTMENT MODAL */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#050B18] border border-[#D4AF37]/50 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Crop className="w-5 h-5" /> चित्र संरेखण एवं क्रॉप (Crop & Position Adjust)
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Canvas */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative border-2 border-[#D4AF37] rounded-3xl overflow-hidden bg-black shadow-2xl p-2">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-2xl bg-black" />
                {/* Overlay Circle Guide */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#D4AF37]/60 rounded-full m-8 flex items-center justify-center">
                  <span className="text-[10px] text-[#D4AF37] bg-black/70 px-2 py-0.5 rounded-full">
                    वृत्ताकार फ्रेम सीमा रेखा
                  </span>
                </div>
              </div>

              {/* Adjustment Controls */}
              <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                {/* Zoom Control */}
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-white/60" />
                  <span className="text-xs font-semibold w-16">ज़ूम (Zoom):</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="flex-1 accent-[#D4AF37] cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-[#D4AF37] font-mono w-10">{zoomLevel.toFixed(2)}x</span>
                </div>

                {/* Rotation Control */}
                <div className="flex items-center gap-3">
                  <RotateCw className="w-4 h-4 text-white/60" />
                  <span className="text-xs font-semibold w-16">घुमाव:</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="flex-1 accent-[#D4AF37] cursor-pointer"
                  />
                  <span className="text-xs text-[#D4AF37] font-mono w-10">{rotation}°</span>
                </div>

                {/* Position Shift Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-white/60 flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" /> स्थिति खिसकाएँ (Pan):
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOffsetPos((prev) => ({ ...prev, y: prev.y - 15 }))}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetPos((prev) => ({ ...prev, y: prev.y + 15 }))}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetPos((prev) => ({ ...prev, x: prev.x - 15 }))}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetPos((prev) => ({ ...prev, x: prev.x + 15 }))}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetPos({ x: 0, y: 0 })}
                      className="px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold"
                    >
                      रीसेट
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={applyCropAndSave}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#050B18] font-bold text-xs uppercase cursor-pointer shadow-lg hover:brightness-110"
              >
                {submitting ? 'सहेजा जा रहा है...' : 'क्रॉप लागू करें एवं सहेजें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
