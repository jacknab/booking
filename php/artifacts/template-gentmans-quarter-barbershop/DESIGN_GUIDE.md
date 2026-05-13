# Barbershop Website - Design Viewing Guide

## How to View the Designs

The website includes **25 unique design themes** that you can browse and switch between in real time.

### Using the Design Selector

1. **Open the website** in your browser (the dev server runs automatically).
2. **Look for the floating palette button** in the **bottom-right corner** of the screen - it's a circular button with a palette/swatch icon.
3. **Click the palette button** to open the design selector panel.
4. **Browse all 25 designs** - each shows a color preview swatch, the design name, and a short description.
5. **Click any design** to instantly apply it to the entire page. The colors, fonts, and overall aesthetic will change immediately.
6. **Click the palette button again** to close the selector.

### Mobile Viewing

The design selector works on mobile too. Tap the floating palette button (bottom-right) to open the panel, then scroll through the designs and tap to select one.

---

## All 25 Design Themes

### Original 15 Designs

| # | Name | Style | Description |
|---|------|-------|-------------|
| 1 | Midnight & Gold | Luxury | Dark luxury with gold accents |
| 2 | Cream & Heritage | Classic | Warm cream tones with rich brown |
| 3 | Slate & Steel | Modern | Cool grays with steel blue accents |
| 4 | Obsidian & Copper | Industrial | Deep black with warm copper highlights |
| 5 | Ivory & Emerald | Classic | Clean ivory with rich emerald green |
| 6 | Charcoal & Crimson | Bold | Dark charcoal with bold red accents |
| 7 | Sand & Turquoise | Tropical | Desert sand with turquoise accents |
| 8 | Noir & Silver | Minimal | Pure black with silver metallic |
| 9 | Walnut & Brass | Rustic | Rich walnut wood with brass hardware |
| 10 | Frost & Navy | Scandinavian | Icy white with deep navy blue |
| 11 | Espresso & Cream | Rustic | Rich espresso brown with cream |
| 12 | Graphite & Amber | Industrial | Cool graphite with warm amber glow |
| 13 | Pearl & Rosewood | Art Deco | Soft pearl white with rosewood accents |
| 14 | Onyx & Teal | Contemporary | Deep onyx with vibrant teal |
| 15 | Linen & Charcoal | Minimal | Natural linen with charcoal accents |

### New 10 Designs

| # | Name | Style | Description |
|---|------|-------|-------------|
| 16 | Volcanic & Ember | Bold | Deep volcanic black with fiery orange embers |
| 17 | Arctic & Fjord | Scandinavian | Glacial white with deep Nordic blue |
| 18 | Mahogany & Whiskey | Luxury | Rich mahogany wood with whiskey amber |
| 19 | Concrete & Moss | Contemporary | Raw concrete gray with living moss green |
| 20 | Midnight & Sapphire | Modern | Deep midnight blue with sapphire brilliance |
| 21 | Desert & Sunset | Tropical | Warm desert sand with sunset coral |
| 22 | Thunder & Platinum | Industrial | Storm gray with platinum metallic sheen |
| 23 | Sage & Terracotta | Rustic | Muted sage green with warm terracotta |
| 24 | Neon & Carbon | Retro | Carbon fiber black with electric neon green |
| 25 | Porcelain & Ink | Art Deco | Delicate porcelain white with ink black accents |

---

## Website Sections

Each design applies to all sections of the single-page website:

1. **Navigation Bar** - Fixed top bar with logo, nav links, and "Check In" button
2. **Hero Section** - Full-screen hero with business name, tagline, and CTA buttons
3. **Services** - 12 services across 6 categories (Haircut, Beard, Shave, Combo, Specialty, Treatment) with prices and durations
4. **Queue Check-In** - Full check-in widget with:
   - Name, phone, and party size input
   - Service selection by category
   - Preferred barber selection
   - Confirmation step
   - Success screen with queue position and estimated wait
   - Status check tab (look up your position by phone number)
   - Cancel check-in option
5. **About** - Business story, stats, and client testimonials
6. **Business Hours** - Weekly schedule with online check-in availability note
7. **Contact** - Address, phone, and email cards
8. **Footer** - Social links and copyright

---

## Queue Management System

The check-in system is modeled after Great Clips' online check-in:

- **Check In tab**: Enter your name, phone, party size, select a service and optional preferred barber, then confirm
- **Check Status tab**: Enter your phone number to see your current position and estimated wait time
- **Cancel**: Cancel your check-in from the status screen
- **Notifications**: The system notes it will text you ~15 minutes before your turn
- **Progress bar**: Visual indicator of your position in the queue

All check-in data is stored in Supabase with Row Level Security enabled.
