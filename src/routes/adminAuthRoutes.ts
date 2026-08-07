import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { admins } from '../db/schema.ts';
import { generateAdminToken, verifyAdminToken } from '../lib/adminAuthService.ts';
import { AdminRole, PermissionAction, ModuleName, AdminUser, AdminActivityLog } from '../types.ts';

const router = express.Router();

export const ALL_MODULES: ModuleName[] = [
  'dashboard',
  'bookings',
  'customers',
  'services',
  'blog',
  'gallery',
  'home_banner',
  'rajan_profile',
  'director_profile',
  'about_us',
  'testimonials',
  'reviews',
  'payments',
  'reports',
  'analytics',
  'notifications',
  'website_settings',
  'seo',
  'cloudinary_media',
  'admin_management',
  'users',
  'roles',
  'staff',
  'appointments',
];

export const ALL_ACTIONS: PermissionAction[] = [
  'view',
  'create',
  'edit',
  'delete',
  'upload',
  'download',
  'print',
  'export_excel',
  'export_pdf',
  'publish',
  'approve',
  'manage_settings',
];

export function getFullPermissions(): Record<string, PermissionAction[]> {
  const perm: Record<string, PermissionAction[]> = {};
  ALL_MODULES.forEach((mod) => {
    perm[mod] = [...ALL_ACTIONS];
  });
  return perm;
}

export function getStandardAdminPermissions(): Record<string, PermissionAction[]> {
  const perm: Record<string, PermissionAction[]> = {};
  ALL_MODULES.forEach((mod) => {
    if (['admin_management', 'roles', 'users'].includes(mod)) {
      perm[mod] = ['view'];
    } else {
      perm[mod] = ['view', 'create', 'edit', 'upload', 'download', 'print', 'export_excel', 'export_pdf', 'publish', 'approve'];
    }
  });
  return perm;
}

export function getStaffPermissions(): Record<string, PermissionAction[]> {
  const perm: Record<string, PermissionAction[]> = {};
  ALL_MODULES.forEach((mod) => {
    if (['bookings', 'customers', 'appointments', 'reviews', 'testimonials'].includes(mod)) {
      perm[mod] = ['view', 'create', 'edit', 'print'];
    } else {
      perm[mod] = ['view'];
    }
  });
  return perm;
}

// Fallback admin users with full RBAC permissions
export let fallbackAdmins: (AdminUser & { passwordHash: string })[] = [
  {
    id: 1,
    name: 'राजन कैथवास',
    email: 'admin@rajankaithwas.com',
    mobile: '+91 9876543210',
    username: 'superadmin',
    designation: 'मुख्य ज्योतिषाचार्य एवं संस्थापक',
    profileImage: '/rajan_kaithwas.svg',
    passwordHash: '',
    role: 'Super Admin',
    status: 'active',
    permissions: getFullPermissions(),
    failedAttempts: 0,
    lockUntil: null,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'एडमिन प्रबंधक',
    email: 'manager@rajankaithwas.com',
    mobile: '+91 9876543211',
    username: 'astromanager',
    designation: 'वरिष्ठ परिचालन प्रबंधक',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    passwordHash: '',
    role: 'Admin',
    status: 'active',
    permissions: getStandardAdminPermissions(),
    failedAttempts: 0,
    lockUntil: null,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'सहायक स्टाफ',
    email: 'staff@rajankaithwas.com',
    mobile: '+91 9876543212',
    username: 'jyotishstaff',
    designation: 'परामर्श समन्वयक',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    passwordHash: '',
    role: 'Staff',
    status: 'active',
    permissions: getStaffPermissions(),
    failedAttempts: 0,
    lockUntil: null,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// Activity Logs Database
export let activityLogsDatabase: AdminActivityLog[] = [
  {
    id: 'log-1',
    adminId: 1,
    adminName: 'राजन कैथवास',
    role: 'Super Admin',
    action: 'SYSTEM_BOOT',
    module: 'system',
    details: 'Super Admin Security & RBAC control panel initialized.',
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1',
  },
  {
    id: 'log-2',
    adminId: 1,
    adminName: 'राजन कैथवास',
    role: 'Super Admin',
    action: 'SEEDED_ACCOUNTS',
    module: 'admin_management',
    details: 'Super Admin & Admin system accounts populated.',
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1',
  },
];

export function logAdminAction(admin: { id: number | string; name: string; role: string }, action: string, module: string, details: string) {
  activityLogsDatabase.unshift({
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    adminId: admin.id,
    adminName: admin.name,
    role: admin.role,
    action,
    module,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1',
  });
}

// Initialize password hashes
(async () => {
  fallbackAdmins[0].passwordHash = await bcrypt.hash('admin123', 10);
  fallbackAdmins[1].passwordHash = await bcrypt.hash('manager123', 10);
  fallbackAdmins[2].passwordHash = await bcrypt.hash('staff123', 10);
})();

// Helper to authenticate request and get current admin user
export function getAuthenticatedAdmin(req: Request): AdminUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  const decoded = verifyAdminToken(token);
  if (!decoded) return null;

  const found = fallbackAdmins.find((a) => String(a.id) === String(decoded.id) || a.email.toLowerCase() === decoded.email.toLowerCase());
  if (found) {
    const { passwordHash, ...userWithoutPassword } = found;
    return userWithoutPassword;
  }

  return {
    id: decoded.id,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role as AdminRole,
    status: 'active',
    permissions: decoded.role === 'Super Admin' ? getFullPermissions() : getStandardAdminPermissions(),
  };
}

// POST /api/auth/admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'कृपया ईमेल एवं पासवर्ड दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let adminRecord: any = fallbackAdmins.find((a) => a.email.toLowerCase() === cleanEmail || a.username?.toLowerCase() === cleanEmail);

    // Try DB if available
    if (!adminRecord) {
      try {
        const dbResult = await db.select().from(admins).where(eq(admins.email, cleanEmail)).limit(1);
        if (dbResult && dbResult.length > 0) {
          adminRecord = dbResult[0];
        }
      } catch (dbErr) {
        // use fallback
      }
    }

    if (!adminRecord) {
      return res.status(401).json({
        success: false,
        error: 'अमान्य क्रेडेंशियल! कृपया सही ईमेल अथवा यूजरनेम दर्ज करें।',
      });
    }

    if (adminRecord.status === 'inactive' || adminRecord.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: `आपका खाता वर्तमान में ${adminRecord.status === 'suspended' ? 'निलंबित (Suspended)' : 'निष्क्रिय (Inactive)'} है। कृपया Super Admin से संपर्क करें।`,
      });
    }

    // Check if account is temporarily locked due to rate limiting / repeated failed attempts
    if (adminRecord.lockUntil && new Date(adminRecord.lockUntil) > new Date()) {
      const remainingMinutes = Math.max(1, Math.ceil((new Date(adminRecord.lockUntil).getTime() - Date.now()) / (60 * 1000)));
      return res.status(429).json({
        success: false,
        error: `बार-बार अमान्य प्रयासों के कारण खाता locked है। कृपया ${remainingMinutes} मिनट पश्चात् पुनः प्रयास करें।`,
      });
    }

    const isMatch = await bcrypt.compare(password, adminRecord.passwordHash);

    if (!isMatch) {
      adminRecord.failedAttempts = (adminRecord.failedAttempts || 0) + 1;
      if (adminRecord.failedAttempts >= 5) {
        // Lock account for 15 minutes after 5 failed attempts
        adminRecord.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        logAdminAction(adminRecord, 'ACCOUNT_LOCKED', 'auth', `लगातार 5 बार गलत पासवर्ड के कारण ${adminRecord.name} का खाता 15 मिनट के लिए लॉक हुआ।`);
        return res.status(429).json({
          success: false,
          error: 'लगातार 5 बार अमान्य पासवर्ड दर्ज करने के कारण आपका खाता 15 मिनट के लिए लॉक कर दिया गया है।',
        });
      }

      return res.status(401).json({
        success: false,
        error: `अमान्य पासवर्ड! (शेष प्रयास: ${5 - adminRecord.failedAttempts})`,
      });
    }

    // Success login: reset failed attempts counter & lockout timer
    adminRecord.failedAttempts = 0;
    adminRecord.lockUntil = null;

    // Success login
    const nowIso = new Date().toISOString();
    adminRecord.lastLogin = nowIso;

    if (!adminRecord.permissions || Object.keys(adminRecord.permissions).length === 0) {
      adminRecord.permissions = adminRecord.role === 'Super Admin' ? getFullPermissions() : getStandardAdminPermissions();
    }

    const token = generateAdminToken({
      id: adminRecord.id,
      name: adminRecord.name,
      email: adminRecord.email,
      role: adminRecord.role,
    });

    logAdminAction(adminRecord, 'LOGIN', 'auth', `${adminRecord.name} (${adminRecord.role}) ने लॉगिन किया।`);

    const adminProfile: AdminUser = {
      id: adminRecord.id,
      name: adminRecord.name,
      email: adminRecord.email,
      mobile: adminRecord.mobile || '+91 9876543210',
      username: adminRecord.username || adminRecord.email.split('@')[0],
      designation: adminRecord.designation || 'ज्योतिष प्रशासक',
      profileImage: adminRecord.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: adminRecord.role,
      status: 'active',
      permissions: adminRecord.permissions,
      lastLogin: nowIso,
    };

    return res.json({
      success: true,
      message: `नमस्ते ${adminRecord.name}! एडमिन कंट्रोल पैनल में आपका स्वागत है।`,
      token,
      admin: adminProfile,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'लॉगिन प्रक्रिया में त्रुटि आई।' });
  }
});

// POST /api/auth/admin/logout
router.post('/logout', (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (currentAdmin) {
    logAdminAction(currentAdmin, 'LOGOUT', 'auth', `${currentAdmin.name} ने लॉगआउट किया।`);
  }
  return res.json({ success: true, message: 'सफलतापूर्वक लॉगआउट हो गए हैं।' });
});

// GET /api/auth/admin/profile
router.get('/profile', async (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin) {
    return res.status(401).json({ success: false, error: 'अनधिकृत: सेशन समाप्त या अमान्य टोकन।' });
  }
  return res.json({ success: true, admin: currentAdmin });
});

// GET /api/auth/admin/users - List all admins
router.get('/users', (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin) return res.status(401).json({ error: 'Unauthorized' });

  const sanitized = fallbackAdmins.map(({ passwordHash, ...user }) => user);
  return res.json({ success: true, admins: sanitized });
});

// POST /api/auth/admin/users - Create New Admin (Super Admin only)
router.post('/users', async (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin || currentAdmin.role !== 'Super Admin') {
    return res.status(403).json({ success: false, error: 'केवल Super Admin ही नया एडमिन बना सकते हैं।' });
  }

  const { name, email, mobile, username, password, designation, role, status, permissions, profileImage } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'नाम, ईमेल एवं पासवर्ड अनिवार्य हैं।' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = fallbackAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

  if (existing) {
    return res.status(400).json({ success: false, error: 'इस ईमेल से एडमिन पहले से मौजूद है।' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const assignedRole: AdminRole = role || 'Admin';

  let assignedPermissions = permissions;
  if (!assignedPermissions || Object.keys(assignedPermissions).length === 0) {
    if (assignedRole === 'Super Admin') assignedPermissions = getFullPermissions();
    else if (assignedRole === 'Admin') assignedPermissions = getStandardAdminPermissions();
    else assignedPermissions = getStaffPermissions();
  }

  const newAdmin: AdminUser & { passwordHash: string } = {
    id: Date.now(),
    name,
    email: cleanEmail,
    mobile: mobile || '+91 9876543210',
    username: username || cleanEmail.split('@')[0],
    designation: designation || 'वैदिक ज्योतिष प्रबंधक',
    profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    passwordHash,
    role: assignedRole,
    status: status || 'active',
    permissions: assignedPermissions,
    failedAttempts: 0,
    lockUntil: null,
    lastLogin: null,
    createdAt: new Date().toISOString(),
  };

  fallbackAdmins.unshift(newAdmin);
  logAdminAction(currentAdmin, 'CREATE_ADMIN', 'admin_management', `नया एडमिन निर्मित: ${name} (${assignedRole})`);

  const { passwordHash: _, ...createdUser } = newAdmin;
  return res.json({ success: true, admin: createdUser, message: 'नया एडमिन सफलतापूर्वक बनाया गया!' });
});

// PUT /api/auth/admin/users/:id - Edit Admin (Super Admin only or self edit basic info)
router.put('/users/:id', async (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin) return res.status(401).json({ error: 'Unauthorized' });

  const targetId = req.params.id;
  const isSuper = currentAdmin.role === 'Super Admin';
  const isSelf = String(currentAdmin.id) === String(targetId);

  if (!isSuper && !isSelf) {
    return res.status(403).json({ success: false, error: 'केवल Super Admin ही दूसरों की प्रोफाइल संपादित कर सकते हैं।' });
  }

  const index = fallbackAdmins.findIndex((a) => String(a.id) === String(targetId));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'एडमिन नहीं मिला।' });
  }

  const { name, mobile, designation, role, status, permissions, profileImage, password } = req.body;

  if (name) fallbackAdmins[index].name = name;
  if (mobile) fallbackAdmins[index].mobile = mobile;
  if (designation) fallbackAdmins[index].designation = designation;
  if (profileImage) fallbackAdmins[index].profileImage = profileImage;

  if (isSuper) {
    if (role) fallbackAdmins[index].role = role;
    if (status) fallbackAdmins[index].status = status;
    if (permissions) fallbackAdmins[index].permissions = permissions;
  }

  if (password && password.length >= 6) {
    fallbackAdmins[index].passwordHash = await bcrypt.hash(password, 10);
  }

  fallbackAdmins[index].updatedAt = new Date().toISOString();

  logAdminAction(currentAdmin, 'EDIT_ADMIN', 'admin_management', `एडमिन प्रोफाइल अपडेट: ${fallbackAdmins[index].name}`);

  const { passwordHash: _, ...updatedUser } = fallbackAdmins[index];
  return res.json({ success: true, admin: updatedUser, message: 'एडमिन जानकारी सफलतापूर्वक अपडेट हो गई!' });
});

// DELETE /api/auth/admin/users/:id - Delete Admin (Super Admin only)
router.delete('/users/:id', (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin || currentAdmin.role !== 'Super Admin') {
    return res.status(403).json({ success: false, error: 'केवल Super Admin ही किसी एडमिन को हटा सकते हैं।' });
  }

  const targetId = req.params.id;
  if (String(currentAdmin.id) === String(targetId)) {
    return res.status(400).json({ success: false, error: 'आप स्वयं के Super Admin खाते को नहीं हटा सकते।' });
  }

  const target = fallbackAdmins.find((a) => String(a.id) === String(targetId));
  fallbackAdmins = fallbackAdmins.filter((a) => String(a.id) !== String(targetId));

  logAdminAction(currentAdmin, 'DELETE_ADMIN', 'admin_management', `एडमिन डिलीट किया गया: ${target?.name || targetId}`);
  return res.json({ success: true, message: 'एडमिन सफलतापूर्वक हटा दिया गया।' });
});

// POST /api/auth/admin/users/:id/reset-password - Reset Admin Password
router.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin || currentAdmin.role !== 'Super Admin') {
    return res.status(403).json({ success: false, error: 'केवल Super Admin ही पासवर्ड रीसेट कर सकते हैं।' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'नया पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।' });
  }

  const targetId = req.params.id;
  const index = fallbackAdmins.findIndex((a) => String(a.id) === String(targetId));

  if (index === -1) return res.status(404).json({ success: false, error: 'एडमिन नहीं मिला।' });

  fallbackAdmins[index].passwordHash = await bcrypt.hash(newPassword, 10);
  fallbackAdmins[index].failedAttempts = 0;
  fallbackAdmins[index].lockUntil = null;
  if (fallbackAdmins[index].status === 'locked') fallbackAdmins[index].status = 'active';

  logAdminAction(currentAdmin, 'RESET_PASSWORD', 'admin_management', `एडमिन ${fallbackAdmins[index].name} का पासवर्ड रीसेट किया गया।`);
  return res.json({ success: true, message: `एडमिन ${fallbackAdmins[index].name} का पासवर्ड रीसेट कर दिया गया!` });
});

// POST /api/auth/admin/users/:id/toggle-status - Activate / Deactivate / Suspend Admin
router.post('/users/:id/toggle-status', (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin || currentAdmin.role !== 'Super Admin') {
    return res.status(403).json({ success: false, error: 'केवल Super Admin ही खाता स्थिति बदल सकते हैं।' });
  }

  const { status } = req.body;
  const targetId = req.params.id;

  if (String(currentAdmin.id) === String(targetId)) {
    return res.status(400).json({ success: false, error: 'आप स्वयं के Super Admin खाते की स्थिति नहीं बदल सकते।' });
  }

  const index = fallbackAdmins.findIndex((a) => String(a.id) === String(targetId));
  if (index === -1) return res.status(404).json({ success: false, error: 'एडमिन नहीं मिला।' });

  fallbackAdmins[index].status = status || 'active';
  logAdminAction(currentAdmin, 'CHANGE_STATUS', 'admin_management', `एडमिन ${fallbackAdmins[index].name} की स्थिति: ${status}`);

  return res.json({ success: true, message: `खाता स्थिति बदल कर ${status} कर दी गई!` });
});

// GET /api/auth/admin/activity-logs - Get System Activity Logs
router.get('/activity-logs', (req: Request, res: Response) => {
  const currentAdmin = getAuthenticatedAdmin(req);
  if (!currentAdmin) return res.status(401).json({ error: 'Unauthorized' });

  return res.json({ success: true, logs: activityLogsDatabase });
});

// GET /api/auth/admin/roles - Get Roles and Permission Matrix Metadata
router.get('/roles', (req: Request, res: Response) => {
  return res.json({
    success: true,
    roles: [
      { id: 'super_admin', name: 'Super Admin', description: 'संपूर्ण सिस्टम नियंत्रण एवं सुरक्षा अधिकार' },
      { id: 'admin', name: 'Admin', description: 'सामान्य प्रबंधन एवं कंटेंट नियंत्रण' },
      { id: 'manager', name: 'Manager', description: 'ज्योतिष परामर्श एवं बुकिंग समन्वयक' },
      { id: 'staff', name: 'Staff', description: 'सीमित एक्सेस केवल देखने और सहायता हेतु' },
    ],
    modules: ALL_MODULES,
    actions: ALL_ACTIONS,
  });
});

export default router;
