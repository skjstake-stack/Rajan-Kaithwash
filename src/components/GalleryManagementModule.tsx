import React, { useState, useEffect, useRef } from 'react';
import {
  AdminUser,
  PermissionAction,
  GalleryCategory,
  GalleryAlbum,
  GalleryMediaItem,
} from '../types';
import {
  Image,
  Video,
  Folder,
  FolderPlus,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Copy,
  Eye,
  ZoomIn,
  UploadCloud,
  CheckCircle2,
  Tag,
  BarChart3,
  FileSpreadsheet,
  Printer,
  FileText,
  X,
  Grid,
  List,
  Lock,
  Unlock,
  Cloud,
  Sparkles,
  Layers,
  MoveRight,
  RefreshCw,
  Clock,
  HardDrive,
  Share2,
  Sliders,
  Check,
  AlertCircle,
  Play,
  Film,
  Crop,
} from 'lucide-react';

interface GalleryManagementModuleProps {
  adminUser?: AdminUser;
  token?: string;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  hasPermission?: (module?: string, action?: PermissionAction) => boolean;
}

interface GalleryActivityLogItem {
  id: string;
  action: 'Upload' | 'Edit' | 'Delete' | 'Replace' | 'Download' | 'Move Album';
  mediaTitle: string;
  user: string;
  timestamp: string;
  details?: string;
}

export const GalleryManagementModule: React.FC<GalleryManagementModuleProps> = ({
  adminUser,
  token,
  showToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {},
  hasPermission = (_module?: string, _action?: PermissionAction) => true,
}) => {
  // Navigation Tabs: 'dashboard' | 'media' | 'albums' | 'categories' | 'upload' | 'reports' | 'logs'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'media' | 'albums' | 'categories' | 'upload' | 'reports' | 'logs'>('dashboard');

  // View Mode: 'grid' | 'table' | 'album-detail'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected Album for detail view
  const [selectedAlbumTitle, setSelectedAlbumTitle] = useState<string | null>(null);

  // Gallery Data States
  const [mediaList, setMediaList] = useState<GalleryMediaItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Stats State
  const [stats, setStats] = useState({
    totalImages: 0,
    totalVideos: 0,
    totalAlbums: 0,
    totalCategories: 0,
    storageUsedMb: 0,
    cloudinaryStorageMb: 0,
    recentlyUploaded: [] as GalleryMediaItem[],
    mostViewedAlbum: null as GalleryAlbum | null,
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAlbum, setFilterAlbum] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Lightbox Preview & Zoom
  const [previewMedia, setPreviewMedia] = useState<GalleryMediaItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editMediaModal, setEditMediaModal] = useState<GalleryMediaItem | null>(null);
  const [replaceMediaModal, setReplaceMediaModal] = useState<GalleryMediaItem | null>(null);
  const [moveAlbumModal, setMoveAlbumModal] = useState<GalleryMediaItem | null>(null);
  const [seoModal, setSeoModal] = useState<GalleryMediaItem | null>(null);

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<GalleryActivityLogItem[]>([
    {
      id: 'log-1',
      action: 'Upload',
      mediaTitle: 'महाकालेश्वर ज्योतिर्लिंग उज्जैन दर्शन',
      user: adminUser?.name || 'पं. राजन कैथवास',
      timestamp: new Date().toLocaleString('hi-IN'),
      details: 'Cloudinary Folder: gallery/temple/',
    },
    {
      id: 'log-2',
      action: 'Upload',
      mediaTitle: 'मांगलिक एवं कालसर्प दोष निवारण संपूर्ण वीडियो मार्गदर्शन',
      user: adminUser?.name || 'पं. राजन कैथवास',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('hi-IN'),
      details: 'Cloudinary Folder: gallery/videos/',
    },
  ]);

  // Upload Form State
  const [uploadFolder, setUploadFolder] = useState<string>('gallery/');
  const [uploadCategory, setUploadCategory] = useState<string>('मंदिर');
  const [uploadAlbum, setUploadAlbum] = useState<string>('श्री महाकाल मंदिर एवं दर्शन');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDesc, setUploadDesc] = useState<string>('');
  const [uploadMediaType, setUploadMediaType] = useState<'image' | 'video'>('image');
  const [uploadFiles, setUploadFiles] = useState<Array<{ name: string; url: string; sizeMb: number; type: 'image' | 'video' }>>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCat, setEditingCat] = useState<GalleryCategory | null>(null);

  // Album Form State
  const [albTitle, setAlbTitle] = useState('');
  const [albDesc, setAlbDesc] = useState('');
  const [albCat, setAlbCat] = useState('मंदिर');
  const [albCoverUrl, setAlbCoverUrl] = useState('');
  const [albVisibility, setAlbVisibility] = useState<'public' | 'private'>('public');
  const [editingAlb, setEditingAlb] = useState<GalleryAlbum | null>(null);

  // Replace URL
  const [replaceUrl, setReplaceUrl] = useState('');
  const [targetAlbumMove, setTargetAlbumMove] = useState('');

  // Fetch Gallery Data from API
  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterCategory !== 'all') query.append('category', filterCategory);
      if (filterAlbum !== 'all') query.append('album', filterAlbum);
      if (filterType !== 'all') query.append('media_type', filterType);
      if (filterStatus !== 'all') query.append('status', filterStatus);
      if (searchQuery) query.append('search', searchQuery);

      const res = await fetch(`/api/gallery?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        setMediaList(data.media || []);
        setCategories(data.categories || []);
        setAlbums(data.albums || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        showToast('गैलरी डेटा लोड करने में विफल', 'error');
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
      showToast('सर्वर से डेटा लोड नहीं हो सका', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [filterCategory, filterAlbum, filterType, filterStatus]);

  // Log action helper
  const logGalleryActivity = (action: GalleryActivityLogItem['action'], mediaTitle: string, details?: string) => {
    const newLog: GalleryActivityLogItem = {
      id: 'log-' + Date.now(),
      action,
      mediaTitle,
      user: adminUser?.name || 'पं. राजन कैथवास',
      timestamp: new Date().toLocaleString('hi-IN'),
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Cloudinary Folder Map based on Category
  const getCloudinaryFolderForCategory = (catName: string): string => {
    switch (catName) {
      case 'मंदिर':
        return 'gallery/temple/';
      case 'कार्यक्रम':
      case 'पूजा एवं अनुष्ठान':
        return 'gallery/events/';
      case 'सेमिनार':
        return 'gallery/seminars/';
      case 'सम्मान समारोह':
      case 'पुरस्कार':
        return 'gallery/awards/';
      case 'प्रमाण पत्र':
        return 'gallery/certificates/';
      case 'वीडियो गैलरी':
        return 'gallery/videos/';
      default:
        return 'gallery/';
    }
  };

  const handleCategoryChangeForUpload = (cat: string) => {
    setUploadCategory(cat);
    setUploadFolder(getCloudinaryFolderForCategory(cat));
  };

  // Mock file drop handler
  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files) as File[];
    processSelectedFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      processSelectedFiles(files);
    }
  };

  const processSelectedFiles = (files: File[]) => {
    const fileList: Array<{ name: string; url: string; sizeMb: number; type: 'image' | 'video' }> = [];

    files.forEach((file) => {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.webm');
      const sizeMb = Number((file.size / (1024 * 1024)).toFixed(2));

      if (!isVideo && sizeMb > 10) {
        showToast(`चित्र फ़ाइल '${file.name}' 10MB से अधिक है!`, 'error');
        return;
      }
      if (isVideo && sizeMb > 100) {
        showToast(`वीडियो फ़ाइल '${file.name}' 100MB से अधिक है!`, 'error');
        return;
      }

      // Generate object URL preview
      const objectUrl = URL.createObjectURL(file);
      fileList.push({
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: objectUrl,
        sizeMb: sizeMb > 0 ? sizeMb : isVideo ? 18.5 : 2.4,
        type: isVideo ? 'video' : 'image',
      });
    });

    if (fileList.length > 0) {
      setUploadFiles((prev) => [...prev, ...fileList]);
      if (!uploadTitle && fileList[0]) {
        setUploadTitle(fileList[0].name);
      }
      showToast(`${fileList.length} फ़ाइल(एं) अपलोड सूची में जोड़ी गईं।`, 'info');
    }
  };

  // Execute Upload to Cloudinary & API
  const executeUpload = async () => {
    if (uploadFiles.length === 0) {
      showToast('कृपया कम से कम एक फ़ाइल चुनें', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const itemsToSubmit = uploadFiles.map((f, idx) => {
        const fileTitle = uploadFiles.length === 1 && uploadTitle ? uploadTitle : `${f.name}`;
        const folder = uploadFolder || getCloudinaryFolderForCategory(uploadCategory);
        const slug = fileTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const pubId = `${folder}${slug}_${Date.now()}_${idx}`;

        return {
          title: fileTitle,
          description: uploadDesc || `${uploadCategory} वर्ग के अंतर्गत अपलोड की गई फ़ाइल`,
          category: uploadCategory,
          album: uploadAlbum,
          mediaType: f.type,
          imageUrl: f.type === 'image' ? f.url : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          videoUrl: f.type === 'video' ? f.url : '',
          thumbnailUrl: f.type === 'video' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' : f.url,
          cloudinaryPublicId: pubId,
          uploadedBy: adminUser?.name || 'पं. राजन कैथवास',
          status: 'published',
          altText: `${fileTitle} - ${uploadCategory} गैलरी`,
          fileSizeMb: f.sizeMb,
        };
      });

      setUploadProgress(60);

      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSubmit }),
      });

      const data = await res.json();
      setUploadProgress(100);

      if (data.success) {
        showToast(data.message || 'मीडिया फ़ाइलें क्लाउडिनरी में सहेजी गईं!', 'success');
        itemsToSubmit.forEach((item) => logGalleryActivity('Upload', item.title, `Folder: ${uploadFolder}`));
        setUploadFiles([]);
        setUploadTitle('');
        setUploadDesc('');
        setShowUploadModal(false);
        fetchGalleryData();
      } else {
        showToast(data.error || 'अपलोड करने में त्रुटि', 'error');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('अपलोड विफल रहा', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Add / Edit Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('श्रेणी नाम अनिवार्य है', 'error');
      return;
    }

    try {
      if (editingCat) {
        const res = await fetch(`/api/gallery/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catName, description: catDesc }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('श्रेणी अपडेट की गई', 'success');
          logGalleryActivity('Edit', `श्रेणी: ${catName}`);
        }
      } else {
        const res = await fetch('/api/gallery/create-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catName, description: catDesc }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('नई श्रेणी जोड़ी गई', 'success');
          logGalleryActivity('Upload', `नई श्रेणी: ${catName}`);
        }
      }
      setCatName('');
      setCatDesc('');
      setEditingCat(null);
      setShowAddCategoryModal(false);
      fetchGalleryData();
    } catch (err) {
      showToast('श्रेणी सहेजने में त्रुटि', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string | number, name: string) => {
    if (!confirm(`क्या आप श्रेणी '${name}' हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/gallery/categories/${catId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('श्रेणी हटाई गई', 'success');
        logGalleryActivity('Delete', `श्रेणी: ${name}`);
        fetchGalleryData();
      }
    } catch (err) {
      showToast('हटाने में विफलता', 'error');
    }
  };

  // Add / Edit Album
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albTitle.trim()) {
      showToast('एल्बम का शीर्षक अनिवार्य है', 'error');
      return;
    }

    try {
      if (editingAlb) {
        const res = await fetch(`/api/gallery/albums/${editingAlb.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: albTitle,
            description: albDesc,
            category: albCat,
            coverImageUrl: albCoverUrl,
            visibility: albVisibility,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('एल्बम अपडेट किया गया', 'success');
          logGalleryActivity('Edit', `एल्बम: ${albTitle}`);
        }
      } else {
        const res = await fetch('/api/gallery/create-album', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: albTitle,
            description: albDesc,
            category: albCat,
            coverImageUrl: albCoverUrl,
            visibility: albVisibility,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('नया एल्बम निर्मित हुआ', 'success');
          logGalleryActivity('Upload', `नया एल्बम: ${albTitle}`);
        }
      }
      setAlbTitle('');
      setAlbDesc('');
      setAlbCoverUrl('');
      setEditingAlb(null);
      setShowAddAlbumModal(false);
      fetchGalleryData();
    } catch (err) {
      showToast('एल्बम सहेजने में त्रुटि', 'error');
    }
  };

  const handleDeleteAlbum = async (albId: string | number, title: string) => {
    if (!confirm(`क्या आप एल्बम '${title}' हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/gallery/albums/${albId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('एल्बम हटा दिया गया', 'success');
        logGalleryActivity('Delete', `एल्बम: ${title}`);
        fetchGalleryData();
      }
    } catch (err) {
      showToast('एल्बम हटाने में त्रुटि', 'error');
    }
  };

  // Edit Media Item
  const handleSaveEditMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMediaModal) return;

    try {
      const res = await fetch(`/api/gallery/${editMediaModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editMediaModal.title,
          description: editMediaModal.description,
          category: editMediaModal.category,
          album: editMediaModal.album,
          status: editMediaModal.status,
          altText: editMediaModal.altText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('मीडिया विवरण अपडेट हुआ', 'success');
        logGalleryActivity('Edit', editMediaModal.title);
        setEditMediaModal(null);
        fetchGalleryData();
      }
    } catch (err) {
      showToast('अपडेट में त्रुटि', 'error');
    }
  };

  // Replace Media URL
  const handleReplaceMedia = async () => {
    if (!replaceMediaModal || !replaceUrl.trim()) {
      showToast('कृपया नया चित्र/वीडियो URL दर्ज करें', 'error');
      return;
    }

    try {
      const isVideo = replaceUrl.includes('.mp4') || replaceUrl.includes('.mov') || replaceUrl.includes('video');
      const res = await fetch(`/api/gallery/${replaceMediaModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: isVideo ? replaceMediaModal.imageUrl : replaceUrl,
          videoUrl: isVideo ? replaceUrl : replaceMediaModal.videoUrl,
          cloudinaryPublicId: `gallery/replaced/${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('फ़ाइल सफलतापूर्वक बदल (Replace) दी गई!', 'success');
        logGalleryActivity('Replace', replaceMediaModal.title, `नया URL: ${replaceUrl}`);
        setReplaceMediaModal(null);
        setReplaceUrl('');
        fetchGalleryData();
      }
    } catch (err) {
      showToast('बदलने में त्रुटि', 'error');
    }
  };

  // Move Media to Another Album
  const handleMoveAlbum = async () => {
    if (!moveAlbumModal || !targetAlbumMove) return;

    try {
      const res = await fetch(`/api/gallery/${moveAlbumModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ album: targetAlbumMove }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`मीडिया '${targetAlbumMove}' एल्बम में स्थानांतरित हुआ।`, 'success');
        logGalleryActivity('Move Album', moveAlbumModal.title, `नया एल्बम: ${targetAlbumMove}`);
        setMoveAlbumModal(null);
        fetchGalleryData();
      }
    } catch (err) {
      showToast('स्थानांतरण विफल', 'error');
    }
  };

  // Delete Media
  const handleDeleteMedia = async (mediaId: string | number, title: string) => {
    if (!confirm(`क्या आप '${title}' को स्थायी रूप से हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/gallery/${mediaId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('फ़ाइल हटाई गई', 'success');
        logGalleryActivity('Delete', title);
        fetchGalleryData();
      }
    } catch (err) {
      showToast('हटाने में विफलता', 'error');
    }
  };

  // Copy Image URL
  const copyToClipboard = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    showToast(`URL कॉपी किया गया: ${title}`, 'info');
  };

  // Download File simulation
  const handleDownloadFile = (url?: string, title?: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'gallery_media'}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`फ़ाइल डाउनलोड प्रारंभ: ${title}`, 'success');
    logGalleryActivity('Download', title || 'फ़ाइल डाउनलोड');
  };

  // Auto Generate SEO Alt Text & Title
  const generateSeoMetadata = (item: GalleryMediaItem) => {
    const seoTitle = `${item.title} - पं. राजन कैथवास (मंटू) गैलरी`;
    const altText = `${item.title} (${item.category}) | वैदिक ज्योतिष एवं वास्तु संस्थान`;
    const metaDesc = `${item.category} वर्ग की यह फ़ाइल '${item.title}' पं. राजन कैथवास (मंटू) के आधिकारिक संग्रह से है।`;

    return { seoTitle, altText, metaDesc };
  };

  // Filtered Media Display
  const displayedMedia = selectedAlbumTitle
    ? mediaList.filter((m) => m.album === selectedAlbumTitle)
    : mediaList;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#030712]/90 p-6 rounded-3xl border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                गैलरी प्रबंधन (Gallery Management)
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                  Cloudinary Powered
                </span>
              </h1>
              <p className="text-xs text-white/60">
                मंदिर, अनुष्ठान, सेमिनार, सम्मान एवं वीडियो संग्रह को क्लाउडिनरी स्टोरेज के साथ प्रबंधित करें।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('gallery', 'create') && (
            <>
              <button
                onClick={() => {
                  setEditingAlb(null);
                  setAlbTitle('');
                  setAlbDesc('');
                  setAlbCoverUrl('');
                  setShowAddAlbumModal(true);
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl flex items-center gap-2 border border-white/20 transition cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-[#D4AF37]" /> नया एल्बम
              </button>

              <button
                onClick={() => {
                  setEditingCat(null);
                  setCatName('');
                  setCatDesc('');
                  setShowAddCategoryModal(true);
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl flex items-center gap-2 border border-white/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" /> नई श्रेणी
              </button>

              <button
                onClick={() => {
                  setUploadFiles([]);
                  setShowUploadModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#050B18] font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:brightness-110 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" /> अपलोड फ़ाइलें (Cloudinary)
              </button>
            </>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs">
        {[
          { id: 'dashboard', label: 'डैशबोर्ड ओवरव्यू', icon: BarChart3 },
          { id: 'media', label: `मीडिया गैलरी (${mediaList.length})`, icon: Image },
          { id: 'albums', label: `एल्बम संग्रह (${albums.length})`, icon: Folder },
          { id: 'categories', label: `श्रेणियां (${categories.length})`, icon: Tag },
          { id: 'upload', label: 'ड्रैग & ड्रॉप अपलोड जोन', icon: UploadCloud },
          { id: 'reports', label: 'रिपोर्ट्स एवं एक्सपोर्ट', icon: FileSpreadsheet },
          { id: 'logs', label: 'गैलरी एक्टिविटी लॉग्स', icon: Clock },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                if (t.id !== 'media') setSelectedAlbumTitle(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md'
                  : 'bg-[#030712]/80 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-white/60 text-xs">
                <span>कुल इमेज</span>
                <Image className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalImages}</div>
              <p className="text-[10px] text-emerald-400">JPG, PNG, WEBP</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-white/60 text-xs">
                <span>कुल वीडियो</span>
                <Video className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalVideos}</div>
              <p className="text-[10px] text-purple-300">MP4, MOV, WEBM</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-white/60 text-xs">
                <span>कुल एल्बम</span>
                <Folder className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalAlbums}</div>
              <p className="text-[10px] text-amber-300">पब्लिक व प्राइवेट</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-white/60 text-xs">
                <span>श्रेणियां</span>
                <Tag className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalCategories}</div>
              <p className="text-[10px] text-blue-300">डिफ़ॉल्ट श्रेणी समूह</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-white/60 text-xs">
                <span>स्टोरेज उपयोग</span>
                <HardDrive className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-[#D4AF37]">{stats.storageUsedMb} MB</div>
              <p className="text-[10px] text-white/60">Cloudinary Safe Limit</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-1">
              <div className="flex justify-between items-center text-white/60 text-xs">
                <span>क्लाउडिनरी सिंक</span>
                <Cloud className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Sync
              </div>
              <p className="text-[10px] text-emerald-300/80">Direct CDN Access</p>
            </div>
          </div>

          {/* TWO COLUMN GRID: RECENT UPLOADS & CLOUDINARY FOLDERS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RECENT UPLOADS */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                  <Clock className="w-5 h-5" /> हाल ही में अपलोड किए गए मीडिया (Recently Uploaded)
                </h3>
                <button
                  onClick={() => setActiveTab('media')}
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  सभी देखें <MoveRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stats.recentlyUploaded.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setPreviewMedia(item)}
                    className="group relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 hover:border-[#D4AF37]/50 transition shadow-lg cursor-pointer"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={item.imageUrl || item.thumbnailUrl}
                        alt={item.title}
                        className="w-[#100%] w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {item.mediaType === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="p-3 bg-[#D4AF37] rounded-full text-[#050B18]">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] text-[#D4AF37] font-semibold backdrop-blur-sm border border-white/10">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <div className="flex justify-between items-center text-[10px] text-white/50">
                        <span>{item.album}</span>
                        <span>{item.fileSizeMb || 2.1} MB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CLOUDINARY FOLDERS & MOST VIEWED ALBUM */}
            <div className="space-y-6">
              {/* CLOUDINARY FOLDERS BREAKDOWN */}
              <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-4">
                <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2 border-b border-white/10 pb-3">
                  <Cloud className="w-5 h-5 text-emerald-400" /> क्लाउडिनरी फोल्डर मैपिंग
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { folder: 'gallery/temple/', label: 'मंदिर दर्शन', count: mediaList.filter((m) => m.category === 'मंदिर').length },
                    { folder: 'gallery/events/', label: 'कार्यक्रम व अनुष्ठान', count: mediaList.filter((m) => m.category === 'पूजा एवं अनुष्ठान' || m.category === 'कार्यक्रम').length },
                    { folder: 'gallery/seminars/', label: 'ज्योतिष सेमिनार', count: mediaList.filter((m) => m.category === 'सेमिनार').length },
                    { folder: 'gallery/awards/', label: 'पुरस्कार व सम्मान', count: mediaList.filter((m) => m.category === 'सम्मान समारोह' || m.category === 'पुरस्कार').length },
                    { folder: 'gallery/certificates/', label: 'प्रमाण पत्र', count: mediaList.filter((m) => m.category === 'प्रमाण पत्र').length },
                    { folder: 'gallery/videos/', label: 'वीडियो गैलरी', count: mediaList.filter((m) => m.mediaType === 'video').length },
                  ].map((f) => (
                    <div key={f.folder} className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{f.label}</div>
                        <div className="text-[10px] text-[#D4AF37] font-mono">{f.folder}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold">
                        {f.count} फ़ाइलें
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOST VIEWED ALBUM */}
              {stats.mostViewedAlbum && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#D4AF37]/15 to-transparent border border-[#D4AF37]/30 shadow-xl space-y-3">
                  <div className="flex justify-between items-center text-xs text-[#D4AF37] font-bold">
                    <span className="uppercase tracking-wider">सर्वाधिक देखा गया एल्बम</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-white">{stats.mostViewedAlbum.title}</h4>
                  <p className="text-xs text-white/70 line-clamp-2">{stats.mostViewedAlbum.description}</p>
                  <div className="flex justify-between items-center text-xs text-white/60 pt-2 border-t border-white/10">
                    <span>श्रेणी: {stats.mostViewedAlbum.category}</span>
                    <span className="text-[#D4AF37] font-bold">{stats.mostViewedAlbum.views} व्यूज</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA GALLERY MANAGER */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="शीर्षक, श्रेणी या विवरण खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">सभी श्रेणियां</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Album Filter */}
              <select
                value={filterAlbum}
                onChange={(e) => setFilterAlbum(e.target.value)}
                className="px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">सभी एल्बम</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">इमेज + वीडियो</option>
                <option value="image">केवल इमेज</option>
                <option value="video">केवल वीडियो</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-black/50 border border-white/15 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-[#D4AF37] text-[#050B18]' : 'text-white/60 hover:text-white'}`}
                  title="ग्रिड व्यू"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-[#D4AF37] text-[#050B18]' : 'text-white/60 hover:text-white'}`}
                  title="लिस्ट/टेबल व्यू"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ALBUM HEADER IF SELECTED */}
          {selectedAlbumTitle && (
            <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-white font-bold">एल्बम: {selectedAlbumTitle}</span>
                <span className="text-white/60">({displayedMedia.length} फ़ाइलें)</span>
              </div>
              <button
                onClick={() => setSelectedAlbumTitle(null)}
                className="text-[#D4AF37] hover:underline cursor-pointer font-bold"
              >
                सभी फ़ाइलें देखें ✕
              </button>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedMedia.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-3xl overflow-hidden bg-[#030712]/90 border border-white/10 hover:border-[#D4AF37]/50 transition duration-300 shadow-xl flex flex-col justify-between"
                >
                  {/* Thumbnail Container */}
                  <div className="aspect-video relative overflow-hidden bg-black/80">
                    <img
                      src={item.imageUrl || item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {item.mediaType === 'video' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="p-3 bg-[#D4AF37] rounded-full text-[#050B18]">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-black/80 text-[10px] text-[#D4AF37] font-bold backdrop-blur-sm border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    {/* Quick Hover Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => setPreviewMedia(item)}
                        className="p-2 bg-[#D4AF37] text-[#050B18] rounded-xl hover:scale-110 transition cursor-pointer"
                        title="देखें (Preview)"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditMediaModal(item)}
                        className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition cursor-pointer"
                        title="संपादित करें (Edit)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setReplaceMediaModal(item);
                          setReplaceUrl(item.imageUrl || item.videoUrl || '');
                        }}
                        className="p-2 bg-purple-600/80 text-white rounded-xl hover:bg-purple-600 transition cursor-pointer"
                        title="फ़ाइल बदलें (Replace)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.imageUrl || item.videoUrl || '', item.title)}
                        className="p-2 bg-blue-600/80 text-white rounded-xl hover:bg-blue-600 transition cursor-pointer"
                        title="URL कॉपी करें"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs leading-tight line-clamp-2">{item.title}</h4>
                      <p className="text-[11px] text-white/50 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10 text-[10px] text-white/60 flex justify-between items-center">
                      <span className="truncate max-w-[120px]">एल्बम: {item.album || 'सामान्य'}</span>
                      <span className="text-[#D4AF37] font-semibold">{item.views || 0} व्यूज</span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[10px]">
                      <div className="flex items-center gap-1 text-white/40">
                        <span>{item.uploadedBy || 'पं. राजन कैथवास'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setMoveAlbumModal(item);
                            setTargetAlbumMove(item.album || 'सामान्य');
                          }}
                          className="px-2 py-1 bg-white/5 text-white/80 hover:text-white rounded-md cursor-pointer"
                        >
                          मूव
                        </button>
                        <button
                          onClick={() => setSeoModal(item)}
                          className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md cursor-pointer"
                          title="SEO Meta"
                        >
                          SEO
                        </button>
                        {hasPermission('gallery', 'delete') && (
                          <button
                            onClick={() => handleDeleteMedia(item.id, item.title)}
                            className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TABLE / LIST VIEW */}
          {viewMode === 'table' && (
            <div className="rounded-3xl bg-[#030712]/90 border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/5 text-[#D4AF37] font-serif uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3.5">थंबनेल</th>
                      <th className="p-3.5">शीर्षक</th>
                      <th className="p-3.5">श्रेणी</th>
                      <th className="p-3.5">एल्बम</th>
                      <th className="p-3.5">प्रकार</th>
                      <th className="p-3.5">अपलोडकर्ता</th>
                      <th className="p-3.5">तिथि</th>
                      <th className="p-3.5">स्थिति</th>
                      <th className="p-3.5 text-right">कार्रवाई (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {displayedMedia.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition">
                        <td className="p-3">
                          <img
                            src={item.imageUrl || item.thumbnailUrl}
                            alt={item.title}
                            className="w-12 h-10 object-cover rounded-lg border border-white/10"
                          />
                        </td>
                        <td className="p-3 font-semibold text-white max-w-xs truncate">{item.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-white/70">{item.album}</td>
                        <td className="p-3 uppercase font-mono text-[10px]">{item.mediaType}</td>
                        <td className="p-3 text-white/60">{item.uploadedBy || 'पं. राजन कैथवास'}</td>
                        <td className="p-3 text-white/50">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('hi-IN') : 'हाल ही में'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                            {item.status || 'published'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => setPreviewMedia(item)}
                            className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 cursor-pointer"
                            title="देखें"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditMediaModal(item)}
                            className="p-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.imageUrl || item.videoUrl || '', item.title)}
                            className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 cursor-pointer"
                            title="URL कॉपी करें"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {hasPermission('gallery', 'delete') && (
                            <button
                              onClick={() => handleDeleteMedia(item.id, item.title)}
                              className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 cursor-pointer"
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
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALBUMS MANAGEMENT */}
      {activeTab === 'albums' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center gap-2">
              <Folder className="w-5 h-5" /> सभी गैलरी एल्बम (Gallery Albums)
            </h2>
            {hasPermission('gallery', 'create') && (
              <button
                onClick={() => {
                  setEditingAlb(null);
                  setAlbTitle('');
                  setAlbDesc('');
                  setAlbCoverUrl('');
                  setShowAddAlbumModal(true);
                }}
                className="px-4 py-2 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer hover:brightness-110"
              >
                <FolderPlus className="w-4 h-4" /> नया एल्बम बनाएं
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((alb) => {
              const count = mediaList.filter((m) => m.album === alb.title).length;
              return (
                <div
                  key={alb.id}
                  className="group rounded-3xl bg-[#030712]/90 border border-white/10 overflow-hidden shadow-xl hover:border-[#D4AF37]/50 transition duration-300 flex flex-col justify-between"
                >
                  <div className="aspect-video relative overflow-hidden bg-black/80">
                    <img
                      src={alb.coverImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                      alt={alb.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/80 text-[10px] text-[#D4AF37] font-bold border border-white/10">
                        {alb.category || 'अन्य'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/80 text-[10px] text-white flex items-center gap-1 border border-white/10">
                        {alb.visibility === 'private' ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                        {alb.visibility === 'private' ? 'प्राइवेट' : 'पब्लिक'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{alb.title}</h3>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1">{alb.description}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-white/70 pt-2 border-t border-white/10">
                      <span>कुल फ़ाइलें: <b className="text-[#D4AF37]">{count}</b></span>
                      <span>व्यूज: <b>{alb.views || 0}</b></span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setSelectedAlbumTitle(alb.title);
                          setActiveTab('media');
                        }}
                        className="px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> मीडिया देखें
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAlb(alb);
                            setAlbTitle(alb.title);
                            setAlbDesc(alb.description || '');
                            setAlbCat(alb.category || 'मंदिर');
                            setAlbCoverUrl(alb.coverImageUrl || '');
                            setAlbVisibility(alb.visibility || 'public');
                            setShowAddAlbumModal(true);
                          }}
                          className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {hasPermission('gallery', 'delete') && (
                          <button
                            onClick={() => handleDeleteAlbum(alb.id, alb.title)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center gap-2">
              <Tag className="w-5 h-5" /> गैलरी श्रेणियां (Gallery Categories)
            </h2>
            {hasPermission('gallery', 'create') && (
              <button
                onClick={() => {
                  setEditingCat(null);
                  setCatName('');
                  setCatDesc('');
                  setShowAddCategoryModal(true);
                }}
                className="px-4 py-2 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer hover:brightness-110"
              >
                <Plus className="w-4 h-4" /> नई श्रेणी जोड़ें
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = mediaList.filter((m) => m.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-0.5 rounded-full font-bold">
                        {cat.name}
                      </span>
                      <span className="text-xs text-white/50">{count} फ़ाइलें</span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2">{cat.description || 'श्रेणी विवरण उपलब्ध नहीं'}</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        setEditingCat(cat);
                        setCatName(cat.name);
                        setCatDesc(cat.description || '');
                        setShowAddCategoryModal(true);
                      }}
                      className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {hasPermission('gallery', 'delete') && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: UPLOAD ZONE (DRAG & DROP) */}
      {activeTab === 'upload' && (
        <div className="p-8 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/30 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">क्लाउडिनरी मीडिया अपलोड जोन</h2>
            <p className="text-xs text-white/60">
              चित्र (JPG, PNG, WEBP, GIF max 10MB) अथवा वीडियो (MP4, MOV, WEBM max 100MB) सीधे अपलोड करें।
            </p>
          </div>

          {/* DROP AREA */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropFiles}
            className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-3xl p-10 text-center bg-black/40 hover:bg-black/60 transition duration-300 space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">ड्रैग करके फ़ाइलें यहां छोड़ें</h3>
              <p className="text-xs text-white/50">या अपने डिवाइस से फ़ाइलें चुनने के लिए क्लिक करें</p>
            </div>

            <label className="inline-flex px-6 py-2.5 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl cursor-pointer hover:brightness-110 shadow-lg">
              फ़ाइलें चुनें (Single/Bulk)
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </div>

          {/* UPLOAD CONFIGURATION FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-white/80 font-bold mb-1">श्रेणी चुनें (Category)</label>
              <select
                value={uploadCategory}
                onChange={(e) => handleCategoryChangeForUpload(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-1">एल्बम चुनें (Album)</label>
              <select
                value={uploadAlbum}
                onChange={(e) => setUploadAlbum(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-1">क्लाउडिनरी फोल्डर (Auto Mapped)</label>
              <input
                type="text"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-emerald-400 font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-1">शीर्षक (Title Override)</label>
              <input
                type="text"
                placeholder="खाली छोड़ने पर फ़ाइल नाम प्रयुक्त होगा"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* PREVIEW SELECTED FILES LIST */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-[#D4AF37] flex justify-between items-center">
                <span>अपलोड हेतु चुनी गईं फ़ाइलें ({uploadFiles.length})</span>
                <button
                  onClick={() => setUploadFiles([])}
                  className="text-red-400 hover:underline cursor-pointer"
                >
                  सूची साफ करें ✕
                </button>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {uploadFiles.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <img src={f.url} alt={f.name} className="w-10 h-10 object-cover rounded-lg" />
                    <div className="flex-1 truncate text-xs">
                      <div className="font-bold text-white truncate">{f.name}</div>
                      <div className="text-[10px] text-white/50">
                        {f.type} • {f.sizeMb} MB
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROGRESS BAR IF UPLOADING */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#D4AF37]">
                    <span>क्लाउडिनरी में सहेजा जा रहा है...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D4AF37] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={executeUpload}
                disabled={isUploading}
                className="w-full py-3 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl shadow-xl hover:brightness-110 transition cursor-pointer disabled:opacity-50"
              >
                {isUploading ? 'सहेजा जा रहा है...' : 'सुरक्षित क्लाउडिनरी स्टोरेज में अपलोड करें'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#D4AF37]">गैलरी रिपोर्ट्स एवं स्टोरेज एनालिसिस</h3>
                <p className="text-xs text-white/60">मीडिया उपयोग, श्रेणी वितरण एवं स्टोरेज डेटा एक्सपोर्ट करें</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,' +
                      ['Title,Category,Album,Type,SizeMB,Views,Date'].join(',') + '\n' +
                      mediaList.map(m => `"${m.title}","${m.category}","${m.album}","${m.mediaType}",${m.fileSizeMb || 2.1},${m.views || 0},"${m.createdAt}"`).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `Gallery_Report_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    showToast('Excel/CSV रिपोर्ट डाउनलोड हो गई', 'success');
                  }}
                  className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Excel / CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> प्रिंट / PDF
                </button>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-white/60">मीडिया फ़ाइलों की कुल संख्या</span>
                <div className="text-2xl font-bold text-white">{mediaList.length} फ़ाइलें</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-white/60">क्लाउडिनरी स्टोरेज उपयोग</span>
                <div className="text-2xl font-bold text-[#D4AF37]">{stats.storageUsedMb} MB</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-white/60">कुल व्यूज काउंट</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {mediaList.reduce((a, b) => a + (b.views || 0), 0)} बार
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#D4AF37] border-b border-white/10 pb-3">
            गैलरी एक्टिविटी लॉग्स (System Audit Trail)
          </h3>
          <div className="divide-y divide-white/10">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-bold text-white">{log.mediaTitle}</span>
                  </div>
                  {log.details && <p className="text-[10px] text-white/50">{log.details}</p>}
                </div>
                <div className="text-right text-[10px] text-white/50">
                  <div>{log.user}</div>
                  <div>{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full space-y-4 text-center">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black max-h-[70vh] flex items-center justify-center">
              {previewMedia.mediaType === 'video' ? (
                <video
                  src={previewMedia.videoUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-auto mx-auto rounded-2xl"
                />
              ) : (
                <img
                  src={previewMedia.imageUrl}
                  alt={previewMedia.title}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="max-h-[70vh] w-auto mx-auto transition-transform duration-200 object-contain rounded-2xl"
                />
              )}
            </div>

            <div className="space-y-2 text-white text-xs">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37]">{previewMedia.title}</h3>
              <p className="text-white/70 max-w-xl mx-auto">{previewMedia.description}</p>
              <div className="flex justify-center items-center gap-4 text-white/50">
                <span>श्रेणी: {previewMedia.category}</span>
                <span>एल्बम: {previewMedia.album}</span>
                <span>साइज़: {previewMedia.fileSizeMb || 2.1} MB</span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-center items-center gap-3 pt-2">
                {previewMedia.mediaType === 'image' && (
                  <button
                    onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
                    className="px-3 py-1.5 bg-white/10 rounded-xl text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" /> ज़ूम ({zoomLevel}x)
                  </button>
                )}
                <button
                  onClick={() => handleDownloadFile(previewMedia.imageUrl || previewMedia.videoUrl, previewMedia.title)}
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#050B18] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> डाउनलोड करें
                </button>
                <button
                  onClick={() => copyToClipboard(previewMedia.imageUrl || previewMedia.videoUrl || '', previewMedia.title)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> URL कॉपी
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">
                {editingCat ? 'श्रेणी संपादित करें' : 'नई गैलरी श्रेणी जोड़ें'}
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-bold mb-1">श्रेणी का नाम *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="उदा. मंदिर, अनुष्ठान, सेमिनार"
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-1">श्रेणी विवरण</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="विवरण दर्ज करें..."
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-[#050B18] font-bold rounded-xl cursor-pointer hover:brightness-110"
                >
                  सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ALBUM */}
      {showAddAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">
                {editingAlb ? 'एल्बम संपादित करें' : 'नया एल्बम निर्मित करें'}
              </h3>
              <button onClick={() => setShowAddAlbumModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-bold mb-1">एल्बम का शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={albTitle}
                  onChange={(e) => setAlbTitle(e.target.value)}
                  placeholder="उदा. श्री महाकाल मंदिर दर्शन 2026"
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 font-bold mb-1">श्रेणी</label>
                  <select
                    value={albCat}
                    onChange={(e) => setAlbCat(e.target.value)}
                    className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">विजिबिलिटी (Visibility)</label>
                  <select
                    value={albVisibility}
                    onChange={(e) => setAlbVisibility(e.target.value as any)}
                    className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="public">सार्वजनिक (Public)</option>
                    <option value="private">प्राइवेट (Private)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-1">कवर इमेज URL</label>
                <input
                  type="text"
                  value={albCoverUrl}
                  onChange={(e) => setAlbCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-1">एल्बम विवरण</label>
                <textarea
                  rows={3}
                  value={albDesc}
                  onChange={(e) => setAlbDesc(e.target.value)}
                  placeholder="एल्बम का संक्षिप्त विवरण..."
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAlbumModal(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-[#050B18] font-bold rounded-xl cursor-pointer hover:brightness-110"
                >
                  सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEDIA ITEM */}
      {editMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">मीडिया विवरण संपादित करें</h3>
              <button onClick={() => setEditMediaModal(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-bold mb-1">शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={editMediaModal.title}
                  onChange={(e) => setEditMediaModal({ ...editMediaModal, title: e.target.value })}
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 font-bold mb-1">श्रेणी</label>
                  <select
                    value={editMediaModal.category}
                    onChange={(e) => setEditMediaModal({ ...editMediaModal, category: e.target.value })}
                    className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">एल्बम</label>
                  <select
                    value={editMediaModal.album}
                    onChange={(e) => setEditMediaModal({ ...editMediaModal, album: e.target.value })}
                    className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {albums.map((a) => (
                      <option key={a.id} value={a.title}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-1">SEO Alt Text</label>
                <input
                  type="text"
                  value={editMediaModal.altText || ''}
                  onChange={(e) => setEditMediaModal({ ...editMediaModal, altText: e.target.value })}
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-1">विवरण</label>
                <textarea
                  rows={3}
                  value={editMediaModal.description || ''}
                  onChange={(e) => setEditMediaModal({ ...editMediaModal, description: e.target.value })}
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMediaModal(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-[#050B18] font-bold rounded-xl cursor-pointer hover:brightness-110"
                >
                  सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPLACE MEDIA */}
      {replaceMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">फ़ाइल बदलें (Replace Media)</h3>
              <button onClick={() => setReplaceMediaModal(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/70">
              लक्ष्य फ़ाइल: <b>{replaceMediaModal.title}</b>
            </p>

            <div>
              <label className="block text-white/80 font-bold mb-1">नया क्लाउडिनरी / इमेज URL</label>
              <input
                type="text"
                value={replaceUrl}
                onChange={(e) => setReplaceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplaceMediaModal(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleReplaceMedia}
                className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl cursor-pointer hover:bg-purple-500"
              >
                बदलें (Replace)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MOVE ALBUM */}
      {moveAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">एल्बम बदलें (Move Album)</h3>
              <button onClick={() => setMoveAlbumModal(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/70">
              फ़ाइल: <b>{moveAlbumModal.title}</b>
            </p>

            <div>
              <label className="block text-white/80 font-bold mb-1">नया एल्बम चुनें</label>
              <select
                value={targetAlbumMove}
                onChange={(e) => setTargetAlbumMove(e.target.value)}
                className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMoveAlbumModal(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleMoveAlbum}
                className="px-5 py-2 bg-[#D4AF37] text-[#050B18] font-bold rounded-xl cursor-pointer hover:brightness-110"
              >
                स्थानांतरित करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEO METADATA */}
      {seoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> स्वचालित SEO मेटाडेटा (Auto SEO Generator)
              </h3>
              <button onClick={() => setSeoModal(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const seo = generateSeoMetadata(seoModal);
              return (
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/60 mb-0.5">Generated Alt Text</label>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono">
                      {seo.altText}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-0.5">Meta Title</label>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono">
                      {seo.seoTitle}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-0.5">Meta Description</label>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                      {seo.metaDesc}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-0.5">Open Graph Tag</label>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-mono text-[10px]">
                      {`<meta property="og:image" content="${seoModal.imageUrl || seoModal.thumbnailUrl}" />`}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        copyToClipboard(seo.altText, 'Alt Text');
                        setSeoModal(null);
                      }}
                      className="px-4 py-2 bg-[#D4AF37] text-[#050B18] font-bold rounded-xl cursor-pointer"
                    >
                      Alt Text कॉपी करें
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
