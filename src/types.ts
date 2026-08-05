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

export interface RajanProfile {
  id: string;
  name: string;
  designation: string;
  short_bio: string;
  image_url: string;
  cloudinary_public_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

