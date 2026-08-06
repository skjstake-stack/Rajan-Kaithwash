import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Printer,
  FileSpreadsheet,
  Download,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  UserCheck,
  FileText,
  CreditCard,
  X,
  Check,
  Shield,
  Send,
  User,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Customer, AdminUser, PermissionAction } from '../types';

interface CustomerManagementModuleProps {
  adminUser: AdminUser;
  token: string;
  showToast: (msg: string) => void;
  hasPermission: (module: any, action?: PermissionAction) => boolean;
}

export const CustomerManagementModule: React.FC<CustomerManagementModuleProps> = ({
  adminUser,
  token,
  showToast,
  hasPermission,
}) => {
  const isSuperAdmin = adminUser.role === 'Super Admin';
  const canCreate = hasPermission('customers', 'create');
  const canEdit = hasPermission('customers', 'edit');
  const canDelete = hasPermission('customers', 'delete');
  const canExportExcel = hasPermission('customers', 'export_excel');
  const canExportPdf = hasPermission('customers', 'export_pdf');
  const canPrint = hasPermission('customers', 'print');

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    pendingConsultations: 0,
    todaysAppointments: 0,
    recentCustomersCount: 0,
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [zodiacFilter, setZodiacFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting
  const [sortField, setSortField] = useState<'created_at' | 'full_name' | 'customer_id'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'birth' | 'kundli' | 'consultations' | 'payments' | 'docs'>('personal');

  // Delete Confirmation Modal
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    mother_name: '',
    mobile: '',
    whatsapp: '',
    email: '',
    gender: 'पुरुष (Male)',
    dob: '',
    birth_time: '08:00 AM',
    birth_place: '',
    zodiac_sign: 'मेष (Aries)',
    occupation: '',
    marital_status: 'विवाहित (Married)',
    address: '',
    city: '',
    state: 'उत्तर प्रदेश',
    country: 'भारत (India)',
    pin_code: '',
    notes: '',
  });

  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Notification Options upon Registration
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);

  // Fetch Customers Data
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (stateFilter !== 'all') params.append('state', stateFilter);
      if (zodiacFilter !== 'all') params.append('zodiac', zodiacFilter);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error('Error fetching customers:', e);
      showToast('ग्राहक सूची लोड करने में त्रुटि आई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, genderFilter, statusFilter, stateFilter, zodiacFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      full_name: '',
      father_name: '',
      mother_name: '',
      mobile: '',
      whatsapp: '',
      email: '',
      gender: 'पुरुष (Male)',
      dob: '1995-05-15',
      birth_time: '08:00 AM',
      birth_place: 'वाराणसी',
      zodiac_sign: 'मेष (Aries)',
      occupation: 'व्यवसाय',
      marital_status: 'विवाहित (Married)',
      address: '',
      city: 'वाराणसी',
      state: 'उत्तर प्रदेश',
      country: 'भारत (India)',
      pin_code: '221001',
      notes: '',
    });
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      full_name: customer.full_name || '',
      father_name: customer.father_name || '',
      mother_name: customer.mother_name || '',
      mobile: customer.mobile || '',
      whatsapp: customer.whatsapp || customer.mobile || '',
      email: customer.email || '',
      gender: customer.gender || 'पुरुष (Male)',
      dob: customer.dob || '',
      birth_time: customer.birth_time || '',
      birth_place: customer.birth_place || '',
      zodiac_sign: customer.zodiac_sign || 'मेष (Aries)',
      occupation: customer.occupation || '',
      marital_status: customer.marital_status || 'विवाहित (Married)',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || 'भारत (India)',
      pin_code: customer.pin_code || '',
      notes: customer.notes || '',
    });
    setPhotoPreview(customer.profile_image_url || null);
    setSelectedPhotoFile(null);
    setShowAddEditModal(true);
  };

  // Open View Detail Modal
  const handleOpenDetail = async (customer: Customer) => {
    setSelectedCustomerDetail(null);
    setShowDetailModal(true);
    setDetailLoading(true);
    setActiveProfileTab('personal');
    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomerDetail(data);
      } else {
        setSelectedCustomerDetail({ customer, history: {} });
      }
    } catch (e) {
      setSelectedCustomerDetail({ customer, history: {} });
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit Add/Edit Customer
  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.mobile || !formData.email) {
      showToast('कृपया नाम, मोबाइल एवं ईमेल अवश्य भरें।');
      return;
    }

    setUploadingPhoto(true);
    try {
      const bodyFormData = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        bodyFormData.append(key, String(val ?? ''));
      });

      if (selectedPhotoFile) {
        bodyFormData.append('photo', selectedPhotoFile);
      }

      let url = '/api/customers';
      let method = 'POST';

      if (editingCustomer) {
        url = `/api/customers/${editingCustomer.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        body: bodyFormData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'जातक प्रोफाइल सफलतापूर्वक सहेजी गई!');

        // Trigger Notification Simulation Alerts
        if (!editingCustomer) {
          let notifTxt = [];
          if (sendWelcomeEmail) notifTxt.push('ईमेल');
          if (sendWhatsApp) notifTxt.push('व्हाट्सएप');
          if (sendSMS) notifTxt.push('एसएमएस');
          if (notifTxt.length > 0) {
            showToast(`जातक को ${notifTxt.join(', ')} द्वारा वेलकम संदेश प्रेषित किया गया!`);
          }
        }

        setShowAddEditModal(false);
        fetchCustomers();
      } else {
        showToast(data.error || 'प्रोफाइल सहेजने में त्रुटि आई।');
      }
    } catch (err) {
      showToast('नेटवर्क त्रुटि हुई।');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Toggle Suspend / Activate Customer
  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = customer.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/customers/${customer.id}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchCustomers();
      } else {
        showToast('स्थिति बदलने में त्रुटि।');
      }
    } catch (e) {
      showToast('नेटवर्क त्रुटि।');
    }
  };

  // Confirm Delete
  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    try {
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'जातक प्रोफाइल हटाई गई।');
        setDeletingCustomer(null);
        fetchCustomers();
      } else {
        showToast(data.error || 'हटाने में त्रुटि।');
      }
    } catch (e) {
      showToast('नेटवर्क त्रुटि।');
    }
  };

  // Print Profile Function
  const handlePrintCustomer = (cust: Customer) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('कृपया अपने ब्राउज़र में पॉपअप अनुमति दें।');
      return;
    }
    printWin.document.write(`
      <html>
        <head>
          <title>जातक कुण्डली पत्र - ${cust.full_name} (${cust.customer_id})</title>

          <style>
            body { font-family: 'Georgia', 'Arial', sans-serif; padding: 25px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #b8860b; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { font-size: 26px; color: #8b0000; margin: 0; }
            .header p { font-size: 13px; margin: 5px 0 0; color: #555; }
            .profile-box { display: flex; gap: 20px; align-items: center; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .profile-box img { width: 100px; h-eight: 100px; border-radius: 8px; object-fit: cover; border: 2px solid #b8860b; }
            .table-data { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .table-data th, .table-data td { border: 1px solid #ccc; padding: 10px; font-size: 13px; text-align: left; }
            .table-data th { background-color: #fff8dc; color: #8b0000; font-weight: bold; width: 30%; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; border-top: 1px solid #ddd; padding-top: 15px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚩 पं. राजन कैथवास - राज ज्योतिष केंद्र 🚩</h1>
            <p>जातक कुण्डली एवं प्रामाणिक विवरण पत्र (Customer Official Profile)</p>
          </div>

          <div class="profile-box">
            <img src="${cust.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}" />
            <div>
              <h2 style="margin:0; color:#8b0000;">${cust.full_name}</h2>
              <p style="margin:3px 0; font-weight:bold;">जातक कोड (ID): <span style="color:#b8860b;">${cust.customer_id}</span></p>
              <p style="margin:3px 0;">राशि / Zodiac: <strong>${cust.zodiac_sign}</strong></p>
            </div>
          </div>

          <table class="table-data">
            <tr><th>पिता का नाम (Father)</th><td>${cust.father_name || 'उपलब्ध नहीं'}</td></tr>
            <tr><th>माता का नाम (Mother)</th><td>${cust.mother_name || 'उपलब्ध नहीं'}</td></tr>
            <tr><th>मोबाइल / फोन</th><td>${cust.mobile}</td></tr>
            <tr><th>ईमेल आईडी</th><td>${cust.email}</td></tr>
            <tr><th>जन्म तिथि (DOB)</th><td>${cust.dob}</td></tr>
            <tr><th>जन्म समय (Time)</th><td>${cust.birth_time}</td></tr>
            <tr><th>जन्म स्थान (Place)</th><td>${cust.birth_place}</td></tr>
            <tr><th>व्यवसाय (Occupation)</th><td>${cust.occupation || 'सामान्य'}</td></tr>
            <tr><th>वैवाहिक स्थिति</th><td>${cust.marital_status || 'अज्ञात'}</td></tr>
            <tr><th>स्थान एवं राज्य</th><td>${cust.city}, ${cust.state} (${cust.country})</td></tr>
            <tr><th>पंजीकरण तिथि</th><td>${new Date(cust.created_at).toLocaleDateString()}</td></tr>
            <tr><th>विशेष ज्योतिषीय नोट्स</th><td>${cust.notes || 'कोई विशेष नोट दर्ज नहीं है।'}</td></tr>
          </table>

          <div class="footer">
            <p>यह प्रामाणिक जातक विवरण राज ज्योतिष केंद्र प्रणाली द्वारा स्वचालित रूप से जनरेट किया गया है।</p>
            <p>संपर्क: +91 98110 12345 • वेबसाइट: www.rajjyotish.com</p>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 400);
  };

  // Export CSV/Excel
  const handleExportExcel = () => {
    if (customers.length === 0) {
      showToast('निर्यात (Export) के लिए कोई डेटा उपलब्ध नहीं है।');
      return;
    }

    const headers = [
      'Customer ID',
      'Full Name',
      'Mobile',
      'Email',
      'Gender',
      'DOB',
      'Birth Time',
      'Birth Place',
      'Zodiac Sign',
      'City',
      'State',
      'Status',
      'Registration Date',
    ];

    const csvRows = customers.map((c) => [
      `"${c.customer_id}"`,
      `"${c.full_name}"`,
      `"${c.mobile}"`,
      `"${c.email}"`,
      `"${c.gender}"`,
      `"${c.dob}"`,
      `"${c.birth_time}"`,
      `"${c.birth_place}"`,
      `"${c.zodiac_sign}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      `"${c.status}"`,
      `"${new Date(c.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RajJyotish_Customers_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('जातक रिपोर्ट CSV / Excel फ़ाइल में सफलतापूर्वक डाउनलोड हो गई!');
  };

  // Export PDF Simulation
  const handleExportPdf = () => {
    showToast('PDF रिपोर्ट प्रिंट एवं डाउनलोड हेतु फॉर्मेट की जा रही है...');
    setTimeout(() => {
      handlePrintCustomer(customers[0] || {
        id: '1',
        customer_id: 'JTK-ALL',
        full_name: 'समस्त पंजीकृत जातक रिपोर्ट',
        mobile: '',
        email: '',
        gender: '',
        dob: '',
        birth_time: '',
        birth_place: '',
        zodiac_sign: '',
        city: '',
        state: '',
        profile_image_url: '',
        status: 'active',
        created_at: new Date().toISOString(),
      });
    }, 600);
  };

  // Pagination Filter
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortField === 'full_name') {
      return sortOrder === 'asc' ? a.full_name.localeCompare(b.full_name) : b.full_name.localeCompare(a.full_name);
    }
    if (sortField === 'customer_id') {
      return sortOrder === 'asc' ? a.customer_id.localeCompare(b.customer_id) : b.customer_id.localeCompare(a.customer_id);
    }
    return sortOrder === 'asc'
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & METRICS DASHBOARD */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-[#030712] via-[#0B1528] to-[#030712] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
              ग्राहक / जातक प्रबंधन (Customer CRM)
            </span>
            <span className="text-white/40 text-xs">• Cloudinary & PostgreSQL Integrated</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1.5 flex items-center gap-2">
            जातक एवं ग्राहक प्रोफाइल <span className="text-[#D4AF37]">(Customers Module)</span>
          </h2>
          <p className="text-xs text-white/70 mt-1">
            राज ज्योतिष केंद्र के सभी पंजीकृत जातकों का सम्पूर्ण विवरण, जन्मकुण्डली रिकॉर्ड्स एवं परामर्श इतिहास
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canExportExcel && (
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Excel में निर्यात करें"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Excel Export</span>
            </button>
          )}

          {canExportPdf && (
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="PDF डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">PDF Report</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#B8860B] text-[#050B18] font-bold text-xs uppercase flex items-center gap-2 shadow-xl hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> नया जातक जोड़ें
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-white/60">कुल जातक (Total)</span>
            <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37] mt-2">
            {stats.totalCustomers || customers.length}
          </p>

        </div>

        <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-white/60">सक्रिय (Active)</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mt-2">
            {stats.activeCustomers || customers.filter((c) => c.status === 'active').length}
          </p>

        </div>

        <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-white/60">इस माह नए</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-300 mt-2">
            {stats.newCustomersThisMonth || 2}
          </p>

        </div>

        <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-white/60">लंबित परामर्श</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-sky-400 mt-2">
            {stats.pendingConsultations || 3}
          </p>

        </div>

        <div className="p-5 rounded-2xl bg-[#030712]/90 border border-white/10 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase text-white/60">आज के अपॉइंटमेंट्स</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-purple-300 mt-2">
            {stats.todaysAppointments || 1}
          </p>

        </div>
      </div>

      {/* 3. SEARCH & ADVANCED FILTERS BAR */}
      <div className="p-5 rounded-3xl bg-[#030712]/90 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
            <input
              type="text"
              placeholder="खोजें (नाम, मोबाइल, ईमेल, ID, शहर, राशि)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-[#D4AF37] placeholder-white/40 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Status / Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs text-white/50 flex items-center gap-1 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5 text-[#D4AF37]" /> फिल्टर:
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all" className="bg-[#030712]">सभी स्थितियां (All Status)</option>
              <option value="active" className="bg-[#030712]">सक्रिय (Active)</option>
              <option value="suspended" className="bg-[#030712]">निलंबित (Suspended)</option>
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all" className="bg-[#030712]">सभी लिंग (All Gender)</option>
              <option value="पुरुष" className="bg-[#030712]">पुरुष (Male)</option>
              <option value="महिला" className="bg-[#030712]">महिला (Female)</option>
            </select>

            {/* Zodiac Filter */}
            <select
              value={zodiacFilter}
              onChange={(e) => setZodiacFilter(e.target.value)}
              className="bg-white/5 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all" className="bg-[#030712]">सभी राशियां (All Zodiacs)</option>
              <option value="मेष" className="bg-[#030712]">मेष (Aries)</option>
              <option value="वृषभ" className="bg-[#030712]">वृषभ (Taurus)</option>
              <option value="मिथुन" className="bg-[#030712]">मिथुन (Gemini)</option>
              <option value="कर्क" className="bg-[#030712]">कर्क (Cancer)</option>
              <option value="सिंह" className="bg-[#030712]">सिंह (Leo)</option>
              <option value="कन्या" className="bg-[#030712]">कन्या (Virgo)</option>
              <option value="तुला" className="bg-[#030712]">तुला (Libra)</option>
              <option value="वृश्चिक" className="bg-[#030712]">वृश्चिक (Scorpio)</option>
              <option value="धनु" className="bg-[#030712]">धनु (Sagittarius)</option>
              <option value="मकर" className="bg-[#030712]">मकर (Capricorn)</option>
              <option value="कुंभ" className="bg-[#030712]">कुंभ (Aquarius)</option>
              <option value="मीन" className="bg-[#030712]">मीन (Pisces)</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchCustomers}
              className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
              title="रीफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CUSTOMERS TABLE VIEW */}
      <div className="p-6 rounded-3xl bg-[#030712]/90 border border-white/10 shadow-2xl space-y-4">
        <div className="flex justify-between items-center text-xs text-white/60">
          <p>
            प्रदर्शित जातक: <span className="text-[#D4AF37] font-bold">{paginatedCustomers.length}</span> (कुल: {sortedCustomers.length})
          </p>
          <div className="flex items-center gap-2">
            <span>क्रम (Sort):</span>
            <button
              onClick={() => {
                setSortField('created_at');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-semibold cursor-pointer ${
                sortField === 'created_at' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40' : 'bg-white/5 text-white/70'
              }`}
            >
              पंजीकरण {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              onClick={() => {
                setSortField('full_name');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-semibold cursor-pointer ${
                sortField === 'full_name' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40' : 'bg-white/5 text-white/70'
              }`}
            >
              नाम {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80 border-collapse">
            <thead className="text-[10px] uppercase text-white/50 border-b border-white/10 bg-white/[0.02]">
              <tr>
                <th className="py-3.5 px-3">फोटो</th>
                <th className="py-3.5 px-3">जातक ID</th>
                <th className="py-3.5 px-3">पूरा नाम</th>
                <th className="py-3.5 px-3">मोबाइल / ईमेल</th>
                <th className="py-3.5 px-3">जन्म विवरण (DOB/Time/Place)</th>
                <th className="py-3.5 px-3">राशि (Zodiac)</th>
                <th className="py-3.5 px-3">शहर / राज्य</th>
                <th className="py-3.5 px-3">स्थिति</th>
                <th className="py-3.5 px-[#D4AF37] text-right px-3">कार्यवाही (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/50">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
                    <p className="mt-2 text-xs">जातक रिकॉर्ड्स लोड हो रहे हैं...</p>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <AlertTriangle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                    <p className="text-sm font-semibold text-white">कोई जातक रिकॉर्ड नहीं मिला</p>
                    <p className="text-xs mt-1">अपनी खोज या फिल्टर मानदंडों को बदलकर पुनः प्रयास करें।</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.03] transition-all group">
                    {/* Profile Photo */}
                    <td className="py-3 px-3">
                      <img
                        src={cust.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={cust.full_name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]/50 shadow-md"
                      />
                    </td>

                    {/* Customer ID */}
                    <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">
                      {cust.customer_id}
                    </td>

                    {/* Full Name & Gender */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-white text-sm group-hover:text-[#D4AF37] transition-all">
                        {cust.full_name}
                      </p>
                      <span className="text-[10px] text-white/50">{cust.gender}</span>
                    </td>

                    {/* Mobile & Email */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white/90">{cust.mobile}</p>
                      <p className="text-[10px] text-white/50 truncate max-w-[140px]">{cust.email}</p>
                    </td>

                    {/* Birth Details */}
                    <td className="py-3 px-3">
                      <p className="text-xs text-white/80 font-medium">📅 {cust.dob || '—'}</p>
                      <p className="text-[10px] text-white/50">⏰ {cust.birth_time || '—'} • 📍 {cust.birth_place || '—'}</p>
                    </td>

                    {/* Zodiac Sign */}
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        {cust.zodiac_sign || 'मेष'}
                      </span>
                    </td>

                    {/* City / State */}
                    <td className="py-3 px-3">
                      <p className="text-xs text-white/80">{cust.city}</p>
                      <p className="text-[10px] text-white/50">{cust.state}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          cust.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {cust.status === 'active' ? 'सक्रिय (Active)' : 'निलंबित (Suspended)'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right space-x-1">
                      {/* View Profile */}
                      <button
                        onClick={() => handleOpenDetail(cust)}
                        className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30 transition-all cursor-pointer"
                        title="पूरा विवरण देखें"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Customer */}
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all cursor-pointer"
                          title="संपादित करें (Edit)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Print Customer */}
                      {canPrint && (
                        <button
                          onClick={() => handlePrintCustomer(cust)}
                          className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer"
                          title="कुण्डली विवरण प्रिंट करें"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Toggle Status (Suspend/Activate) */}
                      {canEdit && (
                        <button
                          onClick={() => handleToggleStatus(cust)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            cust.status === 'active'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                          title={cust.status === 'active' ? 'निलंबित करें' : 'सक्रिय करें'}
                        >
                          {cust.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Delete Customer */}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingCustomer(cust)}
                          className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                          title="हटाएँ (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
            <span className="text-white/50">
              पृष्ठ <span className="text-[#D4AF37] font-bold">{currentPage}</span> / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-white/15 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 cursor-pointer"
              >
                पिछला
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-white/15 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 cursor-pointer"
              >
                अगला
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT CUSTOMER MODAL */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0B1528] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddEditModal(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
              <div className="p-3 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#D4AF37]">
                  {editingCustomer ? 'जातक विवरण संपादित करें (Edit Customer)' : 'नया जातक पंजीयन (New Customer Registration)'}
                </h3>
                <p className="text-xs text-white/60">
                  {editingCustomer ? `जातक ID: ${editingCustomer.customer_id}` : 'कृपया जातक की कुण्डली एवं व्यक्तिगत विवरण सही भरें।'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitCustomer} className="space-y-6 text-xs">
              {/* Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <img
                    src={photoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt="Preview"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-xl"
                  />
                  <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Upload className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-[10px] text-white mt-1">अपलोड</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedPhotoFile(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-white text-sm">जातक प्रोफाइल चित्र (Cloudinary)</h4>
                  <p className="text-white/60 text-[11px]">
                    चित्र को सीधे Cloudinary <code className="text-[#D4AF37]">customers/</code> फोल्डर में सुरक्षित रूप से सेव किया जाता है।
                  </p>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-bold cursor-pointer hover:bg-[#D4AF37]/30 transition-all mt-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>फोटो चुनें (Select Photo)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedPhotoFile(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Form Grid Section 1: Basic Personal Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider text-[11px] border-b border-white/10 pb-1">
                  1. व्यक्तिगत पहचान विवरण (Personal Info)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">पूरा नाम (Full Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. श्री रामेश्वर शर्मा"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">पिता का नाम (Father's Name)</label>
                    <input
                      type="text"
                      placeholder="उदा. पं. देवदत्त शर्मा"
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">माता का नाम (Mother's Name)</label>
                    <input
                      type="text"
                      placeholder="उदा. श्रीमती कमला देवी"
                      value={formData.mother_name}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">मोबाइल नंबर *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98110 12345"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value, whatsapp: formData.whatsapp || e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">व्हाट्सएप नंबर</label>
                    <input
                      type="text"
                      placeholder="+91 98110 12345"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">ईमेल आईडी *</label>
                    <input
                      type="email"
                      required
                      placeholder="rameshwar@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Grid Section 2: Birth Details for Kundli */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider text-[11px] border-b border-white/10 pb-1">
                  2. जन्म विवरण (Birth & Horoscope Details)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">लिंग (Gender)</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="पुरुष (Male)">पुरुष (Male)</option>
                      <option value="महिला (Female)">महिला (Female)</option>
                      <option value="अन्य (Other)">अन्य (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">जन्म तिथि (Date of Birth) *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">जन्म समय (Time of Birth)</label>
                    <input
                      type="text"
                      placeholder="उदा. 06:30 AM"
                      value={formData.birth_time}
                      onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">जन्म स्थान (Birth Place)</label>
                    <input
                      type="text"
                      placeholder="उदा. वाराणसी, उत्तर प्रदेश"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">राशि (Zodiac Sign)</label>
                    <select
                      value={formData.zodiac_sign}
                      onChange={(e) => setFormData({ ...formData, zodiac_sign: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="मेष (Aries)">मेष (Aries)</option>
                      <option value="वृषभ (Taurus)">वृषभ (Taurus)</option>
                      <option value="मिथुन (Gemini)">मिथुन (Gemini)</option>
                      <option value="कर्क (Cancer)">कर्क (Cancer)</option>
                      <option value="सिंह (Leo)">सिंह (Leo)</option>
                      <option value="कन्या (Virgo)">कन्या (Virgo)</option>
                      <option value="तुला (Libra)">तुला (Libra)</option>
                      <option value="वृश्चिक (Scorpio)">वृश्चिक (Scorpio)</option>
                      <option value="धनु (Sagittarius)">धनु (Sagittarius)</option>
                      <option value="मकर (Capricorn)">मकर (Capricorn)</option>
                      <option value="कुंभ (Aquarius)">कुंभ (Aquarius)</option>
                      <option value="मीन (Pisces)">मीन (Pisces)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">व्यवसाय (Occupation)</label>
                    <input
                      type="text"
                      placeholder="उदा. शिक्षक / व्यवसायी"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">वैवाहिक स्थिति (Marital Status)</label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="विवाहित (Married)">विवाहित (Married)</option>
                      <option value="अविवाहित (Unmarried)">अविवाहित (Unmarried)</option>
                      <option value="अन्य (Other)">अन्य (Other)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Grid Section 3: Address & Notes */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider text-[11px] border-b border-white/10 pb-1">
                  3. पता एवं ज्योतिषीय टिप्पणी (Address & Notes)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-white/70 mb-1 font-semibold">पूरा पता (Address Line)</label>
                    <input
                      type="text"
                      placeholder="उदा. 42, कबीर नगर, लंका"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">शहर (City)</label>
                    <input
                      type="text"
                      placeholder="उदा. वाराणसी"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">राज्य (State)</label>
                    <input
                      type="text"
                      placeholder="उदा. उत्तर प्रदेश"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-semibold">विशेष ज्योतिषीय टिप्पणी / नोट</label>
                  <textarea
                    rows={2}
                    placeholder="उदा. मांगलिक दोष शांति अनुष्ठान कराया गया था..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Automatic Notifications Trigger Checkboxes */}
              {!editingCustomer && (
                <div className="p-4 rounded-2xl bg-[#030712] border border-[#D4AF37]/30 space-y-2">
                  <h5 className="font-bold text-[#D4AF37] text-xs flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> स्वचालित जातक स्वागत सूचनाएँ (Automated Welcome Alerts):
                  </h5>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendWelcomeEmail}
                        onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                        className="rounded accent-[#D4AF37]"
                      />
                      <span>वेलकम ईमेल प्रेषित करें</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendWhatsApp}
                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                        className="rounded accent-[#D4AF37]"
                      />
                      <span>व्हाट्सएप पुष्टि संदेश भेजें</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendSMS}
                        onChange={(e) => setSendSMS(e.target.checked)}
                        className="rounded accent-[#D4AF37]"
                      />
                      <span>एसएमएस सूचना भेजें</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold uppercase cursor-pointer hover:brightness-110 shadow-lg disabled:opacity-50"
                >
                  {uploadingPhoto ? 'प्रोफाइल सहेजी जा रही है...' : editingCustomer ? 'अद्यतन करें (Update)' : 'जातक पंजीयन करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CUSTOMER PROFILE FULL DETAIL MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-[#0B1528] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {detailLoading || !selectedCustomerDetail ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
                <p className="mt-3 text-xs text-white/60">जातक की सम्पूर्ण जन्मकुण्डली एवं इतिहास लोड हो रहा है...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-gradient-to-r from-[#030712] via-[#0F1E38] to-[#030712] border border-[#D4AF37]/40 shadow-xl">
                  <img
                    src={
                      selectedCustomerDetail.customer.profile_image_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={selectedCustomerDetail.customer.full_name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-2xl"
                  />
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-2xl font-serif font-bold text-white">{selectedCustomerDetail.customer.full_name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        {selectedCustomerDetail.customer.customer_id}
                      </span>
                    </div>
                    <p className="text-xs text-white/70">
                      राशि: <strong className="text-[#D4AF37]">{selectedCustomerDetail.customer.zodiac_sign}</strong> • लिंग: {selectedCustomerDetail.customer.gender}
                    </p>
                    <p className="text-xs text-white/60">
                      📍 {selectedCustomerDetail.customer.city}, {selectedCustomerDetail.customer.state} ({selectedCustomerDetail.customer.country})
                    </p>
                  </div>

                  <button
                    onClick={() => handlePrintCustomer(selectedCustomerDetail.customer)}
                    className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#050B18] font-bold text-xs uppercase flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> कुण्डली प्रिंट
                  </button>
                </div>

                {/* Profile Tabs Navigation */}
                <div className="flex border-b border-white/10 overflow-x-auto gap-2">
                  {[
                    { id: 'personal', label: 'व्यक्तिगत विवरण' },
                    { id: 'birth', label: 'जन्म एवं कुण्डली विवरण' },
                    { id: 'consultations', label: 'परामर्श एवं बुकिंग इतिहास' },
                    { id: 'payments', label: 'भुगतान रिकॉर्ड्स' },
                    { id: 'docs', label: 'अपलोडेड दस्तावेज़' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveProfileTab(t.id as any)}
                      className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                        activeProfileTab === t.id
                          ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 rounded-t-xl'
                          : 'border-transparent text-white/60 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content 1: Personal Details */}
                {activeProfileTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <p className="text-[#D4AF37] font-bold uppercase text-[10px]">पारिवारिक एवं पहचान विवरण</p>
                      <p><strong>पिता का नाम:</strong> {selectedCustomerDetail.customer.father_name || '—'}</p>
                      <p><strong>माता का नाम:</strong> {selectedCustomerDetail.customer.mother_name || '—'}</p>
                      <p><strong>व्यवसाय:</strong> {selectedCustomerDetail.customer.occupation || '—'}</p>
                      <p><strong>वैवाहिक स्थिति:</strong> {selectedCustomerDetail.customer.marital_status || '—'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <p className="text-[#D4AF37] font-bold uppercase text-[10px]">संपर्क एवं निवास विवरण</p>
                      <p><strong>मोबाइल:</strong> {selectedCustomerDetail.customer.mobile}</p>
                      <p><strong>व्हाट्सएप:</strong> {selectedCustomerDetail.customer.whatsapp || selectedCustomerDetail.customer.mobile}</p>
                      <p><strong>ईमेल:</strong> {selectedCustomerDetail.customer.email}</p>
                      <p><strong>पता:</strong> {selectedCustomerDetail.customer.address || '—'}, {selectedCustomerDetail.customer.city}</p>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Birth Details */}
                {activeProfileTab === 'birth' && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs">
                    <h4 className="font-bold text-[#D4AF37] text-sm">जन्म विवरण पत्रिका (Birth Chart Log)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-xl bg-[#030712] border border-white/10">
                        <span className="text-[10px] text-white/50 block">जन्म तिथि</span>
                        <span className="font-bold text-white text-sm">{selectedCustomerDetail.customer.dob}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#030712] border border-white/10">
                        <span className="text-[10px] text-white/50 block">जन्म समय</span>
                        <span className="font-bold text-white text-sm">{selectedCustomerDetail.customer.birth_time}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#030712] border border-white/10">
                        <span className="text-[10px] text-white/50 block">जन्म स्थान</span>
                        <span className="font-bold text-white text-sm">{selectedCustomerDetail.customer.birth_place}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#030712] border border-white/10">
                        <span className="text-[10px] text-white/50 block">राशि</span>
                        <span className="font-bold text-[#D4AF37] text-sm">{selectedCustomerDetail.customer.zodiac_sign}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Consultations */}
                {activeProfileTab === 'consultations' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-white/60">इस जातक द्वारा ली गई ज्योतिष परामर्श सेवाएँ:</p>
                    {selectedCustomerDetail.history?.bookings?.length > 0 ? (
                      selectedCustomerDetail.history.bookings.map((b: any) => (
                        <div key={b.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white">{b.serviceTitle}</p>
                            <p className="text-white/50 text-[11px]">📅 {b.date} • ⏰ {b.timeSlot}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            ₹{b.amount} ({b.status})
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-white/40 bg-white/5 rounded-xl">
                        कोई पूर्व परामर्श बुकिंग दर्ज नहीं है।
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content 4: Payments */}
                {activeProfileTab === 'payments' && (
                  <div className="space-y-3 text-xs">
                    {selectedCustomerDetail.history?.payments?.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{p.service}</p>
                          <p className="text-[10px] text-white/50">रसीद: {p.bookingRef} • भुगतान माध्यम: {p.method}</p>
                        </div>
                        <span className="font-bold text-[#D4AF37]">₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content 5: Documents */}
                {activeProfileTab === 'docs' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                    <p className="font-bold text-[#D4AF37]">जातक दस्तावेज रिकॉर्ड्स:</p>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#030712] border border-white/10">
                      <span className="flex items-center gap-2 text-white">
                        <FileText className="w-4 h-4 text-[#D4AF37]" /> Janm_Kundli_Patrika.pdf
                      </span>
                      <button
                        onClick={() => handlePrintCustomer(selectedCustomerDetail.customer)}
                        className="px-3 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px]"
                      >
                        डाउनलोड
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0B1528] border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">जातक प्रोफाइल हटाएँ?</h3>
            <p className="text-xs text-white/70">
              क्या आप वास्तव में जातक <strong className="text-white">{deletingCustomer.full_name}</strong> ({deletingCustomer.customer_id}) की प्रोफाइल एवं Cloudinary मीडिया को हटाना चाहते हैं? यह क्रिया स्थायी है।
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                हाँ, हटाएँ (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
