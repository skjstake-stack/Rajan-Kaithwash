import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'bookings' table for astrology bookings
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  service: text('service').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'admins' table for Admin Login & RBAC System
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  mobile: text('mobile'),
  username: text('username'),
  designation: text('designation'),
  profileImage: text('profile_image'),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('Admin'), // 'Super Admin' | 'Admin' | 'Staff' | 'Manager'
  status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'suspended' | 'locked'
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockUntil: timestamp('lock_until'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'roles' table
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'permissions' table
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  module: text('module').notNull(),
  action: text('action').notNull(),
  description: text('description'),
});

// Define 'role_permissions' junction table
export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id),
  permissionId: integer('permission_id').references(() => permissions.id),
});

// Define 'admin_permissions' table
export const adminPermissions = pgTable('admin_permissions', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => admins.id),
  permissionsJson: text('permissions_json').notNull(), // JSON mapping module -> actions[]
});

// Define 'admin_activity_logs' table
export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id'),
  adminName: text('admin_name').notNull(),
  role: text('role').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'customers' table for Customer / Jatak Management
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  customerId: text('customer_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  fatherName: text('father_name'),
  motherName: text('mother_name'),
  mobile: text('mobile').notNull(),
  whatsapp: text('whatsapp'),
  email: text('email').notNull(),
  gender: text('gender').notNull(),
  dob: text('dob').notNull(),
  birthTime: text('birth_time').notNull(),
  birthPlace: text('birth_place').notNull(),
  zodiacSign: text('zodiac_sign').notNull(),
  occupation: text('occupation'),
  maritalStatus: text('marital_status'),
  address: text('address'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').default('India'),
  pinCode: text('pin_code'),
  profileImageUrl: text('profile_image_url'),
  cloudinaryPublicId: text('cloudinary_public_id'),
  notes: text('notes'),
  status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'suspended'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'blogs' table for Blog & Article Management
export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  categoryId: text('category_id').default('vedic-astrology'),
  category: text('category').notNull().default('वैदिक ज्योतिष'),
  author: text('author').notNull().default('पं. राजन कैथवास'),
  shortDescription: text('short_description'),
  content: text('content').notNull(),
  featuredImageUrl: text('featured_image_url'),
  cloudinaryPublicId: text('cloudinary_public_id'),
  altText: text('alt_text'),
  tags: text('tags'), // Comma separated or JSON string
  status: text('status').notNull().default('published'), // 'draft' | 'published' | 'scheduled'
  publishDate: text('publish_date'),
  views: integer('views').default(0),
  isFeatured: integer('is_featured').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'gallery_categories' table
export const galleryCategories = pgTable('gallery_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  mediaCount: integer('media_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'gallery_albums' table
export const galleryAlbums = pgTable('gallery_albums', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  category: text('category').default('अन्य'),
  coverImageUrl: text('cover_image_url'),
  visibility: text('visibility').default('public'), // 'public' | 'private'
  sortOrder: integer('sort_order').default(0),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'gallery_media' table
export const galleryMedia = pgTable('gallery_media', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull().default('अन्य'),
  album: text('album').default('सामान्य'),
  mediaType: text('media_type').notNull().default('image'), // 'image' | 'video'
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  cloudinaryPublicId: text('cloudinary_public_id'),
  uploadedBy: text('uploaded_by').default('पं. राजन कैथवास'),
  status: text('status').default('published'), // 'published' | 'draft'
  altText: text('alt_text'),
  views: integer('views').default(0),
  fileSizeMb: integer('file_size_mb').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'homepage_banners' table
export const homepageBanners = pgTable('homepage_banners', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  heroImageUrl: text('hero_image_url').notNull(),
  mobileImageUrl: text('mobile_image_url'),
  cloudinaryPublicId: text('cloudinary_public_id'),
  buttonText: text('button_text'),
  buttonUrl: text('button_url'),
  secondButtonText: text('second_button_text'),
  secondButtonUrl: text('second_button_url'),
  status: text('status').notNull().default('active'), // 'active' | 'draft' | 'scheduled'
  displayOrder: integer('display_order').default(0),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdBy: text('created_by').default('पं. राजन कैथवास'),
  views: integer('views').default(0),
  clicks: integer('clicks').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'rajan_profile' table
export const rajanProfile = pgTable('rajan_profile', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull().default('पं. राजन कैथवास (मंटू)'),
  displayName: text('display_name').notNull().default('राजन कैथवास (मंटू)'),
  designation: text('designation').notNull().default('अंतरराष्ट्रीय ख्याति प्राप्त वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक'),
  shortBio: text('short_bio'),
  biography: text('biography'),
  experience: text('experience').default('33+ वर्ष'),
  qualification: text('qualification').default('ज्योतिष भास्कर, वैदिक शास्त्री, वास्तु विशारद'),
  specialization: text('specialization').default('जन्मकुण्डली फलादेश, मांगलिक दोष निवारण, वास्तु दोष निवारण, रत्न परामर्श'),
  languages: text('languages').default('हिंदी, संस्कृत, अंग्रेजी'),
  mobile: text('mobile').default('8319885134'),
  whatsapp: text('whatsapp').default('8319885134'),
  helpline: text('helpline').default('8319885134'),
  email: text('email').default('contact@rajankaithwas.com'),
  website: text('website').default('https://rajankaithwas.com'),
  officeAddress: text('office_address').default('Smart Point के सामने, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India'),
  pincode: text('pincode').default('480447'),
  googleMap: text('google_map').default('https://maps.google.com/?q=Chhindwara+Madhya+Pradesh+480447'),
  facebook: text('facebook').default('https://facebook.com/rajankaithwas.official'),
  instagram: text('instagram').default('https://instagram.com/rajankaithwas.official'),
  youtube: text('youtube').default('https://youtube.com/@rajankaithwasjyotish'),
  linkedin: text('linkedin').default('https://linkedin.com/in/rajankaithwas'),
  twitter: text('twitter').default('https://x.com/rajankaithwas'),
  awards: text('awards'),
  achievements: text('achievements'),
  publications: text('publications'),
  memberships: text('memberships'),
  mission: text('mission'),
  vision: text('vision'),
  profileImageUrl: text('profile_image_url'),
  cloudinaryPublicId: text('cloudinary_public_id'),
  galleryImages: text('gallery_images'), // JSON stringified array of gallery items
  certificates: text('certificates'),     // JSON stringified array of certificate items
  documents: text('documents'),           // JSON stringified array of documents
  status: text('status').notNull().default('active'),
  views: integer('views').default(12500),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'hero_section_images' table for Home Page Hero Section Image management
export const heroSectionImages = pgTable('hero_section_images', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'disabled'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

