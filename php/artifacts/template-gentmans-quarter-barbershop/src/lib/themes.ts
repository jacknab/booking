export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    bg: string;
    bgSecondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    accentLight: string;
    card: string;
    cardHover: string;
    border: string;
    heroOverlay: string;
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonSecondary: string;
    buttonSecondaryHover: string;
    checkinBg: string;
    checkinCard: string;
    priceTag: string;
    divider: string;
    footerBg: string;
    footerText: string;
    navBg: string;
    navText: string;
    badge: string;
    badgeText: string;
  };
  fonts: { heading: string; body: string };
  heroImage: string;
  style: string;
}

const PEXELS_BARBER = 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=1920';
const PEXELS_SALON = 'https://images.pexels.com/photos/3993312/pexels-photo-3993312.jpeg?auto=compress&cs=tinysrgb&w=1920';
const PEXELS_MIRROR = 'https://images.pexels.com/photos/3993299/pexels-photo-3993299.jpeg?auto=compress&cs=tinysrgb&w=1920';
const PEXELS_DARK = 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920';
const PEXELS_CHAIR = 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1920';

export const themes: Theme[] = [
  // === ORIGINAL 15 ===
  {
    id: 'midnight-gold',
    name: 'Midnight & Gold',
    description: 'Dark luxury with gold accents',
    colors: { bg:'#0a0a0a',bgSecondary:'#141414',text:'#f5f5f5',textSecondary:'#a0a0a0',accent:'#d4a853',accentHover:'#e6bc6a',accentLight:'rgba(212,168,83,0.1)',card:'#1a1a1a',cardHover:'#222222',border:'#2a2a2a',heroOverlay:'rgba(0,0,0,0.6)',buttonPrimary:'#d4a853',buttonPrimaryHover:'#e6bc6a',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(212,168,83,0.1)',checkinBg:'#111111',checkinCard:'#1a1a1a',priceTag:'#d4a853',divider:'#d4a853',footerBg:'#050505',footerText:'#a0a0a0',navBg:'rgba(10,10,10,0.95)',navText:'#f5f5f5',badge:'#d4a853',badgeText:'#0a0a0a' },
    fonts: { heading:"'Playfair Display', serif", body:"'Inter', sans-serif" },
    heroImage: PEXELS_BARBER, style:'luxury',
  },
  {
    id: 'cream-heritage',
    name: 'Cream & Heritage',
    description: 'Warm cream tones with rich brown',
    colors: { bg:'#faf6f0',bgSecondary:'#f0ebe3',text:'#2c1810',textSecondary:'#6b4c3b',accent:'#8b4513',accentHover:'#a0522d',accentLight:'rgba(139,69,19,0.08)',card:'#ffffff',cardHover:'#faf6f0',border:'#e0d5c7',heroOverlay:'rgba(250,246,240,0.3)',buttonPrimary:'#8b4513',buttonPrimaryHover:'#a0522d',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(139,69,19,0.08)',checkinBg:'#f0ebe3',checkinCard:'#ffffff',priceTag:'#8b4513',divider:'#8b4513',footerBg:'#2c1810',footerText:'#d4c4b0',navBg:'rgba(250,246,240,0.95)',navText:'#2c1810',badge:'#8b4513',badgeText:'#faf6f0' },
    fonts: { heading:"'Playfair Display', serif", body:"'Lora', serif" },
    heroImage: PEXELS_SALON, style:'classic',
  },
  {
    id: 'slate-steel',
    name: 'Slate & Steel',
    description: 'Cool grays with steel blue accents',
    colors: { bg:'#1e293b',bgSecondary:'#0f172a',text:'#e2e8f0',textSecondary:'#94a3b8',accent:'#38bdf8',accentHover:'#7dd3fc',accentLight:'rgba(56,189,248,0.1)',card:'#334155',cardHover:'#3d4f66',border:'#475569',heroOverlay:'rgba(15,23,42,0.5)',buttonPrimary:'#38bdf8',buttonPrimaryHover:'#7dd3fc',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(56,189,248,0.1)',checkinBg:'#0f172a',checkinCard:'#1e293b',priceTag:'#38bdf8',divider:'#38bdf8',footerBg:'#020617',footerText:'#94a3b8',navBg:'rgba(30,41,59,0.95)',navText:'#e2e8f0',badge:'#38bdf8',badgeText:'#0f172a' },
    fonts: { heading:"'Montserrat', sans-serif", body:"'Open Sans', sans-serif" },
    heroImage: PEXELS_DARK, style:'modern',
  },
  {
    id: 'obsidian-copper',
    name: 'Obsidian & Copper',
    description: 'Deep black with warm copper highlights',
    colors: { bg:'#0c0c0c',bgSecondary:'#161616',text:'#ececec',textSecondary:'#8a8a8a',accent:'#c87533',accentHover:'#d4894a',accentLight:'rgba(200,117,51,0.1)',card:'#1c1c1c',cardHover:'#262626',border:'#333333',heroOverlay:'rgba(0,0,0,0.55)',buttonPrimary:'#c87533',buttonPrimaryHover:'#d4894a',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(200,117,51,0.1)',checkinBg:'#111111',checkinCard:'#1c1c1c',priceTag:'#c87533',divider:'#c87533',footerBg:'#060606',footerText:'#8a8a8a',navBg:'rgba(12,12,12,0.95)',navText:'#ececec',badge:'#c87533',badgeText:'#0c0c0c' },
    fonts: { heading:"'Cinzel', serif", body:"'Raleway', sans-serif" },
    heroImage: PEXELS_CHAIR, style:'industrial',
  },
  {
    id: 'ivory-emerald',
    name: 'Ivory & Emerald',
    description: 'Clean ivory with rich emerald green',
    colors: { bg:'#fffff0',bgSecondary:'#f5f5e8',text:'#1a1a1a',textSecondary:'#4a4a4a',accent:'#2d6a4f',accentHover:'#40916c',accentLight:'rgba(45,106,79,0.08)',card:'#ffffff',cardHover:'#f8f8f0',border:'#d4d4c8',heroOverlay:'rgba(255,255,240,0.2)',buttonPrimary:'#2d6a4f',buttonPrimaryHover:'#40916c',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(45,106,79,0.08)',checkinBg:'#f5f5e8',checkinCard:'#ffffff',priceTag:'#2d6a4f',divider:'#2d6a4f',footerBg:'#1b4332',footerText:'#d8e8dc',navBg:'rgba(255,255,240,0.95)',navText:'#1a1a1a',badge:'#2d6a4f',badgeText:'#fffff0' },
    fonts: { heading:"'DM Serif Display', serif", body:"'DM Sans', sans-serif" },
    heroImage: PEXELS_MIRROR, style:'classic',
  },
  {
    id: 'charcoal-crimson',
    name: 'Charcoal & Crimson',
    description: 'Dark charcoal with bold red accents',
    colors: { bg:'#1a1a1a',bgSecondary:'#111111',text:'#f0f0f0',textSecondary:'#999999',accent:'#dc2626',accentHover:'#ef4444',accentLight:'rgba(220,38,38,0.1)',card:'#252525',cardHover:'#2f2f2f',border:'#3a3a3a',heroOverlay:'rgba(0,0,0,0.55)',buttonPrimary:'#dc2626',buttonPrimaryHover:'#ef4444',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(220,38,38,0.1)',checkinBg:'#111111',checkinCard:'#252525',priceTag:'#dc2626',divider:'#dc2626',footerBg:'#0a0a0a',footerText:'#999999',navBg:'rgba(26,26,26,0.95)',navText:'#f0f0f0',badge:'#dc2626',badgeText:'#ffffff' },
    fonts: { heading:"'Bebas Neue', sans-serif", body:"'Roboto', sans-serif" },
    heroImage: PEXELS_BARBER, style:'bold',
  },
  {
    id: 'sand-turquoise',
    name: 'Sand & Turquoise',
    description: 'Desert sand with turquoise accents',
    colors: { bg:'#f4efe6',bgSecondary:'#e8e0d2',text:'#2d2a26',textSecondary:'#6b6560',accent:'#2a9d8f',accentHover:'#3ab5a5',accentLight:'rgba(42,157,143,0.08)',card:'#faf7f2',cardHover:'#f4efe6',border:'#d4cfc4',heroOverlay:'rgba(244,239,230,0.2)',buttonPrimary:'#2a9d8f',buttonPrimaryHover:'#3ab5a5',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(42,157,143,0.08)',checkinBg:'#e8e0d2',checkinCard:'#faf7f2',priceTag:'#2a9d8f',divider:'#2a9d8f',footerBg:'#2d2a26',footerText:'#c4bfb6',navBg:'rgba(244,239,230,0.95)',navText:'#2d2a26',badge:'#2a9d8f',badgeText:'#ffffff' },
    fonts: { heading:"'Cormorant Garamond', serif", body:"'Nunito', sans-serif" },
    heroImage: PEXELS_CHAIR, style:'tropical',
  },
  {
    id: 'noir-silver',
    name: 'Noir & Silver',
    description: 'Pure black with silver metallic',
    colors: { bg:'#000000',bgSecondary:'#0a0a0a',text:'#e8e8e8',textSecondary:'#808080',accent:'#c0c0c0',accentHover:'#d4d4d4',accentLight:'rgba(192,192,192,0.08)',card:'#141414',cardHover:'#1e1e1e',border:'#2a2a2a',heroOverlay:'rgba(0,0,0,0.5)',buttonPrimary:'#c0c0c0',buttonPrimaryHover:'#d4d4d4',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(192,192,192,0.08)',checkinBg:'#0a0a0a',checkinCard:'#141414',priceTag:'#c0c0c0',divider:'#c0c0c0',footerBg:'#000000',footerText:'#808080',navBg:'rgba(0,0,0,0.95)',navText:'#e8e8e8',badge:'#c0c0c0',badgeText:'#000000' },
    fonts: { heading:"'Space Grotesk', sans-serif", body:"'Inter', sans-serif" },
    heroImage: PEXELS_DARK, style:'minimal',
  },
  {
    id: 'walnut-brass',
    name: 'Walnut & Brass',
    description: 'Rich walnut wood with brass hardware',
    colors: { bg:'#3e2723',bgSecondary:'#2c1a17',text:'#f5e6d3',textSecondary:'#c4a882',accent:'#d4a843',accentHover:'#e0b955',accentLight:'rgba(212,168,67,0.1)',card:'#4e342e',cardHover:'#5d4037',border:'#6d4c41',heroOverlay:'rgba(46,26,23,0.4)',buttonPrimary:'#d4a843',buttonPrimaryHover:'#e0b955',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(212,168,67,0.1)',checkinBg:'#2c1a17',checkinCard:'#4e342e',priceTag:'#d4a843',divider:'#d4a843',footerBg:'#1a0e0c',footerText:'#c4a882',navBg:'rgba(62,39,35,0.95)',navText:'#f5e6d3',badge:'#d4a843',badgeText:'#2c1a17' },
    fonts: { heading:"'Merriweather', serif", body:"'Source Sans 3', sans-serif" },
    heroImage: PEXELS_SALON, style:'rustic',
  },
  {
    id: 'frost-navy',
    name: 'Frost & Navy',
    description: 'Icy white with deep navy blue',
    colors: { bg:'#f8fafc',bgSecondary:'#e2e8f0',text:'#0f172a',textSecondary:'#475569',accent:'#1e3a5f',accentHover:'#2a4f7f',accentLight:'rgba(30,58,95,0.08)',card:'#ffffff',cardHover:'#f1f5f9',border:'#cbd5e1',heroOverlay:'rgba(248,250,252,0.15)',buttonPrimary:'#1e3a5f',buttonPrimaryHover:'#2a4f7f',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(30,58,95,0.08)',checkinBg:'#e2e8f0',checkinCard:'#ffffff',priceTag:'#1e3a5f',divider:'#1e3a5f',footerBg:'#0f172a',footerText:'#94a3b8',navBg:'rgba(248,250,252,0.95)',navText:'#0f172a',badge:'#1e3a5f',badgeText:'#f8fafc' },
    fonts: { heading:"'Libre Baskerville', serif", body:"'Work Sans', sans-serif" },
    heroImage: PEXELS_MIRROR, style:'scandinavian',
  },
  {
    id: 'espresso-cream',
    name: 'Espresso & Cream',
    description: 'Rich espresso brown with cream',
    colors: { bg:'#2c1e14',bgSecondary:'#1f150e',text:'#faf0e6',textSecondary:'#c8b49a',accent:'#f5deb3',accentHover:'#faebd7',accentLight:'rgba(245,222,179,0.1)',card:'#3a2a1e',cardHover:'#4a3828',border:'#5a4a3a',heroOverlay:'rgba(31,21,14,0.4)',buttonPrimary:'#f5deb3',buttonPrimaryHover:'#faebd7',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(245,222,179,0.1)',checkinBg:'#1f150e',checkinCard:'#3a2a1e',priceTag:'#f5deb3',divider:'#f5deb3',footerBg:'#140c08',footerText:'#c8b49a',navBg:'rgba(44,30,20,0.95)',navText:'#faf0e6',badge:'#f5deb3',badgeText:'#2c1e14' },
    fonts: { heading:"'Cormorant Garamond', serif", body:"'Lato', sans-serif" },
    heroImage: PEXELS_BARBER, style:'rustic',
  },
  {
    id: 'graphite-amber',
    name: 'Graphite & Amber',
    description: 'Cool graphite with warm amber glow',
    colors: { bg:'#2d3436',bgSecondary:'#1e2526',text:'#f0f0f0',textSecondary:'#a0a8ab',accent:'#f59e0b',accentHover:'#fbbf24',accentLight:'rgba(245,158,11,0.1)',card:'#3a4244',cardHover:'#454e50',border:'#525b5e',heroOverlay:'rgba(30,37,38,0.5)',buttonPrimary:'#f59e0b',buttonPrimaryHover:'#fbbf24',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(245,158,11,0.1)',checkinBg:'#1e2526',checkinCard:'#3a4244',priceTag:'#f59e0b',divider:'#f59e0b',footerBg:'#141819',footerText:'#a0a8ab',navBg:'rgba(45,52,54,0.95)',navText:'#f0f0f0',badge:'#f59e0b',badgeText:'#1e2526' },
    fonts: { heading:"'Archivo Black', sans-serif", body:"'Archivo', sans-serif" },
    heroImage: PEXELS_DARK, style:'industrial',
  },
  {
    id: 'pearl-rosewood',
    name: 'Pearl & Rosewood',
    description: 'Soft pearl white with rosewood accents',
    colors: { bg:'#faf5f0',bgSecondary:'#f0e8e0',text:'#2d1f1a',textSecondary:'#6b5248',accent:'#8b2252',accentHover:'#a52a5e',accentLight:'rgba(139,34,82,0.08)',card:'#ffffff',cardHover:'#faf5f0',border:'#e0d4cc',heroOverlay:'rgba(250,245,240,0.2)',buttonPrimary:'#8b2252',buttonPrimaryHover:'#a52a5e',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(139,34,82,0.08)',checkinBg:'#f0e8e0',checkinCard:'#ffffff',priceTag:'#8b2252',divider:'#8b2252',footerBg:'#2d1f1a',footerText:'#d4c4b8',navBg:'rgba(250,245,240,0.95)',navText:'#2d1f1a',badge:'#8b2252',badgeText:'#faf5f0' },
    fonts: { heading:"'Cormorant Garamond', serif", body:"'Proza Libre', sans-serif" },
    heroImage: PEXELS_SALON, style:'art-deco',
  },
  {
    id: 'onyx-teal',
    name: 'Onyx & Teal',
    description: 'Deep onyx with vibrant teal',
    colors: { bg:'#121212',bgSecondary:'#0a0a0a',text:'#e0e0e0',textSecondary:'#888888',accent:'#14b8a6',accentHover:'#2dd4bf',accentLight:'rgba(20,184,166,0.1)',card:'#1e1e1e',cardHover:'#282828',border:'#333333',heroOverlay:'rgba(0,0,0,0.5)',buttonPrimary:'#14b8a6',buttonPrimaryHover:'#2dd4bf',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(20,184,166,0.1)',checkinBg:'#0a0a0a',checkinCard:'#1e1e1e',priceTag:'#14b8a6',divider:'#14b8a6',footerBg:'#050505',footerText:'#888888',navBg:'rgba(18,18,18,0.95)',navText:'#e0e0e0',badge:'#14b8a6',badgeText:'#121212' },
    fonts: { heading:"'Outfit', sans-serif", body:"'Outfit', sans-serif" },
    heroImage: PEXELS_CHAIR, style:'contemporary',
  },
  {
    id: 'linen-charcoal',
    name: 'Linen & Charcoal',
    description: 'Natural linen with charcoal accents',
    colors: { bg:'#f5f0e8',bgSecondary:'#ebe4d8',text:'#1a1a1a',textSecondary:'#555555',accent:'#333333',accentHover:'#4a4a4a',accentLight:'rgba(51,51,51,0.06)',card:'#faf7f2',cardHover:'#f5f0e8',border:'#d4ccc0',heroOverlay:'rgba(245,240,232,0.2)',buttonPrimary:'#333333',buttonPrimaryHover:'#4a4a4a',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(51,51,51,0.06)',checkinBg:'#ebe4d8',checkinCard:'#faf7f2',priceTag:'#333333',divider:'#333333',footerBg:'#1a1a1a',footerText:'#b0a898',navBg:'rgba(245,240,232,0.95)',navText:'#1a1a1a',badge:'#333333',badgeText:'#f5f0e8' },
    fonts: { heading:"'Fraunces', serif", body:"'DM Sans', sans-serif" },
    heroImage: PEXELS_MIRROR, style:'minimal',
  },

  // === NEW 10 DESIGNS ===
  {
    id: 'volcanic-ember',
    name: 'Volcanic & Ember',
    description: 'Deep volcanic black with fiery orange embers',
    colors: { bg:'#1a0a00',bgSecondary:'#0d0500',text:'#fff3e0',textSecondary:'#bf8060',accent:'#ff6d00',accentHover:'#ff9100',accentLight:'rgba(255,109,0,0.1)',card:'#2a1500',cardHover:'#3a2000',border:'#4a2a10',heroOverlay:'rgba(13,5,0,0.5)',buttonPrimary:'#ff6d00',buttonPrimaryHover:'#ff9100',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(255,109,0,0.1)',checkinBg:'#0d0500',checkinCard:'#2a1500',priceTag:'#ff6d00',divider:'#ff6d00',footerBg:'#050200',footerText:'#bf8060',navBg:'rgba(26,10,0,0.95)',navText:'#fff3e0',badge:'#ff6d00',badgeText:'#1a0a00' },
    fonts: { heading:"'Bebas Neue', sans-serif", body:"'Barlow', sans-serif" },
    heroImage: PEXELS_BARBER, style:'bold',
  },
  {
    id: 'arctic-fjord',
    name: 'Arctic & Fjord',
    description: 'Glacial white with deep Nordic blue',
    colors: { bg:'#f0f4f8',bgSecondary:'#d9e2ec',text:'#102a43',textSecondary:'#486581',accent:'#0c4a6e',accentHover:'#155e8b',accentLight:'rgba(12,74,110,0.08)',card:'#ffffff',cardHover:'#f0f4f8',border:'#bcccdc',heroOverlay:'rgba(240,244,248,0.15)',buttonPrimary:'#0c4a6e',buttonPrimaryHover:'#155e8b',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(12,74,110,0.08)',checkinBg:'#d9e2ec',checkinCard:'#ffffff',priceTag:'#0c4a6e',divider:'#0c4a6e',footerBg:'#102a43',footerText:'#829ab1',navBg:'rgba(240,244,248,0.95)',navText:'#102a43',badge:'#0c4a6e',badgeText:'#f0f4f8' },
    fonts: { heading:"'DM Serif Display', serif", body:"'Nunito Sans', sans-serif" },
    heroImage: PEXELS_MIRROR, style:'scandinavian',
  },
  {
    id: 'mahogany-whiskey',
    name: 'Mahogany & Whiskey',
    description: 'Rich mahogany wood with whiskey amber',
    colors: { bg:'#4a1c1c',bgSecondary:'#3a1212',text:'#fce4c8',textSecondary:'#c89a6e',accent:'#d4880f',accentHover:'#e09a20',accentLight:'rgba(212,136,15,0.1)',card:'#5a2828',cardHover:'#6a3535',border:'#7a4040',heroOverlay:'rgba(58,18,18,0.4)',buttonPrimary:'#d4880f',buttonPrimaryHover:'#e09a20',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(212,136,15,0.1)',checkinBg:'#3a1212',checkinCard:'#5a2828',priceTag:'#d4880f',divider:'#d4880f',footerBg:'#2a0808',footerText:'#c89a6e',navBg:'rgba(74,28,28,0.95)',navText:'#fce4c8',badge:'#d4880f',badgeText:'#3a1212' },
    fonts: { heading:"'Cinzel', serif", body:"'Crimson Text', serif" },
    heroImage: PEXELS_SALON, style:'luxury',
  },
  {
    id: 'concrete-moss',
    name: 'Concrete & Moss',
    description: 'Raw concrete gray with living moss green',
    colors: { bg:'#e8e4e0',bgSecondary:'#d4cfc8',text:'#2c2c2c',textSecondary:'#5a5a5a',accent:'#4a7c59',accentHover:'#5a946b',accentLight:'rgba(74,124,89,0.08)',card:'#f2efec',cardHover:'#e8e4e0',border:'#c4bfb8',heroOverlay:'rgba(232,228,224,0.2)',buttonPrimary:'#4a7c59',buttonPrimaryHover:'#5a946b',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(74,124,89,0.08)',checkinBg:'#d4cfc8',checkinCard:'#f2efec',priceTag:'#4a7c59',divider:'#4a7c59',footerBg:'#2c2c2c',footerText:'#a8a098',navBg:'rgba(232,228,224,0.95)',navText:'#2c2c2c',badge:'#4a7c59',badgeText:'#e8e4e0' },
    fonts: { heading:"'Sora', sans-serif", body:"'Sora', sans-serif" },
    heroImage: PEXELS_CHAIR, style:'contemporary',
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight & Sapphire',
    description: 'Deep midnight blue with sapphire brilliance',
    colors: { bg:'#0a1628',bgSecondary:'#060f1c',text:'#e8edf5',textSecondary:'#8899b3',accent:'#3b82f6',accentHover:'#60a5fa',accentLight:'rgba(59,130,246,0.1)',card:'#12233d',cardHover:'#1a3050',border:'#1e3a5f',heroOverlay:'rgba(6,15,28,0.5)',buttonPrimary:'#3b82f6',buttonPrimaryHover:'#60a5fa',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(59,130,246,0.1)',checkinBg:'#060f1c',checkinCard:'#12233d',priceTag:'#3b82f6',divider:'#3b82f6',footerBg:'#030810',footerText:'#8899b3',navBg:'rgba(10,22,40,0.95)',navText:'#e8edf5',badge:'#3b82f6',badgeText:'#0a1628' },
    fonts: { heading:"'Syne', sans-serif", body:"'Manrope', sans-serif" },
    heroImage: PEXELS_DARK, style:'modern',
  },
  {
    id: 'desert-sunset',
    name: 'Desert & Sunset',
    description: 'Warm desert sand with sunset coral',
    colors: { bg:'#fdf6ec',bgSecondary:'#f5e6d0',text:'#3d2b1f',textSecondary:'#7a6252',accent:'#e07a5f',accentHover:'#e89580',accentLight:'rgba(224,122,95,0.08)',card:'#fffaf2',cardHover:'#fdf6ec',border:'#e0d0bc',heroOverlay:'rgba(253,246,236,0.2)',buttonPrimary:'#e07a5f',buttonPrimaryHover:'#e89580',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(224,122,95,0.08)',checkinBg:'#f5e6d0',checkinCard:'#fffaf2',priceTag:'#e07a5f',divider:'#e07a5f',footerBg:'#3d2b1f',footerText:'#c8b8a8',navBg:'rgba(253,246,236,0.95)',navText:'#3d2b1f',badge:'#e07a5f',badgeText:'#fdf6ec' },
    fonts: { heading:"'Fraunces', serif", body:"'Karla', sans-serif" },
    heroImage: PEXELS_CHAIR, style:'tropical',
  },
  {
    id: 'thunder-platinum',
    name: 'Thunder & Platinum',
    description: 'Storm gray with platinum metallic sheen',
    colors: { bg:'#2d2d2d',bgSecondary:'#222222',text:'#f0f0f0',textSecondary:'#a0a0a0',accent:'#e5e4e2',accentHover:'#f0efed',accentLight:'rgba(229,228,226,0.08)',card:'#383838',cardHover:'#424242',border:'#4a4a4a',heroOverlay:'rgba(34,34,34,0.5)',buttonPrimary:'#e5e4e2',buttonPrimaryHover:'#f0efed',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(229,228,226,0.08)',checkinBg:'#222222',checkinCard:'#383838',priceTag:'#e5e4e2',divider:'#e5e4e2',footerBg:'#151515',footerText:'#a0a0a0',navBg:'rgba(45,45,45,0.95)',navText:'#f0f0f0',badge:'#e5e4e2',badgeText:'#2d2d2d' },
    fonts: { heading:"'Oswald', sans-serif", body:"'Source Sans 3', sans-serif" },
    heroImage: PEXELS_DARK, style:'industrial',
  },
  {
    id: 'sage-terracotta',
    name: 'Sage & Terracotta',
    description: 'Muted sage green with warm terracotta',
    colors: { bg:'#f4f1eb',bgSecondary:'#e8e3d9',text:'#2d2a24',textSecondary:'#6b6558',accent:'#c4724e',accentHover:'#d48560',accentLight:'rgba(196,114,78,0.08)',card:'#faf8f5',cardHover:'#f4f1eb',border:'#d4cec2',heroOverlay:'rgba(244,241,235,0.2)',buttonPrimary:'#c4724e',buttonPrimaryHover:'#d48560',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(196,114,78,0.08)',checkinBg:'#e8e3d9',checkinCard:'#faf8f5',priceTag:'#c4724e',divider:'#c4724e',footerBg:'#2d2a24',footerText:'#b0a898',navBg:'rgba(244,241,235,0.95)',navText:'#2d2a24',badge:'#c4724e',badgeText:'#f4f1eb' },
    fonts: { heading:"'Lora', serif", body:"'Nunito', sans-serif" },
    heroImage: PEXELS_SALON, style:'rustic',
  },
  {
    id: 'neon-carbon',
    name: 'Neon & Carbon',
    description: 'Carbon fiber black with electric neon green',
    colors: { bg:'#0a0a0a',bgSecondary:'#050505',text:'#e8e8e8',textSecondary:'#666666',accent:'#39ff14',accentHover:'#5fff3a',accentLight:'rgba(57,255,20,0.08)',card:'#151515',cardHover:'#1e1e1e',border:'#2a2a2a',heroOverlay:'rgba(5,5,5,0.5)',buttonPrimary:'#39ff14',buttonPrimaryHover:'#5fff3a',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(57,255,20,0.08)',checkinBg:'#050505',checkinCard:'#151515',priceTag:'#39ff14',divider:'#39ff14',footerBg:'#000000',footerText:'#666666',navBg:'rgba(10,10,10,0.95)',navText:'#e8e8e8',badge:'#39ff14',badgeText:'#0a0a0a' },
    fonts: { heading:"'Orbitron', sans-serif", body:"'Rajdhani', sans-serif" },
    heroImage: PEXELS_BARBER, style:'retro',
  },
  {
    id: 'porcelain-ink',
    name: 'Porcelain & Ink',
    description: 'Delicate porcelain white with ink black accents',
    colors: { bg:'#faf8f5',bgSecondary:'#f0ece6',text:'#1a1a1a',textSecondary:'#5a5a5a',accent:'#1a1a1a',accentHover:'#333333',accentLight:'rgba(26,26,26,0.05)',card:'#ffffff',cardHover:'#faf8f5',border:'#e0dcd4',heroOverlay:'rgba(250,248,245,0.15)',buttonPrimary:'#1a1a1a',buttonPrimaryHover:'#333333',buttonSecondary:'transparent',buttonSecondaryHover:'rgba(26,26,26,0.05)',checkinBg:'#f0ece6',checkinCard:'#ffffff',priceTag:'#1a1a1a',divider:'#1a1a1a',footerBg:'#1a1a1a',footerText:'#b0aca4',navBg:'rgba(250,248,245,0.95)',navText:'#1a1a1a',badge:'#1a1a1a',badgeText:'#faf8f5' },
    fonts: { heading:"'EB Garamond', serif", body:"'Inter', sans-serif" },
    heroImage: PEXELS_MIRROR, style:'art-deco',
  },
];
