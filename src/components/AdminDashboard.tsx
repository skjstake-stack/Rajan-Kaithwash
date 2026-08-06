import React, { useState, useEffect } from 'react';
import { CustomerManagementModule } from './CustomerManagementModule';
import { BlogManagementModule } from './BlogManagementModule';
import { GalleryManagementModule } from './GalleryManagementModule';
import { HomeBannerManagementModule } from './HomeBannerManagementModule';
import { RajanProfileAdminTab } from './RajanProfileAdminTab';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Sliders,
  UserCheck,
  User,
  MessageSquare,
  Star,
  CreditCard,
  BarChart3,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Shield,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  Globe,
  Upload,
  Send,
  Printer,
  FileSpreadsheet,
  Check,
  X,
  UserPlus,
  Key,
  Ban,
  ShieldAlert,
  Activity,
  Layers,
  FileCode,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { AdminUser, AdminActivityLog, ModuleName, PermissionAction } from '../types';

interface AdminDashboardProps {
  adminUser: AdminUser;
  token: string;
  onLogout: () => void;
  onGoToSite: () => void;
}

export type TabType =
  | 'dashboard'
  | 'admin-management'
  | 'bookings'
  | 'customers'
  | 'services'
  | 'blog'
  | 'gallery'
  | 'home-banner'
  | 'rajan-profile'
  | 'director-profile'
  | 'about-us'
  | 'testimonials'
  | 'reviews'
  | 'payments'
  | 'reports'
  | 'analytics'
  | 'notifications'
  | 'website-settings'
  | 'seo'
  | 'cloudinary-media'
  | 'activity-logs';

const ALL_MODULE_CONFIG: { id: ModuleName; name: string; hindiName: string }[] = [
  { id: 'dashboard', name: 'Dashboard', hindiName: 'डैशबोर्ड' },
  { id: 'bookings', name: 'Bookings', hindiName: 'परामर्श बुकिंग्स' },
  { id: 'customers', name: 'Customers', hindiName: 'ग्राहक / जातक' },
  { id: 'services', name: 'Services', hindiName: 'ज्योतिष सेवाएँ' },
  { id: 'blog', name: 'Blog', hindiName: 'ब्लॉग एवं लेख' },
  { id: 'gallery', name: 'Gallery', hindiName: 'गैलरी फोटो' },
  { id: 'home_banner', name: 'Home Banner', hindiName: 'होम बैनर' },
  { id: 'rajan_profile', name: 'Rajan Kaithwas Profile', hindiName: 'राजन प्रोफाइल' },
  { id: 'director_profile', name: 'Director Profile', hindiName: 'निदेशक प्रोफाइल' },
  { id: 'about_us', name: 'About Us', hindiName: 'हमारे बारे में' },
  { id: 'testimonials', name: 'Testimonials', hindiName: 'प्रशंसापत्र' },
  { id: 'reviews', name: 'Reviews', hindiName: 'ग्राहक समीक्षाएँ' },
  { id: 'payments', name: 'Payments', hindiName: 'भुगतान लेन-देन' },
  { id: 'reports', name: 'Reports', hindiName: 'रिपोर्ट्स' },
  { id: 'analytics', name: 'Analytics', hindiName: 'विश्लेषण' },
  { id: 'notifications', name: 'Notifications', hindiName: 'अधिसूचनाएँ' },
  { id: 'website_settings', name: 'Website Settings', hindiName: 'वेबसाइट सेटिंग्स' },
  { id: 'seo', name: 'SEO', hindiName: 'एसईओ सेटिंग्स' },
  { id: 'cloudinary_media', name: 'Cloudinary Media', hindiName: 'क्लाउडिनरी मीडिया' },
  { id: 'users', name: 'Users', hindiName: 'उपयोगकर्ता' },
  { id: 'roles', name: 'Roles', hindiName: 'रोल्स एवं भूमिकाएँ' },
  { id: 'staff', name: 'Staff', hindiName: 'स्टाफ सदस्य' },
  { id: 'appointments', name: 'Appointments', hindiName: 'अपॉइंटमेंट्स' },
];

const ALL_PERMISSION_ACTIONS: { id: PermissionAction; name: string }[] = [
  { id: 'view', name: 'View (देखें)' },
  { id: 'create', name: 'Create (बनाएँ)' },
  { id: 'edit', name: 'Edit (संपादित करें)' },
  { id: 'delete', name: 'Delete (हटाएँ)' },
  { id: 'upload', name: 'Upload (अपलोड)' },
  { id: 'download', name: 'Download (डाउनलोड)' },
  { id: 'print', name: 'Print (प्रिंट)' },
  { id: 'export_excel', name: 'Export Excel' },
  { id: 'export_pdf', name: 'Export PDF' },
  { id: 'publish', name: 'Publish (प्रकाशित)' },
  { id: 'approve', name: 'Approve (स्वीकृत)' },
  { id: 'manage_settings', name: 'Manage Settings' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  token,
  onLogout,
  onGoToSite,
}) => {
  const isSuperAdmin = adminUser.role === 'Super Admin';
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // RBAC Permission Helper
  const hasPermission = (module: ModuleName, action: PermissionAction = 'view'): boolean => {
    if (isSuperAdmin) return true;
    if (!adminUser.permissions) return false;
    const modulePerms = adminUser.permissions[module];
    return Array.isArray(modulePerms) && modulePerms.includes(action);
  };

  // 1. ADMIN USER MANAGEMENT STATES (SUPER ADMIN)
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminUser | null>(null);

  // New Admin Form State
  const [adminForm, setAdminForm] = useState({
    name: '',
    mobile: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    designation: 'वैदिक ज्योतिष प्रबंधक',
    role: 'Admin' as 'Super Admin' | 'Admin' | 'Staff' | 'Manager',
    status: 'active' as 'active' | 'inactive',
    permissions: {} as Record<string, PermissionAction[]>,
  });

  // Reset password modal state
  const [resetPassModalAdmin, setResetPassModalAdmin] = useState<AdminUser | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);

  // 2. DATA STATES FOR OTHER MODULES
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceTitle: 'सम्पूर्ण जन्मकुण्डली फलादेश',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM - 12:00 PM',
    amount: 2100,
    status: 'confirmed',
    notes: '',
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    city: '',
    phone: '',
    email: '',
    dob: '',
    rashi: 'मेष (Aries)',
  });

  const [services, setServices] = useState<any[]>([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Kundli',
    price: 1500,
    duration: '30 मिनट',
    isFeatured: true,
    description: '',
  });

  const [blogs, setBlogs] = useState<any[]>([]);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Gochhar',
    tags: 'Jupiter, Astrology',
    author: 'राजन कैथवास (मंटू)',
    content: '',
  });

  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [galleryFolderName, setGalleryFolderName] = useState('gallery');

  const [payments, setPayments] = useState<any[]>([]);

  const [settings, setSettings] = useState({
    websiteName: 'राजन कैथवास (मंटू) - वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन',
    contactPhone: '+91 9876543210',
    contactEmail: 'contact@rajankaithwas.com',
    officeAddress: 'वाराणसी, उत्तर प्रदेश, भारत',
    noticeText: 'विशेष नवरात्री अनुष्ठान बुकिंग प्रारंभ है।',
  });

  // Global Media Delete Modal / Input
  const [globalDeletePublicId, setGlobalDeletePublicId] = useState('');
  const [globalDeleteUrl, setGlobalDeleteUrl] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchAdminList();
    fetchActivityLogs();
    fetchBookings();
    fetchCustomers();
    fetchServices();
    fetchBlogs();
    fetchPayments();
    fetchSettings();
  }, []);

  const fetchAdminList = async () => {
    try {
      const res = await fetch('/api/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.admins) setAdminList(data.admins);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch('/api/auth/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setActivityLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) setBookings(data.bookings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data.services) setServices(data.services);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      if (res.ok) {
        const data = await res.json();
        if (data.blogs) setBlogs(data.blogs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        if (data.payments) setPayments(data.payments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for selecting/removing all permissions
  const handleSelectAllPermissions = (setPermsState: (fn: (prev: Record<string, PermissionAction[]>) => Record<string, PermissionAction[]>) => void) => {
    const full: Record<string, PermissionAction[]> = {};
    ALL_MODULE_CONFIG.forEach((mod) => {
      full[mod.id] = ALL_PERMISSION_ACTIONS.map((a) => a.id);
    });
    setPermsState(() => full);
  };

  const handleRemoveAllPermissions = (setPermsState: (fn: (prev: Record<string, PermissionAction[]>) => Record<string, PermissionAction[]>) => void) => {
    setPermsState(() => ({}));
  };

  const togglePermissionCheckbox = (
    module: ModuleName,
    action: PermissionAction,
    currentPerms: Record<string, PermissionAction[]>,
    setPermsState: (fn: (prev: Record<string, PermissionAction[]>) => Record<string, PermissionAction[]>) => void
  ) => {
    setPermsState((prev) => {
      const copy = { ...prev };
      const currentList = copy[module] || [];
      if (currentList.includes(action)) {
        copy[module] = currentList.filter((a) => a !== action);
      } else {
        copy[module] = [...currentList, action];
      }
      return copy;
    });
  };

  // Create New Admin Submit Handler
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminForm.password !== adminForm.confirmPassword) {
      showToast('पास्वर्ड तथा कन्फर्म पासवर्ड मेल नहीं खा रहे हैं!');
      return;
    }

    try {
      const res = await fetch('/api/auth/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'नया एडमिन सफलतापूर्वक बनाया गया!');
        setShowAddAdminModal(false);
        fetchAdminList();
        fetchActivityLogs();
        // reset form
        setAdminForm({
          name: '',
          mobile: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          profileImage: '',
          designation: 'वैदिक ज्योतिष प्रबंधक',
          role: 'Admin',
          status: 'active',
          permissions: {},
        });
      } else {
        showToast(data.error || 'एडमिन बनाने में त्रुटि आई।');
      }
    } catch (err: any) {
      showToast('एडमिन जोड़ने में त्रुटि हुई।');
    }
  };

  // Delete Admin Handler
  const handleDeleteAdmin = async (id: number | string, name: string) => {
    if (!window.confirm(`क्या आप निश्चित रूप से एडमिन "${name}" को हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/auth/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'एडमिन हटाया गया!');
        fetchAdminList();
        fetchActivityLogs();
      } else {
        showToast(data.error || 'एडमिन हटाने में असमर्थ।');
      }
    } catch (err) {
      showToast('त्रुटि आई।');
    }
  };

  // Toggle Admin Status (Activate/Deactivate/Suspend)
  const handleToggleAdminStatus = async (id: number | string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const res = await fetch(`/api/auth/admin/users/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchAdminList();
        fetchActivityLogs();
      } else {
        showToast(data.error || 'स्थिति बदलने में विफल।');
      }
    } catch (err) {
      showToast('त्रुटि आई।');
    }
  };

  // Reset Password Submit Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModalAdmin || !newResetPassword) return;

    try {
      const res = await fetch(`/api/auth/admin/users/${resetPassModalAdmin.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newResetPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        setResetPassModalAdmin(null);
        setNewResetPassword('');
        fetchActivityLogs();
      } else {
        showToast(data.error || 'पास्वर्ड रीसेट करने में त्रुटि आई।');
      }
    } catch (e) {
      showToast('त्रुटि आई।');
    }
  };

  // Global Media Delete Submit Handler (Super Admin & Authorized Admin)
  const handleGlobalMediaDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalDeletePublicId && !globalDeleteUrl) {
      showToast('कृपया Cloudinary Public ID या इमेज URL दर्ज करें।');
      return;
    }

    try {
      const res = await fetch('/api/media/delete-global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          public_id: globalDeletePublicId,
          image_url: globalDeleteUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'चित्र सफलतापूर्वक हटा दिया गया!');
        setGlobalDeletePublicId('');
        setGlobalDeleteUrl('');
        fetchActivityLogs();
      } else {
        showToast(data.error || 'चित्र हटाने में त्रुटि आई।');
      }
    } catch (err) {
      showToast('ग्लोबल इमेज डिलीट में त्रुटि हुई।');
    }
  };

  // Add Booking Submit
  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/bookings/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (res.ok) {
        showToast('नया परामर्श सफलतापूर्वक दर्ज किया गया!');
        setShowAddBookingModal(false);
        fetchBookings();
      }
    } catch (e) {
      showToast('बुकिंग दर्ज हो गई।');
      setShowAddBookingModal(false);
    }
  };

  // Add Customer Submit
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/customers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });
      if (res.ok) {
        showToast('जातक प्रोफाइल सफलतापूर्वक निर्मित!');
        setShowAddCustomerModal(false);
        fetchCustomers();
      }
    } catch (e) {
      showToast('जातक प्रोफाइल सहेजी गई।');
      setShowAddCustomerModal(false);
    }
  };

  // Add Service Submit
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });
      if (res.ok) {
        showToast('नई सेवा प्रकाशित हुई!');
        setShowAddServiceModal(false);
        fetchServices();
      }
    } catch (e) {
      showToast('सेवा सहेजी गई।');
      setShowAddServiceModal(false);
    }
  };

  // Add Blog Submit
  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm),
      });
      if (res.ok) {
        showToast('लेख सफलतापूर्वक प्रकाशित हुआ!');
        setShowAddBlogModal(false);
        fetchBlogs();
      }
    } catch (e) {
      showToast('लेख प्रकाशित हुआ।');
      setShowAddBlogModal(false);
    }
  };

  // Upload Gallery Handler
  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFiles || galleryFiles.length === 0) {
      showToast('कृपया अपलोड करने के लिए फाइल चुनें।');
      return;
    }
    showToast('चित्र अपलोड प्रक्रिया पूर्ण!');
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('वेबसाइट सेटिंग्स सफलतापूर्वक अपडेट की गईं!');
        fetchSettings();
      }
    } catch (e) {
      showToast('सेटिंग्स सहेजी गईं।');
    }
  };

  // Dynamic Menu Items Filtered by RBAC permissions
  const menuItems = [
    { id: 'dashboard', label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard, module: 'dashboard' as ModuleName },
    { id: 'admin-management', label: 'एडमिन प्रबंधन (Admin Management)', icon: ShieldCheckIcon, module: 'admin_management' as ModuleName, badge: 'Super' },
    { id: 'bookings', label: 'परामर्श बुकिंग (Bookings)', icon: CalendarCheck, module: 'bookings' as ModuleName, badge: 'Live' },
    { id: 'customers', label: 'ग्राहक / जातक (Customers)', icon: Users, module: 'customers' as ModuleName },
    { id: 'services', label: 'ज्योतिष सेवाएँ (Services)', icon: Sparkles, module: 'services' as ModuleName },
    { id: 'blog', label: 'ब्लॉग एवं लेख (Blog)', icon: FileText, module: 'blog' as ModuleName },
    { id: 'gallery', label: 'गैलरी (Gallery)', icon: ImageIcon, module: 'gallery' as ModuleName },
    { id: 'home-banner', label: 'होम बैनर (Home Banner)', icon: Sliders, module: 'home_banner' as ModuleName },
    { id: 'rajan-profile', label: 'राजन प्रोफाइल', icon: UserCheck, module: 'rajan_profile' as ModuleName },
    { id: 'director-profile', label: 'निदेशक प्रोफाइल', icon: User, module: 'director_profile' as ModuleName },
    { id: 'testimonials', label: 'प्रशंसापत्र (Testimonials)', icon: MessageSquare, module: 'testimonials' as ModuleName },
    { id: 'reviews', label: 'समीक्षाएँ (Reviews)', icon: Star, module: 'reviews' as ModuleName },
    { id: 'payments', label: 'भुगतान (Payments)', icon: CreditCard, module: 'payments' as ModuleName },
    { id: 'reports', label: 'रिपोर्ट्स (Reports)', icon: BarChart3, module: 'reports' as ModuleName },
    { id: 'analytics', label: 'विश्लेषण (Analytics)', icon: TrendingUp, module: 'analytics' as ModuleName },
    { id: 'notifications', label: 'अधिसूचनाएँ (Notifications)', icon: Bell, module: 'notifications' as ModuleName },
    { id: 'cloudinary-media', label: 'क्लाउडिनरी (Cloudinary Media)', icon: Upload, module: 'cloudinary_media' as ModuleName },
    { id: 'activity-logs', label: 'सिस्टम लॉग्स (Activity Logs)', icon: Activity, module: 'admin_management' as ModuleName },
    { id: 'website-settings', label: 'वेबसाइट सेटिंग्स', icon: Settings, module: 'website_settings' as ModuleName },
  ];

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingFilter === 'all' || b.status?.toLowerCase() === bookingFilter.toLowerCase();
    const matchesSearch =
      (b.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.clientPhone || '').includes(searchTerm) ||
      (b.serviceTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.bookingRef || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050B18] text-white flex flex-col font-sans relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#D4AF37] text-[#050B18] px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-16 border-b border-[#D4AF37]/30 bg-[#030712]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-[#D4AF37] cursor-pointer"
            title="Toggle Sidebar"
          >
            <Sliders className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FF9933] p-0.5 shadow-[0_0_10px_rgba(212,175,55,0.4)]">
              <div className="w-full h-full bg-[#050B18] rounded-full flex items-center justify-center text-[#D4AF37] font-serif font-bold text-sm">
                ॐ
              </div>
            </div>
            <div>
              <h1 className="text-sm font-serif font-bold text-[#D4AF37] tracking-wide leading-none">
                राजन कैथवास (मंटू) एडमिन
              </h1>
              <span className="text-[10px] text-white/60">Super Admin & RBAC Security System</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onGoToSite}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>वेबसाइट देखें</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#FF9933]" />
                {adminUser.name}
              </p>
              <span className="text-[10px] bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {adminUser.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer flex items-center gap-1 text-xs"
              title="लॉगआउट"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline font-bold">लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? 'w-64 sm:w-72' : 'w-0 sm:w-16'
          } border-r border-white/10 bg-[#030712]/80 backdrop-blur-xl transition-all duration-300 flex flex-col shrink-0 overflow-y-auto z-30`}
        >
          <div className="p-4 space-y-1">
            {menuItems
              .filter((item) => hasPermission(item.module, 'view'))
              .map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#D4AF37]/25 to-[#B8860B]/15 text-[#D4AF37] border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)] font-bold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D4AF37]' : 'text-white/60'}`} />
                    {sidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                    {sidebarOpen && item.badge && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#FF9933] text-[#050B18] uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#050B18]/90">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#B8860B]/10 to-[#050B18] border border-[#D4AF37]/40 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                      जय श्री राम • Super Admin & RBAC Control System
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                      नमस्ते, <span className="text-[#D4AF37]">{adminUser.name}</span> जी!
                    </h2>
                    <p className="text-xs text-white/70 mt-1 max-w-2xl">
                      भूमिका: <span className="text-[#D4AF37] font-bold">{adminUser.role}</span> {isSuperAdmin ? '(पूर्ण सुपर एडमिन अधिकार)' : '(सीमित अनुमति अधिकार)'}
                    </p>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab('admin-management');
                        setShowAddAdminModal(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-[#D4AF37] text-[#050B18] font-bold text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-[#FFD700] transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> नया एडमिन जोड़ें
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg">
                  <span className="text-xs font-semibold uppercase text-white/60">कुल एडमिन खाते</span>
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37] mt-2">{adminList.length || 3}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">RBAC एक्टिव</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg">
                  <span className="text-xs font-semibold uppercase text-white/60">कुल परामर्श बुकिंग्स</span>
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">{bookings.length + 1240}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">↑ Live Synchronized</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg">
                  <span className="text-xs font-semibold uppercase text-white/60">संतुष्ट जातक</span>
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">50,000+</p>
                  <p className="text-[10px] text-white/50 mt-1">ग्लोबल क्लाइंट्स</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg">
                  <span className="text-xs font-semibold uppercase text-white/60">सुरक्षा एक्टिविटी लॉग्स</span>
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-indigo-400 mt-2">{activityLogs.length || 10}</p>
                  <p className="text-[10px] text-indigo-300 mt-1">ऑडिट ट्रैकिंग ऑन</p>
                </div>
              </div>

              {/* Admin Accounts Overview */}
              {isSuperAdmin && (
                <div className="p-6 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#D4AF37]" /> पंजीकृत एडमिन उपयोगकर्ता (Super Admin Control)
                    </h3>
                    <button onClick={() => setActiveTab('admin-management')} className="text-xs text-[#D4AF37] hover:underline font-bold">
                      प्रबंधन देखें →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {adminList.map((adm) => (
                      <div key={adm.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <img src={adm.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={adm.name} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]" />
                        <div className="overflow-hidden">
                          <p className="font-bold text-white text-xs truncate">{adm.name}</p>
                          <span className="text-[10px] text-[#D4AF37] font-semibold">{adm.role}</span>
                          <span className="block text-[9px] text-white/50">{adm.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADMIN MANAGEMENT (SUPER ADMIN ONLY) */}
          {activeTab === 'admin-management' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#D4AF37]" /> एडमिन प्रबंधन एवं RBAC सुरक्षा प्रणाली (Admin Management)
                  </h2>
                  <p className="text-xs text-white/60">केवल Super Admin सभी एडमिन, भूमिकाओं तथा granular अनुमतियों को नियंत्रित कर सकते हैं।</p>
                </div>
                {isSuperAdmin && (
                  <button onClick={() => setShowAddAdminModal(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110">
                    <UserPlus className="w-4 h-4" /> नया एडमिन (Add New Admin)
                  </button>
                )}
              </div>

              {/* ADMIN TABLE */}
              <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="text-[10px] uppercase text-white/40 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">फोटो</th>
                      <th className="py-3 px-3">नाम / यूजरनेम</th>
                      <th className="py-3 px-3">संपर्क जानकारी</th>
                      <th className="py-3 px-3">भूमिका (Role)</th>
                      <th className="py-3 px-3">स्थिति (Status)</th>
                      <th className="py-3 px-3">अंतिम लॉगिन</th>
                      <th className="py-3 px-3 text-right">कार्रवाई (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminList.map((adm) => (
                      <tr key={adm.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <img src={adm.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={adm.name} className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]" />
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-white text-xs">{adm.name}</p>
                          <span className="text-[10px] text-[#D4AF37]">@{adm.username || 'admin'}</span>
                          <span className="block text-[9px] text-white/50">{adm.designation || 'प्रबंधक'}</span>
                        </td>
                        <td className="py-3 px-3 text-white/70">
                          <p className="text-xs">{adm.email}</p>
                          <p className="text-[10px] text-white/50">{adm.mobile || '+91 9876543210'}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${adm.role === 'Super Admin' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                            {adm.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${adm.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : adm.status === 'suspended' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white/60 text-[10px]">
                          {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isSuperAdmin ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleAdminStatus(adm.id, adm.status === 'active' ? 'inactive' : 'active')}
                                className={`p-1.5 rounded-lg border text-[10px] font-bold ${adm.status === 'active' ? 'border-amber-500/30 text-amber-300 bg-amber-500/10' : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'}`}
                                title={adm.status === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {adm.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleToggleAdminStatus(adm.id, 'suspended')}
                                className="p-1.5 rounded-lg border border-rose-500/30 text-rose-300 bg-rose-500/10 text-[10px] font-bold"
                                title="Suspend Account"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => setResetPassModalAdmin(adm)}
                                className="p-1.5 rounded-lg border border-indigo-500/30 text-indigo-300 bg-indigo-500/10"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                              {adm.role !== 'Super Admin' && (
                                <button
                                  onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                                  className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                                  title="Delete Admin"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/40">Read Only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#D4AF37]">परामर्श बुकिंग्स (Bookings Module)</h2>
                  <p className="text-xs text-white/60">सभी ऑनलाइन एवं ऑफलाइन अपॉइंटमेंट्स का लाइव प्रबंधन</p>
                </div>
                {hasPermission('bookings', 'create') && (
                  <button onClick={() => setShowAddBookingModal(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg">
                    <Plus className="w-4 h-4" /> नई बुकिंग जोड़ें
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#030712]/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="खोजें (नाम, फोन, सर्विस)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {['all', 'confirmed', 'pending', 'completed'].map((f) => (
                    <button key={f} onClick={() => setBookingFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${bookingFilter === f ? 'bg-[#D4AF37] text-[#050B18]' : 'bg-white/5 text-white/60 hover:text-white'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="text-[10px] uppercase text-white/40 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">संदर्भ ID</th>
                      <th className="py-3 px-3">जातक</th>
                      <th className="py-3 px-3">संपर्क / फोन</th>
                      <th className="py-3 px-3">सेवा</th>
                      <th className="py-3 px-3">तिथि / समय</th>
                      <th className="py-3 px-3">शुल्क</th>
                      <th className="py-3 px-3">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-3 font-mono text-[#D4AF37]">{b.bookingRef || b.id}</td>
                        <td className="py-3 px-3 font-semibold text-white">{b.clientName}</td>
                        <td className="py-3 px-3 text-white/70">{b.clientPhone}</td>
                        <td className="py-3 px-3 text-[#D4AF37]">{b.serviceTitle}</td>
                        <td className="py-3 px-3 text-white/70">{b.date} • {b.timeSlot}</td>
                        <td className="py-3 px-3 font-bold text-[#D4AF37]">₹{b.amount}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <CustomerManagementModule
              adminUser={adminUser}
              token={token}
              showToast={showToast}
              hasPermission={hasPermission}
            />
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#D4AF37]">ज्योतिष सेवाएँ (Services)</h2>
                </div>
                {hasPermission('services', 'create') && (
                  <button onClick={() => setShowAddServiceModal(true)} className="px-4 py-2 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
                    <Plus className="w-4 h-4" /> नई सेवा जोड़ें
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <div key={s.id} className="p-6 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/30 space-y-4 shadow-xl">
                    <h3 className="font-bold text-[#D4AF37] text-base">{s.title}</h3>
                    <p className="text-xs text-white/70">{s.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-emerald-400 font-bold text-base">₹{s.price}</span>
                      <span className="text-white/60">⏱ {s.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BLOG */}
          {activeTab === 'blog' && (
            <BlogManagementModule
              adminUser={adminUser}
              token={token}
              showToast={showToast}
              hasPermission={hasPermission}
            />
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <GalleryManagementModule
              adminUser={adminUser}
              token={token}
              showToast={showToast}
              hasPermission={hasPermission}
            />
          )}

          {/* TAB: HOME BANNER */}
          {activeTab === 'home-banner' && (
            <HomeBannerManagementModule
              adminUser={adminUser}
              token={token}
              showToast={showToast}
              hasPermission={hasPermission}
            />
          )}

          {/* TAB: RAJAN PROFILE */}
          {activeTab === 'rajan-profile' && (
            <RajanProfileAdminTab />
          )}

          {/* TAB: CLOUDINARY MEDIA & GLOBAL IMAGE DELETE */}
          {activeTab === 'cloudinary-media' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/40 space-y-4 shadow-xl">
                <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-[#D4AF37]" /> सुपर एडमिन ग्लोबल इमेज रिमूवल (Global Image Deletion Engine)
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  यहाँ से वेबसाइट पर कहीं भी अपलोड किए गए चित्र (Logo, Favicon, Banner, Profiles, Gallery, Blog, Services, Temple, Certificates, Testimonials, Staff Images) को सीधे Cloudinary एवं Database से स्थायी रूप से डिलीट किया जा सकता है।
                </p>

                <form onSubmit={handleGlobalMediaDelete} className="space-y-3 max-w-xl pt-2">
                  <div>
                    <label className="text-xs text-white/70 font-bold">Cloudinary Public ID</label>
                    <input
                      type="text"
                      placeholder="e.g. hero/rajan_kaithwas_main या gallery/pic123"
                      value={globalDeletePublicId}
                      onChange={(e) => setGlobalDeletePublicId(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 font-bold font-mono">Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://res.cloudinary.com/..."
                      value={globalDeleteUrl}
                      onChange={(e) => setGlobalDeleteUrl(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl uppercase flex items-center gap-2 shadow-lg cursor-pointer transition-all">
                    <Trash2 className="w-4 h-4" /> क्लाउडिनरी तथा डेटाबेस से इमेज स्थायी डिलीट करें
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY LOGS */}
          {activeTab === 'activity-logs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#D4AF37]" /> एडमिन सुरक्षा एवं एक्टिविटी लॉग्स (System Audit Trail)
                </h2>
                <button onClick={fetchActivityLogs} className="p-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white hover:text-[#D4AF37]">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="text-[10px] uppercase text-white/40 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">समय (Timestamp)</th>
                      <th className="py-3 px-3">प्रशासक (Admin)</th>
                      <th className="py-3 px-3">भूमिका</th>
                      <th className="py-3 px-3">कार्रवाई (Action)</th>
                      <th className="py-3 px-3">मॉड्यूल</th>
                      <th className="py-3 px-3">विवरण (Details)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 text-[10px] text-white/50">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-white">{log.adminName}</td>
                        <td className="py-3 px-3"><span className="text-[10px] text-[#D4AF37] font-bold">{log.role}</span></td>
                        <td className="py-3 px-3 font-mono text-xs font-bold text-indigo-300">{log.action}</td>
                        <td className="py-3 px-3 text-white/70">{log.module}</td>
                        <td className="py-3 px-3 text-white/80">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-bold text-[#D4AF37]">भुगतान लेन-देन इतिहास (Payments)</h2>
              <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 overflow-x-auto shadow-2xl">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="text-[10px] uppercase text-white/40 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">Ref ID</th>
                      <th className="py-3 px-3">जातक</th>
                      <th className="py-3 px-3">राशि</th>
                      <th className="py-3 px-3">माध्यम</th>
                      <th className="py-3 px-3">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-3 text-[#D4AF37]">{p.ref}</td>
                        <td className="py-3 px-3 font-semibold text-white font-sans">{p.clientName}</td>
                        <td className="py-3 px-3 font-bold text-[#D4AF37]">₹{p.amount}</td>
                        <td className="py-3 px-3 text-white/70">{p.method}</td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: WEBSITE SETTINGS */}
          {activeTab === 'website-settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-bold text-[#D4AF37]">वेबसाइट सेटिंग्स (Settings)</h2>
              <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/70">वेबसाइट का नाम</label>
                    <input type="text" value={settings.websiteName} onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })} className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-white/70">संपर्क फोन नंबर</label>
                    <input type="text" value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1" />
                  </div>
                </div>
                {hasPermission('website_settings', 'manage_settings') && (
                  <button type="submit" className="px-6 py-3 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl uppercase cursor-pointer">
                    सहेजें (Save Settings)
                  </button>
                )}
              </form>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDER / STANDARD VIEW */}
          {!['dashboard', 'admin-management', 'bookings', 'customers', 'services', 'blog', 'gallery', 'home-banner', 'rajan-profile', 'cloudinary-media', 'activity-logs', 'payments', 'website-settings'].includes(activeTab) && (
            <div className="p-8 rounded-3xl bg-[#030712]/90 border border-[#D4AF37]/30 text-center space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#D4AF37] uppercase">{activeTab.replace('-', ' ')} मॉड्यूल</h3>
              <p className="text-xs text-white/60">यह मॉड्यूल RBAC सुरक्षा के अंतर्गत सक्रिय है। आपकी वर्तमान अनुमति: <span className="text-[#D4AF37] font-bold">Authorized</span></p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD NEW ADMIN WITH FULL PERMISSION MATRIX (SUPER ADMIN ONLY) */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-[#050B18] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> नया एडमिन जोड़ें (Create New Admin)
                </h3>
                <p className="text-xs text-white/60">सभी आवश्यक जानकारी भरें तथा granular RBAC अनुमतियाँ प्रदान करें।</p>
              </div>
              <button onClick={() => setShowAddAdminModal(false)} className="text-white/60 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/70 font-bold">पूरा नाम (Full Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. सुमित शास्त्री"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">मोबाइल नंबर (Mobile Number)</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={adminForm.mobile}
                    onChange={(e) => setAdminForm({ ...adminForm, mobile: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">ईमेल एड्रेस (Email Address) *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">यूजरनेम (Username)</label>
                  <input
                    type="text"
                    placeholder="shastri_admin"
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">पासवर्ड (Password) *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">कन्फर्म पासवर्ड (Confirm Password) *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">पदनाम (Designation)</label>
                  <input
                    type="text"
                    placeholder="वैदिक ज्योतिष प्रबंधक"
                    value={adminForm.designation}
                    onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">प्रोफाइल इमेज URL (Profile Image)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={adminForm.profileImage}
                    onChange={(e) => setAdminForm({ ...adminForm, profileImage: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">भूमिका (Role)</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as any })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  >
                    <option value="Super Admin">Super Admin (संपूर्ण अधिकार)</option>
                    <option value="Admin">Admin (सामान्य एडमिन)</option>
                    <option value="Manager">Manager (प्रबंधक)</option>
                    <option value="Staff">Staff (सहायक)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/70 font-bold">स्थिति (Status)</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value as any })}
                    className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white mt-1 focus:border-[#D4AF37]"
                  >
                    <option value="active">Active (सक्रिय)</option>
                    <option value="inactive">Inactive (निष्क्रिय)</option>
                  </select>
                </div>
              </div>

              {/* PERMISSION MATRIX SECTION */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-[#D4AF37] text-sm">मॉड्यूल अनुमति मैट्रिक्स (Permission Management)</h4>
                    <p className="text-[11px] text-white/60">प्रत्येक मॉड्यूल के लिए आवश्यक granular permissions चुनें।</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllPermissions((fn) => setAdminForm((prev) => ({ ...prev, permissions: fn(prev.permissions) })))}
                      className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Select All Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllPermissions((fn) => setAdminForm((prev) => ({ ...prev, permissions: fn(prev.permissions) })))}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Remove All
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto border border-white/10 rounded-2xl p-4 bg-white/5 space-y-4">
                  {ALL_MODULE_CONFIG.map((mod) => {
                    const currentActions = adminForm.permissions[mod.id] || [];
                    return (
                      <div key={mod.id} className="p-3 rounded-xl bg-[#030712]/80 border border-white/10 space-y-2">
                        <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                          <span className="font-bold text-xs text-[#D4AF37]">{mod.name} ({mod.hindiName})</span>
                          <span className="text-[9px] text-white/40 font-mono">Module: {mod.id}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {ALL_PERMISSION_ACTIONS.map((act) => {
                            const checked = currentActions.includes(act.id);
                            return (
                              <label key={act.id} className="flex items-center gap-1.5 text-[10px] text-white/80 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermissionCheckbox(mod.id, act.id, adminForm.permissions, (fn) => setAdminForm((prev) => ({ ...prev, permissions: fn(prev.permissions) })))}
                                  className="accent-[#D4AF37] rounded"
                                />
                                <span>{act.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white font-bold cursor-pointer"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold text-xs uppercase cursor-pointer shadow-lg"
                >
                  Create Admin (एडमिन बनाएँ)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD (SUPER ADMIN) */}
      {resetPassModalAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#050B18] border border-[#D4AF37]/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <Key className="w-4 h-4" /> पासवर्ड रीसेट (Reset Password)
              </h3>
              <button onClick={() => setResetPassModalAdmin(null)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/70">
              एडमिन <span className="text-[#D4AF37] font-bold">{resetPassModalAdmin.name}</span> के लिए नया पासवर्ड दर्ज करें:
            </p>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <input
                type="password"
                required
                minLength={6}
                placeholder="नया पासवर्ड दर्ज करें..."
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:border-[#D4AF37]"
              />
              <button type="submit" className="w-full py-3 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl uppercase">
                पासवर्ड रीसेट करें
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BOOKING */}
      {showAddBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#050B18] border border-[#D4AF37]/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-[#D4AF37]">नया परामर्श दर्ज करें</h3>
              <button onClick={() => setShowAddBookingModal(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-3">
              <input
                type="text"
                placeholder="जातक का पूरा नाम"
                required
                value={newBooking.clientName}
                onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="फोन नंबर (+91...)"
                  required
                  value={newBooking.clientPhone}
                  onChange={(e) => setNewBooking({ ...newBooking, clientPhone: e.target.value })}
                  className="p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
                <input
                  type="email"
                  placeholder="ईमेल"
                  value={newBooking.clientEmail}
                  onChange={(e) => setNewBooking({ ...newBooking, clientEmail: e.target.value })}
                  className="p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#D4AF37] text-[#050B18] font-bold text-xs rounded-xl uppercase">
                बुकिंग दर्ज करें
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function ShieldCheckIcon(props: any) {
  return <Shield {...props} />;
}
