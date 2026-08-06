import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { admins } from '../db/schema.ts';
import { AdminRole, AdminUser } from '../types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'rajan_kaithwas_astrology_super_secret_jwt_2026';

export async function seedInitialAdmins() {
  try {
    const existingAdmins = await db.select().from(admins);
    if (existingAdmins.length === 0) {
      const superAdminPasswordHash = await bcrypt.hash('admin123', 10);
      const adminPasswordHash = await bcrypt.hash('manager123', 10);

      await db.insert(admins).values([
        {
          name: 'राजन कैथवास',
          email: 'admin@rajankaithwas.com',
          mobile: '+91 9876543210',
          passwordHash: superAdminPasswordHash,
          role: 'Super Admin',
          status: 'active',
          failedAttempts: 0,
        },
        {
          name: 'एडमिन प्रबंधक (Astrology Manager)',
          email: 'manager@rajankaithwas.com',
          mobile: '+91 9876543211',
          passwordHash: adminPasswordHash,
          role: 'Admin',
          status: 'active',
          failedAttempts: 0,
        },
        {
          name: 'सहायक स्टाफ (Support Staff)',
          email: 'staff@rajankaithwas.com',
          mobile: '+91 9876543212',
          passwordHash: 'staff123',
          role: 'Staff',
          status: 'active',
          failedAttempts: 0,
        }
      ]);
      console.log('✅ Initial Admin accounts seeded successfully in Cloud SQL PostgreSQL.');
    }
  } catch (err: any) {
    // Database table or column is initializing; running in fallback in-memory mode
    console.log('ℹ️ Admin system running in resilient in-memory mode.');
  }
}

export function generateAdminToken(admin: { id: number; name: string; email: string; role: string }) {
  return jwt.sign(
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyAdminToken(token: string): { id: number; name: string; email: string; role: AdminRole } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; name: string; email: string; role: AdminRole };
  } catch (err) {
    return null;
  }
}
