-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0013: Seed the 16 canonical LaunchSite templates.
--
-- This is idempotent:  ON CONFLICT (id) DO NOTHING means existing rows are
-- untouched; missing ones are inserted.  The DELETE at the bottom removes any
-- stale rows whose id is not in the curated set (e.g. old TemplateManager
-- entries that may have been written by an earlier version of the app).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO launchsite_templates
    (id, name, category, style, "desc", badge, features, accent, dark, light,
     url_slug, hero_tagline, hero_sub, business_name, type, sort_order)
VALUES
-- ── Hair Salon ───────────────────────────────────────────────────────────────
('luxe-atelier',
 'Luxe Atelier', 'Hair Salon', 'Elegant',
 'An elevated editorial look for high-end salons.',
 'popular', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'luxe-atelier',
 'Your hair, perfected.',
 'High-end styling for every occasion.',
 'Luxe Atelier', 'php', 10),

('maison-beaute',
 'Maison Beauté', 'Hair Salon', 'Luxury',
 'French-inspired luxury layout with warm tones.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'maison-beaute',
 'Où la beauté commence.',
 'Luxurious hair care in every detail.',
 'Maison Beauté', 'php', 20),

('sage-collective',
 'Sage Collective', 'Hair Salon', 'Minimal',
 'Clean, spacious minimal design with earthy tones.',
 'new', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'sage-collective',
 'Simplicity, beautifully styled.',
 'Mindful beauty, naturally.',
 'Sage Collective', 'php', 30),

('studio-bloom',
 'Studio Bloom', 'Hair Salon', 'Modern',
 'Vibrant modern layout with bold typographic sections.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'studio-bloom',
 'Where creativity blossoms.',
 'Bold cuts, bold colours.',
 'Studio Bloom', 'php', 40),

('petal-studio',
 'Petal Studio', 'Hair Salon', 'Feminine',
 'Soft florals and pastel tones for boutique salons.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'petal-studio',
 'Beauty in full bloom.',
 'Delicate. Feminine. Flawless.',
 'Petal Studio', 'php', 50),

('noir-studio',
 'Noir Studio', 'Hair Salon', 'Editorial',
 'Dark, cinematic design for avant-garde salons.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'noir-studio',
 'Hair as art.',
 'Cutting-edge editorial styling.',
 'Noir Studio', 'php', 60),

-- ── Barbershop ───────────────────────────────────────────────────────────────
('fresh-fades',
 'Fresh Fades', 'Barbershop', 'Modern',
 'Sharp, contemporary layout for modern barbers.',
 'popular', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'fresh-fades',
 'Always fresh. Always sharp.',
 'Your go-to spot for precision cuts.',
 'Fresh Fades', 'php', 70),

('gentlemans-club',
 'Gentleman''s Club', 'Barbershop', 'Classic',
 'Heritage-inspired dark wood tones and serif fonts.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'gentlemans-club',
 'Old-school cool. New-school cuts.',
 'Traditional craft. Modern results.',
 'Gentleman''s Club', 'php', 80),

('midnight-cuts',
 'Midnight Cuts', 'Barbershop', 'Bold',
 'Dark, dramatic layout with high-contrast visuals.',
 'new', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'midnight-cuts',
 'Cut above the rest.',
 'Bold cuts for bold men.',
 'Midnight Cuts', 'php', 90),

('razor-sharp',
 'Razor Sharp', 'Barbershop', 'Minimal',
 'Clean, minimalist design focused on conversions.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'razor-sharp',
 'Precision is everything.',
 'Where every detail matters.',
 'Razor Sharp', 'php', 100),

-- ── Nail Salon ───────────────────────────────────────────────────────────────
('chrome-nails',
 'Chrome Nails', 'Nail Salon', 'Modern',
 'Sleek, metallic-accented layout for modern studios.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'chrome-nails',
 'Your nails, elevated.',
 'Expert nail artistry in every detail.',
 'Chrome Nails', 'php', 110),

('luxe-nails',
 'Luxe Nails', 'Nail Salon', 'Elegant',
 'Refined, elegant template for luxury nail bars.',
 'popular', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'luxe-nails',
 'Indulge in perfection.',
 'Luxury nail care, redefined.',
 'Luxe Nails', 'php', 120),

('luxury-nails-spa',
 'Luxury Nails Spa', 'Nail Salon', 'Luxury',
 'Full-service spa feel with warm, opulent styling.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'luxury-nails-spa',
 'Treat yourself.',
 'Beauty and wellness in harmony.',
 'Luxury Nails Spa', 'php', 130),

('nail-bar-nyc',
 'Nail Bar NYC', 'Nail Salon', 'Urban',
 'Bold urban aesthetic inspired by city nail bars.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'nail-bar-nyc',
 'NYC nails. Worldwide vibes.',
 'Fast, fresh, fabulous.',
 'Nail Bar NYC', 'php', 140),

('pastel-pop',
 'Pastel Pop', 'Nail Salon', 'Playful',
 'Fun, colourful layout with a pop-art sensibility.',
 'new', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'pastel-pop',
 'Nails that pop.',
 'Fun colours, expert finish.',
 'Pastel Pop', 'php', 150),

('nail-salon-template-1',
 'Nail Studio', 'Nail Salon', 'Classic',
 'Timeless clean layout suitable for any nail salon.',
 '', '["Services","Gallery","Booking"]'::jsonb,
 '#a855f7', '#0a0b15', '#1c1d27',
 'nail-salon-template-1',
 'Classic beauty, always.',
 'The foundation of great nails.',
 'Nail Studio', 'php', 160)

ON CONFLICT (id) DO NOTHING;

-- Remove any stale templates not in the canonical 16.
-- This prevents old TemplateManager / JSON-sourced rows from polluting the catalog.
DELETE FROM launchsite_templates
WHERE id NOT IN (
    'luxe-atelier', 'maison-beaute', 'sage-collective', 'studio-bloom',
    'petal-studio', 'noir-studio',
    'fresh-fades', 'gentlemans-club', 'midnight-cuts', 'razor-sharp',
    'chrome-nails', 'luxe-nails', 'luxury-nails-spa', 'nail-bar-nyc',
    'pastel-pop', 'nail-salon-template-1'
);
