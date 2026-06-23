-- ====================================================================
-- SUPABASE CODE DIRECTIVE: PORTFOLIO DATA & MEDIA SETUP SCRIPT
-- ====================================================================
-- Copy, paste, and run this entire script inside your Supabase 
-- SQL Editor (Dashboard -> SQL Editor -> New Query) to immediately 
-- configure your persistent cloud database and static bucket.

-- --------------------------------------------------------------------
-- 1. Create the Configuration Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Give the table a describing comment
COMMENT ON TABLE public.site_configs IS 'Holds dynamic content JSON payloads and administrator credentials configurations.';

-- --------------------------------------------------------------------
-- 2. Seed Default Site Content JSON Payload (Fallback Initial State)
-- --------------------------------------------------------------------
INSERT INTO public.site_configs (key, value)
VALUES (
    'site_content',
    '{
      "hero": {
        "badgeText": "FINE ART ACADEMY CERTIFIED TUTOR",
        "headingTextMain": "Unlock the ",
        "headingTextHighlight": "soul of your pencil",
        "headingTextSuffix": " and learn to see truly.",
        "subheadingText": "Sneha teaches classical drawing techniques, from direct charcoal portraiture to complex architectural line perspective, guiding students from tentative markings to confident, beautiful fine artistry.",
        "ctaPrimaryText": "Contact Sneha",
        "ctaSecondaryText": "View Portfolio",
        "teacherPhotoUrl": "/assets/sneha_photo.png",
        "underlayPhotoUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400",
        "sigQuote": "See, Shaded, Sculpted",
        "sigSub": "Traditional Medium, Studio 12"
      },
      "about": {
        "badgeText": "THE FOUNDRY OF TECHNIQUE",
        "title": "About Sneha Bansal",
        "paragraphs": [
          "Hello! I am Sneha, a traditional artist and visual discipline mentor based in India. Art is not a collection of happy accidents or unexplainable magic. It is a language of visual relationships, structural perspective, and careful tonal gradation.",
          "My teaching philosophy centers on systematic academic instruction. Whether you are an absolute beginner struggling to draw eyes that line up, or an experienced hobbyist wanting to elevate your portraits, I dismantle the visual world into clear, repeatable mathematical steps.",
          "By guiding you through sight-size triangulation, edge hierarchy refinement, and charcoal value mapping, we will rewrite the software of how you see. Let''s train your eye to see truly and your pencil to express with absolute precision."
        ],
        "experienceYears": "8+",
        "studentsMentored": "450+",
        "quote": "We do not learn to draw to replicate a photo. We learn to draw so we can translate how light rolls over a surface, and make a flat piece of paper breathe.",
        "avatarUrl": "/assets/sneha_photo.png",
        "authorName": "Sneha Bansal",
        "authorRole": "Academic Director, Kailaras, Morena, Madhya Pradesh, India"
      },
      "contact": {
        "badgeText": "START YOUR EDUCATION",
        "title": "Connect with Sneha Bansal",
        "description": "Have questions about group programs, specialized portfolio reviews, or personalized coaching? Fill out the portfolio inquiry form below and elevate your sketching foundations.",
        "phone": "+91 7562 224809",
        "email": "sneha@fineart-morena.com",
        "address": "Studio 12, Main Road, Kailaras, Morena, Madhya Pradesh, 476224, India",
        "infoCardText": "Based out of Kailaras, Morena, Sneha offers structural art training worldwide. Whether you prefer traditional paper workshops or live interactive screens, get structured answers.",
        "infoCardQuote": "Art is not just a collection of drawings. It is a systematic, lovely discipline of learning to see depth, space, and accurate value hierarchies.",
        "infoCardQuoteAuthor": "Sneha Bansal",
        "metricLeftVal": "24 Hour",
        "metricLeftLabel": "Typical Reply Time",
        "metricRightVal": "Global",
        "metricRightLabel": "India & International"
      },
      "gallery": [
        {
          "id": "art-1",
          "title": "Philosopher''s Wisdom",
          "category": "charcoal",
          "medium": "Compressed charcoal, raw vine willow, and white chalk on heavy Canson paper",
          "dimensions": "18\" x 24\"",
          "year": "2024",
          "imageUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
          "description": "A study in high chiaroscuro and skin textures. Drawn from a live model session in Siena, Italy. This drawing demonstrates how hard edge-lines can be dissolved entirely into shadow gradients to establish monumental physical volume."
        },
        {
          "id": "art-2",
          "title": "Cathedral of San Frediano",
          "category": "ink",
          "medium": "Iron gall ink, bamboo stylus, and dry-brush sepia washes on vintage paper",
          "dimensions": "12\" x 16\"",
          "year": "2023",
          "imageUrl": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=800",
          "description": "An architectural perspective study illustrating 3-point vanishing alignments. This piece showcases controlled hatching density to suggest ancient sun-baked stone and deep, dusty archway negative spaces."
        },
        {
          "id": "art-3",
          "title": "The Florentine Hand Study",
          "category": "charcoal",
          "medium": "Willow charcoal rods and graphite 4B accents on cream drawing rag",
          "dimensions": "16\" x 20\"",
          "year": "2024",
          "imageUrl": "https://images.unsplash.com/photo-1576016770956-debb63d900ef?auto=format&fit=crop&q=80&w=800",
          "description": "Anatomical study highlighting active hand tendons and structural joint foreshortening. A major focus here is the delicate gradation of light bouncing off the palm versus the dark backdrop shadows."
        }
      ],
      "studentShowcase": [
        {
          "id": "proj-1",
          "title": "Bargue Profile of Dante",
          "studentName": "Clarissa Montgomery",
          "durationInAcademy": "6 Weeks of Training",
          "level": "Beginner",
          "medium": "Academic Graphite (HB, 2B, 4B) on Strathmore heavy paper",
          "imageUrl": "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&q=80&w=800",
          "description": "A dedicated study in line-weight control and outline exactness, practicing Charles Bargue''s Sight-Size classical methodology of geometric simplification.",
          "teacherMentorshipNotes": "Clarissa started with zero formal drawing experience. By teaching her to squint and simplify complex contours into straight, angled vectors first, she overcame the fear of free-hand portraiture. Her precision in the forehead slope and nose contour is exceptional."
        }
      ]
    }'::jsonb
)
ON CONConflict(key) DO NOTHING;

-- --------------------------------------------------------------------
-- 3. Configure Table Row Level Security (RLS)
-- --------------------------------------------------------------------
-- Enable security policies on the site_configs table
ALTER TABLE public.site_configs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and public users to read configurations
DROP POLICY IF EXISTS "Allow public select access to site metadata" ON public.site_configs;
CREATE POLICY "Allow public select access to site metadata" 
ON public.site_configs 
FOR SELECT 
TO public, anon, authenticated
USING (true);

-- Allow authenticated or public clients to insert configurations
DROP POLICY IF EXISTS "Allow unrestricted write access for site admin" ON public.site_configs;
DROP POLICY IF EXISTS "Allow admin inserts to site configs" ON public.site_configs;
CREATE POLICY "Allow admin inserts to site configs" 
ON public.site_configs 
FOR INSERT 
TO public, anon, authenticated
WITH CHECK (true);

-- Allow authenticated or public clients to update configurations
DROP POLICY IF EXISTS "Allow admin updates to site configs" ON public.site_configs;
CREATE POLICY "Allow admin updates to site configs" 
ON public.site_configs 
FOR UPDATE 
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------------------
-- 4. Set Up public Supabase Storage Bucket ('portfolio')
-- --------------------------------------------------------------------
-- Inserts a registration for host-bucket 'portfolio' inside the public buckets list.
-- This ensures the bucket is activated.
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 5. Set Up Storage Bucket Policies
-- --------------------------------------------------------------------
-- Ensure storage tables allow operations for public/anonymous users 
-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Public Read Access for Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow administrative file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow administrative file changes" ON storage.objects;
DROP POLICY IF EXISTS "Allow administrative file deletes" ON storage.objects;

-- Policy A: Allow anyone to view and fetch uploaded images publicly
CREATE POLICY "Public Read Access for Images"
ON storage.objects FOR SELECT TO public, anon
USING (bucket_id = 'portfolio');

-- Policy B: Allow uploads and edits into the bucket 
CREATE POLICY "Allow administrative file uploads"
ON storage.objects FOR INSERT TO public, anon
WITH CHECK (bucket_id = 'portfolio');

-- Policy C: Allow editing files
CREATE POLICY "Allow administrative file changes"
ON storage.objects FOR UPDATE TO public, anon
USING (bucket_id = 'portfolio')
WITH CHECK (bucket_id = 'portfolio');

-- Policy D: Allow deleting files
CREATE POLICY "Allow administrative file deletes"
ON storage.objects FOR DELETE TO public, anon
USING (bucket_id = 'portfolio');

-- ====================================================================
-- FINISH: Setup script execution successful!
-- ====================================================================
