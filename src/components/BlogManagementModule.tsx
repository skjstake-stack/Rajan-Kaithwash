import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  Pin,
  CheckCircle,
  Clock,
  Archive,
  Image as ImageIcon,
  FolderPlus,
  Tag as TagIcon,
  MessageSquare,
  BarChart3,
  Globe,
  Share2,
  Sparkles,
  Download,
  Printer,
  Calendar,
  User,
  ExternalLink,
  Code,
  List,
  Heading,
  Bold,
  Italic,
  Underline,
  Quote,
  Table as TableIcon,
  Video,
  MapPin,
  Link as LinkIcon,
  ChevronRight,
  AlertTriangle,
  X,
  Upload,
  RefreshCw,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import { AdminUser, BlogArticle, BlogCategory, BlogComment, PermissionAction } from '../types';

interface BlogManagementModuleProps {
  adminUser: AdminUser | null;
  token?: string;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  hasPermission?: (module: string, action: PermissionAction) => boolean;
}

export const BlogManagementModule: React.FC<BlogManagementModuleProps> = ({
  adminUser,
  token,
  showToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {},
  hasPermission = (_module?: string, _action?: PermissionAction) => true,
}) => {
  // Tabs: 'articles' | 'editor' | 'categories' | 'tags' | 'comments' | 'analytics'
  const [activeSubTab, setActiveSubTab] = useState<'articles' | 'editor' | 'categories' | 'tags' | 'comments' | 'analytics'>('articles');

  // State
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Article Editor State
  const [editingArticleId, setEditingArticleId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    seo_title: '',
    seo_description: '',
    category_id: 'cat-1',
    category: 'वैदिक ज्योतिष',
    author: adminUser?.name || 'पं. राजन कैथवास',
    short_description: '',
    content: '',
    featured_image_url: '',
    cloudinary_public_id: '',
    alt_text: '',
    tags: [] as string[],
    status: 'published' as 'draft' | 'published' | 'scheduled' | 'archived',
    publish_date: new Date().toISOString().slice(0, 16),
    reading_time: '4 मिनट',
    is_featured: false,
    faqs: [] as Array<{ question: string; answer: string }>,
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  // Preview Modal State
  const [previewArticle, setPreviewArticle] = useState<BlogArticle | null>(null);
  const [showSEOModal, setShowSEOModal] = useState<boolean>(false);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatHindi, setNewCatHindi] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Comment Reply Modal
  const [replyingComment, setReplyingComment] = useState<BlogComment | null>(null);
  const [commentReplyText, setCommentReplyText] = useState('');

  // Delete Confirm Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);

  // Rich Text Editor Ref & Selection Helpers
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all blog data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBlogs, resCats, resComms, resAnalytics] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/blog-categories'),
        fetch('/api/blog-comments'),
        fetch('/api/blog-analytics'),
      ]);

      if (resBlogs.ok) {
        const data = await resBlogs.json();
        if (data.blogs) setBlogs(data.blogs);
      }
      if (resCats.ok) {
        const data = await resCats.json();
        if (data.categories) setCategories(data.categories);
      }
      if (resComms.ok) {
        const data = await resComms.json();
        if (data.comments) setComments(data.comments);
      }
      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error fetching blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingArticleId ? prev.slug : generatedSlug || `blog-${Date.now()}`,
      seo_title: prev.seo_title || `${val} | पं. राजन कैथवास`,
    }));
  };

  // Add Tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // FAQ Add & Remove
  const handleAddFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updated }));
  };

  const handleRemoveFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Image File Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Rich Text Editor Command Helpers
  const insertFormatting = (tagStart: string, tagEnd: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || 'पाठ यहाँ लिखें';
    const replacement = `${tagStart}${selectedText}${tagEnd}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({
      ...prev,
      content: newContent,
      reading_time: `${Math.max(1, Math.ceil(newContent.length / 500))} मिनट`,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + selectedText.length);
    }, 50);
  };

  const insertEmbedModal = (type: 'youtube' | 'map' | 'image' | 'link' | 'quote' | 'table') => {
    if (type === 'youtube') {
      const url = prompt('यूट्यूब (YouTube) वीडियो URL दर्ज करें:', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
      if (url) {
        let embedUrl = url;
        if (url.includes('watch?v=')) {
          embedUrl = url.replace('watch?v=', 'embed/');
        }
        insertFormatting(`\n<div class="aspect-w-16 aspect-h-9 my-4"><iframe src="${embedUrl}" class="w-full h-64 rounded-xl" frameborder="0" allowfullscreen></iframe></div>\n`);
      }
    } else if (type === 'map') {
      const url = prompt('गूगल मैप्स Embed URL दर्ज करें:', 'https://www.google.com/maps/embed?pb=...');
      if (url) {
        insertFormatting(`\n<div class="my-4"><iframe src="${url}" class="w-full h-64 rounded-xl border-0" allowfullscreen="" loading="lazy"></iframe></div>\n`);
      }
    } else if (type === 'link') {
      const url = prompt('हाइपरलिंक (Hyperlink) URL:', 'https://');
      if (url) {
        insertFormatting(`<a href="${url}" target="_blank" class="text-[#D4AF37] underline hover:text-amber-300">`, '</a>');
      }
    } else if (type === 'quote') {
      insertFormatting(`\n<blockquote class="p-4 my-4 border-l-4 border-[#D4AF37] bg-[#D4AF37]/10 italic rounded-r-xl">`, `</blockquote>\n`);
    } else if (type === 'table') {
      const tableHTML = `\n<table class="w-full border-collapse border border-white/20 my-4 text-xs">
  <thead>
    <tr class="bg-[#D4AF37]/20 text-[#D4AF37]">
      <th class="border border-white/20 p-2">भाव / ग्रह</th>
      <th class="border border-white/20 p-2">शुभ प्रभाव</th>
      <th class="border border-white/20 p-2">वैदिक उपाय</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-white/20 p-2">प्रथम भाव (लग्न)</td>
      <td class="border border-white/20 p-2">आरोग्य एवं तेज</td>
      <td class="border border-white/20 p-2">सूर्यार्घ्य एवं गायत्री जप</td>
    </tr>
  </tbody>
</table>\n`;
      insertFormatting(tableHTML);
    }
  };

  // Save / Update Article
  const handleSaveArticle = async (publishStatus?: 'draft' | 'published' | 'scheduled') => {
    if (!formData.title.trim()) {
      showToast('कृपया लेख का शीर्षक दर्ज करें।', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('कृपया लेख का विषय (Content) दर्ज करें।', 'error');
      return;
    }

    const targetStatus = publishStatus || formData.status;

    try {
      const bodyFormData = new FormData();
      bodyFormData.append('title', formData.title);
      bodyFormData.append('slug', formData.slug);
      bodyFormData.append('seo_title', formData.seo_title);
      bodyFormData.append('seo_description', formData.seo_description);
      bodyFormData.append('category_id', formData.category_id);
      bodyFormData.append('category', formData.category);
      bodyFormData.append('author', formData.author);
      bodyFormData.append('short_description', formData.short_description);
      bodyFormData.append('content', formData.content);
      bodyFormData.append('alt_text', formData.alt_text);
      bodyFormData.append('tags', formData.tags.join(','));
      bodyFormData.append('status', targetStatus);
      bodyFormData.append('publish_date', formData.publish_date);
      bodyFormData.append('reading_time', formData.reading_time);
      bodyFormData.append('is_featured', formData.is_featured ? 'true' : 'false');
      bodyFormData.append('faqs', JSON.stringify(formData.faqs));

      if (selectedImageFile) {
        bodyFormData.append('featured_image', selectedImageFile);
      } else if (formData.featured_image_url) {
        bodyFormData.append('featured_image_url', formData.featured_image_url);
        bodyFormData.append('cloudinary_public_id', formData.cloudinary_public_id);
      }

      let res;
      if (editingArticleId) {
        res = await fetch(`/api/blogs/${editingArticleId}`, {
          method: 'PUT',
          body: bodyFormData,
        });
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          body: bodyFormData,
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'लेख सफलतापूर्वक सहेजा गया!', 'success');
        fetchData();
        resetEditor();
        setActiveSubTab('articles');
      } else {
        showToast(data.error || 'लेख सहेजने में विफल।', 'error');
      }
    } catch (err: any) {
      showToast('त्रुटि: ' + err.message, 'error');
    }
  };

  // Reset Editor
  const resetEditor = () => {
    setEditingArticleId(null);
    setFormData({
      title: '',
      slug: '',
      seo_title: '',
      seo_description: '',
      category_id: 'cat-1',
      category: 'वैदिक ज्योतिष',
      author: adminUser?.name || 'पं. राजन कैथवास',
      short_description: '',
      content: '',
      featured_image_url: '',
      cloudinary_public_id: '',
      alt_text: '',
      tags: [],
      status: 'published',
      publish_date: new Date().toISOString().slice(0, 16),
      reading_time: '4 मिनट',
      is_featured: false,
      faqs: [],
    });
    setSelectedImageFile(null);
    setImagePreview('');
  };

  // Edit existing article
  const handleEditArticle = (article: BlogArticle) => {
    setEditingArticleId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      seo_title: article.seo_title || article.title,
      seo_description: article.seo_description || article.short_description || '',
      category_id: article.category_id || 'cat-1',
      category: article.category,
      author: article.author || 'पं. राजन कैथवास',
      short_description: article.short_description || '',
      content: article.content,
      featured_image_url: article.featured_image_url || article.imageUrl || '',
      cloudinary_public_id: article.cloudinary_public_id || '',
      alt_text: article.alt_text || '',
      tags: article.tags || [],
      status: article.status || 'published',
      publish_date: article.publish_date ? article.publish_date.replace(' ', 'T').substring(0, 16) : new Date().toISOString().slice(0, 16),
      reading_time: article.reading_time || '4 मिनट',
      is_featured: article.is_featured || false,
      faqs: article.faqs || [],
    });
    setImagePreview(article.featured_image_url || article.imageUrl || '');
    setActiveSubTab('editor');
  };

  // Duplicate Article
  const handleDuplicateArticle = async (id: string | number) => {
    try {
      const res = await fetch(`/api/blogs/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('लेख की प्रतिलिपि (Duplicate) बनाई गई।', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('प्रतिलिपि बनाने में त्रुटि।', 'error');
    }
  };

  // Toggle Featured Pin
  const handleToggleFeatured = async (id: string | number) => {
    try {
      const res = await fetch(`/api/blogs/${id}/toggle-featured`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast('पिन अपडेट करने में त्रुटि।', 'error');
    }
  };

  // Delete Article
  const handleDeleteArticle = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/blogs/${deleteTargetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'लेख हटा दिया गया।', 'success');
        fetchData();
      } else {
        showToast(data.error || 'हटाने में विफल', 'error');
      }
    } catch (err) {
      showToast('हटाने में त्रुटि।', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Add Category
  const handleCreateCategory = async () => {
    if (!newCatName.trim() && !newCatHindi.trim()) return;
    try {
      const res = await fetch('/api/blog-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, hindiName: newCatHindi, description: newCatDesc }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('नई श्रेणी जोड़ी गई!', 'success');
        setNewCatName('');
        setNewCatHindi('');
        setNewCatDesc('');
        setShowCategoryModal(false);
        fetchData();
      }
    } catch (err) {
      showToast('श्रेणी जोड़ने में त्रुटि।', 'error');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string) => {
    try {
      const res = await fetch(`/api/blog-categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('श्रेणी हटाई गई।', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('त्रुटि।', 'error');
    }
  };

  // Comment Status Update
  const handleCommentStatus = async (commentId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/blog-comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`टिप्पणी ${status === 'approved' ? 'स्वीकृत' : 'अस्वीकृत'} की गई।`, 'success');
        fetchData();
      }
    } catch (err) {
      showToast('त्रुटि।', 'error');
    }
  };

  // Comment Reply
  const handleSendCommentReply = async () => {
    if (!replyingComment || !commentReplyText.trim()) return;
    try {
      const res = await fetch(`/api/blog-comments/${replyingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: commentReplyText, status: 'approved' }),
      });
      if (res.ok) {
        showToast('उत्तर (Reply) भेज दिया गया।', 'success');
        setReplyingComment(null);
        setCommentReplyText('');
        fetchData();
      }
    } catch (err) {
      showToast('उत्तर भेजने में त्रुटि।', 'error');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/blog-comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('टिप्पणी हटाई गई।', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('त्रुटि।', 'error');
    }
  };

  // Filtered Articles Logic
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.slug && b.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory || b.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    const matchesAuthor = selectedAuthor === 'all' || b.author === selectedAuthor;
    const matchesTag = selectedTag === 'all' || (b.tags && b.tags.includes(selectedTag));

    return matchesSearch && matchesCategory && matchesStatus && matchesAuthor && matchesTag;
  });

  // Unique Authors & Tags
  const allAuthors = Array.from(new Set(blogs.map((b) => b.author || 'पं. राजन कैथवास')));
  const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags || [])));

  // KPI Calculations
  const totalArticles = blogs.length;
  const publishedArticles = blogs.filter((b) => b.status === 'published').length;
  const draftArticles = blogs.filter((b) => b.status === 'draft').length;
  const scheduledArticles = blogs.filter((b) => b.status === 'scheduled').length;
  const totalCategories = categories.length;
  const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const mostViewedArticle = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Author', 'Status', 'Views', 'Publish Date', 'Slug'];
    const rows = filteredBlogs.map((b) => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.author}"`,
      b.status,
      b.views || 0,
      b.publish_date || b.created_at,
      b.slug,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blog_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#D4AF37]">ब्लॉग एवं लेख प्रबंधन (Blog Management)</h1>
          </div>
          <p className="text-xs text-white/60 mt-1">
            वैदिक ज्योतिष, राशिफल, गोचर एवं आध्यात्मिक लेखों का संपूर्ण प्रकाशन, SEO एवं एनालिटिक्स कंट्रोल पैनल
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab !== 'editor' ? (
            <button
              onClick={() => {
                resetEditor();
                setActiveSubTab('editor');
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#050B18] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> नया लेख लिखें
            </button>
          ) : (
            <button
              onClick={() => setActiveSubTab('articles')}
              className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition cursor-pointer"
            >
              ← सभी लेख देखें
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#0A1228] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold rounded-xl hover:bg-[#D4AF37]/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> CSV रिपोर्ट एक्सपोर्ट
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3 py-2 bg-[#0A1228] border border-white/10 text-white/80 text-xs font-semibold rounded-xl hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> प्रिंट
          </button>
        </div>
      </div>

      {/* DASHBOARD KPIS (SUMMARY CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg space-y-1">
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">कुल लेख</p>

          <p className="text-xl font-bold text-white">{totalArticles}</p>
          <span className="text-[10px] text-[#D4AF37] flex items-center gap-0.5">
            <FileText className="w-2.5 h-2.5" /> Total Posts
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-emerald-500/30 shadow-lg space-y-1">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">प्रकाशित</p>

          <p className="text-xl font-bold text-emerald-400">{publishedArticles}</p>
          <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
            <CheckCircle className="w-2.5 h-2.5" /> Published
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-amber-500/30 shadow-lg space-y-1">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">ड्राफ्ट (Draft)</p>

          <p className="text-xl font-bold text-amber-400">{draftArticles}</p>
          <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" /> Drafts
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-blue-500/30 shadow-lg space-y-1">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">शेड्यूल्ड</p>

          <p className="text-xl font-bold text-blue-400">{scheduledArticles}</p>
          <span className="text-[10px] text-blue-300 flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5" /> Scheduled
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-purple-500/30 shadow-lg space-y-1">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">कुल श्रेणियां</p>

          <p className="text-xl font-bold text-purple-300">{totalCategories}</p>
          <span className="text-[10px] text-purple-300 flex items-center gap-0.5">
            <FolderPlus className="w-2.5 h-2.5" /> Categories
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-pink-500/30 shadow-lg space-y-1">
          <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">कुल टैग्स</p>

          <p className="text-xl font-bold text-pink-300">{allTags.length}</p>
          <span className="text-[10px] text-pink-300 flex items-center gap-0.5">
            <TagIcon className="w-2.5 h-2.5" /> Tags
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-[#D4AF37]/30 shadow-lg space-y-1">
          <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">कुल पाठक (Views)</p>

          <p className="text-xl font-bold text-[#D4AF37]">{totalViews.toLocaleString('hi-IN')}</p>
          <span className="text-[10px] text-[#D4AF37]/70 flex items-center gap-0.5">
            <Eye className="w-2.5 h-2.5" /> Total Readers
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#030712]/90 border border-cyan-500/30 shadow-lg space-y-1">
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">सर्वाधिक पढ़ा गया</p>

          <p className="text-xs font-bold text-cyan-200 truncate">{mostViewedArticle ? mostViewedArticle.title : 'N/A'}</p>
          <span className="text-[10px] text-cyan-400 font-bold">👁️ {mostViewedArticle?.views || 0} पाठ</span>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'articles' ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4" /> लेख सूची (Articles List)
        </button>

        <button
          onClick={() => {
            resetEditor();
            setActiveSubTab('editor');
          }}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'editor' ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <Plus className="w-4 h-4" /> {editingArticleId ? 'लेख संपादित करें (Edit Article)' : 'नया लेख बनाएं (Create Article)'}
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'categories' ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <FolderPlus className="w-4 h-4" /> श्रेणियां (Categories) ({categories.length})
        </button>

        <button
          onClick={() => setActiveSubTab('tags')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tags' ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <TagIcon className="w-4 h-4" /> टैग्स (Tags) ({allTags.length})
        </button>

        <button
          onClick={() => setActiveSubTab('comments')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'comments' ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> टिप्पणियां (Comments) ({comments.length})
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'analytics' ? 'bg-[#D4AF37] text-[#050B18] font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> एनालिटिक्स (Analytics)
        </button>
      </div>

      {/* SUB-TAB 1: ARTICLES LIST TABLE */}
      {activeSubTab === 'articles' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-xl flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="शीर्षक, लेखक या स्लग खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">सभी श्रेणियां (Categories)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.hindiName || c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">सभी स्थिति (All Status)</option>
                <option value="published">प्रकाशित (Published)</option>
                <option value="draft">ड्राफ्ट (Draft)</option>
                <option value="scheduled">शेड्यूल्ड (Scheduled)</option>
              </select>

              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="px-3 py-2 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">सभी लेखक (Authors)</option>
                {allAuthors.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedAuthor !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSelectedAuthor('all');
                  }}
                  className="px-3 py-2 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  रीसेट करें
                </button>
              )}
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="rounded-2xl bg-[#030712]/90 border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-[#0A1228] text-[#D4AF37] uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">चित्र</th>
                    <th className="py-3 px-4">लेख ID / विवरण</th>
                    <th className="py-3 px-4">श्रेणी</th>
                    <th className="py-3 px-4">लेखक</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4">प्रकाशन तिथि</th>
                    <th className="py-3 px-4 text-center">पाठक (Views)</th>
                    <th className="py-3 px-4 text-right">कार्रवाई (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-white/40">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                        लेख सूची लोड हो रही है...
                      </td>
                    </tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-white/40">
                        कोई लेख उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    filteredBlogs.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition">
                        {/* FEATURED IMAGE */}
                        <td className="py-3 px-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-black">
                            <img
                              src={
                                b.featured_image_url ||
                                b.imageUrl ||
                                'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=300&q=80'
                              }
                              alt={b.title}
                              className="w-full h-full object-cover"
                            />
                            {b.is_featured && (
                              <span className="absolute top-0 right-0 p-0.5 bg-[#D4AF37] text-black rounded-bl-md">
                                <Pin className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ID & TITLE & SLUG */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] bg-white/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">
                              #{b.id}
                            </span>
                            {b.is_featured && (
                              <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded font-bold">
                                Pin Featured
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-white text-xs line-clamp-2 hover:text-[#D4AF37] cursor-pointer" onClick={() => setPreviewArticle(b)}>
                            {b.title}
                          </p>
                          <p className="text-[10px] text-white/40 font-mono truncate mt-0.5">/{b.slug}</p>
                        </td>

                        {/* CATEGORY */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                            {b.category}
                          </span>
                        </td>

                        {/* AUTHOR */}
                        <td className="py-3 px-4 font-medium text-white/90">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#D4AF37]" />
                            <span>{b.author || 'पं. राजन कैथवास'}</span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-4">
                          {b.status === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-2.5 h-2.5" /> प्रकाशित
                            </span>
                          ) : b.status === 'scheduled' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              <Calendar className="w-2.5 h-2.5" /> शेड्यूल्ड
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Clock className="w-2.5 h-2.5" /> ड्राफ्ट
                            </span>
                          )}
                        </td>

                        {/* PUBLISH DATE */}
                        <td className="py-3 px-4 text-white/60 text-[11px]">
                          {b.publish_date ? new Date(b.publish_date).toLocaleDateString('hi-IN') : 'N/A'}
                        </td>

                        {/* VIEWS */}
                        <td className="py-3 px-4 text-center font-bold text-[#D4AF37]">
                          👁️ {(b.views || 0).toLocaleString()}
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => setPreviewArticle(b)}
                              title="लेख का पूर्वावलोकन (Preview)"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            {hasPermission('blog', 'edit') && (
                              <button
                                onClick={() => handleEditArticle(b)}
                                title="संपादित करें (Edit)"
                                className="p-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Duplicate */}
                            {hasPermission('blog', 'create') && (
                              <button
                                onClick={() => handleDuplicateArticle(b.id)}
                                title="प्रतिलिपि बनाएं (Duplicate)"
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Pin / Unpin */}
                            <button
                              onClick={() => handleToggleFeatured(b.id)}
                              title={b.is_featured ? 'पिन हटाएं' : 'पिन (Pin Featured) करें'}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                b.is_featured
                                  ? 'bg-amber-500 text-black font-bold'
                                  : 'bg-white/5 hover:bg-white/10 text-white/60'
                              }`}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            {hasPermission('blog', 'delete') && (
                              <button
                                onClick={() => setDeleteTargetId(b.id)}
                                title="हटाएं (Delete)"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ARTICLE EDITOR FORM */}
      {activeSubTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN FORM LEFT (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  {editingArticleId ? 'लेख संशोधित करें (Edit Blog Article)' : 'नया लेख तैयार करें (Create New Article)'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditorMode('visual')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      editorMode === 'visual' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    विजुअल एडिटर
                  </button>
                  <button
                    onClick={() => setEditorMode('html')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      editorMode === 'html' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    HTML व्यू
                  </button>
                </div>
              </div>

              {/* ARTICLE TITLE */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                  लेख का मुख्य शीर्षक (Blog Title) *
                </label>
                <input
                  type="text"
                  placeholder="उदा: वर्ष 2026 में गुरु गोचर का आपकी राशि पर महा प्रभाव..."
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 bg-[#0A1228] border border-white/15 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* SLUG & AUTHOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80">URL Slug (Auto Generated) *</label>
                  <input
                    type="text"
                    placeholder="jupiter-transit-2026"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white/90 font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80">लेखक का नाम (Author Name)</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* SHORT DESCRIPTION */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80">संक्षिप्त विवरण (Short Excerpt Description)</label>
                <textarea
                  rows={2}
                  placeholder="2-3 पंक्तियों में लेख का संक्षेप लिखें जो कार्ड्स और सोशल शेयर पर दिखेगा..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A1228] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* RICH TEXT EDITOR TOOLBAR */}
              <div className="space-y-2 border border-white/15 rounded-2xl p-3 bg-[#0A1228]/80">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> रिच टेक्स्ट एडिटर (Rich Text Editor Toolset)
                  </span>

                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h1>', '</h1>')}
                      title="H1 Heading"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs font-bold text-white"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h2>', '</h2>')}
                      title="H2 Heading"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs font-bold text-white"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<h3>', '</h3>')}
                      title="H3 Heading"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs font-bold text-white"
                    >
                      H3
                    </button>
                    <span className="text-white/20">|</span>

                    <button
                      type="button"
                      onClick={() => insertFormatting('<b>', '</b>')}
                      title="Bold"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs font-bold text-white"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<i>', '</i>')}
                      title="Italic"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs text-white"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<u>', '</u>')}
                      title="Underline"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs text-white"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white/20">|</span>

                    <button
                      type="button"
                      onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                      title="Bullet List"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs text-white"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => insertEmbedModal('quote')}
                      title="Blockquote"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs text-white"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => insertEmbedModal('table')}
                      title="Insert Table"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs text-white"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => insertEmbedModal('link')}
                      title="Insert Hyperlink"
                      className="p-1.5 bg-white/5 hover:bg-white/15 rounded text-xs text-white"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => insertEmbedModal('youtube')}
                      title="Embed YouTube Video"
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-bold"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => insertEmbedModal('map')}
                      title="Embed Google Map"
                      className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs font-bold"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* TEXTAREA OR VISUAL PREVIEW */}
                {editorMode === 'html' ? (
                  <textarea
                    ref={textareaRef}
                    rows={14}
                    placeholder="लेख की संपूर्ण सामग्री (HTML / Plain text) लिखें..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: e.target.value,
                        reading_time: `${Math.max(1, Math.ceil(e.target.value.length / 500))} मिनट`,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#030712] border border-white/10 rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                ) : (
                  <div className="space-y-3">
                    <textarea
                      ref={textareaRef}
                      rows={10}
                      placeholder="लेख की विस्तृत व्याख्या यहाँ दर्ज करें..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: e.target.value,
                          reading_time: `${Math.max(1, Math.ceil(e.target.value.length / 500))} मिनट`,
                        })
                      }
                      className="w-full px-4 py-3 bg-[#030712] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />

                    {/* LIVE RENDER PREVIEW BOX */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-[#D4AF37]">लाइव पूर्वावलोकन (Formatted Output Preview):</p>

                      <div
                        className="prose prose-invert max-w-none text-xs text-white/90 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-white/30 italic">सामग्री दर्ज करने पर लाइव फॉर्मेटिंग यहाँ दिखेगी...</p>' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FAQ SECTION */}
              <div className="p-4 rounded-2xl bg-[#0A1228] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> प्रश्नोत्तर अनुभाग (Frequently Asked Questions - FAQ)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddFAQ}
                    className="px-2.5 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold rounded-lg hover:bg-[#D4AF37]/30 transition cursor-pointer"
                  >
                    + नया FAQ जोड़ें
                  </button>
                </div>

                {formData.faqs.length === 0 ? (
                  <p className="text-[11px] text-white/40 italic">कोई FAQ नहीं जोड़ा गया है। लेख से संबंधित बहुप्रतीक्षित प्रश्न जोड़ें।</p>
                ) : (
                  formData.faqs.map((faq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#030712] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#D4AF37]">प्रश्न #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFAQ(idx)}
                          className="text-red-400 hover:text-red-300 text-[10px] cursor-pointer"
                        >
                          हटाएं
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="प्रश्न दर्ज करें (उदा: गुरु गोचर से किसको लाभ होगा?)"
                        value={faq.question}
                        onChange={(e) => handleFAQChange(idx, 'question', e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0A1228] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="सटीक उत्तर लिखें..."
                        value={faq.answer}
                        onChange={(e) => handleFAQChange(idx, 'answer', e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0A1228] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (1 COL): PUBLISH OPTIONS, CLOUDINARY UPLOAD, SEO, CATEGORY, TAGS */}
          <div className="space-y-6">
            {/* PUBLICATION ACTION PANEL */}
            <div className="p-5 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/30 shadow-2xl space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] border-b border-white/10 pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" /> प्रकाशन सेटिंग्स (Publishing)
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">प्रकाशन स्थिति (Status)</label>

                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="published">प्रकाशित करें (Published)</option>
                    <option value="draft">ड्राफ्ट रखें (Draft)</option>
                    <option value="scheduled">समय निर्धारित करें (Scheduled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-semibold">प्रकाशन तिथि एवं समय (Publish Date)</label>

                  <input
                    type="datetime-local"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-white/80 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-white/20 bg-[#0A1228] text-[#D4AF37] focus:ring-0"
                    />
                    <span>मुख्य लेख पिन करें (Pin Featured Article)</span>
                  </label>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  <button
                    onClick={() => handleSaveArticle('published')}
                    className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#050B18] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" /> {editingArticleId ? 'अपडेट एवं प्रकाशित करें' : 'लेख प्रकाशित करें (Publish Article)'}
                  </button>

                  <button
                    onClick={() => handleSaveArticle('draft')}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> ड्राफ्ट के रूप में सहेजें (Save Draft)
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURED IMAGE & CLOUDINARY */}
            <div className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] border-b border-white/10 pb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> मुख्य चित्र (Cloudinary `blog/`)
              </h3>

              <div className="space-y-3">
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-black/40 flex flex-col items-center justify-center text-center p-2">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="space-y-1 text-white/50">
                      <Upload className="w-8 h-8 mx-auto text-[#D4AF37]" />
                      <p className="text-[11px]">क्लिक करके चित्र अपलोड करें</p>
                      <p className="text-[9px] text-white/30">Folder: Cloudinary /blog/</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/60">Image Alt Text (SEO)</label>

                  <input
                    type="text"
                    placeholder="उदा: वर्ष 2026 में गुरु गोचर का प्रभाव"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#0A1228] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CATEGORY & TAGS SELECTOR */}
            <div className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#D4AF37] border-b border-white/10 pb-2 flex items-center gap-2">
                <FolderPlus className="w-4 h-4" /> श्रेणी एवं टैग्स (Taxonomy)
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">श्रेणी (Category) *</label>

                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.name === e.target.value || c.hindiName === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        category_id: selected?.id || 'cat-1',
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.hindiName || c.name}>
                        {c.hindiName || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-semibold">टैग्स (Tags)</label>

                  <div className="flex items-center gap-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="टैग दर्ज करें..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-1.5 bg-[#0A1228] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-[#D4AF37] text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition cursor-pointer"
                    >
                      जोड़ें
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1"
                      >
                        #{t}
                        <button onClick={() => handleRemoveTag(t)} className="text-white/60 hover:text-white cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEO SETTINGS & META DATA */}
            <div className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-sm font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                  <Globe className="w-4 h-4" /> SEO ऑप्टिमाइजेशन
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Ready</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Meta Title (SEO Header)</label>

                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#0A1228] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  />
                  <p className="text-[9px] text-white/40 mt-0.5">{formData.seo_title.length}/60 अक्षर (Recommended)</p>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Meta Description</label>

                  <textarea
                    rows={2}
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#0A1228] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  />
                  <p className="text-[9px] text-white/40 mt-0.5">{formData.seo_description.length}/160 अक्षर</p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                  <p className="text-[10px] text-emerald-400 font-bold">Google खोज रिजल्ट पूर्वावलोकन:</p>

                  <p className="text-blue-400 text-xs font-semibold hover:underline truncate">
                    https://astrorajan.com/blog/{formData.slug || 'slug'}
                  </p>
                  <p className="text-white text-xs font-bold line-clamp-1">{formData.seo_title || formData.title || 'लेख शीर्षक'}</p>

                  <p className="text-white/60 text-[10px] line-clamp-2">
                    {formData.seo_description || formData.short_description || 'ज्योतिष लेख विवरण...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CATEGORIES MANAGEMENT */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#D4AF37]">लेख श्रेणियां (Blog Categories)</h2>
              <p className="text-xs text-white/60">ज्योतिषीय विषयों की वर्गीकरण सूची एवं प्रबंधन</p>
            </div>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> नई श्रेणी जोड़ें
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 hover:border-[#D4AF37]/50 shadow-xl transition space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                    <FolderPlus className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold bg-white/10 text-[#D4AF37] px-2.5 py-0.5 rounded-full">
                    {c.articleCount || 0} लेख
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{c.hindiName || c.name}</h3>

                  <p className="text-[10px] text-white/40 font-mono">/{c.slug}</p>
                </div>

                <p className="text-xs text-white/60 line-clamp-2">{c.description || 'वैदिक ज्योतिष से संबंधित महत्वपूर्ण लेख।'}</p>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory(c.hindiName || c.name);
                      setActiveSubTab('articles');
                    }}
                    className="text-[#D4AF37] font-semibold hover:underline cursor-pointer"
                  >
                    लेख देखें →
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-red-400 hover:text-red-300 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TAGS MANAGEMENT */}
      {activeSubTab === 'tags' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#D4AF37]">टैग्स प्रबंधन (Unlimited SEO Tags)</h2>
            <p className="text-xs text-white/60">सभी प्रकाशित एवं ड्राफ्ट लेखों में इस्तेमाल किए गए मुख्य कीवर्ड्स/टैग्स</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {allTags.map((tag) => {
                const count = blogs.filter((b) => b.tags && b.tags.includes(tag)).length;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setActiveSubTab('articles');
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-[#0A1228] border border-white/15 hover:border-[#D4AF37] text-xs font-medium text-white flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <span className="text-[#D4AF37] font-bold">#{tag}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: COMMENTS MODERATION */}
      {activeSubTab === 'comments' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#D4AF37]">जातकों की टिप्पणियां (Article Comments)</h2>
            <p className="text-xs text-white/60">ब्लॉग लेखों पर प्राप्त पाठकों के प्रश्न, टिप्पणियां एवं प्रतिक्रियाएं</p>
          </div>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="p-12 text-center text-white/40 rounded-3xl bg-[#030712]/90 border border-white/10">
                कोई टिप्पणी प्राप्त नहीं हुई है।
              </div>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-xl space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{comm.authorName}</h4>
                        <span className="text-[10px] text-white/40 font-mono">({comm.authorEmail})</span>
                      </div>
                      <p className="text-[11px] text-[#D4AF37] font-semibold mt-0.5">लेख: {comm.articleTitle}</p>
                    </div>

                    <div>
                      {comm.status === 'approved' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          स्वीकृत (Approved)
                        </span>
                      ) : comm.status === 'rejected' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          अस्वीकृत
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          समीक्षाधीन (Pending)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-white/80 bg-[#0A1228] p-3 rounded-2xl border border-white/5">{comm.content}</p>

                  {comm.reply && (
                    <div className="pl-4 border-l-2 border-[#D4AF37] text-xs text-amber-200/90 italic">
                      <p className="font-bold text-[#D4AF37] not-italic text-[11px]">पं. राजन कैथवास जी का उत्तर:</p>
                      {comm.reply}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                    <span className="text-white/40 text-[10px]">{new Date(comm.createdAt).toLocaleString('hi-IN')}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCommentStatus(comm.id, 'approved')}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[11px] rounded-lg hover:bg-emerald-500/30 transition cursor-pointer"
                      >
                        स्वीकृत करें
                      </button>

                      <button
                        onClick={() => setReplyingComment(comm)}
                        className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[11px] rounded-lg hover:bg-[#D4AF37]/30 transition cursor-pointer"
                      >
                        उत्तर दें (Reply)
                      </button>

                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="px-2 py-1 bg-red-500/10 text-red-400 text-[11px] rounded-lg hover:bg-red-500/20 transition cursor-pointer"
                      >
                        हटाएं
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ANALYTICS & PERFORMANCE REPORT */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#D4AF37]">ब्लॉग एनालिटिक्स एवं परफॉरमेंस रिपोर्ट</h2>
            <p className="text-xs text-white/60">पाठकों का रुझान, दैनिक व्यूज एवं टॉप पढ़े गए लेख</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DAILY VIEWS BAR CHART */}
            <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> दैनिक पाठक संख्या (Daily Views Breakdown)
              </h3>

              <div className="space-y-3 pt-2">
                {analyticsData?.dailyViews?.map((item: any) => (
                  <div key={item.date} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>{item.date}</span>
                      <span className="font-bold text-[#D4AF37]">{item.views} पाठक</span>
                    </div>

                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, (item.views / 700) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP PERFORMING POSTS */}
            <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                <Award className="w-4 h-4" /> सर्वाधिक पढ़े गए लेख (Top Performing Articles)
              </h3>

              <div className="space-y-3 divide-y divide-white/10">
                {blogs
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 5)
                  .map((b, idx) => (
                    <div key={b.id} className="pt-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-center leading-6 text-[11px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-white line-clamp-1">{b.title}</p>
                          <span className="text-[10px] text-white/50">{b.category}</span>
                        </div>
                      </div>

                      <span className="font-bold text-[#D4AF37] whitespace-nowrap">👁️ {b.views || 0}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ARTICLE PREVIEW MODAL */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37]">
                  {previewArticle.category}
                </span>
                <h2 className="text-lg font-serif font-bold text-[#D4AF37] mt-1">{previewArticle.title}</h2>
              </div>
              <button onClick={() => setPreviewArticle(null)} className="p-2 text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PREVIEW HERO IMAGE */}
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={previewArticle.featured_image_url || previewArticle.imageUrl}
                alt={previewArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ARTICLE META */}
            <div className="flex items-center justify-between text-xs text-white/60 border-b border-white/10 pb-3">
              <span>✍️ लेखक: {previewArticle.author}</span>
              <span>📅 तिथि: {previewArticle.publish_date || previewArticle.created_at}</span>
              <span>⏱️ समय: {previewArticle.reading_time || '4 मिनट'}</span>
              <span>👁️ {previewArticle.views || 0} पाठक</span>
            </div>

            {/* CONTENT BODY */}
            <div
              className="prose prose-invert max-w-none text-xs leading-relaxed text-white/90"
              dangerouslySetInnerHTML={{ __html: previewArticle.content }}
            />

            {/* FAQS IF ANY */}
            {previewArticle.faqs && previewArticle.faqs.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0A1228] border border-white/10 space-y-3">
                <h4 className="font-bold text-[#D4AF37] text-xs">बहुप्रतीक्षित प्रश्न उत्तर (FAQs):</h4>

                {previewArticle.faqs.map((f, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <p className="font-bold text-white">प्र: {f.question}</p>
                    <p className="text-white/70">उ: {f.answer}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setPreviewArticle(null)}
                className="px-5 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">नई श्रेणी जोड़ें (Add Category)</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/80 mb-1 font-semibold">हिंदी श्रेणी नाम *</label>
                <input
                  type="text"
                  placeholder="उदा: हस्तरेखा विज्ञान"
                  value={newCatHindi}
                  onChange={(e) => setNewCatHindi(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-1 font-semibold">अंग्रेजी श्रेणी नाम (English Name)</label>
                <input
                  type="text"
                  placeholder="Palmistry"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-1 font-semibold">विवरण (Description)</label>
                <textarea
                  rows={2}
                  placeholder="श्रेणी की जानकारी..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
              >
                सहेजें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMMENT REPLY MODAL */}
      {replyingComment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-[#D4AF37]/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">टिप्पणी का उत्तर दें (Reply Comment)</h3>
              <button onClick={() => setReplyingComment(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-white/80 bg-[#0A1228] p-3 rounded-xl border border-white/10">
                <span className="font-bold text-[#D4AF37]">{replyingComment.authorName}:</span> {replyingComment.content}
              </p>

              <div>
                <label className="block text-white/80 mb-1 font-semibold">पं. राजन कैथवास जी का उत्तर *</label>
                <textarea
                  rows={4}
                  placeholder="सटीक आध्यात्मिक एवं ज्योतिषीय उत्तर लिखें..."
                  value={commentReplyText}
                  onChange={(e) => setCommentReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A1228] border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyingComment(null)}
                className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                onClick={handleSendCommentReply}
                className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
              >
                उत्तर भेजें एवं प्रकाशित करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#030712] border border-red-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white">क्या आप निश्चित रूप से हटाना चाहते हैं?</h3>
            <p className="text-xs text-white/60">यह लेख डेटाबेस से स्थायी रूप से हटा दिया जाएगा। यह प्रक्रिया पूर्ववत नहीं की जा सकती।</p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                onClick={handleDeleteArticle}
                className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition cursor-pointer"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
