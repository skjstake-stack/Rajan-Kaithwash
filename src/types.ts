export type Language = 'en' | 'hi' | 'gu' | 'mr' | 'ta' | 'te' | 'pa' | 'bn' | 'ur';

export interface ZodiacSign {
  id: string;
  name: string;
  hindiName: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  ruler: string;
  dates: string;
  luckyColor: string;
  luckyNumber: number;
  overview: string;
  love: string;
  career: string;
  finance: string;
  health: string;
}

export interface AstrologyService {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'kundli' | 'marriage' | 'career' | 'dosha' | 'vastu' | 'gemstone' | 'remedy' | 'numerology';
  description: string;
  iconName: string;
  priceINR: number;
  priceUSD: number;
  features: string[];
  popular?: boolean;
}

export interface PanchangData {
  date: string;
  vikramSamvat: string;
  sakaSamvat: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: string;
  paksha: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  abhijitMuhurat: string;
  rahuKalam: string;
  yamaganda: string;
  dishaShool: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  tags: string[];
}

export interface MediaItem {
  id: string;
  image_url: string;
  video_url?: string;
  cloudinary_public_id: string;
  media_type: 'image' | 'video';
  folder_name: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  serviceUsed: string;
  photoUrl: string;
  comment: string;
  verified: boolean;
  videoUrl?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  serviceId: string;
  serviceTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dob: string;
  tob: string;
  pob: string;
  date: string;
  timeSlot: string;
  consultationType: 'video' | 'audio' | 'in_person' | 'whatsapp' | 'chat';
  platform?: 'google_meet' | 'zoom' | 'whatsapp' | 'office';
  meetingLink?: string;
  notes?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: string;
}

export interface HeroBannerData {
  secure_url: string;
  public_id: string;
  title: string;
  subtitle: string;
  tagline: string;
  updated_at?: string;
}

export interface RajanProfileGalleryItem {
  id: string;
  title?: string;
  image_url: string;
  cloudinary_public_id: string;
  featured?: boolean;
  order?: number;
  created_at?: string;
}

export interface RajanProfileCertificateItem {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
  image_url: string;
  cloudinary_public_id: string;
  file_type?: 'image' | 'pdf';
  created_at?: string;
}

export interface RajanProfileDocumentItem {
  id: string;
  title: string;
  category?: 'Certificate' | 'Award' | 'PDF Document' | 'Media Coverage';
  file_url: string;
  cloudinary_public_id: string;
  file_type?: string;
  created_at?: string;
}

export interface RajanProfileActivityLog {
  id: string;
  action: 'Profile Updated' | 'Image Uploaded' | 'Image Deleted' | 'Certificates Added' | 'Gallery Updated';
  details: string;
  performedBy: string;
  timestamp: string;
}

export type RajanActivityLog = RajanProfileActivityLog;
export type RajanGalleryItem = RajanProfileGalleryItem;
export type RajanCertificateItem = RajanProfileCertificateItem;
export type RajanDocumentItem = RajanProfileDocumentItem;

export interface RajanProfileStats {
  status: string;
  lastUpdated: string;
  totalViews: number;
  completionPercentage: number;
  activeImage: string;
  certificatesCount: number;
  galleryImagesCount: number;
}

export interface RajanProfile {
  id: string | number;
  name?: string; // alias for display_name / full_name for backward compat
  full_name: string;
  display_name: string;
  designation: string;
  short_bio: string;
  biography: string;
  experience: string;
  qualification: string;
  specialization: string;
  languages: string;
  mobile: string;
  whatsapp: string;
  email: string;
  website: string;
  office_address: string;
  google_map: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  awards: string;
  achievements: string;
  publications: string;
  memberships: string;
  mission: string;
  vision: string;
  image_url?: string; // alias for profile_image_url
  profile_image_url: string;
  cloudinary_public_id: string;
  gallery_images?: RajanProfileGalleryItem[];
  certificates?: RajanProfileCertificateItem[];
  documents?: RajanProfileDocumentItem[];
  status: 'active' | 'inactive';
  views: number;
  created_at: string;
  updated_at: string;
}

export type AdminRole = 'Super Admin' | 'Admin' | 'Staff' | 'Manager';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'upload'
  | 'download'
  | 'print'
  | 'export_excel'
  | 'export_pdf'
  | 'publish'
  | 'approve'
  | 'manage_settings';

export type ModuleName =
  | 'dashboard'
  | 'bookings'
  | 'customers'
  | 'services'
  | 'blog'
  | 'gallery'
  | 'home_banner'
  | 'rajan_profile'
  | 'director_profile'
  | 'about_us'
  | 'testimonials'
  | 'reviews'
  | 'payments'
  | 'reports'
  | 'analytics'
  | 'notifications'
  | 'website_settings'
  | 'seo'
  | 'cloudinary_media'
  | 'admin_management'
  | 'users'
  | 'roles'
  | 'staff'
  | 'appointments';

export interface AdminUser {
  id: number | string;
  name: string;
  email: string;
  mobile?: string;
  username?: string;
  designation?: string;
  profileImage?: string;
  role: AdminRole;
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  permissions?: Record<string, PermissionAction[]>;
  failedAttempts?: number;
  lockUntil?: string | null;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminActivityLog {
  id: string;
  adminId: number | string;
  adminName: string;
  role: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Customer {
  id: string | number;
  customer_id: string;
  full_name: string;
  father_name?: string;
  mother_name?: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  gender: string;
  dob: string;
  birth_time: string;
  birth_place: string;
  zodiac_sign: string;
  occupation?: string;
  marital_status?: string;
  address?: string;
  city: string;
  state: string;
  country?: string;
  pin_code?: string;
  profile_image_url: string;
  cloudinary_public_id?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: AdminUser;
  error?: string;
}

export interface BlogArticle {
  id: string | number;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  category_id?: string;
  category: string;
  author: string;
  short_description?: string;
  content: string;
  featured_image_url: string;
  imageUrl?: string;
  cloudinary_public_id?: string;
  alt_text?: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publish_date: string;
  views: number;
  is_featured?: boolean;
  reading_time?: string;
  faqs?: Array<{ question: string; answer: string }>;
  created_at: string;
  updated_at?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  hindiName: string;
  slug: string;
  articleCount: number;
  description?: string;
}

export interface BlogComment {
  id: string;
  articleId: string | number;
  articleTitle?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reply?: string;
}

export interface GalleryCategory {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  mediaCount?: number;
  createdAt?: string;
}

export interface GalleryAlbum {
  id: string | number;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  visibility?: 'public' | 'private';
  sortOrder?: number;
  views?: number;
  mediaCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryMediaItem {
  id: string | number;
  title: string;
  description?: string;
  category: string;
  album?: string;
  mediaType: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  uploadedBy?: string;
  status?: 'published' | 'draft';
  altText?: string;
  views?: number;
  fileSizeMb?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeBannerItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  hero_image_url: string;
  mobile_image_url?: string;
  cloudinary_public_id?: string;
  button_text?: string;
  button_url?: string;
  second_button_text?: string;
  second_button_url?: string;
  status: 'active' | 'draft' | 'scheduled';
  display_order: number;
  start_date?: string;
  end_date?: string;
  created_by?: string;
  views?: number;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomeBannerSettings {
  autoRotation: boolean;
  sliderMode: 'auto' | 'manual' | 'disabled';
  autoRotationIntervalSec: number;
  overlayOpacity: number;
  textAlignment: 'left' | 'center' | 'right';
  darkOverlay: boolean;
  animationEffect: 'fade' | 'slide' | 'zoom' | 'none';
}

