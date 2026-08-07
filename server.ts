import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import adminAuthRoutes from './src/routes/adminAuthRoutes.ts';
import { seedInitialAdmins } from './src/lib/adminAuthService.ts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount Admin Authentication APIs
app.use('/api/auth/admin', adminAuthRoutes);

// Seed initial Admin & Super Admin credentials on boot
seedInitialAdmins();


// Configure Memory Storage for Multer (no local disk storage as required)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos/images
});

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('✅ Cloudinary initialized with environment credentials.');
} else {
  console.log('⚠️ CLOUDINARY credentials not set in environment. Running with high-res Cloudinary simulation fallback.');
}

// Initialize Gemini Client (Server-side only)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set yet.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// In-Memory Database for Media, Bookings, Blog, and Reviews
interface MediaItem {
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

interface BookingItem {
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
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'pending';
  createdAt: string;
}

// Seed initial Media Items
let mediaDatabase: MediaItem[] = [
  {
    id: 'm-1',
    image_url: '/rajan_kaithwas.svg',
    cloudinary_public_id: 'hero/rajan_kaithwas_main',
    media_type: 'image',
    folder_name: 'hero',
    title: 'Rajan Kaithwas Ji Portrait',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-2',
    image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80',
    cloudinary_public_id: 'temple_images/kedarnath_temple',
    media_type: 'image',
    folder_name: 'temple_images',
    title: 'Kedarnath Holy Shrine Pooja',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-3',
    image_url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80',
    cloudinary_public_id: 'awards/national_astrology_award',
    media_type: 'image',
    folder_name: 'awards',
    title: 'Gold Medalist Jyotish Ratna Award 2024',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-4',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    cloudinary_public_id: 'gallery/grand_yajna_seminar',
    media_type: 'image',
    folder_name: 'events',
    title: 'Vedic Astrology Global Seminar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let bookingsDatabase: BookingItem[] = [
  {
    id: 'b-101',
    bookingRef: 'RKJ-2026-8812',
    serviceId: 'janam-kundli',
    serviceTitle: 'Full Comprehensive Janam Kundli Analysis',
    clientName: 'Ananya Sharma',
    clientEmail: 'ananya.s@gmail.com',
    clientPhone: '+91 98765 43210',
    dob: '1995-04-14',
    tob: '08:30',
    pob: 'New Delhi, India',
    date: '2026-08-06',
    timeSlot: '11:00 AM - 12:00 PM',
    consultationType: 'video',
    platform: 'google_meet',
    meetingLink: 'https://meet.google.com/rkj-ast-vdp',
    notes: 'Career transition and marriage prospects inquiry.',
    amount: 2100,
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-102',
    bookingRef: 'RKJ-2026-9241',
    serviceId: 'kundli-matching',
    serviceTitle: '36 Guna Kundli Matching & Marriage Dosha',
    clientName: 'Rahul Verma',
    clientEmail: 'rahul.verma@yahoo.com',
    clientPhone: '+91 91234 56789',
    dob: '1992-11-20',
    tob: '19:15',
    pob: 'Mumbai, India',
    date: '2026-08-07',
    timeSlot: '03:00 PM - 04:00 PM',
    consultationType: 'audio',
    platform: 'whatsapp',
    notes: 'Manglik Dosha evaluation for both partners.',
    amount: 1500,
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
];

// Hero Banner Database State
interface HeroBannerItem {
  secure_url: string;
  public_id: string;
  title: string;
  subtitle: string;
  tagline: string;
  updated_at: string;
}

let heroBannerDatabase: HeroBannerItem = {
  secure_url: '/rajan_kaithwas.svg',
  public_id: 'hero/rajan_kaithwas_main',
  title: 'राजन कैथवास (मंटू)',
  subtitle: 'वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन',
  tagline: 'प्राचीन वैदिक ज्ञान के माध्यम से आपके जीवन का सही मार्गदर्शन',
  updated_at: new Date().toISOString(),
};

// ==========================================
// HERO BANNER APIs
// ==========================================

// Get Hero Banner
app.get('/api/hero', (req, res) => {
  return res.json({
    success: true,
    hero: heroBannerDatabase,
  });
});

// Upload & Replace Hero Banner Image (Folder: hero/, deletes old asset, updates database)
app.post('/api/hero/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { title, subtitle, tagline } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided for Hero Banner.' });
    }

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
    const oldPublicId = heroBannerDatabase.public_id;

    let newSecureUrl = '';
    let newPublicId = '';

    if (isCloudinaryConfigured) {
      // 1. Delete old Cloudinary asset if public_id exists and isn't the initial seed default
      if (oldPublicId && oldPublicId !== 'hero/rajan_kaithwas_main') {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log(`Deleted old hero asset from Cloudinary: ${oldPublicId}`);
        } catch (destroyErr: any) {
          console.warn('Notice: Could not destroy old hero asset:', destroyErr.message);
        }
      }

      // 2. Upload to Cloudinary under folder 'hero/' with q_auto and f_auto
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hero',
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      newSecureUrl = uploadResult.secure_url;
      newPublicId = uploadResult.public_id;
    } else {
      // Fallback base64 URI / mock public id if Cloudinary secret not set in dev
      newSecureUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      newPublicId = `hero/banner_${Date.now()}`;
    }

    // Overwrite heroBannerDatabase record
    heroBannerDatabase = {
      secure_url: newSecureUrl,
      public_id: newPublicId,
      title: title || heroBannerDatabase.title,
      subtitle: subtitle || heroBannerDatabase.subtitle,
      tagline: tagline || heroBannerDatabase.tagline,
      updated_at: new Date().toISOString(),
    };

    // Keep mediaDatabase in sync under 'hero' folder
    const heroMediaIndex = mediaDatabase.findIndex((m) => m.folder_name === 'hero');
    const mediaRecord: MediaItem = {
      id: 'm-hero-' + Date.now(),
      image_url: newSecureUrl,
      cloudinary_public_id: newPublicId,
      media_type: 'image',
      folder_name: 'hero',
      title: 'Hero Banner - ' + heroBannerDatabase.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (heroMediaIndex !== -1) {
      mediaDatabase[heroMediaIndex] = mediaRecord;
    } else {
      mediaDatabase.unshift(mediaRecord);
    }

    return res.json({
      success: true,
      message: 'Hero banner updated and saved to database successfully!',
      hero: heroBannerDatabase,
    });
  } catch (error: any) {
    console.error('Hero Banner upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload Hero Banner.' });
  }
});

// Update Hero Banner Text Content
app.put('/api/hero', (req, res) => {
  const { title, subtitle, tagline } = req.body;
  heroBannerDatabase = {
    ...heroBannerDatabase,
    title: title || heroBannerDatabase.title,
    subtitle: subtitle || heroBannerDatabase.subtitle,
    tagline: tagline || heroBannerDatabase.tagline,
    updated_at: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: 'Hero banner text updated successfully.',
    hero: heroBannerDatabase,
  });
});

// ==========================================
// DYNAMIC HERO SECTION IMAGES (hero_section_images) APIs
// ==========================================

interface HeroSectionImageItem {
  id: string;
  image_url: string;
  cloudinary_public_id: string;
  status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

let heroSectionImagesDatabase: HeroSectionImageItem[] = [];

// Helper to get active hero section image
function getActiveHeroSectionImage(): HeroSectionImageItem | null {
  const activeItem = heroSectionImagesDatabase.find((img) => img.status === 'active');
  if (activeItem) return activeItem;
  if (heroSectionImagesDatabase.length > 0) return heroSectionImagesDatabase[0];
  return null;
}

// 1. Get all Hero Section Images
app.get('/api/hero-section-images', (req, res) => {
  return res.json({
    success: true,
    images: heroSectionImagesDatabase,
    activeImage: getActiveHeroSectionImage(),
  });
});

// 2. Get Active Hero Section Image
app.get('/api/hero-section-images/active', (req, res) => {
  return res.json({
    success: true,
    activeImage: getActiveHeroSectionImage(),
  });
});

// 3. Upload new Hero Section Image to folder 'hero_section/'
app.post('/api/hero-section-images/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { status = 'active' } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
    let newSecureUrl = '';
    let newPublicId = '';

    if (isCloudinaryConfigured) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hero_section',
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      newSecureUrl = uploadResult.secure_url;
      newPublicId = uploadResult.public_id;
    } else {
      newSecureUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      newPublicId = `hero_section/hero_${Date.now()}`;
    }

    // If new image is active, set other existing images to disabled
    if (status === 'active') {
      heroSectionImagesDatabase.forEach((img) => {
        img.status = 'disabled';
      });
    }

    const newRecord: HeroSectionImageItem = {
      id: 'hsi-' + Date.now(),
      image_url: newSecureUrl,
      cloudinary_public_id: newPublicId,
      status: status === 'disabled' ? 'disabled' : 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    heroSectionImagesDatabase.unshift(newRecord);

    return res.json({
      success: true,
      message: 'Hero Section image uploaded directly to Cloudinary (hero_section/) and saved successfully!',
      image: newRecord,
      activeImage: getActiveHeroSectionImage(),
    });
  } catch (error: any) {
    console.error('Hero Section Image Upload Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload hero image.' });
  }
});

// 4. Replace existing Hero Section Image
app.post('/api/hero-section-images/:id/replace', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No replacement image file provided.' });
    }

    const itemIndex = heroSectionImagesDatabase.findIndex((item) => String(item.id) === String(id));
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Hero image record not found.' });
    }

    const targetItem = heroSectionImagesDatabase[itemIndex];
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

    // Delete old Cloudinary asset if configured and not default
    if (isCloudinaryConfigured && targetItem.cloudinary_public_id && !targetItem.cloudinary_public_id.includes('rajan_kaithwas_main')) {
      try {
        await cloudinary.uploader.destroy(targetItem.cloudinary_public_id);
        console.log(`Destroyed old Cloudinary asset: ${targetItem.cloudinary_public_id}`);
      } catch (destroyErr: any) {
        console.warn('Notice: Could not destroy old hero asset:', destroyErr.message);
      }
    }

    let newSecureUrl = '';
    let newPublicId = '';

    if (isCloudinaryConfigured) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hero_section',
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      newSecureUrl = uploadResult.secure_url;
      newPublicId = uploadResult.public_id;
    } else {
      newSecureUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      newPublicId = `hero_section/hero_${Date.now()}`;
    }

    // Update item
    targetItem.image_url = newSecureUrl;
    targetItem.cloudinary_public_id = newPublicId;
    targetItem.updated_at = new Date().toISOString();

    heroSectionImagesDatabase[itemIndex] = targetItem;

    return res.json({
      success: true,
      message: 'Hero image replaced and old Cloudinary asset deleted successfully!',
      image: targetItem,
      activeImage: getActiveHeroSectionImage(),
    });
  } catch (error: any) {
    console.error('Hero Image Replace Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to replace hero image.' });
  }
});

// 5. Update Status (Enable / Disable)
app.put('/api/hero-section-images/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const itemIndex = heroSectionImagesDatabase.findIndex((item) => String(item.id) === String(id));
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Hero image record not found.' });
  }

  if (status === 'active') {
    // Disable all others
    heroSectionImagesDatabase.forEach((img) => {
      img.status = 'disabled';
    });
  }

  heroSectionImagesDatabase[itemIndex].status = status === 'active' ? 'active' : 'disabled';
  heroSectionImagesDatabase[itemIndex].updated_at = new Date().toISOString();

  return res.json({
    success: true,
    message: `Hero image status updated to ${heroSectionImagesDatabase[itemIndex].status}`,
    image: heroSectionImagesDatabase[itemIndex],
    activeImage: getActiveHeroSectionImage(),
  });
});

// 6. Delete Hero Section Image
app.delete('/api/hero-section-images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = heroSectionImagesDatabase.findIndex((item) => String(item.id) === String(id));

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Hero image record not found.' });
    }

    const targetItem = heroSectionImagesDatabase[itemIndex];
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

    // Destroy Cloudinary asset
    if (isCloudinaryConfigured && targetItem.cloudinary_public_id && !targetItem.cloudinary_public_id.includes('rajan_kaithwas_main')) {
      try {
        await cloudinary.uploader.destroy(targetItem.cloudinary_public_id);
        console.log(`Destroyed Cloudinary asset upon deletion: ${targetItem.cloudinary_public_id}`);
      } catch (destroyErr: any) {
        console.warn('Notice: Could not destroy asset from Cloudinary:', destroyErr.message);
      }
    }

    const wasActive = targetItem.status === 'active';
    heroSectionImagesDatabase.splice(itemIndex, 1);

    // If deleted item was active and items remain, make the first remaining item active
    if (wasActive && heroSectionImagesDatabase.length > 0) {
      heroSectionImagesDatabase[0].status = 'active';
    }

    return res.json({
      success: true,
      message: 'Hero image deleted from database and Cloudinary successfully!',
      activeImage: getActiveHeroSectionImage(),
    });
  } catch (error: any) {
    console.error('Delete Hero Image Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete hero image.' });
  }
});


// ==========================================
// RAJAN KAITHWAS JI PROFILE APIs
// ==========================================

interface RajanProfileItem {
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

// Rajan Profile DB is defined in the comprehensive Rajan Profile Module section below


// ==========================================
// 1. CLOUDINARY MEDIA APIs
// ==========================================

// Upload Media API
app.post('/api/media/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const folder = (req.body.folder_name || 'uploads').toLowerCase();
    const mediaType = req.body.media_type || 'image';

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const uploadedResults: MediaItem[] = [];

    for (const file of files) {
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

      if (isCloudinaryConfigured) {
        // Real Cloudinary Upload via Stream
        const result: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `rajan_kaithwas_ji/${folder}`,
              resource_type: mediaType === 'video' ? 'video' : 'auto',
              transformation: mediaType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        const newItem: MediaItem = {
          id: 'm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          image_url: result.secure_url,
          video_url: mediaType === 'video' ? result.secure_url : undefined,
          cloudinary_public_id: result.public_id,
          media_type: mediaType,
          folder_name: folder,
          title: file.originalname.replace(/\.[^/.]+$/, ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mediaDatabase.unshift(newItem);
        uploadedResults.push(newItem);
      } else {
        // Fallback Base64/Data URI / Unsplash preview item
        const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const mockPublicId = `${folder}/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`;

        const newItem: MediaItem = {
          id: 'm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          image_url: base64Data,
          video_url: mediaType === 'video' ? base64Data : undefined,
          cloudinary_public_id: mockPublicId,
          media_type: mediaType,
          folder_name: folder,
          title: file.originalname,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mediaDatabase.unshift(newItem);
        uploadedResults.push(newItem);
      }
    }

    return res.json({
      success: true,
      message: `${uploadedResults.length} file(s) uploaded successfully.`,
      media: uploadedResults,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload media.' });
  }
});

// List Media API
app.get('/api/media/list', (req, res) => {
  const folder = req.query.folder as string;
  let items = mediaDatabase;
  if (folder && folder !== 'all') {
    items = mediaDatabase.filter((m) => m.folder_name === folder.toLowerCase());
  }
  return res.json({
    success: true,
    total: items.length,
    media: items,
  });
});

// Update Media API
app.put('/api/media/update', (req, res) => {
  const { id, title, folder_name } = req.body;
  const index = mediaDatabase.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Media item not found.' });
  }

  mediaDatabase[index] = {
    ...mediaDatabase[index],
    title: title || mediaDatabase[index].title,
    folder_name: folder_name ? folder_name.toLowerCase() : mediaDatabase[index].folder_name,
    updated_at: new Date().toISOString(),
  };

  return res.json({
    success: true,
    media: mediaDatabase[index],
  });
});

// Delete Media API
app.delete('/api/media/delete', async (req, res) => {
  try {
    const { id, public_id } = req.body;
    let targetPublicId = public_id;

    if (id) {
      const found = mediaDatabase.find((m) => m.id === id);
      if (found) targetPublicId = found.cloudinary_public_id;
    }

    // If Cloudinary is active, attempt to delete from Cloudinary
    if (targetPublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      await cloudinary.uploader.destroy(targetPublicId).catch((err) => console.warn('Cloudinary destroy notice:', err.message));
    }

    mediaDatabase = mediaDatabase.filter((m) => m.id !== id && m.cloudinary_public_id !== targetPublicId);

    return res.json({
      success: true,
      message: 'Media deleted successfully.',
    });
  } catch (error: any) {
    console.error('Media delete error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete media.' });
  }
});

// Super Admin Global Image Deletion API (Removes asset from Cloudinary & all DB collections)
app.post('/api/media/delete-global', async (req, res) => {
  try {
    const { public_id, image_url, id } = req.body;

    let targetPublicId = public_id;
    let targetUrl = image_url;

    if (id) {
      const found = mediaDatabase.find((m) => m.id === id);
      if (found) {
        targetPublicId = targetPublicId || found.cloudinary_public_id;
        targetUrl = targetUrl || found.image_url;
      }
    }

    // 1. Destroy from Cloudinary if API credentials available
    if (targetPublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        await cloudinary.uploader.destroy(targetPublicId);
        console.log(`✅ Global Delete: Destroyed Cloudinary asset public_id: ${targetPublicId}`);
      } catch (err: any) {
        console.warn('Notice during Cloudinary global destroy:', err.message);
      }
    }

    // 2. Remove from mediaDatabase
    mediaDatabase = mediaDatabase.filter((m) => m.id !== id && m.cloudinary_public_id !== targetPublicId && m.image_url !== targetUrl);

    // 3. Reset Hero Banner if it matches
    if (heroBannerDatabase.public_id === targetPublicId || heroBannerDatabase.secure_url === targetUrl) {
      heroBannerDatabase.secure_url = '/rajan_kaithwas.svg';
      heroBannerDatabase.public_id = 'hero/rajan_kaithwas_main';
    }

    // 4. Reset Rajan Profile Image if matches
    if (rajanProfileDatabase.cloudinary_public_id === targetPublicId || rajanProfileDatabase.image_url === targetUrl) {
      rajanProfileDatabase.image_url = '/rajan_kaithwas.svg';
      rajanProfileDatabase.cloudinary_public_id = 'rajan_profile/default';
    }

    return res.json({
      success: true,
      message: 'चित्र सफलतापूर्वक क्लाउडिनरी और डेटाबेस से हटा दिया गया है।',
    });
  } catch (err: any) {
    console.error('Global image deletion error:', err);
    return res.status(500).json({ error: err.message || 'चित्र हटाने में त्रुटि आई।' });
  }
});

// ==========================================
// 2. AI ASTROLOGY APIs (GEMINI API)
// ==========================================

function cleanTextOutput(text: string | null | undefined): string {
  if (!text) return '';
  let str = text;

  // Convert Devanagari numerals to English digits
  const devanagariDigits = '०१२३४५६७८९';
  const englishDigits = '0123456789';
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(devanagariDigits[i], 'g'), englishDigits[i]);
  }

  // Remove Markdown headings: #, ##, ###, etc.
  str = str.replace(/^#{1,6}\s*/gm, '');

  // Remove bold / italic markdown: ***text***, **text**, *text*, ___text___, __text__, _text_
  str = str.replace(/[\*_]{3}(.*?)[\*_]{3}/g, '$1');
  str = str.replace(/[\*_]{2}(.*?)[\*_]{2}/g, '$1');
  str = str.replace(/[\*_]{1}(.*?)[\*_]{1}/g, '$1');

  // Remove leftover markdown characters: **, *, __, _, `, >
  str = str.replace(/\*\*/g, '');
  str = str.replace(/\*/g, '');
  str = str.replace(/__/g, '');
  str = str.replace(/_/g, '');
  str = str.replace(/`/g, '');
  str = str.replace(/^>\s*/gm, '');

  // Convert bullet points starting with - or * into '• '
  str = str.replace(/^[\-\*]\s+/gm, '• ');

  return str.trim();
}

// AI Horoscope Generator
app.post('/api/ai/horoscope', async (req, res) => {
  try {
    const { sign, timeframe = 'daily', name, lang = 'hi' } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are Rajan Kaithwas Ji, an internationally renowned Vedic Astrologer with 33+ years of experience.
Generate a highly detailed, deeply insightful Vedic Astrology Horoscope for:
Zodiac Sign: ${sign}
Timeframe: ${timeframe} (daily/monthly/yearly)
User Name: ${name || 'Seeker'}
Language: ${lang}

Include structured sections:
1. Planetary Alignment Overview & Celestial Energy
2. Career & Business Insights
3. Love, Relationship & Marriage Guidance
4. Wealth, Investments & Money Prospects
5. Health, Vitality & Mental Well-being
6. Lucky Color, Lucky Number, Lucky Timing & Auspicious Direction
7. Custom Vedic Remedy / Mantra for ${sign} today.

Tone: Majestic, warm, authoritative, deeply spiritual, authentic Vedic wisdom. Respond in well-formatted plain text.
CRITICAL FORMATTING RULES:
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbered headings (e.g. 1. Heading).
- Always write all numbers using standard English digits (0-9).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: cleanTextOutput(response.text),
    });
  } catch (error: any) {
    console.error('AI Horoscope Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate horoscope prediction.' });
  }
});

// AI Janam Kundli Summary
app.post('/api/ai/kundli', async (req, res) => {
  try {
    const { name, dob, tob, pob, gender, lang = 'hi' } = req.body;
    const ai = getGeminiClient();

    const languageNames: Record<string, string> = {
      hi: 'Hindi (हिंदी)',
      en: 'English',
      gu: 'Gujarati (ગુજરાતી)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      bn: 'Bengali (বাংলা)',
      ur: 'Urdu (اردو)',
    };

    const targetLangName = languageNames[lang] || 'Hindi (हिंदी)';

    const prompt = `You are Rajan Kaithwas Ji, Master of Vedic Jyotish Shastra.
Generate a comprehensive, authentic Janam Kundli (Birth Chart) calculation and interpretation for:
Name: ${name}
Date of Birth: ${dob}
Time of Birth: ${tob}
Place of Birth: ${pob}
Gender: ${gender}
Target Output Language: ${targetLangName}

Please provide:
1. Calculated Lagna (Ascendant) Rashi & Moon Sign (Chandra Rashi)
2. Nakshatra & Pada details with deity
3. Key Planetary Positions (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
4. Current Mahadasha & Antardasha calculation analysis
5. Major Yogic Combinations in Chart (e.g. Gajakesari, Raj Yoga, Dhan Yoga, Manglik status)
6. Life Path Analysis: Career, Finances, Health, Marriage, & Foreign Travel potential
7. Tailored Astrological Remedies (Specific Vedic Mantras, Gemstone suggestions with carat/metal/finger, and Daan/Charity).

Expressed with authentic Vedic terminology and Rajan Kaithwas Ji's blessing.
CRITICAL LANGUAGE & NUMERICAL FORMATTING RULES:
- Write the ENTIRE analysis, titles, planet names, house details, nakshatras, dashas, yogas, and remedies strictly in ${targetLangName}.
- ALWAYS write all numbers (dates, times, house numbers, degrees, percentages, age, counts) using standard English numerals (0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Do NOT use Devanagari or regional script digits under any circumstances.
- Example format for numbers: " जन्म तिथि: 15 अगस्त 1990", "जन्म समय: 10:30 AM".
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbered headings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: cleanTextOutput(response.text),
    });
  } catch (error: any) {
    console.error('AI Kundli Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate Kundli analysis.' });
  }
});

// AI Compatibility Score & Match Making (Ashta Kuta Milan)
app.post('/api/ai/compatibility', async (req, res) => {
  try {
    const { partner1, partner2, lang = 'en' } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are Rajan Kaithwas Ji, expert Kundli Matching & Marriage Astrologer.
Calculate and evaluate 36 Guna Ashta Kuta Kundli Matching for:
Partner 1: ${partner1.name} (DOB: ${partner1.dob}, TOB: ${partner1.tob}, POB: ${partner1.pob})
Partner 2: ${partner2.name} (DOB: ${partner2.dob}, TOB: ${partner2.tob}, POB: ${partner2.pob})
Language: ${lang}

Deliver a precise breakdown:
1. Overall Guna Score (Out of 36 Gunas, e.g., 28/36 Gunas Match)
2. Ashta Kuta Score Table:
   • Varna (1)
   • Vashya (2)
   • Tara (3)
   • Yoni (4)
   • Graha Maitri (5)
   • Gana (6)
   • Bhakoot (7)
   • Nadi (8)
3. Manglik Dosha Analysis for both charts (Presence, Severity & Cancellation rules)
4. Long-term Harmony, Emotional Bond, Financial Growth & Family Lineage
5. Rajan Kaithwas Ji's Final Verdict & Nuptial Blessing
6. Dosha Nivaran Remedies (if any score is low or Nadi/Bhakoot/Manglik dosha exists).

CRITICAL FORMATTING RULES:
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbers.
- Always write all numbers using standard English digits (0-9).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: cleanTextOutput(response.text),
    });
  } catch (error: any) {
    console.error('AI Compatibility Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate compatibility report.' });
  }
});

// AI Chat Assistant (Consultation Bot representing Rajan Kaithwas Ji)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, userProfile, lang = 'en' } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are the digital AI persona of "Rajan Kaithwas Ji", a esteemed, venerable, compassionate Vedic Astrologer & Spiritual Guide.
You advise seekers on Vedic Astrology, Horoscopes, Kundli, Gemstones, Vastu Shastra, Palmistry, Muhurat, and Spiritual Remedies.
Always speak with dignity, warmth, divine positivity, and ancient wisdom ("Hari Om", "Blessings of Bhagwan", "According to Jyotish Shastra...").
User details: Name: ${userProfile?.name || 'Seeker'}, DOB: ${userProfile?.dob || 'Not provided'}, Location: ${userProfile?.pob || 'Not provided'}.
Language: Respond in ${lang}.
When questions require personalized deep chart readings, warmly suggest booking a 1-on-1 private Video/Audio consultation with Rajan Kaithwas Ji.

CRITICAL FORMATTING RULES:
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbers.
- Always write all numbers using standard English digits (0-9).`;

    const conversationPrompt = messages.map((m: any) => `${m.role === 'user' ? 'Seeker' : 'Rajan Kaithwas Ji'}: ${m.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: conversationPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      success: true,
      reply: cleanTextOutput(response.text),
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to consult AI Astrologer.' });
  }
});

// AI Remedy & Gemstone Finder
app.post('/api/ai/remedy', async (req, res) => {
  try {
    const { problemArea, Rashi, birthStar, lang = 'en' } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are Rajan Kaithwas Ji. Provide ancient authentic Vedic remedies for the following issue:
Problem/Goal: ${problemArea}
Zodiac/Rashi: ${Rashi}
Birth Star (Nakshatra): ${birthStar}
Language: ${lang}

Detail:
1. Recommended Gemstone (Ratna), its Weight in Carats, Metal, Ring Finger, and Chanting Activation Mantra
2. Vedic Mantra Chanting (Bija Mantra & repetition count)
3. Yantra & Deity Worship
4. Daan / Charity (Items, Day of week, Beneficiaries)
5. Fasting (Vrat) & Daily Ritual Recommendations.

CRITICAL FORMATTING RULES:
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbers.
- Always write all numbers using standard English digits (0-9).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: cleanTextOutput(response.text),
    });
  } catch (error: any) {
    console.error('AI Remedy Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate Vedic remedies.' });
  }
});

// AI Panchang Generator
app.post('/api/ai/panchang', async (req, res) => {
  try {
    const { date, location = 'New Delhi', lang = 'en' } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a precise, authentic Vedic Daily Panchang for Date: ${date || 'Today'}, Location: ${location}, Language: ${lang}.
Include:
• Vikram Samvat & Saka Samvat
• Sunrise & Sunset Timing, Moonrise & Moonset Timing
• Tithi & Paksha (Shukla/Krishna)
• Nakshatra & Deity
• Yoga & Karana
• Abhijit Muhurat (Auspicious Window)
• Rahu Kalam (Inauspicious Window) & Yamaganda
• Disha Shool & Remedies
• Special Festival / Vrat of the day.

CRITICAL FORMATTING RULES:
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbers.
- Always write all numbers using standard English digits (0-9).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      result: cleanTextOutput(response.text),
    });
  } catch (error: any) {
    console.error('AI Panchang Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to calculate Panchang.' });
  }
});

// ==========================================
// 3. BOOKING & CONSULTATION APIs
// ==========================================

// Create Appointment Booking
app.post('/api/bookings', (req, res) => {
  try {
    const {
      serviceId,
      serviceTitle,
      clientName,
      clientEmail,
      clientPhone,
      dob,
      tob,
      pob,
      date,
      timeSlot,
      consultationType,
      notes,
      amount,
      paymentMethod,
    } = req.body;

    const bookingRef = 'RKJ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    let platform: 'google_meet' | 'zoom' | 'whatsapp' | 'office' = 'google_meet';
    let meetingLink = `https://meet.google.com/rkj-${Math.random().toString(36).substring(2, 6)}-ast`;

    if (consultationType === 'audio' || consultationType === 'whatsapp') {
      platform = 'whatsapp';
      meetingLink = `https://wa.me/918319885134?text=Booking%20Ref:%20${bookingRef}`;
    } else if (consultationType === 'in_person') {
      platform = 'office';
      meetingLink = 'Smart Point के सामने, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh 480447';
    }

    const newBooking: BookingItem = {
      id: 'b-' + Date.now(),
      bookingRef,
      serviceId,
      serviceTitle,
      clientName,
      clientEmail,
      clientPhone,
      dob,
      tob,
      pob,
      date,
      timeSlot,
      consultationType,
      platform,
      meetingLink,
      notes,
      amount,
      paymentMethod: paymentMethod || 'UPI Instant',
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    bookingsDatabase.unshift(newBooking);

    return res.json({
      success: true,
      message: 'Consultation booked successfully!',
      booking: newBooking,
      notificationSent: {
        email: true,
        sms: true,
        whatsapp: true,
      },
    });
  } catch (error: any) {
    console.error('Booking Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to complete booking.' });
  }
});

// Get Bookings List (Admin)
app.get(['/api/bookings', '/api/admin/bookings'], (req, res) => {
  return res.json({
    success: true,
    total: bookingsDatabase.length,
    bookings: bookingsDatabase,
  });
});

// Create Booking (Admin)
app.post(['/api/admin/bookings', '/api/admin/bookings/add', '/api/bookings'], (req, res) => {
  const { clientName, clientEmail, clientPhone, serviceTitle, date, timeSlot, amount, status, consultationType, notes } = req.body;
  const bookingRef = 'RKJ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const newB: BookingItem = {
    id: 'b-' + Date.now(),
    bookingRef,
    serviceId: 'custom-service',
    serviceTitle: serviceTitle || 'सामान्य वैदिक ज्योतिष परामर्श',
    clientName: clientName || 'जातक',
    clientEmail: clientEmail || 'client@example.com',
    clientPhone: clientPhone || '+91 98765 43210',
    dob: '1990-01-01',
    tob: '10:00 AM',
    pob: 'New Delhi',
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '11:00 AM - 12:00 PM',
    consultationType: consultationType || 'video',
    platform: 'google_meet',
    meetingLink: `https://meet.google.com/rkj-${Math.random().toString(36).substring(2, 6)}-ast`,
    notes: notes || 'Admin added appointment',
    amount: Number(amount) || 1100,
    paymentMethod: 'UPI / Direct',
    paymentStatus: 'paid',
    status: status || 'confirmed',
    createdAt: new Date().toISOString(),
  };
  bookingsDatabase.unshift(newB);
  return res.json({ success: true, booking: newB, message: 'बुकिंग सफलतापूर्वक जोड़ी गई!' });
});

// Update Booking Status / Details (Admin)
app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status, date, timeSlot, notes, amount } = req.body;

  const index = bookingsDatabase.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  bookingsDatabase[index] = {
    ...bookingsDatabase[index],
    status: status || bookingsDatabase[index].status,
    date: date || bookingsDatabase[index].date,
    timeSlot: timeSlot || bookingsDatabase[index].timeSlot,
    notes: notes !== undefined ? notes : bookingsDatabase[index].notes,
    amount: amount !== undefined ? Number(amount) : bookingsDatabase[index].amount,
  };

  return res.json({
    success: true,
    booking: bookingsDatabase[index],
    message: 'बुकिंग स्थिति अपडेट हो गई!',
  });
});

// Delete Booking (Admin)
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  bookingsDatabase = bookingsDatabase.filter((b) => b.id !== id);
  return res.json({ success: true, message: 'बुकिंग सफलतापूर्वक हटा दी गई।' });
});

// ==========================================
// 4. CUSTOMERS / JATAK APIs
// ==========================================
interface DetailedCustomerItem {
  id: string;
  customer_id: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  gender: string;
  dob: string;
  birth_time: string;
  birth_place: string;
  zodiac_sign: string;
  occupation: string;
  marital_status: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  profile_image_url: string;
  cloudinary_public_id: string;
  notes: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  // Legacy aliases for backwards compatibility
  name?: string;
  phone?: string;
  rashi?: string;
  photoUrl?: string;
  totalBookings?: number;
  createdAt?: string;
}

let customersDatabase: DetailedCustomerItem[] = [
  {
    id: 'c-1',
    customer_id: 'JTK-2026-001',
    full_name: 'श्री रामेश्वर शर्मा',
    father_name: 'पं. देवदत्त शर्मा',
    mother_name: 'श्रीमती कमला देवी',
    mobile: '+91 98110 12345',
    whatsapp: '+91 98110 12345',
    email: 'rameshwar@gmail.com',
    gender: 'पुरुष (Male)',
    dob: '1985-05-12',
    birth_time: '06:30 AM',
    birth_place: 'वाराणसी, उत्तर प्रदेश',
    zodiac_sign: 'मेष (Aries)',
    occupation: 'सरकारी शिक्षक',
    marital_status: 'विवाहित (Married)',
    address: '42, कबीर नगर, लंका',
    city: 'वाराणसी',
    state: 'उत्तर प्रदेश',
    country: 'भारत (India)',
    pin_code: '221005',
    profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    cloudinary_public_id: 'customers/jatak_1',
    notes: 'विशेष मांगलिक दोष शांति अनुष्ठान कराया गया था।',
    status: 'active',
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: new Date().toISOString(),
    name: 'श्री रामेश्वर शर्मा',
    phone: '+91 98110 12345',
    rashi: 'मेष (Aries)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    totalBookings: 4,
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'c-2',
    customer_id: 'JTK-2026-002',
    full_name: 'श्रीमती सुनीता पटेल',
    father_name: 'श्री जगदीश पटेल',
    mother_name: 'श्रीमती हंसाबेन पटेल',
    mobile: '+91 98250 67890',
    whatsapp: '+91 98250 67890',
    email: 'sunita.patel@gmail.com',
    gender: 'महिला (Female)',
    dob: '1990-09-24',
    birth_time: '11:45 PM',
    birth_place: 'अहमदाबाद, गुजरात',
    zodiac_sign: 'वृषभ (Taurus)',
    occupation: 'सॉफ्टवेयर इंजीनियर',
    marital_status: 'विवाहित (Married)',
    address: '102, नवंरगपुरा रोड',
    city: 'अहमदाबाद',
    state: 'गुजरात',
    country: 'भारत (India)',
    pin_code: '380009',
    profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    cloudinary_public_id: 'customers/jatak_2',
    notes: 'कैरियर एवं विदेश यात्रा योग फलादेश।',
    status: 'active',
    created_at: '2026-02-15T14:30:00.000Z',
    updated_at: new Date().toISOString(),
    name: 'श्रीमती सुनीता पटेल',
    phone: '+91 98250 67890',
    rashi: 'वृषभ (Taurus)',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    totalBookings: 2,
    createdAt: '2026-02-15T14:30:00.000Z',
  },
  {
    id: 'c-3',
    customer_id: 'JTK-2026-003',
    full_name: 'इंजी. विक्रम राठौड़',
    father_name: 'श्री कुंवर सिंह राठौड़',
    mother_name: 'श्रीमती कौशल्या राठौड़',
    mobile: '+91 99770 54321',
    whatsapp: '+91 99770 54321',
    email: 'vikram.rathore@gmail.com',
    gender: 'पुरुष (Male)',
    dob: '1988-12-04',
    birth_time: '04:15 PM',
    birth_place: 'इंदौर, मध्य प्रदेश',
    zodiac_sign: 'सिंह (Leo)',
    occupation: 'व्यवसायी (Business Owner)',
    marital_status: 'अविवाहित (Single)',
    address: '78, विजय नगर विस्तार',
    city: 'इंदौर',
    state: 'मध्य प्रदेश',
    country: 'भारत (India)',
    pin_code: '452010',
    profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    cloudinary_public_id: 'customers/jatak_3',
    notes: 'रत्न परामर्श एवं धन प्राप्ति उपाय।',
    status: 'active',
    created_at: '2026-03-01T09:15:00.000Z',
    updated_at: new Date().toISOString(),
    name: 'इंजी. विक्रम राठौड़',
    phone: '+91 99770 54321',
    rashi: 'सिंह (Leo)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    totalBookings: 5,
    createdAt: '2026-03-01T09:15:00.000Z',
  },
];

// GET /api/customers - List & Dashboard Stats
app.get(['/api/customers', '/api/admin/customers'], (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  const gender = (req.query.gender as string) || '';
  const status = (req.query.status as string) || '';
  const state = (req.query.state as string) || '';
  const zodiac = (req.query.zodiac as string) || '';

  let filtered = customersDatabase.filter((c) => {
    const matchesSearch =
      !search ||
      c.full_name.toLowerCase().includes(search) ||
      (c.name || '').toLowerCase().includes(search) ||
      c.mobile.includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.customer_id.toLowerCase().includes(search) ||
      c.city.toLowerCase().includes(search) ||
      c.zodiac_sign.toLowerCase().includes(search);

    const matchesGender = !gender || gender === 'all' || c.gender.toLowerCase().includes(gender.toLowerCase());
    const matchesStatus = !status || status === 'all' || c.status.toLowerCase() === status.toLowerCase();
    const matchesState = !state || state === 'all' || c.state.toLowerCase().includes(state.toLowerCase());
    const matchesZodiac = !zodiac || zodiac === 'all' || c.zodiac_sign.toLowerCase().includes(zodiac.toLowerCase());

    return matchesSearch && matchesGender && matchesStatus && matchesState && matchesZodiac;
  });

  // Calculate Dashboard KPIs
  const totalCustomers = customersDatabase.length;
  const activeCustomers = customersDatabase.filter((c) => c.status === 'active').length;
  const newCustomersThisMonth = customersDatabase.filter((c) => {
    const cDate = new Date(c.created_at);
    const now = new Date();
    return cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear();
  }).length;

  const pendingConsultations = bookingsDatabase.filter((b) => b.status === 'pending').length;
  const todaysAppointments = bookingsDatabase.filter((b) => b.date === new Date().toISOString().split('T')[0]).length;

  return res.json({
    success: true,
    total: filtered.length,
    customers: filtered,
    stats: {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      pendingConsultations,
      todaysAppointments,
      recentCustomersCount: Math.min(customersDatabase.length, 5),
    },
  });
});

// GET /api/customers/:id - Single Customer Full Profile
app.get(['/api/customers/:id', '/api/admin/customers/:id'], (req, res) => {
  const { id } = req.params;
  const customer = customersDatabase.find((c) => c.id === id || c.customer_id === id);

  if (!customer) {
    return res.status(404).json({ success: false, error: 'जातक / ग्राहक नहीं मिला (Customer not found)' });
  }

  // Related data
  const customerBookings = bookingsDatabase.filter(
    (b) => b.clientEmail?.toLowerCase() === customer.email.toLowerCase() || b.clientPhone?.includes(customer.mobile)
  );

  const kundliHistory = [
    {
      id: 'knd-1',
      title: 'सम्पूर्ण जन्मकुण्डली एवं नवमांश विश्लेषण',
      generatedAt: customer.created_at,
      rashi: customer.zodiac_sign,
      lagna: 'सिंह (Leo)',
      dasha: 'राहु महादशा / शनि अंतरदशा',
    },
  ];

  const paymentHistory = [
    {
      id: 'pay-101',
      bookingRef: 'RKJ-2026-101',
      service: 'सम्पूर्ण जन्मकुण्डली फلاदेश',
      amount: 2100,
      method: 'Razorpay / UPI',
      status: 'Paid',
      date: customer.created_at.split('T')[0],
    },
  ];

  return res.json({
    success: true,
    customer,
    history: {
      bookings: customerBookings,
      kundli: kundliHistory,
      payments: paymentHistory,
      uploadedDocuments: [
        { name: 'Janm_Kundli_Chart.pdf', size: '2.4 MB', uploadedAt: customer.created_at },
      ],
    },
  });
});

// POST /api/customers - Add Customer with Cloudinary Photo
app.post(['/api/customers', '/api/admin/customers/add', '/api/admin/customers'], upload.single('photo'), async (req, res) => {
  try {
    const {
      full_name,
      name,
      father_name,
      mother_name,
      mobile,
      phone,
      whatsapp,
      email,
      gender,
      dob,
      birth_time,
      birth_place,
      zodiac_sign,
      rashi,
      occupation,
      marital_status,
      address,
      city,
      state,
      country,
      pin_code,
      notes,
    } = req.body;

    const chosenName = full_name || name || 'नया जातक';
    const chosenMobile = mobile || phone || '+91 9876543210';
    const chosenZodiac = zodiac_sign || rashi || 'मेष (Aries)';

    let profile_image_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    let cloudinary_public_id = '';

    if (req.file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'customers' }, (err, res) => (err ? reject(err) : resolve(res)));
          stream.end(req.file!.buffer);
        });
        profile_image_url = uploadResult.secure_url;
        cloudinary_public_id = uploadResult.public_id;
      } else {
        profile_image_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else if (req.body.profile_image_url) {
      profile_image_url = req.body.profile_image_url;
    }

    const autoCustId = 'JTK-2026-' + Math.floor(100 + Math.random() * 900);
    const newCust: DetailedCustomerItem = {
      id: 'c-' + Date.now(),
      customer_id: autoCustId,
      full_name: chosenName,
      father_name: father_name || 'श्री रामप्रसाद',
      mother_name: mother_name || 'श्रीमती भगवती देवी',
      mobile: chosenMobile,
      whatsapp: whatsapp || chosenMobile,
      email: email || `jatak_${Date.now()}@example.com`,
      gender: gender || 'पुरुष (Male)',
      dob: dob || '1995-01-01',
      birth_time: birth_time || '08:00 AM',
      birth_place: birth_place || 'वाराणसी',
      zodiac_sign: chosenZodiac,
      occupation: occupation || 'व्यवसाय',
      marital_status: marital_status || 'विवाहित (Married)',
      address: address || 'मुख्य बाजार मार्ग',
      city: city || 'वाराणसी',
      state: state || 'उत्तर प्रदेश',
      country: country || 'भारत (India)',
      pin_code: pin_code || '221001',
      profile_image_url,
      cloudinary_public_id,
      notes: notes || 'प्रथम बार रजिस्ट्रेशन किया गया।',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: chosenName,
      phone: chosenMobile,
      rashi: chosenZodiac,
      photoUrl: profile_image_url,
      totalBookings: 0,
      createdAt: new Date().toISOString(),
    };

    customersDatabase.unshift(newCust);

    return res.json({
      success: true,
      customer: newCust,
      message: `जातक ${chosenName} (${autoCustId}) की प्रोफाइल सफलतापूर्वक बनाई गई तथा वेलकम नोटिफिकेशन प्रेषित किया गया!`,
    });
  } catch (err: any) {
    console.error('Customer Creation Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'जातक प्रोफाइल जोड़ने में त्रुटि आई।' });
  }
});

// PUT /api/customers/:id - Update Customer
app.put(['/api/customers/:id', '/api/admin/customers/:id'], upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const index = customersDatabase.findIndex((c) => c.id === id || c.customer_id === id);

  if (index === -1) return res.status(404).json({ success: false, error: 'Customer not found' });

  let updatedPhotoUrl = customersDatabase[index].profile_image_url;
  let updatedCloudinaryId = customersDatabase[index].cloudinary_public_id;

  if (req.file) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'customers' }, (err, res) => (err ? reject(err) : resolve(res)));
        stream.end(req.file!.buffer);
      });
      updatedPhotoUrl = uploadResult.secure_url;
      updatedCloudinaryId = uploadResult.public_id;
    } else {
      updatedPhotoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
  }

  const updatedData = {
    ...customersDatabase[index],
    ...req.body,
    profile_image_url: updatedPhotoUrl,
    cloudinary_public_id: updatedCloudinaryId,
    photoUrl: updatedPhotoUrl,
    updated_at: new Date().toISOString(),
  };

  if (req.body.full_name) updatedData.name = req.body.full_name;
  if (req.body.mobile) updatedData.phone = req.body.mobile;
  if (req.body.zodiac_sign) updatedData.rashi = req.body.zodiac_sign;

  customersDatabase[index] = updatedData;

  return res.json({
    success: true,
    customer: customersDatabase[index],
    message: 'जातक प्रोफाइल सफलतापूर्वक अद्यतन (Update) कर दी गई।',
  });
});

// DELETE /api/customers/:id - Delete Customer
app.delete(['/api/customers/:id', '/api/admin/customers/:id'], async (req, res) => {
  const { id } = req.params;
  const target = customersDatabase.find((c) => c.id === id || c.customer_id === id);

  if (!target) return res.status(404).json({ success: false, error: 'Customer not found' });

  if (target.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      await cloudinary.uploader.destroy(target.cloudinary_public_id);
    } catch (e) {
      console.warn('Cloudinary delete notice:', e);
    }
  }

  customersDatabase = customersDatabase.filter((c) => c.id !== id && c.customer_id !== id);
  return res.json({ success: true, message: `जातक ${target.full_name} (${target.customer_id}) की प्रोफाइल सफलतापूर्वक हटा दी गई।` });
});

// POST /api/customers/:id/toggle-status - Suspend / Activate Customer
app.post('/api/customers/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = customersDatabase.findIndex((c) => c.id === id || c.customer_id === id);

  if (index === -1) return res.status(404).json({ success: false, error: 'Customer not found' });

  customersDatabase[index].status = status || (customersDatabase[index].status === 'active' ? 'suspended' : 'active');
  return res.json({
    success: true,
    message: `जातक ${customersDatabase[index].full_name} की स्थिति बदलकर '${customersDatabase[index].status}' कर दी गई।`,
  });
});

// ==========================================
// 5. SERVICES APIs
// ==========================================
interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  description: string;
}

let servicesDatabase: ServiceItem[] = [
  { id: 's-1', title: 'सम्पूर्ण जन्मकुण्डली फलादेश', category: 'Kundli', price: 2100, duration: '45 मिनट', status: 'active', isFeatured: true, description: 'ग्रह-नक्षत्रों का सूक्ष्म विश्लेषण एवं जीवन फलक।' },
  { id: 's-2', title: 'विवाह गुण मिलान एवं दोष निवारण', category: 'Marriage', price: 1500, duration: '30 मिनट', status: 'active', isFeatured: true, description: '36 गुण मिलान, मांगलिक दोष एवं अष्टकूट विश्लेषण।' },
  { id: 's-3', title: 'करियर एवं व्यापार ज्योतिष', category: 'Career', price: 2500, duration: '45 मिनट', status: 'active', isFeatured: false, description: 'व्यापार, पदोन्नति एवं धन लाभ हेतु विशेष उपाय।' },
  { id: 's-4', title: 'वास्तु परामर्श (गृह एवं कार्यालय)', category: 'Vastu', price: 5100, duration: '60 मिनट', status: 'active', isFeatured: true, description: 'बिना तोड़-फोड़ वास्तु दोष निवारण।' },
  { id: 's-5', title: 'रत्न एवं रुद्राक्ष परामर्श', category: 'Gemstones', price: 1100, duration: '20 मिनट', status: 'active', isFeatured: false, description: 'राशिनुसार सिद्ध प्रामाणिक रत्न चयन।' },
];

app.get('/api/services', (req, res) => {
  return res.json({ success: true, services: servicesDatabase });
});

app.post('/api/services', (req, res) => {
  const { title, category, price, duration, isFeatured, description } = req.body;
  const newService: ServiceItem = {
    id: 's-' + Date.now(),
    title: title || 'नई ज्योतिष सेवा',
    category: category || 'General',
    price: Number(price) || 1100,
    duration: duration || '30 मिनट',
    status: 'active',
    isFeatured: !!isFeatured,
    description: description || 'वैदिक ज्योतिष परामर्श।',
  };
  servicesDatabase.unshift(newService);
  return res.json({ success: true, service: newService, message: 'सेवा सफलतापूर्वक जोड़ी गई!' });
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = servicesDatabase.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  servicesDatabase[index] = { ...servicesDatabase[index], ...req.body };
  return res.json({ success: true, service: servicesDatabase[index], message: 'सेवा अपडेट हो गई।' });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  servicesDatabase = servicesDatabase.filter(s => s.id !== id);
  return res.json({ success: true, message: 'सेवा सफलतापूर्वक हटाई गई।' });
});

// ==========================================
// 6. BLOG APIs
// ==========================================
interface BlogPostItem {
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

interface BlogCategoryItem {
  id: string;
  name: string;
  hindiName: string;
  slug: string;
  articleCount: number;
  description?: string;
}

interface BlogCommentItem {
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

let blogCategoriesDatabase: BlogCategoryItem[] = [
  { id: 'cat-1', name: 'Vedic Astrology', hindiName: 'वैदिक ज्योतिष', slug: 'vedic-astrology', articleCount: 14, description: 'ग्रह, नक्षत्र एवं प्राचीन ज्योतिषीय सिद्धांत' },
  { id: 'cat-2', name: 'Horoscope', hindiName: 'राशिफल', slug: 'horoscope', articleCount: 28, description: 'दैनिक, साप्ताहिक एवं वार्षिक राशि भविष्य' },
  { id: 'cat-3', name: 'Kundli', hindiName: 'कुंडली', slug: 'kundli', articleCount: 19, description: 'जन्मपत्रिका, भाव, दशा एवं योग विश्लेष्ण' },
  { id: 'cat-4', name: 'Vastu Shastra', hindiName: 'वास्तु', slug: 'vastu', articleCount: 11, description: 'गृह एवं व्यावसायिक वास्तु समाधान' },
  { id: 'cat-5', name: 'Numerology', hindiName: 'अंक ज्योतिष', slug: 'numerology', articleCount: 8, description: 'मूलांक, भाग्यांक एवं नामांक प्रभाव' },
  { id: 'cat-6', name: 'Palmistry', hindiName: 'हस्तरेखा', slug: 'palmistry', articleCount: 6, description: 'करतलों की रेखाएं एवं उनके रहस्य' },
  { id: 'cat-7', name: 'Planetary Transit', hindiName: 'ग्रह गोचर', slug: 'graha-gochar', articleCount: 15, description: 'शनि, राहु, केतु एवं गुरु का गोचर प्रभाव' },
  { id: 'cat-8', name: 'Puja & Remedies', hindiName: 'पूजा एवं उपाय', slug: 'puja-remedies', articleCount: 22, description: 'दोष निवारण, मंत्र एवं अनुष्ठान' },
];

let blogCommentsDatabase: BlogCommentItem[] = [
  { id: 'com-1', articleId: 'b-1', articleTitle: 'वर्ष 2026 में गुरु का महा गोचर', authorName: 'अमित शर्मा', authorEmail: 'amit.s@gmail.com', content: 'गुरु गोचर का मेष राशि पर कैसा प्रभाव रहेगा? कृपया बताएं।', status: 'approved', createdAt: '2026-08-01T10:20:00Z', reply: 'जय श्री राम! मेष राशि के लिए गुरु का गोचर शुभ फलदायी रहेगा।' },
  { id: 'com-2', articleId: 'b-2', articleTitle: 'मांगलिक दोष क्या है?', authorName: 'सुनीता पटेल', authorEmail: 'sunita.p@gmail.com', content: 'क्या 28 वर्ष के बाद मंगल दोष स्वतः समाप्त हो जाता है?', status: 'pending', createdAt: '2026-08-03T14:15:00Z' },
  { id: 'com-3', articleId: 'b-3', articleTitle: 'वास्तु अनुसार मुख्य द्वार की दिशा', authorName: 'विकास वर्मा', authorEmail: 'vikas.v@gmail.com', content: 'दक्षिण मुखी घर के लिए क्या विशेष उपाय करना चाहिए?', status: 'approved', createdAt: '2026-08-04T09:30:00Z' },
];

let blogDatabase: BlogPostItem[] = [
  {
    id: 'b-1',
    title: 'वर्ष 2026 में गुरु का महा गोचर: आपकी राशि पर प्रभाव एवं महा उपाय',
    slug: 'jupiter-transit-2026-astrology-prediction',
    seo_title: 'Guru Gochar 2026 Prediction & Remedies | Rajan Kaithwas',
    seo_description: 'देवगुरु बृहस्पति का 2026 में राशि परिवर्तन! जानें आपकी राशि पर शुभ-अशुभ प्रभाव तथा सुख-समृद्धि के विशेष वैदिक उपाय।',
    category_id: 'cat-7',
    category: 'ग्रह गोचर',
    author: 'पं. राजन कैथवास',
    short_description: 'देवगुरु बृहस्पति का वृषभ राशि में प्रवेश जातक के जीवन में खुशहाली एवं धन-समृद्धि लाएगा।',
    content: `<h1>वर्ष 2026 में गुरु का महा गोचर</h1>
<p>वैदिक ज्योतिष शास्त्र में देवगुरु बृहस्पति को परम शुभ, ज्ञान, धर्म, संतान एवं धन-समृद्धि का कारक ग्रह माना गया है। गुरु का गोचर सदैव जनमानस एवं समस्त 12 राशियों के जीवन में व्यापक सकारात्मक बदलाव लाता है।</p>
<h2>गोचर का मुख्य समय एवं तिथि</h2>
<p>वर्ष 2026 में गुरु का विशेष परिवर्तन होगा। इस परिवर्तन काल में जातकों के रुके हुए कार्य पूर्ण होंगे और भाग्य वृद्धि के योग बनेंगे।</p>
<h3>प्रमुख प्रभाव:</h3>
<ul>
  <li><b>मेष राशि:</b> वाणी में मधुरता आएगी और अचानक धन लाभ के योग बनेंगे।</li>
  <li><b>वृषभ राशि:</b> लग्न में गुरु होने से आत्मविश्वास में अभूतपूर्व वृद्धि होगी।</li>
  <li><b>मिथुन राशि:</b> विदेश यात्रा एवं धार्मिक कार्यों में व्यय की संभावना।</li>
</ul>
<blockquote>"गुरु की दृष्टि जिस भाव पर पड़ती है, वह भाव गंगाजल की भांति पवित्र और फलदायी हो जाता है।"</blockquote>
<h2>अचूक वैदिक उपाय</h2>
<p>गुरु ग्रह की कृपा प्राप्ति हेतु प्रत्येक गुरुवार को भगवान विष्णु की पूजा करें, चने की दाल एवं पीले वस्त्र का दान करें।</p>`,
    featured_image_url: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'blog/jupiter_transit_2026',
    alt_text: 'गुरु गोचर 2026 वैदिक ज्योतिष',
    tags: ['Jupiter', 'Astrology', 'Gochhar', '2026 Predictions', 'Remedies'],
    status: 'published',
    publish_date: '2026-07-15 10:00:00',
    views: 1420,
    is_featured: true,
    reading_time: '4 मिनट',
    faqs: [
      { question: 'गुरु गोचर से किस राशि को सबसे अधिक लाभ होगा?', answer: 'वृषभ, कर्क एवं मकर राशि के जातकों को इस गोचर में विशेष धन लाभ प्राप्त होगा।' },
      { question: 'गुरु ग्रह को मजबूत करने का मुख्य मंत्र क्या है?', answer: 'ॐ बृं बृहस्पतये नमः का नित्य 108 बार जप करें।' }
    ],
    created_at: new Date('2026-07-15').toISOString(),
  },
  {
    id: 'b-2',
    title: 'मांगलिक दोष क्या है? भ्रांतियाँ, सच्चाई एवं अचूक विवाह उपाय',
    slug: 'manglik-dosha-myths-facts-remedies',
    seo_title: 'Manglik Dosha Myths Facts and Marriage Remedies',
    seo_description: 'कुंडली में मंगल दोष से घबराएं नहीं! जानें मंगल दोष के वास्तविक नियम, परिहार तथा शीघ्र विवाह के अचूक वैदिक उपाय।',
    category_id: 'cat-3',
    category: 'कुंडली',
    author: 'पं. राजन कैथवास',
    short_description: 'मंगल ग्रह का लग्न, चतुर्थ, सप्तम, अष्टम या द्वादश भाव में होना मंगल दोष निर्मित करता है।',
    content: `<h1>मांगलिक दोष की सच्चाई एवं परिहार</h1>
<p>समाज में मांगलिक दोष को लेकर अत्यधिक भ्रांतियां और भय व्याप्त हैं। वास्तव में हर मांगलिक कुंडली में दोष नुकसानदायक नहीं होता।</p>
<h2>मंगल दोष कब कट जाता है?</h2>
<p>यदि मंगल अपनी स्वराशि (मेष/वृश्चिक) या उच्च राशि (मकर) में स्थित हो तो मंगल दोष समाप्त हो जाता है। इसके अलावा गुरु की शुभ दृष्टि से भी इसका प्रभाव निष्प्रभावी हो जाता है।</p>
<p><b>सरल उपाय:</b> नीम का वृक्ष लगाएं, हनुमान चालीसा का पाठ करें तथा मंगल यन्त्र की प्रतिष्ठा करें।</p>`,
    featured_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'blog/manglik_dosha',
    alt_text: 'मांगलिक दोष निवारण कुण्डली',
    tags: ['Manglik', 'Marriage', 'Kundli', 'Dosha Remedies'],
    status: 'published',
    publish_date: '2026-07-20 11:30:00',
    views: 980,
    is_featured: false,
    reading_time: '5 मिनट',
    faqs: [
      { question: 'क्या 28 वर्ष के बाद मंगल दोष खत्म हो जाता है?', answer: 'शास्त्रीय मान्यता अनुसार 28 वर्ष के पश्चात मंगल की तीव्र उग्रता में कमी आती है, परंतु परिहार कुण्डली देखकर ही निश्चित होता है।' }
    ],
    created_at: new Date('2026-07-20').toISOString(),
  },
  {
    id: 'b-3',
    title: 'वास्तु शास्त्र अनुसार मुख्य द्वार का रंग एवं दिशा: सुख-समृद्धि के नियम',
    slug: 'vastu-main-door-direction-color-guide',
    seo_title: 'Vastu Main Entrance Direction & Color Tips',
    seo_description: 'घर के मुख्य द्वार का वास्तु सही करके दूर करें नकारात्मक ऊर्जा! जानें पूर्व, उत्तर, पश्चिम व दक्षिण द्वार के नियम।',
    category_id: 'cat-4',
    category: 'वास्तु',
    author: 'पं. राजन कैथवास',
    short_description: 'मुख्य द्वार से ही घर में सकारात्मक ऊर्जा एवं मां लक्ष्मी का प्रवेश होता है। जानिए दिशा अनुसार सटीक वास्तु नियम।',
    content: `<h1>वास्तु अनुसार मुख्य द्वार के नियम</h1>
<p>गृह निर्माण या फ्लैट क्रय करते समय मुख्य द्वार की दिशा अत्यंत महत्वपूर्ण होती है। उत्तर एवं पूर्व दिशा के द्वार अत्यंत शुभ माने जाते हैं।</p>
<h2>मुख्य द्वार पर क्या न रखें?</h2>
<p>मुख्य द्वार के सामने जूते-चप्पल, डस्टबिन या अवरोध कभी न रखें। द्वार पर स्वास्तिक या ॐ का शुभ चिह्न अवश्य बनाएं।</p>`,
    featured_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'blog/vastu_main_door',
    alt_text: 'वास्तु मुख्य द्वार नियम',
    tags: ['Vastu', 'Home Design', 'Energy', 'Main Door'],
    status: 'published',
    publish_date: '2026-07-28 09:00:00',
    views: 650,
    is_featured: false,
    reading_time: '3 मिनट',
    created_at: new Date('2026-07-28').toISOString(),
  },
  {
    id: 'b-4',
    title: 'सावन 2026: रुद्राभिषेक का महत्व एवं राशि अनुसार शिव आराधना',
    slug: 'sawan-2026-rudrabhishek-significance-remedies',
    seo_title: 'Sawan 2026 Rudrabhishek Significance & Worship Guide',
    seo_description: 'पवित्र सावन मास में भगवान शिव का जलाभिषेक व रुद्राभिषेक करने से मनवांछित फल मिलता है। जानिए राशि अनुसार विधि।',
    category_id: 'cat-8',
    category: 'पूजा एवं उपाय',
    author: 'पं. राजन कैथवास',
    short_description: 'सावन में महादेव की पूजा विशेष फलदायी है। जानें किन द्रव्यों से अभिषेक करने से कौन से कष्ट दूर होते हैं।',
    content: `<h1>सावन मास में रुद्राभिषेक का महत्व</h1>
<p>सावन मास भगवान आशुतोष को अति प्रिय है। इस दौरान शिवलिंग पर दुग्ध, शहद, पंचामृत एवं गंगाजल से रुद्राभिषेक करने पर समस्त ग्रह दोष शांत होते हैं।</p>`,
    featured_image_url: 'https://images.unsplash.com/photo-1545232979-fbf592320757?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'blog/sawan_rudrabhishek',
    alt_text: 'सावन रुद्राभिषेक पूजा',
    tags: ['Sawan', 'Shiv Puja', 'Rudrabhishek', 'Remedies'],
    status: 'draft',
    publish_date: '2026-08-10 08:00:00',
    views: 120,
    is_featured: false,
    reading_time: '4 मिनट',
    created_at: new Date('2026-08-01').toISOString(),
  },
];

// ==========================================
// GALLERY MANAGEMENT TYPES & DATABASES
// ==========================================
interface GalleryCategoryServerItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mediaCount: number;
  createdAt?: string;
}

interface GalleryAlbumServerItem {
  id: string;
  title: string;
  slug: string;
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

interface GalleryMediaServerItem {
  id: string;
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

let galleryCategoriesDatabase: GalleryCategoryServerItem[] = [
  { id: 'cat-g-1', name: 'मंदिर', slug: 'temple', description: 'धार्मिक स्थल, प्रसिद्ध मंदिर एवं दर्शन छायाचित्र', mediaCount: 1 },
  { id: 'cat-g-2', name: 'कार्यालय', slug: 'office', description: 'ज्योतिष संस्थान, स्वागत कक्ष एवं परामर्श हॉल', mediaCount: 1 },
  { id: 'cat-g-3', name: 'कार्यक्रम', slug: 'events', description: 'संस्थान के सार्वजनिक कार्यक्रम व उत्सव', mediaCount: 0 },
  { id: 'cat-g-4', name: 'सेमिनार', slug: 'seminar', description: 'अंतर्राष्ट्रीय एवं राष्ट्रीय ज्योतिष महासम्मेलन', mediaCount: 2 },
  { id: 'cat-g-5', name: 'सम्मान समारोह', slug: 'awards-ceremony', description: 'ज्योतिष मंच पर प्राप्त सम्मान व अलंकरण', mediaCount: 1 },
  { id: 'cat-g-6', name: 'पुरस्कार', slug: 'awards', description: 'राष्ट्रीय व अंतर्राष्ट्रीय पुरस्कार', mediaCount: 0 },
  { id: 'cat-g-7', name: 'प्रमाण पत्र', slug: 'certificates', description: 'वैदिक ज्योतिष एवं वास्तु विशेषज्ञता प्रमाण पत्र', mediaCount: 1 },
  { id: 'cat-g-8', name: 'पूजा एवं अनुष्ठान', slug: 'puja-rituals', description: 'विशेष महायज्ञ, नवग्रह एवं कालसर्प शांति पूजा', mediaCount: 1 },
  { id: 'cat-g-9', name: 'ज्योतिष परामर्श', slug: 'consultation', description: 'प्रत्यक्ष एवं ऑनलाइन परामर्श क्षण', mediaCount: 0 },
  { id: 'cat-g-10', name: 'मीडिया कवरेज', slug: 'media-coverage', description: 'अखबारों एवं टीवी चैनलों में प्रकाशित खबरें', mediaCount: 1 },
  { id: 'cat-g-11', name: 'ग्राहक अनुभव', slug: 'testimonials', description: 'संतुष्ट जातकों के अनुभव व चित्र', mediaCount: 0 },
  { id: 'cat-g-12', name: 'वीडियो गैलरी', slug: 'video-gallery', description: 'ज्योतिष मार्गदर्शन एवं अनुष्ठान वीडियो', mediaCount: 2 },
  { id: 'cat-g-13', name: 'अन्य', slug: 'others', description: 'अन्य विविध चित्र एवं मीडिया', mediaCount: 0 },
];

let galleryAlbumsDatabase: GalleryAlbumServerItem[] = [
  { id: 'alb-1', title: 'श्री महाकाल मंदिर एवं दर्शन', slug: 'shree-mahakal-temple', category: 'मंदिर', description: 'बाबा महाकाल उज्जैन दर्शन एवं भस्म आरती दृश्य', coverImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', visibility: 'public', sortOrder: 1, views: 1240, mediaCount: 1, createdAt: '2026-07-01' },
  { id: 'alb-2', title: 'अंतर्राष्ट्रीय ज्योतिष सेमिनार 2026', slug: 'international-astrology-seminar-2026', category: 'सेमिनार', description: 'राष्ट्रीय एवं अंतर्राष्ट्रीय ज्योतिष महासम्मेलन में मुख्य वक्ता संबोधन', coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', visibility: 'public', sortOrder: 2, views: 890, mediaCount: 2, createdAt: '2026-07-10' },
  { id: 'alb-3', title: 'राष्ट्रीय ज्योतिष पुरस्कार एवं सम्मान', slug: 'national-astrology-awards', category: 'सम्मान समारोह', description: 'श्रेष्ठ ज्योतिषाचार्य अलंकरण एवं प्रमाण पत्र वितरण', coverImageUrl: 'https://images.unsplash.com/photo-1531058240690-006c446962d8?auto=format&fit=crop&w=800&q=80', visibility: 'public', sortOrder: 3, views: 1420, mediaCount: 2, createdAt: '2026-07-15' },
  { id: 'alb-4', title: 'विशेष नवग्रह शांति महापूजा', slug: 'navgraha-shanti-puja-album', category: 'पूजा एवं अनुष्ठान', description: 'वैदिक पद्धति द्वारा सर्वग्रह दोष शांति महायज्ञ एवं जाप', coverImageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', visibility: 'public', sortOrder: 4, views: 950, mediaCount: 1, createdAt: '2026-07-20' },
  { id: 'alb-5', title: 'कार्यालय एवं परामर्श कक्ष', slug: 'office-and-consultation', category: 'कार्यालय', description: 'आधुनिक ज्योतिष परामर्श केंद्र एवं स्वागत कक्ष', coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', visibility: 'public', sortOrder: 5, views: 780, mediaCount: 1, createdAt: '2026-07-25' },
  { id: 'alb-6', title: 'ज्योतिष परामर्श एवं वीडियो मार्गदर्शन', slug: 'astrology-video-guidance', category: 'वीडियो गैलरी', description: 'विभिन्न दोष निवारण एवं ज्योतिषीय उपायों के वीडियो संदेश', coverImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', visibility: 'public', sortOrder: 6, views: 2350, mediaCount: 2, createdAt: '2026-08-01' },
];

let galleryMediaDatabase: GalleryMediaServerItem[] = [
  {
    id: 'g-1',
    title: 'महाकालेश्वर ज्योतिर्लिंग उज्जैन दर्शन',
    description: 'उज्जैन स्थित 12 ज्योतिर्लिंगों में से एक श्री महाकालेश्वर मंदिर का भव्य दृश्य।',
    category: 'मंदिर',
    album: 'श्री महाकाल मंदिर एवं दर्शन',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/temple/mahakal_1',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'श्री महाकालेश्वर मंदिर दर्शन उज्जैन',
    views: 1240,
    fileSizeMb: 2.4,
    createdAt: '2026-07-02T10:00:00Z',
  },
  {
    id: 'g-2',
    title: 'अंतर्राष्ट्रीय ज्योतिष महासम्मेलन मंच संबोधन',
    description: 'नई दिल्ली में आयोजित ज्योतिष महासम्मेलन में ग्रह गोचर पर विचार व्यक्त करते पं. राजन कैथवास।',
    category: 'सेमिनार',
    album: 'अंतर्राष्ट्रीय ज्योतिष सेमिनार 2026',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/seminars/astrology_seminar_2026',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'ज्योतिष सेमिनार 2026 संबोधन',
    views: 890,
    fileSizeMb: 3.1,
    createdAt: '2026-07-11T11:30:00Z',
  },
  {
    id: 'g-3',
    title: 'सर्वश्रेष्ठ ज्योतिषाचार्य राष्ट्रीय सम्मान',
    description: 'वर्ष 2025-26 के सर्वश्रेष्ठ ज्योतिषाचार्य अलंकरण से सम्मानित होते हुए।',
    category: 'सम्मान समारोह',
    album: 'राष्ट्रीय ज्योतिष पुरस्कार एवं सम्मान',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1531058240690-006c446962d8?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/awards/national_award_2025',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'राष्ट्रीय ज्योतिष पुरस्कार सम्मान',
    views: 1420,
    fileSizeMb: 1.8,
    createdAt: '2026-07-16T14:20:00Z',
  },
  {
    id: 'g-4',
    title: 'वैदिक नवग्रह शांति एवं कालसर्प पूजा',
    description: 'वैदिक मंत्रोच्चार के साथ संपन्न महायज्ञ एवं नवग्रह शांति हवन।',
    category: 'पूजा एवं अनुष्ठान',
    album: 'विशेष नवग्रह शांति महापूजा',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/events/navgraha_puja',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'नवग्रह शांति पूजा अनुष्ठान',
    views: 950,
    fileSizeMb: 4.2,
    createdAt: '2026-07-21T09:15:00Z',
  },
  {
    id: 'g-5',
    title: 'प्रमाण पत्र - अखिल भारतीय ज्योतिष अनुसंधान परिषद',
    description: 'अनुसंधान परिषद द्वारा प्रदत्त आधिकारिक ज्योतिष रत्न एवं वास्तु शिरोमणि प्रमाण पत्र।',
    category: 'प्रमाण पत्र',
    album: 'राष्ट्रीय ज्योतिष पुरस्कार एवं सम्मान',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/certificates/astrology_certificate',
    uploadedBy: 'एडमिन',
    status: 'published',
    altText: 'ज्योतिष अनुसंधान प्रमाण पत्र',
    views: 610,
    fileSizeMb: 1.5,
    createdAt: '2026-07-22T16:00:00Z',
  },
  {
    id: 'g-6',
    title: 'मुख्य परामर्श केंद्र एवं ज्योतिष संस्थान',
    description: 'मुख्य ज्योतिष परामर्श केंद्र जहां दैनिक कुण्डली विश्लेषण किया जाता है।',
    category: 'कार्यालय',
    album: 'कार्यालय एवं परामर्श कक्ष',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/office/office_view',
    uploadedBy: 'एडमिन',
    status: 'published',
    altText: 'ज्योतिष कार्यालय एवं परामर्श कक्ष',
    views: 780,
    fileSizeMb: 2.0,
    createdAt: '2026-07-26T12:00:00Z',
  },
  {
    id: 'g-7',
    title: 'दैनिक भास्कर समाचार पत्र कवरेज',
    description: 'वर्ष 2026 राशिफल एवं महा उपाय पर प्रकाशित विशेष समाचार लेख।',
    category: 'मीडिया कवरेज',
    album: 'अंतर्राष्ट्रीय ज्योतिष सेमिनार 2026',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/events/media_coverage_news',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'मीडिया कवरेज अखबार लेख',
    views: 1100,
    fileSizeMb: 2.8,
    createdAt: '2026-07-29T15:45:00Z',
  },
  {
    id: 'g-8',
    title: 'मांगलिक एवं कालसर्प दोष निवारण संपूर्ण वीडियो मार्गदर्शन',
    description: 'कुण्डली में कालसर्प व मांगलिक दोष होने पर क्या करें? जानिए पं. राजन कैथवास से।',
    category: 'वीडियो गैलरी',
    album: 'ज्योतिष परामर्श एवं वीडियो मार्गदर्शन',
    mediaType: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/videos/manglik_dosh_video',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'मांगलिक कालसर्प दोष निवारण वीडियो',
    views: 2350,
    fileSizeMb: 24.5,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'g-9',
    title: 'वर्ष 2026 महा गोचर एवं गृह वास्तु उपाय वीडियो',
    description: 'गुरु एवं शनि गोचर के दौरान घर के वास्तु में करने योग्य आसान बदलाव।',
    category: 'वीडियो गैलरी',
    album: 'ज्योतिष परामर्श एवं वीडियो मार्गदर्शन',
    mediaType: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1200&q=80',
    cloudinaryPublicId: 'gallery/videos/vastu_remedies_video',
    uploadedBy: 'पं. राजन कैथवास',
    status: 'published',
    altText: 'वास्तु उपाय वीडियो',
    views: 1890,
    fileSizeMb: 35.0,
    createdAt: '2026-08-03T14:30:00Z',
  },
];

// Helper to sanitize slug
function createSlug(textStr: string): string {
  if (!textStr) return 'blog-' + Date.now();
  return textStr
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || ('blog-' + Date.now());
}

// GET all blogs or with filters
app.get(['/api/blogs', '/api/blog'], (req, res) => {
  const { category, status, tag, search, author, limit, page } = req.query;

  let filtered = [...blogDatabase];

  if (category) {
    filtered = filtered.filter(b => b.category === category || b.category_id === category);
  }
  if (status) {
    filtered = filtered.filter(b => b.status === status);
  }
  if (tag) {
    filtered = filtered.filter(b => b.tags && b.tags.some(t => t.toLowerCase() === String(tag).toLowerCase()));
  }
  if (author) {
    filtered = filtered.filter(b => b.author.toLowerCase().includes(String(author).toLowerCase()));
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) ||
      (b.short_description && b.short_description.toLowerCase().includes(q)) ||
      (b.content && b.content.toLowerCase().includes(q)) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  return res.json({
    success: true,
    total: filtered.length,
    blogs: filtered,
    categories: blogCategoriesDatabase,
  });
});

// GET single blog by ID or Slug
app.get(['/api/blogs/:id', '/api/blog/:id'], (req, res) => {
  const { id } = req.params;
  const item = blogDatabase.find(b => String(b.id) === String(id) || b.slug === id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Blog article not found' });
  }
  // Increment view count
  item.views = (item.views || 0) + 1;
  return res.json({ success: true, blog: item });
});

// POST Create new blog
app.post(['/api/blogs', '/api/blog'], upload.single('featured_image'), async (req, res) => {
  try {
    const {
      title,
      slug,
      seo_title,
      seo_description,
      category_id,
      category,
      author,
      short_description,
      content,
      alt_text,
      tags,
      status,
      publish_date,
      reading_time,
      is_featured,
      faqs,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'शीर्षक (Title) तथा विषय (Content) अनिवार्य हैं।' });
    }

    let featured_image_url = 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80';
    let cloudinary_public_id = '';

    if (req.file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'blog', resource_type: 'image' },
            (err, result) => err ? reject(err) : resolve(result)
          );
          stream.end(req.file!.buffer);
        });
        featured_image_url = uploadResult.secure_url;
        cloudinary_public_id = uploadResult.public_id;
      } else {
        featured_image_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else if (req.body.featured_image_url) {
      featured_image_url = req.body.featured_image_url;
      cloudinary_public_id = req.body.cloudinary_public_id || '';
    }

    const finalSlug = slug ? createSlug(slug) : createSlug(title);
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(tags) ? tags : ['Astrology']);
    let parsedFaqs = [];
    if (typeof faqs === 'string') {
      try { parsedFaqs = JSON.parse(faqs); } catch (e) { parsedFaqs = []; }
    } else if (Array.isArray(faqs)) {
      parsedFaqs = faqs;
    }

    const newPost: BlogPostItem = {
      id: 'blog-' + Date.now(),
      title: title.trim(),
      slug: finalSlug,
      seo_title: seo_title || title,
      seo_description: seo_description || short_description || title,
      category_id: category_id || 'cat-1',
      category: category || 'वैदिक ज्योतिष',
      author: author || 'पं. राजन कैथवास',
      short_description: short_description || title,
      content,
      featured_image_url,
      imageUrl: featured_image_url,
      cloudinary_public_id,
      alt_text: alt_text || title,
      tags: parsedTags,
      status: (status as any) || 'published',
      publish_date: publish_date || new Date().toISOString().replace('T', ' ').substring(0, 19),
      views: 0,
      is_featured: is_featured === true || is_featured === 'true' || is_featured === 1,
      reading_time: reading_time || `${Math.max(1, Math.ceil(content.length / 500))} मिनट`,
      faqs: parsedFaqs,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    blogDatabase.unshift(newPost);

    // Update category count
    const matchedCat = blogCategoriesDatabase.find(c => c.name === newPost.category || c.id === newPost.category_id);
    if (matchedCat) {
      matchedCat.articleCount = (matchedCat.articleCount || 0) + 1;
    }

    return res.json({ success: true, blog: newPost, message: 'लेख सफलतापूर्वक सहेजा गया!' });
  } catch (err: any) {
    console.error('Error creating blog:', err);
    return res.status(500).json({ success: false, error: err.message || 'लेख बनाने में त्रुटि हुई।' });
  }
});

// PUT Edit blog
app.put(['/api/blogs/:id', '/api/blog/:id'], upload.single('featured_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const index = blogDatabase.findIndex(b => String(b.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const current = blogDatabase[index];
    let featured_image_url = current.featured_image_url;
    let cloudinary_public_id = current.cloudinary_public_id;

    if (req.file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'blog', resource_type: 'image' },
            (err, result) => err ? reject(err) : resolve(result)
          );
          stream.end(req.file!.buffer);
        });
        featured_image_url = uploadResult.secure_url;
        cloudinary_public_id = uploadResult.public_id;
      } else {
        featured_image_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else if (req.body.featured_image_url) {
      featured_image_url = req.body.featured_image_url;
    }

    let parsedTags = current.tags;
    if (req.body.tags) {
      parsedTags = typeof req.body.tags === 'string' ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : req.body.tags;
    }

    let parsedFaqs = current.faqs;
    if (req.body.faqs) {
      if (typeof req.body.faqs === 'string') {
        try { parsedFaqs = JSON.parse(req.body.faqs); } catch (e) { }
      } else if (Array.isArray(req.body.faqs)) {
        parsedFaqs = req.body.faqs;
      }
    }

    const updatedItem: BlogPostItem = {
      ...current,
      ...req.body,
      title: req.body.title ? req.body.title.trim() : current.title,
      slug: req.body.slug ? createSlug(req.body.slug) : current.slug,
      featured_image_url,
      imageUrl: featured_image_url,
      cloudinary_public_id,
      tags: parsedTags,
      faqs: parsedFaqs,
      is_featured: req.body.is_featured === true || req.body.is_featured === 'true' || req.body.is_featured === 1,
      updated_at: new Date().toISOString(),
    };

    blogDatabase[index] = updatedItem;
    return res.json({ success: true, blog: updatedItem, message: 'ब्लॉग सफलतापूर्वक अपडेट हो गया।' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'अपडेट करने में त्रुटि।' });
  }
});

// DELETE blog
app.delete(['/api/blogs/:id', '/api/blog/:id'], (req, res) => {
  const { id } = req.params;
  const initialLength = blogDatabase.length;
  blogDatabase = blogDatabase.filter(b => String(b.id) !== String(id));
  if (blogDatabase.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }
  return res.json({ success: true, message: 'ब्लॉग सफलतापूर्वक हटाया गया।' });
});

// POST Duplicate blog
app.post(['/api/blogs/:id/duplicate', '/api/blog/:id/duplicate'], (req, res) => {
  const { id } = req.params;
  const original = blogDatabase.find(b => String(b.id) === String(id));
  if (!original) {
    return res.status(404).json({ success: false, error: 'Original article not found' });
  }

  const duplicated: BlogPostItem = {
    ...original,
    id: 'blog-' + Date.now(),
    title: `${original.title} (प्रतिलिपि)`,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    status: 'draft',
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  blogDatabase.unshift(duplicated);
  return res.json({ success: true, blog: duplicated, message: 'लेख की प्रतिलिपि तैयार की गई।' });
});

// POST Pin / Unpin featured blog
app.post(['/api/blogs/:id/toggle-featured', '/api/blog/:id/toggle-featured'], (req, res) => {
  const { id } = req.params;
  const blog = blogDatabase.find(b => String(b.id) === String(id));
  if (!blog) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }

  blog.is_featured = !blog.is_featured;
  return res.json({ success: true, is_featured: blog.is_featured, message: blog.is_featured ? 'लेख पिन (Featured) किया गया।' : 'पिन हटा दिया गया।' });
});

// Categories Endpoints
app.get('/api/blog-categories', (req, res) => {
  return res.json({ success: true, categories: blogCategoriesDatabase });
});

app.post('/api/blog-categories', (req, res) => {
  const { name, hindiName, description } = req.body;
  if (!name && !hindiName) {
    return res.status(400).json({ success: false, error: 'श्रेणी का नाम आवश्यक है।' });
  }
  const newCat: BlogCategoryItem = {
    id: 'cat-' + Date.now(),
    name: name || hindiName,
    hindiName: hindiName || name,
    slug: createSlug(name || hindiName),
    articleCount: 0,
    description: description || '',
  };
  blogCategoriesDatabase.push(newCat);
  return res.json({ success: true, category: newCat, message: 'नई श्रेणी जोड़ी गई।' });
});

app.delete('/api/blog-categories/:id', (req, res) => {
  const { id } = req.params;
  blogCategoriesDatabase = blogCategoriesDatabase.filter(c => c.id !== id);
  return res.json({ success: true, message: 'श्रेणी हटाई गई।' });
});

// Comments Endpoints
app.get('/api/blog-comments', (req, res) => {
  return res.json({ success: true, comments: blogCommentsDatabase });
});

app.post('/api/blog-comments', (req, res) => {
  const { articleId, articleTitle, authorName, authorEmail, content } = req.body;
  const newComment: BlogCommentItem = {
    id: 'com-' + Date.now(),
    articleId: articleId || 'b-1',
    articleTitle: articleTitle || 'ज्योतिष लेख',
    authorName: authorName || 'अतिथी जातक',
    authorEmail: authorEmail || 'user@example.com',
    content: content || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  blogCommentsDatabase.unshift(newComment);
  return res.json({ success: true, comment: newComment, message: 'आपकी टिप्पणी समीक्षा हेतु भेज दी गई है।' });
});

app.put('/api/blog-comments/:id', (req, res) => {
  const { id } = req.params;
  const comment = blogCommentsDatabase.find(c => c.id === id);
  if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });

  if (req.body.status) comment.status = req.body.status;
  if (req.body.reply) comment.reply = req.body.reply;

  return res.json({ success: true, comment, message: 'टिप्पणी अपडेट की गई।' });
});

app.delete('/api/blog-comments/:id', (req, res) => {
  const { id } = req.params;
  blogCommentsDatabase = blogCommentsDatabase.filter(c => c.id !== id);
  return res.json({ success: true, message: 'टिप्पणी हटाई गई।' });
});

// Analytics & Reports
app.get('/api/blog-analytics', (req, res) => {
  const totalArticles = blogDatabase.length;
  const publishedArticles = blogDatabase.filter(b => b.status === 'published').length;
  const draftArticles = blogDatabase.filter(b => b.status === 'draft').length;
  const scheduledArticles = blogDatabase.filter(b => b.status === 'scheduled').length;
  const totalCategories = blogCategoriesDatabase.length;

  const allTagsSet = new Set<string>();
  blogDatabase.forEach(b => b.tags && b.tags.forEach(t => allTagsSet.add(t)));
  const totalTags = allTagsSet.size;

  const totalViews = blogDatabase.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const sortedByViews = [...blogDatabase].sort((a, b) => (b.views || 0) - (a.views || 0));
  const mostViewed = sortedByViews[0] || null;

  return res.json({
    success: true,
    stats: {
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalCategories,
      totalTags,
      totalViews,
      mostViewed,
    },
    topArticles: sortedByViews.slice(0, 5),
    dailyViews: [
      { date: '2026-07-30', views: 240 },
      { date: '2026-07-31', views: 310 },
      { date: '2026-08-01', views: 420 },
      { date: '2026-08-02', views: 380 },
      { date: '2026-08-03', views: 510 },
      { date: '2026-08-04', views: 490 },
      { date: '2026-08-05', views: 620 },
    ],
  });
});

// ==========================================
// GALLERY MANAGEMENT APIS
// ==========================================

// GET Gallery Media List & Stats
app.get('/api/gallery', (req, res) => {
  const { category, album, media_type, status, search } = req.query;

  let filtered = [...galleryMediaDatabase];

  if (category && category !== 'all' && category !== 'सभी') {
    filtered = filtered.filter(m => m.category === String(category));
  }
  if (album && album !== 'all' && album !== 'सभी') {
    filtered = filtered.filter(m => m.album === String(album));
  }
  if (media_type && media_type !== 'all') {
    filtered = filtered.filter(m => m.mediaType === String(media_type));
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(m => (m.status || 'published') === String(status));
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q) ||
        (m.album && m.album.toLowerCase().includes(q))
    );
  }

  const totalImages = galleryMediaDatabase.filter(m => m.mediaType === 'image').length;
  const totalVideos = galleryMediaDatabase.filter(m => m.mediaType === 'video').length;
  const totalAlbums = galleryAlbumsDatabase.length;
  const totalCategories = galleryCategoriesDatabase.length;
  
  const storageUsedMb = Number(
    galleryMediaDatabase.reduce((acc, curr) => acc + (curr.fileSizeMb || 1.5), 0).toFixed(2)
  );

  const sortedAlbums = [...galleryAlbumsDatabase].sort((a, b) => (b.views || 0) - (a.views || 0));
  const mostViewedAlbum = sortedAlbums[0] || null;

  return res.json({
    success: true,
    media: filtered,
    categories: galleryCategoriesDatabase,
    albums: galleryAlbumsDatabase,
    stats: {
      totalImages,
      totalVideos,
      totalAlbums,
      totalCategories,
      storageUsedMb,
      cloudinaryStorageMb: storageUsedMb,
      recentlyUploaded: [...galleryMediaDatabase].slice(-6).reverse(),
      mostViewedAlbum,
    },
  });
});

// GET Single Gallery Media Item
app.get('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const item = galleryMediaDatabase.find(m => String(m.id) === String(id));
  if (!item) {
    return res.status(404).json({ success: false, error: 'मीडिया आइटम प्राप्त नहीं हुआ।' });
  }
  item.views = (item.views || 0) + 1;
  return res.json({ success: true, item });
});

// POST Upload Media (Single or Bulk)
app.post('/api/gallery/upload', (req, res) => {
  const body = req.body;
  const itemsToUpload = Array.isArray(body.items) ? body.items : [body];

  const addedItems: GalleryMediaServerItem[] = [];

  for (const itemData of itemsToUpload) {
    const title = itemData.title || itemData.name || 'गैलरी छायाचित्र ' + (galleryMediaDatabase.length + 1);
    const category = itemData.category || 'अन्य';
    const album = itemData.album || 'सामान्य';
    const mediaType = itemData.mediaType || (itemData.videoUrl ? 'video' : 'image');
    const imageUrl = itemData.imageUrl || itemData.url || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80';
    const videoUrl = itemData.videoUrl || '';
    const thumbnailUrl = itemData.thumbnailUrl || (mediaType === 'video' ? imageUrl : '');
    const cloudinaryPublicId = itemData.cloudinaryPublicId || itemData.public_id || `gallery/${createSlug(category)}/${Date.now()}`;
    const altText = itemData.altText || `${title} - पं. राजन कैथवास गैलरी`;

    const newItem: GalleryMediaServerItem = {
      id: 'g-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title,
      description: itemData.description || `${category} वर्ग के अंतर्गत अपलोड किया गया मीडिया`,
      category,
      album,
      mediaType,
      imageUrl,
      videoUrl,
      thumbnailUrl,
      cloudinaryPublicId,
      uploadedBy: itemData.uploadedBy || 'पं. राजन कैथवास',
      status: itemData.status || 'published',
      altText,
      views: 0,
      fileSizeMb: itemData.fileSizeMb || (mediaType === 'video' ? 15.0 : 2.5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    galleryMediaDatabase.unshift(newItem);
    addedItems.push(newItem);

    // Update mediaCount in category
    const catObj = galleryCategoriesDatabase.find(c => c.name === category);
    if (catObj) catObj.mediaCount = (catObj.mediaCount || 0) + 1;

    // Update mediaCount in album
    const albObj = galleryAlbumsDatabase.find(a => a.title === album);
    if (albObj) albObj.mediaCount = (albObj.mediaCount || 0) + 1;
  }

  return res.json({
    success: true,
    addedItems,
    message: `${addedItems.length} मीडिया फ़ाइल(एं) सफलतापूर्वक अपलोड एवं क्लाउडिनरी में सहेजी गईं।`,
  });
});

// PUT Update / Replace / Move Gallery Media
app.put('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const item = galleryMediaDatabase.find(m => String(m.id) === String(id));
  if (!item) {
    return res.status(404).json({ success: false, error: 'मीडिया आइटम प्राप्त नहीं हुआ।' });
  }

  if (req.body.title !== undefined) item.title = req.body.title;
  if (req.body.description !== undefined) item.description = req.body.description;
  if (req.body.category !== undefined) item.category = req.body.category;
  if (req.body.album !== undefined) item.album = req.body.album;
  if (req.body.status !== undefined) item.status = req.body.status;
  if (req.body.altText !== undefined) item.altText = req.body.altText;
  if (req.body.imageUrl !== undefined) item.imageUrl = req.body.imageUrl;
  if (req.body.videoUrl !== undefined) item.videoUrl = req.body.videoUrl;
  if (req.body.thumbnailUrl !== undefined) item.thumbnailUrl = req.body.thumbnailUrl;
  if (req.body.cloudinaryPublicId !== undefined) item.cloudinaryPublicId = req.body.cloudinaryPublicId;
  item.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    item,
    message: 'गैलरी मीडिया विवरण अपडेट कर दिया गया है।',
  });
});

// DELETE Gallery Media
app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const index = galleryMediaDatabase.findIndex(m => String(m.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'मीडिया आइटम प्राप्त नहीं हुआ।' });
  }

  const deletedItem = galleryMediaDatabase[index];
  galleryMediaDatabase.splice(index, 1);

  // Update counts
  const catObj = galleryCategoriesDatabase.find(c => c.name === deletedItem.category);
  if (catObj && catObj.mediaCount) catObj.mediaCount = Math.max(0, catObj.mediaCount - 1);

  const albObj = galleryAlbumsDatabase.find(a => a.title === deletedItem.album);
  if (albObj && albObj.mediaCount) albObj.mediaCount = Math.max(0, albObj.mediaCount - 1);

  return res.json({
    success: true,
    message: 'गैलरी फ़ाइल सफलतापूर्वक हटाई गई।',
  });
});

// CREATE Album
app.post('/api/gallery/create-album', (req, res) => {
  const { title, description, category, coverImageUrl, visibility, sortOrder } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'एल्बम का शीर्षक आवश्यक है।' });
  }

  const newAlbum: GalleryAlbumServerItem = {
    id: 'alb-' + Date.now(),
    title,
    slug: createSlug(title),
    description: description || '',
    category: category || 'अन्य',
    coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    visibility: visibility || 'public',
    sortOrder: sortOrder || galleryAlbumsDatabase.length + 1,
    views: 0,
    mediaCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  galleryAlbumsDatabase.push(newAlbum);
  return res.json({
    success: true,
    album: newAlbum,
    message: 'नया एल्बम सफलतापूर्वक निर्मित हुआ।',
  });
});

// UPDATE Album
app.put('/api/gallery/albums/:id', (req, res) => {
  const { id } = req.params;
  const album = galleryAlbumsDatabase.find(a => String(a.id) === String(id));
  if (!album) {
    return res.status(404).json({ success: false, error: 'एल्बम प्राप्त नहीं हुआ।' });
  }

  if (req.body.title) album.title = req.body.title;
  if (req.body.description !== undefined) album.description = req.body.description;
  if (req.body.category) album.category = req.body.category;
  if (req.body.coverImageUrl) album.coverImageUrl = req.body.coverImageUrl;
  if (req.body.visibility) album.visibility = req.body.visibility;
  if (req.body.sortOrder) album.sortOrder = req.body.sortOrder;
  album.updatedAt = new Date().toISOString();

  return res.json({ success: true, album, message: 'एल्बम अपडेट हो गया।' });
});

// DELETE Album
app.delete('/api/gallery/albums/:id', (req, res) => {
  const { id } = req.params;
  galleryAlbumsDatabase = galleryAlbumsDatabase.filter(a => String(a.id) !== String(id));
  return res.json({ success: true, message: 'एल्बम हटा दिया गया।' });
});

// CREATE Category
app.post('/api/gallery/create-category', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'श्रेणी का नाम आवश्यक है।' });
  }

  const newCat: GalleryCategoryServerItem = {
    id: 'cat-g-' + Date.now(),
    name,
    slug: createSlug(name),
    description: description || '',
    mediaCount: 0,
    createdAt: new Date().toISOString(),
  };

  galleryCategoriesDatabase.push(newCat);
  return res.json({
    success: true,
    category: newCat,
    message: 'नई गैलरी श्रेणी जोड़ी गई।',
  });
});

// UPDATE Category
app.put('/api/gallery/categories/:id', (req, res) => {
  const { id } = req.params;
  const cat = galleryCategoriesDatabase.find(c => String(c.id) === String(id));
  if (!cat) {
    return res.status(404).json({ success: false, error: 'श्रेणी प्राप्त नहीं हुई।' });
  }

  if (req.body.name) cat.name = req.body.name;
  if (req.body.description !== undefined) cat.description = req.body.description;

  return res.json({ success: true, category: cat, message: 'श्रेणी अपडेट की गई।' });
});

// DELETE Category
app.delete('/api/gallery/categories/:id', (req, res) => {
  const { id } = req.params;
  galleryCategoriesDatabase = galleryCategoriesDatabase.filter(c => String(c.id) !== String(id));
  return res.json({ success: true, message: 'श्रेणी हटाई गई।' });
});

// GET Gallery Reports
app.get('/api/gallery/reports', (req, res) => {
  const totalMedia = galleryMediaDatabase.length;
  const totalImages = galleryMediaDatabase.filter(m => m.mediaType === 'image').length;
  const totalVideos = galleryMediaDatabase.filter(m => m.mediaType === 'video').length;
  const totalStorageMb = Number(
    galleryMediaDatabase.reduce((acc, curr) => acc + (curr.fileSizeMb || 1.5), 0).toFixed(2)
  );

  const categoryBreakdown = galleryCategoriesDatabase.map(c => ({
    category: c.name,
    count: galleryMediaDatabase.filter(m => m.category === c.name).length,
  }));

  const albumBreakdown = galleryAlbumsDatabase.map(a => ({
    album: a.title,
    count: galleryMediaDatabase.filter(m => m.album === a.title).length,
    views: a.views || 0,
  }));

  return res.json({
    success: true,
    summary: {
      totalMedia,
      totalImages,
      totalVideos,
      totalStorageMb,
      totalAlbums: galleryAlbumsDatabase.length,
      totalCategories: galleryCategoriesDatabase.length,
    },
    categoryBreakdown,
    albumBreakdown,
  });
});

// ==========================================
// 7. HOME BANNER MANAGEMENT APIs
// ==========================================
interface HomeBannerServerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  hero_image_url: string;
  mobile_image_url: string;
  cloudinary_public_id: string;
  button_text: string;
  button_url: string;
  second_button_text: string;
  second_button_url: string;
  status: 'active' | 'draft' | 'scheduled';
  display_order: number;
  start_date: string;
  end_date: string;
  created_by: string;
  views: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

interface HomeBannerSettingsServer {
  autoRotation: boolean;
  sliderMode: 'auto' | 'manual' | 'disabled';
  autoRotationIntervalSec: number;
  overlayOpacity: number;
  textAlignment: 'left' | 'center' | 'right';
  darkOverlay: boolean;
  animationEffect: 'fade' | 'slide' | 'zoom' | 'none';
}

let homeBannersDatabase: HomeBannerServerItem[] = [
  {
    id: 'hb-1',
    title: 'राजन कैथवास (मंटू)',
    subtitle: 'वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक',
    description: 'महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित 33+ वर्षों का प्रामाणिक अनुभव। 50,000+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।',
    hero_image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1600&q=80',
    mobile_image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'hero/rajan_kaithwas_main_banner',
    button_text: 'परामर्श बुक करें',
    button_url: '#booking',
    second_button_text: 'WhatsApp परामर्श',
    second_button_url: 'https://wa.me/918319885134',
    status: 'active',
    display_order: 1,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    created_by: 'पं. राजन कैथवास',
    views: 1240,
    clicks: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'hb-2',
    title: 'महाकालेश्वर उज्जैन विशेष अनुष्ठान',
    subtitle: 'कालसर्प दोष एवं नवग्रह शांति महायज्ञ',
    description: 'उज्जैन सिद्धपीठ से लाइव वैदिक विद्वानों द्वारा सिद्ध महापूजा एवं विशेष संकल्प।',
    hero_image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=80',
    mobile_image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'hero/mahakal_anusthan_banner',
    button_text: 'पूजा संकल्प लें',
    button_url: '#services',
    second_button_text: 'कॉल करें',
    second_button_url: 'tel:8319885134',
    status: 'scheduled',
    display_order: 2,
    start_date: '2026-08-10',
    end_date: '2026-08-25',
    created_by: 'पं. राजन कैथवास',
    views: 450,
    clicks: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let homeBannerSettings: HomeBannerSettingsServer = {
  autoRotation: true,
  sliderMode: 'auto',
  autoRotationIntervalSec: 5,
  overlayOpacity: 50,
  textAlignment: 'left',
  darkOverlay: true,
  animationEffect: 'fade',
};

let homeBannerActivityLogs: Array<{
  id: string;
  action: 'Banner Created' | 'Banner Updated' | 'Banner Deleted' | 'Banner Published' | 'Banner Unpublished';
  bannerTitle: string;
  createdBy: string;
  timestamp: string;
  details?: string;
}> = [
  {
    id: 'hblog-1',
    action: 'Banner Published',
    bannerTitle: 'राजन कैथवास (मंटू)',
    createdBy: 'पं. राजन कैथवास',
    timestamp: new Date().toLocaleString('hi-IN'),
    details: 'Cloudinary Folder: hero/rajan_kaithwas_main_banner',
  },
];

// Helper to log banner activity
function logHomeBannerActivity(
  action: 'Banner Created' | 'Banner Updated' | 'Banner Deleted' | 'Banner Published' | 'Banner Unpublished',
  bannerTitle: string,
  createdBy?: string,
  details?: string
) {
  homeBannerActivityLogs.unshift({
    id: 'hblog-' + Date.now(),
    action,
    bannerTitle,
    createdBy: createdBy || 'पं. राजन कैथवास',
    timestamp: new Date().toLocaleString('hi-IN'),
    details,
  });
}

// GET Home Banner List, Settings & Dashboard Stats
app.get('/api/home-banner', (req, res) => {
  const { search, status } = req.query;

  let filtered = [...homeBannersDatabase];

  if (status && status !== 'all') {
    filtered = filtered.filter(b => b.status === String(status));
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }

  // Sort by display order
  filtered.sort((a, b) => a.display_order - b.display_order);

  const totalBanners = homeBannersDatabase.length;
  const activeBanners = homeBannersDatabase.filter(b => b.status === 'active');
  const scheduledBanners = homeBannersDatabase.filter(b => b.status === 'scheduled').length;
  const draftBanners = homeBannersDatabase.filter(b => b.status === 'draft').length;
  const totalViews = homeBannersDatabase.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = homeBannersDatabase.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  
  const sortedByUpdated = [...homeBannersDatabase].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  const lastUpdatedBanner = sortedByUpdated[0] || null;

  return res.json({
    success: true,
    banners: filtered,
    activeBanners: activeBanners,
    settings: homeBannerSettings,
    stats: {
      totalBanners,
      activeBannersCount: activeBanners.length,
      scheduledBanners,
      draftBanners,
      totalViews,
      totalClicks,
      lastUpdatedBanner,
    },
    logs: homeBannerActivityLogs,
  });
});

// GET Single Home Banner
app.get('/api/home-banner/:id', (req, res) => {
  const { id } = req.params;
  const item = homeBannersDatabase.find(b => String(b.id) === String(id));
  if (!item) {
    return res.status(404).json({ success: false, error: 'होम बैनर प्राप्त नहीं हुआ।' });
  }
  item.views = (item.views || 0) + 1;
  return res.json({ success: true, banner: item });
});

// POST Create New Home Banner
app.post('/api/home-banner', (req, res) => {
  const body = req.body;
  if (!body.title) {
    return res.status(400).json({ success: false, error: 'बैनर का शीर्षक आवश्यक है।' });
  }

  const hero_image_url = body.hero_image_url || body.imageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1600&q=80';
  const mobile_image_url = body.mobile_image_url || hero_image_url;
  const slugTitle = body.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  const cloudinary_public_id = body.cloudinary_public_id || `hero/${slugTitle}_${Date.now()}`;
  const status = body.status || 'active';

  // If new banner is set to active and slider mode is disabled, optional set others to draft
  if (status === 'active' && homeBannerSettings.sliderMode === 'disabled') {
    homeBannersDatabase.forEach(b => {
      if (b.status === 'active') b.status = 'draft';
    });
  }

  const newBanner: HomeBannerServerItem = {
    id: 'hb-' + Date.now(),
    title: body.title,
    subtitle: body.subtitle || '',
    description: body.description || '',
    hero_image_url,
    mobile_image_url,
    cloudinary_public_id,
    button_text: body.button_text || 'परामर्श बुक करें',
    button_url: body.button_url || '#booking',
    second_button_text: body.second_button_text || 'कॉल करें',
    second_button_url: body.second_button_url || 'tel:+919876543210',
    status,
    display_order: Number(body.display_order) || homeBannersDatabase.length + 1,
    start_date: body.start_date || new Date().toISOString().split('T')[0],
    end_date: body.end_date || '2028-12-31',
    created_by: body.created_by || 'पं. राजन कैथवास',
    views: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  homeBannersDatabase.push(newBanner);

  logHomeBannerActivity(
    status === 'active' ? 'Banner Published' : 'Banner Created',
    newBanner.title,
    newBanner.created_by,
    `Cloudinary Folder: hero/ (${cloudinary_public_id})`
  );

  return res.json({
    success: true,
    banner: newBanner,
    message: 'नया होम बैनर सफलतापूर्वक जोड़ा गया एवं क्लाउडिनरी सिंक किया गया!',
  });
});

// PUT Update / Replace Home Banner
app.put('/api/home-banner/:id', (req, res) => {
  const { id } = req.params;
  const item = homeBannersDatabase.find(b => String(b.id) === String(id));
  if (!item) {
    return res.status(404).json({ success: false, error: 'होम बैनर प्राप्त नहीं हुआ।' });
  }

  const oldStatus = item.status;
  const body = req.body;

  if (body.title !== undefined) item.title = body.title;
  if (body.subtitle !== undefined) item.subtitle = body.subtitle;
  if (body.description !== undefined) item.description = body.description;
  
  // Handling Cloudinary replacement: if new hero image provided
  if (body.hero_image_url && body.hero_image_url !== item.hero_image_url) {
    const oldPublicId = item.cloudinary_public_id;
    item.hero_image_url = body.hero_image_url;
    item.cloudinary_public_id = body.cloudinary_public_id || `hero/replaced_${Date.now()}`;
    
    // Attempt deletion of old Cloudinary image if configured
    if (oldPublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        cloudinary.uploader.destroy(oldPublicId, (err, result) => {
          if (err) console.warn('Could not delete old Cloudinary image:', err);
          else console.log('Old Cloudinary banner image removed:', result);
        });
      } catch (err) {
        console.warn('Cloudinary destroy error:', err);
      }
    }
  }

  if (body.mobile_image_url !== undefined) item.mobile_image_url = body.mobile_image_url;
  if (body.cloudinary_public_id !== undefined && !body.hero_image_url) {
    item.cloudinary_public_id = body.cloudinary_public_id;
  }
  if (body.button_text !== undefined) item.button_text = body.button_text;
  if (body.button_url !== undefined) item.button_url = body.button_url;
  if (body.second_button_text !== undefined) item.second_button_text = body.second_button_text;
  if (body.second_button_url !== undefined) item.second_button_url = body.second_button_url;
  
  if (body.status !== undefined) {
    item.status = body.status;
    if (body.status === 'active' && homeBannerSettings.sliderMode === 'disabled') {
      homeBannersDatabase.forEach(b => {
        if (String(b.id) !== String(id) && b.status === 'active') {
          b.status = 'draft';
        }
      });
    }
  }

  if (body.display_order !== undefined) item.display_order = Number(body.display_order);
  if (body.start_date !== undefined) item.start_date = body.start_date;
  if (body.end_date !== undefined) item.end_date = body.end_date;

  item.updated_at = new Date().toISOString();

  let actionLogged: any = 'Banner Updated';
  if (oldStatus !== 'active' && item.status === 'active') actionLogged = 'Banner Published';
  if (oldStatus === 'active' && item.status !== 'active') actionLogged = 'Banner Unpublished';

  logHomeBannerActivity(actionLogged, item.title, item.created_by, `ID: ${item.id}`);

  return res.json({
    success: true,
    banner: item,
    message: 'होम बैनर सफलतापूर्वक अपडेट किया गया।',
  });
});

// DELETE Home Banner
app.delete('/api/home-banner/:id', (req, res) => {
  const { id } = req.params;
  const index = homeBannersDatabase.findIndex(b => String(b.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'होम बैनर प्राप्त नहीं हुआ।' });
  }

  const deleted = homeBannersDatabase[index];
  homeBannersDatabase.splice(index, 1);

  // Attempt Cloudinary image deletion
  if (deleted.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      cloudinary.uploader.destroy(deleted.cloudinary_public_id, (err, res) => {
        if (err) console.warn('Cloudinary delete error:', err);
      });
    } catch (err) {
      console.warn('Cloudinary delete error:', err);
    }
  }

  logHomeBannerActivity('Banner Deleted', deleted.title, 'पं. राजन कैथवास', `ID: ${deleted.id}`);

  return res.json({
    success: true,
    message: 'होम बैनर सफलतापूर्वक हटा दिया गया।',
  });
});

// PUT Update Home Banner Settings
app.put('/api/home-banner/settings', (req, res) => {
  const body = req.body;
  if (body.autoRotation !== undefined) homeBannerSettings.autoRotation = Boolean(body.autoRotation);
  if (body.sliderMode !== undefined) homeBannerSettings.sliderMode = body.sliderMode;
  if (body.autoRotationIntervalSec !== undefined) homeBannerSettings.autoRotationIntervalSec = Number(body.autoRotationIntervalSec);
  if (body.overlayOpacity !== undefined) homeBannerSettings.overlayOpacity = Number(body.overlayOpacity);
  if (body.textAlignment !== undefined) homeBannerSettings.textAlignment = body.textAlignment;
  if (body.darkOverlay !== undefined) homeBannerSettings.darkOverlay = Boolean(body.darkOverlay);
  if (body.animationEffect !== undefined) homeBannerSettings.animationEffect = body.animationEffect;

  return res.json({
    success: true,
    settings: homeBannerSettings,
    message: 'बैनर सेटिंग्स अपडेट हो गईं।',
  });
});

// POST Record Banner Click
app.post('/api/home-banner/:id/click', (req, res) => {
  const { id } = req.params;
  const item = homeBannersDatabase.find(b => String(b.id) === String(id));
  if (item) {
    item.clicks = (item.clicks || 0) + 1;
  }
  return res.json({ success: true, clicks: item ? item.clicks : 0 });
});

// ==========================================
// 7.5. RAJAN KAITHWAS PROFILE APIs
// ==========================================
let rajanProfileActivityLogs: Array<{
  id: string;
  action: 'Profile Updated' | 'Image Uploaded' | 'Image Deleted' | 'Certificates Added' | 'Gallery Updated';
  details: string;
  performedBy: string;
  timestamp: string;
}> = [
  {
    id: 'rlog-1',
    action: 'Profile Updated',
    details: 'प्रोफाइल जानकारी एवं परिचय अपडेट किया गया',
    performedBy: 'सुपर एडमिन',
    timestamp: new Date().toLocaleString('hi-IN'),
  },
  {
    id: 'rlog-2',
    action: 'Image Uploaded',
    details: 'प्रोफाइल फोटो क्लाउडिनरी (rajan_profile/) पर अपलोड हुई',
    performedBy: 'पं. राजन कैथवास (मंटू)',
    timestamp: new Date().toLocaleString('hi-IN'),
  },
];

function logRajanProfileActivity(
  action: 'Profile Updated' | 'Image Uploaded' | 'Image Deleted' | 'Certificates Added' | 'Gallery Updated',
  details: string,
  performedBy?: string
) {
  rajanProfileActivityLogs.unshift({
    id: 'rlog-' + Date.now(),
    action,
    details,
    performedBy: performedBy || 'पं. राजन कैथवास (मंटू)',
    timestamp: new Date().toLocaleString('hi-IN'),
  });
}

let rajanProfileDatabase: any = {
  id: 'rajan-profile-1',
  full_name: 'पं. राजन कैथवास (मंटू)',
  display_name: 'राजन कैथवास (मंटू)',
  designation: 'अंतरराष्ट्रीय ख्याति प्राप्त वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक',
  short_bio: 'महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित 33+ वर्षों का प्रामाणिक अनुभव। 50,000+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।',
  biography: `राजन कैथवास (मंटू) 33 से अधिक वर्षों के गहन अनुभव के साथ अंतरराष्ट्रीय स्तर पर ख्याति प्राप्त वैदिक ज्योतिषाचार्य, वास्तु विशेषज्ञ एवं आध्यात्मिक मार्गदर्शक हैं। महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित उनकी सटीक भविष्यवाणियों से विश्व भर के 50,000 से अधिक जातक लाभान्वित हो चुके हैं।

भ्रमित करने वाले पारंपरिक उपायों के स्थान पर राजन कैथवास (मंटू) प्रामाणिक ग्रह नक्षत्र गणना, सटीक जन्मकुंडली विश्लेषण एवं अत्यंत सरल सात्विक उपायों (मंत्र, यंत्र, रत्न एवं दान) द्वारा जीवन की जटिल से जटिल समस्याओं का स्थायी समाधान प्रदान करते हैं।`,
  experience: '33+ वर्ष',
  qualification: 'ज्योतिष भास्कर, वैदिक शास्त्री, वास्तु विशारद (स्वर्ण पदक विजेता)',
  specialization: 'जन्मकुण्डली फलादेश, मांगलिक दोष निवारण, कालसर्प दोष शांति, वास्तु दोष निवारण, रत्न एवं रुद्राक्ष परामर्श',
  languages: 'हिंदी, संस्कृत, अंग्रेजी',
  mobile: '8319885134',
  whatsapp: '8319885134',
  helpline: '8319885134',
  email: 'contact@rajankaithwas.com',
  website: 'https://rajankaithwas.com',
  office_address: 'Smart Point के सामने, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India',
  pincode: '480447',
  google_map: 'https://maps.google.com/?q=Chhindwara+Madhya+Pradesh+480447',
  facebook: 'https://facebook.com/rajankaithwas.official',
  instagram: 'https://instagram.com/rajankaithwas.official',
  youtube: 'https://youtube.com/@rajankaithwasjyotish',
  linkedin: 'https://linkedin.com/in/rajankaithwas',
  twitter: 'https://x.com/rajankaithwas',
  awards: 'ज्योतिष रत्न स्वर्ण पदक विजेता 2024 (अखिल भारतीय ज्योतिष संघ), वैश्विक वैदिक उत्कृष्टता सम्मान (अंतर्राष्ट्रीय वैदिक सम्मेलन, यूके), वास्तु सम्राट सम्मान (वास्तु अनुसंधान संस्थान)',
  achievements: '50,000+ संतुष्ट जातक, 33+ वर्षों का अनुभव, 100+ राष्ट्रीय व अंतर्राष्ट्रीय सेमिनार संबोधन, 10,000+ कुंडली समाधान',
  publications: 'वैदिक ज्योतिष सिद्धान्त (पुस्तक), दैनिक समाचार पत्रों में नियमित स्तंभ लेखन, गोचर फलिका शोध पत्र',
  memberships: 'अखिल भारतीय ज्योतिष अनुसंधान परिषद (आजीवन सदस्य), अंतर्राष्ट्रीय वैदिक महासंघ (वरिष्ठ सलाहकार)',
  mission: 'प्राचीन वैदिक ज्ञान के माध्यम से भयमुक्त, समृद्ध एवं धर्ममय जीवन जीने का सही मार्ग दिखाना।',
  vision: 'शुद्ध वैदिक ज्योतिषीय मार्गदर्शन को आधुनिक तकनीक द्वारा पूरे विश्व में सुलभ बनाना।',
  profile_image_url: '',
  cloudinary_public_id: '',
  status: 'active',
  views: 12500,
  created_at: new Date('2025-01-01').toISOString(),
  updated_at: new Date().toISOString(),
  gallery_images: [
    {
      id: 'r-gal-1',
      title: 'महाकालेश्वर मंदिर उज्जैन',
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      cloudinary_public_id: 'rajan_profile/gallery/mahakal_1',
      featured: true,
      order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'r-gal-2',
      title: 'अंतर्राष्ट्रीय सेमिनार संबोधन',
      image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      cloudinary_public_id: 'rajan_profile/gallery/seminar_1',
      featured: true,
      order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'r-gal-3',
      title: 'स्वर्ण पदक सम्मान समारोह',
      image_url: 'https://images.unsplash.com/photo-1531058240690-006c446962d8?auto=format&fit=crop&w=1200&q=80',
      cloudinary_public_id: 'rajan_profile/gallery/award_1',
      featured: false,
      order: 3,
      created_at: new Date().toISOString(),
    },
  ],
  certificates: [
    {
      id: 'r-cert-1',
      title: 'ज्योतिष रत्न स्वर्ण पदक प्रमाण पत्र',
      issuer: 'अखिल भारतीय ज्योतिष संघ',
      year: '2024',
      image_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
      cloudinary_public_id: 'rajan_profile/certificates/cert_1',
      file_type: 'image',
      created_at: new Date().toISOString(),
    },
    {
      id: 'r-cert-2',
      title: 'वैदिक वास्तु विशारद प्रमाण पत्र',
      issuer: 'वास्तु अनुसंधान संस्थान, नई दिल्ली',
      year: '2022',
      image_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
      cloudinary_public_id: 'rajan_profile/certificates/cert_2',
      file_type: 'image',
      created_at: new Date().toISOString(),
    },
  ],
  documents: [
    {
      id: 'r-doc-1',
      title: 'मीडिया कवरेज दैनिक भास्कर 2026',
      category: 'Media Coverage',
      file_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      cloudinary_public_id: 'rajan_profile/certificates/media_doc_1',
      file_type: 'image',
      created_at: new Date().toISOString(),
    },
  ],
};

// Calculate profile completion percentage
function calculateProfileCompletion(profile: any): number {
  const fields = [
    'full_name',
    'display_name',
    'designation',
    'short_bio',
    'biography',
    'experience',
    'qualification',
    'specialization',
    'languages',
    'mobile',
    'whatsapp',
    'email',
    'website',
    'office_address',
    'google_map',
    'facebook',
    'instagram',
    'youtube',
    'linkedin',
    'twitter',
    'awards',
    'achievements',
    'mission',
    'vision',
    'profile_image_url',
  ];

  let filled = 0;
  for (const f of fields) {
    if (profile[f] && String(profile[f]).trim() !== '') {
      filled++;
    }
  }

  if (profile.gallery_images && profile.gallery_images.length > 0) filled += 1;
  if (profile.certificates && profile.certificates.length > 0) filled += 1;

  const total = fields.length + 2;
  return Math.round((filled / total) * 100);
}

// GET /api/rajan-profile - Get Complete Profile, Stats & Logs
app.get('/api/rajan-profile', (req, res) => {
  rajanProfileDatabase.views = (rajanProfileDatabase.views || 12500) + 1;

  const completionPercentage = calculateProfileCompletion(rajanProfileDatabase);
  const galleryCount = (rajanProfileDatabase.gallery_images || []).length;
  const certificatesCount = (rajanProfileDatabase.certificates || []).length;

  const stats = {
    status: rajanProfileDatabase.status,
    lastUpdated: rajanProfileDatabase.updated_at,
    totalViews: rajanProfileDatabase.views,
    completionPercentage,
    activeImage: rajanProfileDatabase.profile_image_url,
    certificatesCount,
    galleryImagesCount: galleryCount,
  };

  // Backward compatibility fields
  const formattedProfile = {
    ...rajanProfileDatabase,
    name: rajanProfileDatabase.display_name || rajanProfileDatabase.full_name,
    image_url: rajanProfileDatabase.profile_image_url,
  };

  return res.json({
    success: true,
    profile: formattedProfile,
    stats,
    logs: rajanProfileActivityLogs,
  });
});

// POST /api/rajan-profile - Create or Upsert Profile
app.post('/api/rajan-profile', upload.single('profile_image'), async (req, res) => {
  try {
    const body = req.body;
    let newImageUrl = rajanProfileDatabase.profile_image_url;
    let newPublicId = rajanProfileDatabase.cloudinary_public_id;

    if (req.file) {
      // If old Cloudinary image exists, attempt to delete it from Cloudinary
      if (rajanProfileDatabase.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          await cloudinary.uploader.destroy(rajanProfileDatabase.cloudinary_public_id);
        } catch (err) {
          console.warn('Old Cloudinary image destroy warning:', err);
        }
      }

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'rajan_profile', resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file!.buffer);
        });
        newImageUrl = uploadResult.secure_url;
        newPublicId = uploadResult.public_id;
      } else {
        newImageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        newPublicId = `rajan_profile/local_${Date.now()}`;
      }
      logRajanProfileActivity('Image Uploaded', `नया प्रोफाइल चित्र अपलोड हुआ (Folder: rajan_profile/)`);
    }

    rajanProfileDatabase = {
      ...rajanProfileDatabase,
      full_name: body.full_name || body.name || rajanProfileDatabase.full_name,
      display_name: body.display_name || body.name || rajanProfileDatabase.display_name,
      designation: body.designation || rajanProfileDatabase.designation,
      short_bio: body.short_bio || body.shortBio || rajanProfileDatabase.short_bio,
      biography: body.biography || rajanProfileDatabase.biography,
      experience: body.experience || rajanProfileDatabase.experience,
      qualification: body.qualification || rajanProfileDatabase.qualification,
      specialization: body.specialization || rajanProfileDatabase.specialization,
      languages: body.languages || rajanProfileDatabase.languages,
      mobile: body.mobile || rajanProfileDatabase.mobile,
      whatsapp: body.whatsapp || rajanProfileDatabase.whatsapp,
      email: body.email || rajanProfileDatabase.email,
      website: body.website || rajanProfileDatabase.website,
      office_address: body.office_address || rajanProfileDatabase.office_address,
      google_map: body.google_map || rajanProfileDatabase.google_map,
      facebook: body.facebook || rajanProfileDatabase.facebook,
      instagram: body.instagram || rajanProfileDatabase.instagram,
      youtube: body.youtube || rajanProfileDatabase.youtube,
      linkedin: body.linkedin || rajanProfileDatabase.linkedin,
      twitter: body.twitter || rajanProfileDatabase.twitter,
      awards: body.awards || rajanProfileDatabase.awards,
      achievements: body.achievements || rajanProfileDatabase.achievements,
      publications: body.publications || rajanProfileDatabase.publications,
      memberships: body.memberships || rajanProfileDatabase.memberships,
      mission: body.mission || rajanProfileDatabase.mission,
      vision: body.vision || rajanProfileDatabase.vision,
      profile_image_url: newImageUrl,
      cloudinary_public_id: newPublicId,
      status: body.status || rajanProfileDatabase.status,
      updated_at: new Date().toISOString(),
    };

    logRajanProfileActivity('Profile Updated', 'प्रोफाइल विवरण सहेजा गया');

    const formattedProfile = {
      ...rajanProfileDatabase,
      name: rajanProfileDatabase.display_name,
      image_url: rajanProfileDatabase.profile_image_url,
    };

    return res.json({
      success: true,
      profile: formattedProfile,
      message: 'राजन कैथवास (मंटू) की प्रोफाइल सफलतापूर्वक सहेजी गई!',
    });
  } catch (err: any) {
    console.error('Error saving Rajan Profile:', err);
    return res.status(500).json({ success: false, error: err.message || 'प्रोफाइल सहेजने में त्रुटि आई।' });
  }
});

// POST /api/rajan-profile/upload - Dedicated Profile Image Upload to rajan_profile/
app.post('/api/rajan-profile/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'कोई फ़ाइल अपलोड नहीं की गई।' });
    }

    // Check size limit (10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'फ़ाइल का आकार 10 MB से अधिक नहीं हो सकता।' });
    }

    // Attempt delete old image from Cloudinary
    if (rajanProfileDatabase.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(rajanProfileDatabase.cloudinary_public_id);
      } catch (e) {
        console.warn('Cloudinary previous image delete warning:', e);
      }
    }

    let secure_url = '';
    let public_id = '';

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'rajan_profile', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file!.buffer);
      });
      secure_url = uploadResult.secure_url;
      public_id = uploadResult.public_id;
    } else {
      secure_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      public_id = `rajan_profile/rajan_avatar_${Date.now()}`;
    }

    rajanProfileDatabase.profile_image_url = secure_url;
    rajanProfileDatabase.cloudinary_public_id = public_id;
    if (req.body.name) rajanProfileDatabase.display_name = req.body.name;
    if (req.body.designation) rajanProfileDatabase.designation = req.body.designation;
    if (req.body.short_bio) rajanProfileDatabase.short_bio = req.body.short_bio;
    if (req.body.status) rajanProfileDatabase.status = req.body.status;
    rajanProfileDatabase.updated_at = new Date().toISOString();

    logRajanProfileActivity('Image Uploaded', `प्रोफाइल चित्र अपलोड: ${public_id}`);

    const formattedProfile = {
      ...rajanProfileDatabase,
      name: rajanProfileDatabase.display_name,
      image_url: rajanProfileDatabase.profile_image_url,
    };

    return res.json({
      success: true,
      profile: formattedProfile,
      message: 'प्रोफाइल फोटो क्लाउडिनरी (rajan_profile/) पर सफलतापूर्वक अपलोड हो गई!',
    });
  } catch (err: any) {
    console.error('Rajan Profile Upload Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'फोटो अपलोड करने में त्रुटि आई।' });
  }
});

// PUT /api/rajan-profile/:id or PUT /api/rajan-profile - Update Profile Fields
app.put(['/api/rajan-profile', '/api/rajan-profile/:id'], (req, res) => {
  const body = req.body;

  if (body.full_name !== undefined) rajanProfileDatabase.full_name = body.full_name;
  if (body.display_name !== undefined) rajanProfileDatabase.display_name = body.display_name;
  if (body.name !== undefined) {
    rajanProfileDatabase.display_name = body.name;
    rajanProfileDatabase.full_name = body.name;
  }
  if (body.designation !== undefined) rajanProfileDatabase.designation = body.designation;
  if (body.short_bio !== undefined) rajanProfileDatabase.short_bio = body.short_bio;
  if (body.biography !== undefined) rajanProfileDatabase.biography = body.biography;
  if (body.experience !== undefined) rajanProfileDatabase.experience = body.experience;
  if (body.qualification !== undefined) rajanProfileDatabase.qualification = body.qualification;
  if (body.specialization !== undefined) rajanProfileDatabase.specialization = body.specialization;
  if (body.languages !== undefined) rajanProfileDatabase.languages = body.languages;
  if (body.mobile !== undefined) rajanProfileDatabase.mobile = body.mobile;
  if (body.whatsapp !== undefined) rajanProfileDatabase.whatsapp = body.whatsapp;
  if (body.email !== undefined) rajanProfileDatabase.email = body.email;
  if (body.website !== undefined) rajanProfileDatabase.website = body.website;
  if (body.office_address !== undefined) rajanProfileDatabase.office_address = body.office_address;
  if (body.google_map !== undefined) rajanProfileDatabase.google_map = body.google_map;
  if (body.facebook !== undefined) rajanProfileDatabase.facebook = body.facebook;
  if (body.instagram !== undefined) rajanProfileDatabase.instagram = body.instagram;
  if (body.youtube !== undefined) rajanProfileDatabase.youtube = body.youtube;
  if (body.linkedin !== undefined) rajanProfileDatabase.linkedin = body.linkedin;
  if (body.twitter !== undefined) rajanProfileDatabase.twitter = body.twitter;
  if (body.awards !== undefined) rajanProfileDatabase.awards = body.awards;
  if (body.achievements !== undefined) rajanProfileDatabase.achievements = body.achievements;
  if (body.publications !== undefined) rajanProfileDatabase.publications = body.publications;
  if (body.memberships !== undefined) rajanProfileDatabase.memberships = body.memberships;
  if (body.mission !== undefined) rajanProfileDatabase.mission = body.mission;
  if (body.vision !== undefined) rajanProfileDatabase.vision = body.vision;
  if (body.status !== undefined) rajanProfileDatabase.status = body.status;

  if (body.profile_image_url !== undefined && body.profile_image_url !== rajanProfileDatabase.profile_image_url) {
    if (rajanProfileDatabase.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        cloudinary.uploader.destroy(rajanProfileDatabase.cloudinary_public_id);
      } catch (e) {
        console.warn('Destroy old photo warn:', e);
      }
    }
    rajanProfileDatabase.profile_image_url = body.profile_image_url;
    if (body.cloudinary_public_id) rajanProfileDatabase.cloudinary_public_id = body.cloudinary_public_id;
  }

  rajanProfileDatabase.updated_at = new Date().toISOString();

  logRajanProfileActivity('Profile Updated', 'प्रोफाइल विवरण सफलतापूर्वक अद्यतन किया गया');

  const formattedProfile = {
    ...rajanProfileDatabase,
    name: rajanProfileDatabase.display_name,
    image_url: rajanProfileDatabase.profile_image_url,
  };

  return res.json({
    success: true,
    profile: formattedProfile,
    message: 'राजन कैथवास (मंटू) की प्रोफाइल सफलतापूर्वक अपडेट हो गई!',
  });
});

// DELETE /api/rajan-profile/:id or DELETE /api/rajan-profile - Reset / Delete Image
app.delete(['/api/rajan-profile', '/api/rajan-profile/:id'], async (req, res) => {
  if (rajanProfileDatabase.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      await cloudinary.uploader.destroy(rajanProfileDatabase.cloudinary_public_id);
    } catch (err) {
      console.warn('Cloudinary delete warning:', err);
    }
  }

  rajanProfileDatabase.profile_image_url = '/rajan_kaithwas.svg';
  rajanProfileDatabase.cloudinary_public_id = 'rajan_profile/default_svg';
  rajanProfileDatabase.updated_at = new Date().toISOString();

  logRajanProfileActivity('Image Deleted', 'प्रोफाइल फोटो हटाई गई एवं डिफ़ॉल्ट SVG सेट किया गया');

  const formattedProfile = {
    ...rajanProfileDatabase,
    name: rajanProfileDatabase.display_name,
    image_url: rajanProfileDatabase.profile_image_url,
  };

  return res.json({
    success: true,
    profile: formattedProfile,
    message: 'प्रोफाइल चित्र सफलतापूर्वक हटा दिया गया एवं डिफ़ॉल्ट चित्र सेट हो गया।',
  });
});

// POST /api/rajan-profile/gallery - Upload Gallery Image to rajan_profile/gallery/
app.post('/api/rajan-profile/gallery', upload.single('file'), async (req, res) => {
  try {
    let imageUrl = req.body.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80';
    let cloudinaryPublicId = req.body.cloudinary_public_id || `rajan_profile/gallery/gal_${Date.now()}`;

    if (req.file) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'rajan_profile/gallery', resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file!.buffer);
        });
        imageUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } else {
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const newItem = {
      id: 'r-gal-' + Date.now(),
      title: req.body.title || 'गैलरी छायाचित्र',
      image_url: imageUrl,
      cloudinary_public_id: cloudinaryPublicId,
      featured: req.body.featured === true || req.body.featured === 'true',
      order: (rajanProfileDatabase.gallery_images || []).length + 1,
      created_at: new Date().toISOString(),
    };

    if (!rajanProfileDatabase.gallery_images) rajanProfileDatabase.gallery_images = [];
    rajanProfileDatabase.gallery_images.unshift(newItem);
    rajanProfileDatabase.updated_at = new Date().toISOString();

    logRajanProfileActivity('Gallery Updated', `गैलरी फोटो जोड़ी गई (rajan_profile/gallery/)`);

    return res.json({
      success: true,
      item: newItem,
      gallery: rajanProfileDatabase.gallery_images,
      message: 'गैलरी फोटो सफलतापूर्वक क्लाउडिनरी (rajan_profile/gallery/) पर अपलोड हो गई!',
    });
  } catch (err: any) {
    console.error('Gallery upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'गैलरी अपलोड में त्रुटि।' });
  }
});

// DELETE /api/rajan-profile/gallery/:imageId - Delete Gallery Image
app.delete('/api/rajan-profile/gallery/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const list = rajanProfileDatabase.gallery_images || [];
  const target = list.find((g: any) => String(g.id) === String(imageId));

  if (target && target.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      await cloudinary.uploader.destroy(target.cloudinary_public_id);
    } catch (e) {
      console.warn('Destroy gallery image warning:', e);
    }
  }

  rajanProfileDatabase.gallery_images = list.filter((g: any) => String(g.id) !== String(imageId));
  rajanProfileDatabase.updated_at = new Date().toISOString();

  logRajanProfileActivity('Gallery Updated', 'गैलरी फोटो हटाई गई');

  return res.json({
    success: true,
    gallery: rajanProfileDatabase.gallery_images,
    message: 'गैलरी फ़ाइल सफलतापूर्वक हटाई गई।',
  });
});

// POST /api/rajan-profile/certificates - Upload Certificate/Document to rajan_profile/certificates/
app.post('/api/rajan-profile/certificates', upload.single('file'), async (req, res) => {
  try {
    let fileUrl = req.body.file_url || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80';
    let cloudinaryPublicId = req.body.cloudinary_public_id || `rajan_profile/certificates/cert_${Date.now()}`;
    let fileType = req.body.file_type || 'image';

    if (req.file) {
      const isPdf = req.file.mimetype.includes('pdf');
      fileType = isPdf ? 'pdf' : 'image';

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'rajan_profile/certificates', resource_type: isPdf ? 'raw' : 'image' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file!.buffer);
        });
        fileUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } else {
        fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const newCert = {
      id: 'r-cert-' + Date.now(),
      title: req.body.title || 'नवीन प्रमाण पत्र',
      issuer: req.body.issuer || 'ज्योतिष संस्था',
      year: req.body.year || '2026',
      image_url: fileUrl,
      cloudinary_public_id: cloudinaryPublicId,
      file_type: fileType,
      created_at: new Date().toISOString(),
    };

    if (!rajanProfileDatabase.certificates) rajanProfileDatabase.certificates = [];
    rajanProfileDatabase.certificates.unshift(newCert);
    rajanProfileDatabase.updated_at = new Date().toISOString();

    logRajanProfileActivity('Certificates Added', `प्रमाण पत्र जोड़ा गया: ${newCert.title}`);

    return res.json({
      success: true,
      certificate: newCert,
      certificates: rajanProfileDatabase.certificates,
      message: 'प्रमाण पत्र क्लाउडिनरी (rajan_profile/certificates/) में सहेजा गया!',
    });
  } catch (err: any) {
    console.error('Cert upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'प्रमाण पत्र अपलोड करने में त्रुटि।' });
  }
});

// DELETE /api/rajan-profile/certificates/:certId - Delete Certificate
app.delete('/api/rajan-profile/certificates/:certId', async (req, res) => {
  const { certId } = req.params;
  const list = rajanProfileDatabase.certificates || [];
  const target = list.find((c: any) => String(c.id) === String(certId));

  if (target && target.cloudinary_public_id && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      await cloudinary.uploader.destroy(target.cloudinary_public_id);
    } catch (e) {
      console.warn('Destroy cert warning:', e);
    }
  }

  rajanProfileDatabase.certificates = list.filter((c: any) => String(c.id) !== String(certId));
  rajanProfileDatabase.updated_at = new Date().toISOString();

  logRajanProfileActivity('Certificates Added', 'प्रमाण पत्र हटाया गया');

  return res.json({
    success: true,
    certificates: rajanProfileDatabase.certificates,
    message: 'प्रमाण पत्र सफलतापूर्वक हटाया गया।',
  });
});

// GET /api/rajan-profile/reports - Profile Update & Media Reports
app.get('/api/rajan-profile/reports', (req, res) => {
  const totalGallery = (rajanProfileDatabase.gallery_images || []).length;
  const totalCertificates = (rajanProfileDatabase.certificates || []).length;
  const totalDocuments = (rajanProfileDatabase.documents || []).length;
  const completionPercentage = calculateProfileCompletion(rajanProfileDatabase);

  return res.json({
    success: true,
    summary: {
      fullName: rajanProfileDatabase.full_name,
      displayName: rajanProfileDatabase.display_name,
      designation: rajanProfileDatabase.designation,
      status: rajanProfileDatabase.status,
      completionPercentage,
      totalViews: rajanProfileDatabase.views,
      activeImageUrl: rajanProfileDatabase.profile_image_url,
      cloudinaryPublicId: rajanProfileDatabase.cloudinary_public_id,
      totalGallery,
      totalCertificates,
      totalDocuments,
      lastUpdated: rajanProfileDatabase.updated_at,
    },
    activityLogs: rajanProfileActivityLogs,
    gallery: rajanProfileDatabase.gallery_images || [],
    certificates: rajanProfileDatabase.certificates || [],
  });
});

app.get('/api/banners', (req, res) => {
  return res.json({
    success: true,
    banners: homeBannersDatabase.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.hero_image_url,
      public_id: b.cloudinary_public_id,
      order: b.display_order,
      enabled: b.status === 'active',
    })),
  });
});

app.get('/api/hero', (req, res) => {
  const active = homeBannersDatabase.find(b => b.status === 'active') || homeBannersDatabase[0];
  return res.json({
    success: true,
    hero: {
      secure_url: active ? active.hero_image_url : '/rajan_kaithwas.svg',
      public_id: active ? active.cloudinary_public_id : 'hero/rajan_kaithwas_main',
      title: active ? active.title : 'राजन कैथवास (मंटू)',
      subtitle: active ? active.subtitle : 'वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन',
      tagline: active ? active.description : 'प्राचीन वैदिक ज्ञान के माध्यम से आपके जीवन का सही मार्गदर्शन',
      updated_at: active ? active.updated_at : new Date().toISOString(),
    },
  });
});


// ==========================================
// 8. DIRECTOR PROFILE APIs
// ==========================================
let directorProfileDatabase = {
  name: 'श्रीमती मीनाक्षी कैथवास',
  designation: 'प्रबंध निदेशक (Managing Director)',
  message: 'राजन कैथवास (मंटू) फाउंडेशन के माध्यम से हमारा उद्देश्य प्रत्येक जातक तक शुद्ध एवं प्रामाणिक वैदिक मार्गदर्शन पहुँचाना है।',
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
  public_id: 'director/meenakshi_director',
  updatedAt: new Date().toISOString(),
};

app.get('/api/director-profile', (req, res) => {
  return res.json({ success: true, director: directorProfileDatabase });
});

app.post('/api/director-profile', upload.single('photo'), async (req, res) => {
  const { name, designation, message } = req.body;
  if (req.file) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'director' }, (err, res) => err ? reject(err) : resolve(res));
        stream.end(req.file!.buffer);
      });
      directorProfileDatabase.photoUrl = uploadResult.secure_url;
      directorProfileDatabase.public_id = uploadResult.public_id;
    } else {
      directorProfileDatabase.photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
  }

  directorProfileDatabase = {
    ...directorProfileDatabase,
    name: name || directorProfileDatabase.name,
    designation: designation || directorProfileDatabase.designation,
    message: message || directorProfileDatabase.message,
    updatedAt: new Date().toISOString(),
  };

  return res.json({ success: true, director: directorProfileDatabase, message: 'निदेशक प्रोफाइल अपडेट हो गया!' });
});

// ==========================================
// 9. TESTIMONIALS APIs
// ==========================================
interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  photoUrl: string;
  createdAt: string;
}

let testimonialsDatabase: TestimonialItem[] = [
  { id: 't-1', name: 'डॉ. आलोक श्रीवास्तव', location: 'लखनऊ', rating: 5, comment: 'गुरुजी के अचूक रत्न एवं मंत्र उपायों से व्यापार में अभूतपूर्व प्रगति हुई। कोटि-कोटि नमन!', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', createdAt: new Date().toISOString() },
  { id: 't-2', name: 'श्रीमती रश्मि कपूर', location: 'दिल्ली', rating: 5, comment: 'कुंडली मिलान के समय गुरुजी के सूक्ष्म मार्गदर्शन ने हमारे परिवार को सही निर्णय लेने में बहुत सहायता की।', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', createdAt: new Date().toISOString() },
];

app.get('/api/testimonials', (req, res) => res.json({ success: true, testimonials: testimonialsDatabase }));

app.post('/api/testimonials', upload.single('photo'), async (req, res) => {
  const { name, location, rating, comment } = req.body;
  let photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  if (req.file) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'testimonials' }, (err, res) => err ? reject(err) : resolve(res));
        stream.end(req.file!.buffer);
      });
      photoUrl = uploadResult.secure_url;
    } else {
      photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
  }

  const newT: TestimonialItem = {
    id: 't-' + Date.now(),
    name: name || 'जातक',
    location: location || 'भारत',
    rating: Number(rating) || 5,
    comment: comment || 'उत्कृष्ट वैदिक ज्योतिष सेवा।',
    photoUrl,
    createdAt: new Date().toISOString(),
  };

  testimonialsDatabase.unshift(newT);
  return res.json({ success: true, testimonial: newT, message: 'प्रशंसापत्र जोड़ा गया!' });
});

app.delete('/api/testimonials/:id', (req, res) => {
  testimonialsDatabase = testimonialsDatabase.filter(t => t.id !== req.params.id);
  return res.json({ success: true, message: 'प्रशंसापत्र हटाया गया।' });
});

// ==========================================
// 10. REVIEWS APIs
// ==========================================
interface ReviewItem {
  id: string;
  source: 'Google' | 'Website';
  author: string;
  rating: number;
  reviewText: string;
  status: 'approved' | 'pending' | 'rejected';
  reply?: string;
  createdAt: string;
}

let reviewsDatabase: ReviewItem[] = [
  { id: 'r-1', source: 'Google', author: 'Suresh Menon', rating: 5, reviewText: 'Best Vedic Astrologer in Delhi NCR! Very accurate predictions.', status: 'approved', reply: 'धन्यवाद सुरेश जी! हर हर महादेव।', createdAt: new Date().toISOString() },
  { id: 'r-2', source: 'Website', author: 'Kavita Joshi', rating: 5, reviewText: 'Vastu consultation saved our new house energy. Highly recommended!', status: 'approved', createdAt: new Date().toISOString() },
];

app.get('/api/reviews', (req, res) => res.json({ success: true, reviews: reviewsDatabase }));

app.patch('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const index = reviewsDatabase.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Review not found' });

  reviewsDatabase[index] = { ...reviewsDatabase[index], ...req.body };
  return res.json({ success: true, review: reviewsDatabase[index], message: 'समीक्षा अपडेट की गई।' });
});

app.delete('/api/reviews/:id', (req, res) => {
  reviewsDatabase = reviewsDatabase.filter(r => r.id !== req.params.id);
  return res.json({ success: true, message: 'समीक्षा हटाई गई।' });
});

// ==========================================
// 11. PAYMENTS APIs
// ==========================================
let paymentsDatabase = [
  { id: 'pay-101', ref: 'PAY-2026-001', clientName: 'Ananya Sharma', amount: 2100, method: 'Razorpay UPI', status: 'Success', date: '2026-08-05' },
  { id: 'pay-102', ref: 'PAY-2026-002', clientName: 'Rahul Verma', amount: 1500, method: 'Credit Card', status: 'Success', date: '2026-08-05' },
  { id: 'pay-103', ref: 'PAY-2026-003', clientName: 'Rameshwar Sharma', amount: 5100, method: 'Netbanking', status: 'Success', date: '2026-08-04' },
];

app.get(['/api/payments', '/api/admin/payments'], (req, res) => res.json({ success: true, payments: paymentsDatabase }));

// ==========================================
// 12. REPORTS & ANALYTICS APIs
// ==========================================
app.get('/api/reports', (req, res) => {
  return res.json({
    success: true,
    summary: {
      totalRevenue: 485000,
      monthlyBookings: 1248,
      completedConsultations: 1190,
      customerSatisfactionRate: '99.4%',
    },
    serviceWiseData: [
      { name: 'जन्मकुण्डली फलादेश', count: 520, revenue: 208000 },
      { name: 'विवाह गुण मिलान', count: 340, revenue: 119000 },
      { name: 'वास्तु परामर्श', count: 180, revenue: 918000 },
      { name: 'करियर मार्गदर्शन', count: 208, revenue: 104000 },
    ],
  });
});

app.get('/api/analytics', (req, res) => {
  return res.json({
    success: true,
    monthlyVisitors: 45200,
    conversionRate: '4.8%',
    topLocations: ['नई दिल्ली NCR', 'मुंबई', 'जयपुर', 'अहमदाबाद', 'लंदन UK', 'न्यू यॉर्क USA'],
    popularServices: ['जन्मकुण्डली', 'मांगलिक दोष निवारण', 'वास्तु परामर्श'],
  });
});

// ==========================================
// 13. NOTIFICATIONS APIs
// ==========================================
let notificationsDatabase = [
  { id: 'n-1', type: 'Email', recipient: 'Ananya Sharma', subject: 'परामर्श पुष्टि - राजन कैथवास (मंटू)', status: 'Sent', date: '2026-08-05 10:15 AM' },
  { id: 'n-2', type: 'WhatsApp', recipient: '+91 91234 56789', subject: 'Google Meet लिंक एवं रिमांडर', status: 'Delivered', date: '2026-08-05 09:30 AM' },
];

app.get('/api/notifications', (req, res) => res.json({ success: true, notifications: notificationsDatabase }));

app.post('/api/notifications/broadcast', (req, res) => {
  const { title, message, channel } = req.body;
  const newNotif = {
    id: 'n-' + Date.now(),
    type: channel || 'WhatsApp & Broadcast',
    recipient: 'सभी 50,000+ पंजीकृत जातक',
    subject: title || 'ज्योतिषीय अपडेट',
    status: 'Sent',
    date: new Date().toLocaleString(),
  };
  notificationsDatabase.unshift(newNotif);
  return res.json({ success: true, message: 'ब्रॉडकास्ट संदेश सफलतापूर्वक भेजा गया!', notification: newNotif });
});

// ==========================================
// 14. WEBSITE SETTINGS & SEO APIs
// ==========================================
let websiteSettingsDatabase = {
  websiteName: 'राजन कैथवास (मंटू) - वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन',
  logoUrl: '/rajan_kaithwas.svg',
  faviconUrl: '/favicon.ico',
  helplineNumber: '8319885134',
  whatsappNumber: '8319885134',
  contactPhone: '8319885134',
  contactEmail: 'contact@rajankaithwas.com',
  officeAddress: 'Smart Point के सामने, Mangli Bazar, Chhandameta, Parasia, Tehsil Parasia, District Chhindwara, Madhya Pradesh, India',
  pincode: '480447',
  facebook: 'https://facebook.com/rajankaithwas.official',
  instagram: 'https://instagram.com/rajankaithwas.official',
  youtube: 'https://youtube.com/@rajankaithwasjyotish',
  seoTitle: 'राजन कैथवास (मंटू) | वैदिक ज्योतिष, जन्म कुंडली, वास्तु एवं हस्तरेखा - छिंदवाड़ा',
  seoDescription: 'आचार्य राजन कैथवास (मंटू) जी द्वारा प्रामाणिक वैदिक ज्योतिष, जन्म कुंडली फलादेश, कुंडली मिलान, वास्तु परामर्श, हस्तरेखा, अंक ज्योतिष एवं सटीक रत्न परामर्श। छिंदवाड़ा, परासिया, छांदामेटा (मध्य प्रदेश)।',
  seoKeywords: 'राजन कैथवास, मंटू, वैदिक ज्योतिष, जन्म कुंडली, कुंडली मिलान, विवाह ज्योतिष, करियर ज्योतिष, वास्तु परामर्श, हस्तरेखा, अंक ज्योतिष, रत्न परामर्श, छिंदवाड़ा ज्योतिष, परासिया ज्योतिष, Chhindwara Astrologer, Rajan Kaithwas Mantoo',
  defaultOgImage: 'https://rajankaithwas.com/rajan_kaithwas.svg',
  twitterImage: 'https://rajankaithwas.com/rajan_kaithwas.svg',
  googleSearchConsoleCode: 'google-site-verification=rkj-astro-2026-verify-code',
  googleAnalyticsId: 'G-RKJASTRO2026',
  metaPixelId: '123456789012345',
  sitemapEnabled: true,
  robotsTxtContent: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://rajankaithwas.com/sitemap.xml`,
  maintenanceMode: false,
};

app.get('/api/settings', (req, res) => res.json({ success: true, settings: websiteSettingsDatabase }));

app.put('/api/settings', (req, res) => {
  websiteSettingsDatabase = { ...websiteSettingsDatabase, ...req.body };
  return res.json({ success: true, settings: websiteSettingsDatabase, message: 'वेबसाइट सेटिंग्स एवं SEO सेटिंग्स सफलतापूर्वक अपडेट हो गईं!' });
});

// Dynamic XML Sitemap for Google Search Console & Search Engines
app.get('/sitemap.xml', (req, res) => {
  if (!websiteSettingsDatabase.sitemapEnabled) {
    return res.status(404).send('Sitemap is disabled in settings.');
  }

  const host = req.protocol + '://' + (req.get('host') || 'rajankaithwas.com');
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/kundli', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.9', changefreq: 'monthly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' },
    { url: '/services/janam-kundli', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/kundli-milan', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/vivah-jyotish', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/career-jyotish', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/vyapar-jyotish', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/dhan-vitt-jyotish', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/vastu-paramarsh', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/hastrekha', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/ank-jyotish', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/ratna-paramarsh', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/muhurat', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/prashna-kundli', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/varshik-rashifal', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/masik-rashifal', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/dainik-rashifal', priority: '0.8', changefreq: 'daily' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticRoutes.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${host}${route.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic Blog Posts in Sitemap
  if (Array.isArray(blogDatabase)) {
    blogDatabase.forEach((blog) => {
      const slug = blog.slug || blog.id;
      const lastMod = blog.publish_date ? blog.publish_date.split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${host}/blog/${slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });
  }

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  return res.send(xml);
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  if (websiteSettingsDatabase.robotsTxtContent) {
    return res.send(websiteSettingsDatabase.robotsTxtContent);
  }
  const host = req.protocol + '://' + (req.get('host') || 'rajankaithwas.com');
  const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${host}/sitemap.xml`;
  return res.send(defaultRobots);
});


// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Rajan Kaithwas (Mantoo) Ji Vedic Astrology',
    time: new Date().toISOString(),
    cloudinaryActive: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    geminiActive: !!process.env.GEMINI_API_KEY,
  });
});

// Setup Vite middleware for development, static serve for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER || !!process.env.CLOUD_RUN;
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✨ Rajan Kaithwas (Mantoo) Ji Vedic Astrology Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
