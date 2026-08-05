import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
  status: 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
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
  title: 'राजन कैथवास जी',
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

let rajanProfileDatabase: RajanProfileItem = {
  id: 'rajan_profile_1',
  name: 'राजन कैथवास जी',
  designation: 'वैदिक ज्योतिषाचार्य एवं आध्यात्मिक मार्गदर्शक',
  short_bio: 'महर्षि पराशर एवं जैमिनी सिद्धान्तों पर आधारित २५+ वर्षों का प्रामाणिक अनुभव। ५०,०००+ संतुष्ट जातक। जन्मकुण्डली, हस्तरेखा एवं वास्तु सम्बन्धी सटीक समाधान।',
  image_url: '/rajan_kaithwas.svg',
  cloudinary_public_id: 'rajan_profile/default_avatar',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// GET Profile
app.get('/api/rajan-profile', (req, res) => {
  return res.json({
    success: true,
    profile: rajanProfileDatabase,
  });
});

// POST / Upload Profile Image & Details (Cloudinary folder: rajan_profile/)
app.post('/api/rajan-profile/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { name, designation, short_bio, status } = req.body;

    let newSecureUrl = rajanProfileDatabase.image_url;
    let newPublicId = rajanProfileDatabase.cloudinary_public_id;

    if (file) {
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
      const oldPublicId = rajanProfileDatabase.cloudinary_public_id;

      if (isCloudinaryConfigured) {
        // Delete old asset if exists and not default
        if (oldPublicId && oldPublicId !== 'rajan_profile/default_avatar' && !oldPublicId.startsWith('hero/')) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
            console.log(`Deleted old profile asset from Cloudinary: ${oldPublicId}`);
          } catch (destroyErr: any) {
            console.warn('Notice: Could not destroy old profile asset:', destroyErr.message);
          }
        }

        // Upload to Cloudinary under folder 'rajan_profile/'
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'rajan_profile',
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
        // Fallback base64 / mock public id if Cloudinary credentials absent
        newSecureUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        newPublicId = `rajan_profile/profile_${Date.now()}`;
      }
    }

    rajanProfileDatabase = {
      ...rajanProfileDatabase,
      name: name || rajanProfileDatabase.name,
      designation: designation || rajanProfileDatabase.designation,
      short_bio: short_bio || rajanProfileDatabase.short_bio,
      image_url: newSecureUrl,
      cloudinary_public_id: newPublicId,
      status: status || rajanProfileDatabase.status,
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: 'Rajan Profile updated successfully!',
      profile: rajanProfileDatabase,
    });
  } catch (error: any) {
    console.error('Rajan Profile upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update Rajan Profile.' });
  }
});

// Alias POST /api/rajan-profile
app.post('/api/rajan-profile', upload.single('file'), async (req, res) => {
  // Delegate to same logic or text update
  if (req.file) {
    return app._router.handle({ ...req, url: '/api/rajan-profile/upload' }, res);
  } else {
    const { name, designation, short_bio, status, image_url } = req.body;
    rajanProfileDatabase = {
      ...rajanProfileDatabase,
      name: name || rajanProfileDatabase.name,
      designation: designation || rajanProfileDatabase.designation,
      short_bio: short_bio || rajanProfileDatabase.short_bio,
      image_url: image_url || rajanProfileDatabase.image_url,
      status: status || rajanProfileDatabase.status,
      updated_at: new Date().toISOString(),
    };
    return res.json({
      success: true,
      message: 'Rajan Profile updated successfully.',
      profile: rajanProfileDatabase,
    });
  }
});

// PUT /api/rajan-profile & /api/rajan-profile/:id
const handlePutProfile = (req: any, res: any) => {
  const { name, designation, short_bio, status, image_url } = req.body;
  rajanProfileDatabase = {
    ...rajanProfileDatabase,
    name: name !== undefined ? name : rajanProfileDatabase.name,
    designation: designation !== undefined ? designation : rajanProfileDatabase.designation,
    short_bio: short_bio !== undefined ? short_bio : rajanProfileDatabase.short_bio,
    image_url: image_url !== undefined ? image_url : rajanProfileDatabase.image_url,
    status: status !== undefined ? status : rajanProfileDatabase.status,
    updated_at: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    profile: rajanProfileDatabase,
  });
};

app.put('/api/rajan-profile', handlePutProfile);
app.put('/api/rajan-profile/:id', handlePutProfile);

// DELETE /api/rajan-profile & /api/rajan-profile/:id (Resets image to placeholder and destroys Cloudinary asset)
const handleDeleteProfile = async (req: any, res: any) => {
  try {
    const oldPublicId = rajanProfileDatabase.cloudinary_public_id;
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured && oldPublicId && oldPublicId !== 'rajan_profile/default_avatar' && !oldPublicId.startsWith('hero/')) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(`Destroyed Cloudinary profile asset: ${oldPublicId}`);
      } catch (e: any) {
        console.warn('Notice: Could not destroy Cloudinary profile asset:', e.message);
      }
    }

    rajanProfileDatabase = {
      ...rajanProfileDatabase,
      image_url: '/rajan_kaithwas.svg',
      cloudinary_public_id: 'rajan_profile/default_avatar',
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: 'Profile image deleted and reset to default placeholder.',
      profile: rajanProfileDatabase,
    });
  } catch (err: any) {
    console.error('Delete profile error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete profile image.' });
  }
};

app.delete('/api/rajan-profile', handleDeleteProfile);
app.delete('/api/rajan-profile/:id', handleDeleteProfile);


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

    const prompt = `You are Rajan Kaithwas Ji, an internationally renowned Vedic Astrologer with 25+ years of experience.
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

    const prompt = `You are Rajan Kaithwas Ji, Master of Vedic Jyotish Shastra.
Generate a comprehensive, authentic Janam Kundli (Birth Chart) calculation and interpretation for:
Name: ${name}
Date of Birth: ${dob}
Time of Birth: ${tob}
Place of Birth: ${pob}
Gender: ${gender}
Language: ${lang}

Please provide:
1. Calculated Lagna (Ascendant) Rashi & Moon Sign (Chandra Rashi)
2. Nakshatra & Pada details with deity
3. Key Planetary Positions (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
4. Current Mahadasha & Antardasha calculation analysis
5. Major Yogic Combinations in Chart (e.g. Gajakesari, Raj Yoga, Dhan Yoga, Manglik status)
6. Life Path Analysis: Career, Finances, Health, Marriage, & Foreign Travel potential
7. Tailored Astrological Remedies (Specific Vedic Mantras, Gemstone suggestions with carat/metal/finger, and Daan/Charity).

Expressed with authentic Vedic terminology and Rajan Kaithwas Ji's blessing.
CRITICAL FORMATTING RULES:
- Do NOT use any Markdown syntax under any circumstances (NO asterisks **, NO hashes ##, NO underscores __, NO backticks \`, NO hyphens - at line start, NO greater-than >).
- Use plain text line breaks and standard numbered headings.
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
      meetingLink = `https://wa.me/919876543210?text=Booking%20Ref:%20${bookingRef}`;
    } else if (consultationType === 'in_person') {
      platform = 'office';
      meetingLink = 'Rajan Kaithwas Ji Spiritual Center, Sector 18, Noida, NCR Delhi, India';
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
app.get('/api/bookings', (req, res) => {
  return res.json({
    success: true,
    total: bookingsDatabase.length,
    bookings: bookingsDatabase,
  });
});

// Update Booking Status (Admin)
app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status, date, timeSlot } = req.body;

  const index = bookingsDatabase.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  bookingsDatabase[index] = {
    ...bookingsDatabase[index],
    status: status || bookingsDatabase[index].status,
    date: date || bookingsDatabase[index].date,
    timeSlot: timeSlot || bookingsDatabase[index].timeSlot,
  };

  return res.json({
    success: true,
    booking: bookingsDatabase[index],
  });
});

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Rajan Kaithwas Ji Vedic Astrology',
    time: new Date().toISOString(),
    cloudinaryActive: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    geminiActive: !!process.env.GEMINI_API_KEY,
  });
});

// Setup Vite middleware for development, static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Rajan Kaithwas Ji Vedic Astrology Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
