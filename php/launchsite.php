<?php
/**
 * LaunchSite - Website Builder & Hosting Platform
 * Certxa Product Page
 */

require_once 'includes/TemplateManager.php';

// Get template data
$manager = getTemplateManager();
$categories = $manager->getAvailableCategories();
$stats = $manager->getStats();
$allStyles = $manager->getAllStyles();

// Get featured templates (first theme from each design)
$featuredTemplates = [];
foreach ($categories as $category) {
    foreach ($category['designs'] ?? [] as $design) {
        if (!empty($design['themes'])) {
            $featuredTemplates[] = [
                'category' => $category,
                'design' => $design,
                'theme' => $design['themes'][0]
            ];
            // Limit to 3 featured templates
            if (count($featuredTemplates) >= 3) {
                break 2;
            }
        }
    }
}

// Page metadata
$pageTitle = 'LaunchSite - Website Builder & Hosting for Salons | Certxa';
$pageDescription = 'LaunchSite is the all-in-one website builder and hosting platform designed specifically for salons, barbershops, and nail studios. Create stunning websites in minutes with ' . $stats['themes'] . '+ templates.';
$canonicalUrl = 'https://certxa.com/launchsite.php';

// JSON-LD Schema
$schema = json_encode([
  '@context' => 'https://schema.org',
  '@type' => 'SoftwareApplication',
  'name' => 'LaunchSite by Certxa',
  'applicationCategory' => 'WebApplication',
  'operatingSystem' => 'Web Browser',
  'offers' => [
    '@type' => 'Offer',
    'price' => '0',
    'priceCurrency' => 'USD'
  ],
  'aggregateRating' => [
    '@type' => 'AggregateRating',
    'ratingValue' => '4.9',
    'reviewCount' => '2847'
  ],
  'featureList' => [
    'Drag-and-drop website builder',
    'Industry-specific templates',
    'Built-in SEO optimization',
    'Custom domain hosting',
    'Mobile-responsive design',
    'Online booking integration',
    'SSL certificates included'
  ]
]);

// FAQ Schema for SEO
$faqSchema = json_encode([
  '@context' => 'https://schema.org',
  '@type' => 'FAQPage',
  'mainEntity' => [
    [
      '@type' => 'Question',
      'name' => 'Do I need coding skills to use LaunchSite?',
      'acceptedAnswer' => [
        '@type' => 'Answer',
        'text' => 'No coding required! LaunchSite features a visual drag-and-drop editor that lets you build professional websites without writing a single line of code.'
      ]
    ],
    [
      '@type' => 'Question',
      'name' => 'Can I use my own domain name?',
      'acceptedAnswer' => [
        '@type' => 'Answer',
        'text' => 'Yes! LaunchSite supports custom domains. You can connect your existing domain or purchase a new one directly through the platform.'
      ]
    ],
    [
      '@type' => 'Question',
      'name' => 'Is LaunchSite included with SalonOS?',
      'acceptedAnswer' => [
        '@type' => 'Answer',
        'text' => 'LaunchSite is available as an add-on to SalonOS subscriptions. It integrates seamlessly with your booking system, client management, and payment processing.'
      ]
    ]
  ]
]);

require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- ══════════════ HERO SECTION ══════════════ -->
<section class="hero-section" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 120px 0 80px; position: relative; overflow: hidden;">
  <!-- Animated background elements -->
  <div class="hero-orb" style="position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top: -200px; right: -200px; border-radius: 50%;"></div>
  <div class="hero-orb" style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%); bottom: -100px; left: -100px; border-radius: 50%;"></div>
  
  <div class="container" style="position: relative; z-index: 2;">
    <div class="hero-inner" style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
      
      <!-- Left: Copy -->
      <div class="hero-copy">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 50px; padding: 6px 16px; margin-bottom: 24px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em;">Website Builder + Hosting</span>
        </div>
        
        <h1 class="hero-headline" style="font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 600; line-height: 1.1; color: #ffffff; margin-bottom: 24px;">
          Build stunning salon websites <span style="color: #818cf8;">in minutes</span>, not days.
        </h1>
        
        <p class="hero-sub" style="font-size: 1.125rem; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 32px; max-width: 500px;">
          LaunchSite is the all-in-one website builder and hosting platform designed specifically for salons, barbershops, and nail studios. No coding required.
        </p>
        
        <div class="hero-actions" style="display: flex; gap: 16px; margin-bottom: 40px;">
          <a href="/editor/" class="btn btn-primary" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(99,102,241,0.4);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            Launch Website Builder
          </a>
          <a href="#features" class="btn btn-outline" style="border: 1px solid rgba(255,255,255,0.3); color: white; padding: 16px 32px; border-radius: 12px; font-weight: 500; text-decoration: none;">
            See Features
          </a>
        </div>
        
        <div class="hero-trust" style="display: flex; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 50px;">
            <div style="display: flex; margin-right: 4px;">
              <?php foreach (array_slice($categories, 0, 3) as $cat): ?>
                <span style="font-size: 1.25rem; margin-right: -4px;"><?= $cat['emoji'] ?></span>
              <?php endforeach; ?>
            </div>
            <span style="color: rgba(255,255,255,0.8); font-size: 0.875rem;">
              <strong style="color: white;"><?= number_format($stats['themes']) ?>+</strong> templates available
            </span>
          </div>
        </div>
      </div>
      
      <!-- Right: Visual -->
      <div class="hero-visual" style="position: relative;">
        <div class="browser-mockup" style="background: #1e1e2e; border-radius: 16px; padding: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <!-- Browser chrome -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 0 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
            <div style="flex: 1; height: 28px; background: rgba(255,255,255,0.1); border-radius: 6px; margin-left: 16px; display: flex; align-items: center; padding: 0 12px; color: rgba(255,255,255,0.4); font-size: 0.75rem;">
              sophies-salon.com
            </div>
          </div>
          
          <!-- Website preview -->
          <div style="background: linear-gradient(180deg, #fdf4f0 0%, #fff 100%); border-radius: 8px; overflow: hidden;">
            <!-- Hero of mockup site -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 40px; text-align: center;">
              <h3 style="font-family: 'Cormorant Garamond', serif; color: white; font-size: 1.5rem; margin-bottom: 16px;">Sophie's Salon</h3>
              <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem; margin-bottom: 20px;">Luxury hair & beauty services</p>
              <button style="background: #818cf8; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 0.875rem; cursor: pointer;">Book Now</button>
            </div>
            
            <!-- Services section -->
            <div style="padding: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f9a8d4, #ec4899); border-radius: 8px; margin-bottom: 12px;"></div>
                <div style="height: 12px; background: #e5e7eb; border-radius: 4px; width: 70%; margin-bottom: 8px;"></div>
                <div style="height: 8px; background: #f3f4f6; border-radius: 4px; width: 100%;"></div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #a78bfa, #7c3aed); border-radius: 8px; margin-bottom: 12px;"></div>
                <div style="height: 12px; background: #e5e7eb; border-radius: 4px; width: 70%; margin-bottom: 8px;"></div>
                <div style="height: 8px; background: #f3f4f6; border-radius: 4px; width: 100%;"></div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6ee7b7, #059669); border-radius: 8px; margin-bottom: 12px;"></div>
                <div style="height: 12px; background: #e5e7eb; border-radius: 4px; width: 70%; margin-bottom: 8px;"></div>
                <div style="height: 8px; background: #f3f4f6; border-radius: 4px; width: 100%;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Floating elements -->
        <div style="position: absolute; top: -20px; right: -20px; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
          <span style="font-size: 0.875rem; font-weight: 600; color: #1f2937;">Live Preview</span>
        </div>
        
        <div style="position: absolute; bottom: 40px; left: -30px; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 0.75rem; color: #6b7280;">Mobile Responsive</span>
            <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 0.625rem; font-weight: 600;">AUTO</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <div style="width: 60px; height: 30px; background: #1f2937; border-radius: 4px;"></div>
            <div style="width: 30px; height: 30px; background: #e5e7eb; border-radius: 4px;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ LOGOS/TRUST SECTION ══════════════ -->
<section style="background: #f9fafb; padding: 40px 0; border-bottom: 1px solid #e5e7eb;">
  <div class="container">
    <p style="text-align: center; color: #6b7280; font-size: 0.875rem; margin-bottom: 24px;">Trusted by leading salons and beauty brands</p>
    <div style="display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap; opacity: 0.6;">
      <span style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #374151;">Sophie's Salon</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #374151;">Blade & Co</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #374151;">Nail Atelier</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #374151;">The Hair Studio</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #374151;">Glamour Bar</span>
    </div>
  </div>
</section>

<!-- ══════════════ FEATURES SECTION ══════════════ -->
<section id="features" style="padding: 100px 0; background: white;">
  <div class="container">
    <div style="text-align: center; max-width: 700px; margin: 0 auto 64px;">
      <span style="display: inline-block; background: rgba(99,102,241,0.1); color: #6366f1; padding: 6px 16px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">Features</span>
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.75rem; font-weight: 600; color: #111827; margin-bottom: 20px;">Everything you need to launch your salon website</h2>
      <p style="font-size: 1.125rem; color: #6b7280; line-height: 1.7;">From drag-and-drop editing to built-in SEO, LaunchSite handles the technical stuff so you can focus on your business.</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <!-- Feature 1 -->
      <div style="background: #f9fafb; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Drag-and-Drop Builder</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Build your website visually with our intuitive editor. No coding required—just drag, drop, and customize.</p>
      </div>
      
      <!-- Feature 2 -->
      <div style="background: #f9fafb; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Salon-Specific Templates</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Choose from professionally designed templates for hair salons, barbershops, and nail studios.</p>
      </div>
      
      <!-- Feature 3 -->
      <div style="background: #f9fafb; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Built-in SEO Tools</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Automatic SEO optimization, meta tags, and structured data to help your salon rank on Google.</p>
      </div>
      
      <!-- Feature 4 -->
      <div style="background: #f9fafb; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Custom Domains</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Use your own domain name or get a free certxa.com subdomain. SSL certificates included automatically.</p>
      </div>
      
      <!-- Feature 5 -->
      <div style="background: #f9fafb; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 12px;">SalonOS Integration</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Seamlessly connects with your SalonOS booking system, client management, and payment processing.</p>
      </div>
      
      <!-- Feature 6 -->
      <div style="background: #f9fafb; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Instant Publishing</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Preview changes in real-time and publish with one click. Your website goes live in seconds, not hours.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ TEMPLATES SHOWCASE ══════════════ -->
<section style="padding: 100px 0; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);">
  <div class="container">
    <div style="text-align: center; max-width: 700px; margin: 0 auto 64px;">
      <span style="display: inline-block; background: rgba(99,102,241,0.2); color: #818cf8; padding: 6px 16px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
        <?= number_format($stats['themes']) ?>+ Templates
      </span>
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.75rem; font-weight: 600; color: white; margin-bottom: 20px;">Designed for your industry</h2>
      <p style="font-size: 1.125rem; color: rgba(255,255,255,0.6); line-height: 1.7;">
        Every template is crafted specifically for beauty professionals, with <?= $stats['themes'] ?>+ style variations across <?= $stats['availableCategories'] ?> categories.
      </p>
    </div>
    
    <!-- Category Pills -->
    <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 48px;">
      <?php foreach ($categories as $category): ?>
        <a 
          href="/templates.php?category=<?= $category['id'] ?>" 
          style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 50px; font-size: 0.875rem; font-weight: 500; text-decoration: none; transition: all 0.2s;"
          onmouseover="this.style.background='rgba(99,102,241,0.3)';this.style.borderColor='#6366f1';"
          onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='rgba(255,255,255,0.2)';"
        >
          <span style="font-size: 1.25rem;"><?= $category['emoji'] ?></span>
          <?= $category['label'] ?>
          <span style="background: rgba(255,255,255,0.2); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.625rem;">
            <?php 
              $themeCount = 0;
              foreach ($category['designs'] ?? [] as $d) {
                $themeCount += count($d['themes'] ?? []);
              }
              echo $themeCount;
            ?>
          </span>
        </a>
      <?php endforeach; ?>
    </div>
    
    <!-- Featured Templates Grid -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <?php foreach ($featuredTemplates as $item): 
        $category = $item['category'];
        $design = $item['design'];
        $theme = $item['theme'];
      ?>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;" 
             onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 20px 40px rgba(0,0,0,0.3)';"
             onmouseout="this.style.transform='';this.style.boxShadow='';">
          <!-- Template Preview -->
          <div style="position: relative; aspect-ratio: 4/3; overflow: hidden; background: linear-gradient(135deg, <?= $theme['bgColor'] ?> 0%, <?= $theme['accentColor'] ?>30 100%);">
            <img 
              src="<?= $design['heroImage'] ?>" 
              alt="<?= $design['name'] ?>"
              style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;"
              loading="lazy"
            >
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);"></div>
            
            <!-- Badges -->
            <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px;">
              <span style="background: <?= $theme['accentColor'] ?>; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.625rem; font-weight: 700; text-transform: uppercase;">
                <?= $theme['style'] ?>
              </span>
              <span style="background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.625rem; font-weight: 500; backdrop-filter: blur(4px);">
                <?= $category['emoji'] ?> <?= $category['label'] ?>
              </span>
            </div>
            
            <!-- Theme Name -->
            <div style="position: absolute; bottom: 12px; left: 12px; right: 12px;">
              <h4 style="font-family: 'Cormorant Garamond', serif; color: white; font-size: 1.25rem; font-weight: 600; margin-bottom: 4px;">
                <?= $design['name'] ?>
              </h4>
              <p style="color: rgba(255,255,255,0.8); font-size: 0.875rem;">
                <?= $theme['name'] ?> • <?= count($design['themes']) ?> styles
              </p>
            </div>
          </div>
          
          <!-- Template Info -->
          <div style="padding: 20px;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <?php foreach (array_slice($design['features'], 0, 3) as $feature): ?>
                <span style="background: rgba(99,102,241,0.2); color: #818cf8; padding: 4px 10px; border-radius: 16px; font-size: 0.75rem;">
                  <?= $feature ?>
                </span>
              <?php endforeach; ?>
            </div>
            <a 
              href="/templates/design.php?category=<?= $category['id'] ?>&design=<?= $design['id'] ?>" 
              style="display: block; text-align: center; background: <?= $theme['accentColor'] ?>; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: opacity 0.2s;"
              onmouseover="this.style.opacity='0.9';"
              onmouseout="this.style.opacity='1';"
            >
              Preview Template
            </a>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
    
    <!-- View All CTA -->
    <div style="text-align: center; margin-top: 48px;">
      <a 
        href="/templates.php" 
        style="display: inline-flex; align-items: center; gap: 8px; background: transparent; border: 2px solid rgba(255,255,255,0.3); color: white; padding: 14px 28px; border-radius: 10px; font-weight: 500; text-decoration: none; transition: all 0.2s;"
        onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='rgba(255,255,255,0.5)';"
        onmouseout="this.style.background='transparent';this.style.borderColor='rgba(255,255,255,0.3)';"
      >
        View All <?= number_format($stats['themes']) ?> Templates
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
      </a>
    </div>
    
    <!-- Popular Styles -->
    <div style="margin-top: 64px; padding-top: 48px; border-top: 1px solid rgba(255,255,255,0.1);">
      <h3 style="text-align: center; font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: white; margin-bottom: 24px;">Popular Styles</h3>
      <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
        <?php foreach (array_slice($allStyles, 0, 8) as $style => $count): ?>
          <a 
            href="/templates.php?style=<?= urlencode($style) ?>" 
            style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; text-decoration: none; transition: all 0.2s;"
            onmouseover="this.style.background='rgba(99,102,241,0.2)';this.style.borderColor='#6366f1';this.style.color='white';"
            onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='rgba(255,255,255,0.7)';"
          >
            <?= $style ?>
            <span style="background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 2px 6px; border-radius: 10px; font-size: 0.625rem; margin-left: 6px;">
              <?= $count ?>
            </span>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ HOW IT WORKS ══════════════ -->
<section style="padding: 100px 0; background: #f9fafb;">
  <div class="container">
    <div style="text-align: center; max-width: 700px; margin: 0 auto 64px;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.75rem; font-weight: 600; color: #111827; margin-bottom: 20px;">Launch your website in 3 steps</h2>
      <p style="font-size: 1.125rem; color: #6b7280; line-height: 1.7;">From signup to live website in under 10 minutes.</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
      <!-- Step 1 -->
      <div style="text-align: center;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 1.5rem; font-weight: 700; color: white;">1</div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.375rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Choose Your Template</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Browse our collection of salon-specific templates. Each one is designed for your industry and fully customizable.</p>
      </div>
      
      <!-- Step 2 -->
      <div style="text-align: center;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 1.5rem; font-weight: 700; color: white;">2</div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.375rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Customize & Edit</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Use our visual editor to add your branding, services, team photos, and business info. Preview changes in real-time.</p>
      </div>
      
      <!-- Step 3 -->
      <div style="text-align: center;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 1.5rem; font-weight: 700; color: white;">3</div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.375rem; font-weight: 600; color: #111827; margin-bottom: 12px;">Publish & Go Live</h3>
        <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Connect your domain or use a free certxa.com subdomain. Click publish and your website is live instantly.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ CTA SECTION ══════════════ -->
<section style="padding: 100px 0; background: white;">
  <div class="container">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 24px; padding: 64px; text-align: center; position: relative; overflow: hidden;">
      <!-- Decorative elements -->
      <div style="position: absolute; top: -50%; left: -20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -50%; right: -20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 2;">
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 600; color: white; margin-bottom: 16px;">Ready to launch your salon website?</h2>
        <p style="font-size: 1.125rem; color: rgba(255,255,255,0.8); margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">Join thousands of beauty professionals who've launched stunning websites with LaunchSite.</p>
        
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="/editor/" style="background: white; color: #6366f1; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            Start Building Free
          </a>
          <a href="/pricing.php" style="border: 2px solid rgba(255,255,255,0.3); color: white; padding: 14px 30px; border-radius: 12px; font-weight: 500; text-decoration: none;">
            View Pricing
          </a>
        </div>
        
        <p style="margin-top: 24px; font-size: 0.875rem; color: rgba(255,255,255,0.6);">No credit card required. Free subdomain included.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ FAQ SECTION ══════════════ -->
<section style="padding: 100px 0; background: #f9fafb;">
  <div class="container">
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 48px;">
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-weight: 600; color: #111827; margin-bottom: 16px;">Frequently Asked Questions</h2>
        <p style="font-size: 1.125rem; color: #6b7280;">Everything you need to know about LaunchSite.</p>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- FAQ 1 -->
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Do I need coding skills to use LaunchSite?</h3>
          <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">No coding required! LaunchSite features a visual drag-and-drop editor that lets you build professional websites without writing a single line of code.</p>
        </div>
        
        <!-- FAQ 2 -->
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Can I use my own domain name?</h3>
          <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Yes! LaunchSite supports custom domains. You can connect your existing domain or purchase a new one directly through the platform. SSL certificates are included automatically.</p>
        </div>
        
        <!-- FAQ 3 -->
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Is LaunchSite included with SalonOS?</h3>
          <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">LaunchSite is available as an add-on to SalonOS subscriptions. It integrates seamlessly with your booking system, client management, and payment processing for a unified experience.</p>
        </div>
        
        <!-- FAQ 4 -->
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Will my website work on mobile devices?</h3>
          <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Absolutely. All LaunchSite templates are fully responsive and optimized for mobile, tablet, and desktop. Your clients can book appointments from any device.</p>
        </div>
        
        <!-- FAQ 5 -->
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 8px;">How do I connect my website to SalonOS booking?</h3>
          <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6;">Integration is automatic! When you use both LaunchSite and SalonOS, the booking widget connects directly to your availability, services, and staff. No manual setup needed.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ RELATED PRODUCTS ══════════════ -->
<section style="padding: 80px 0; background: white; border-top: 1px solid #e5e7eb;">
  <div class="container">
    <div style="text-align: center; margin-bottom: 48px;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #111827;">Complete your salon technology stack</h2>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <!-- SalonOS -->
      <div style="text-align: center; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3B0764 0%, #7c3aed 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.238A9.21 9.21 0 005 18.293V13.12l4.4-1.886 4.5 1.93v5.161a9.2 9.2 0 00-4.6-1.087z"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 8px;">SalonOS</h3>
        <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.6; margin-bottom: 16px;">All-in-one salon management: booking, POS, client management, and more.</p>
        <a href="/salonos.php" style="color: #7c3aed; font-weight: 500; text-decoration: none;">Learn more →</a>
      </div>
      
      <!-- Online Booking -->
      <div style="text-align: center; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Online Booking</h3>
        <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.6; margin-bottom: 16px;">24/7 appointment scheduling that syncs with your calendar and reduces no-shows.</p>
        <a href="/online-booking.php" style="color: #ec4899; font-weight: 500; text-decoration: none;">Learn more →</a>
      </div>
      
      <!-- Payments -->
      <div style="text-align: center; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="white"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>
        </div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Payments</h3>
        <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.6; margin-bottom: 16px;">Built-in POS and payment processing with competitive rates and fast deposits.</p>
        <a href="/payments.php" style="color: #10b981; font-weight: 500; text-decoration: none;">Learn more →</a>
      </div>
    </div>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
