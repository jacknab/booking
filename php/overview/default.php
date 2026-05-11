<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Certxa — #1 Salon Management Software | Online Booking & Payments');
define('PAGE_DESC',     'Certxa is the all-in-one salon management software trusted by 50,000+ beauty professionals. Online booking, client management, integrated payments, POS & automated reminders. Free 60-day trial.');
define('PAGE_KEYWORDS', 'salon management software, salon booking software, beauty salon software, hair salon software, salon scheduling software, online booking for salons, salon POS system, beauty professional software, salon appointment app, nail salon software');
define('PAGE_CANONICAL', 'https://certxa.com/overview');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'              => 'SoftwareApplication',
    '@id'                => 'https://certxa.com/#software',
    'name'               => 'Certxa',
    'applicationCategory'=> 'BusinessApplication',
    'applicationSubCategory' => 'SalonManagementSoftware',
    'operatingSystem'    => 'Web, iOS, Android',
    'url'                => 'https://certxa.com',
    'description'        => 'Certxa is the all-in-one salon management software trusted by 50,000+ beauty professionals. Features include 24/7 online booking, multi-staff calendar management, automated SMS and email reminders, integrated payment processing, a POS system, client CRM, gift cards, memberships, Google Reviews integration, Reserve with Google, and a branded website builder.',
    'softwareVersion'    => '2.0',
    'offers' => [
      '@type'       => 'Offer',
      'price'       => '0',
      'priceCurrency' => 'USD',
      'description' => 'Free 60-day trial, then from $29/month. No credit card required.',
    ],
    'aggregateRating' => [
      '@type'       => 'AggregateRating',
      'ratingValue' => '4.9',
      'bestRating'  => '5',
      'worstRating' => '1',
      'ratingCount' => '2847',
      'reviewCount' => '2847',
    ],
    'review' => [
      [
        '@type'        => 'Review',
        'reviewRating' => ['@type'=>'Rating','ratingValue'=>'5','bestRating'=>'5'],
        'author'       => ['@type'=>'Person','name'=>'Jessica Mitchell'],
        'reviewBody'   => 'Since switching to Certxa, my bookings are up 40% and no-shows have dropped dramatically. The automated reminders alone are worth every penny.',
      ],
      [
        '@type'        => 'Review',
        'reviewRating' => ['@type'=>'Rating','ratingValue'=>'5','bestRating'=>'5'],
        'author'       => ['@type'=>'Person','name'=>'Rachel Park'],
        'reviewBody'   => 'The website builder is stunning. My clients constantly compliment how professional my site looks — and I built it myself in one afternoon.',
      ],
      [
        '@type'        => 'Review',
        'reviewRating' => ['@type'=>'Rating','ratingValue'=>'5','bestRating'=>'5'],
        'author'       => ['@type'=>'Person','name'=>'David Kurosawa'],
        'reviewBody'   => 'Managing six stylists used to be a nightmare. Certxa brought everything into one place. Revenue is up 28% in the first three months.',
      ],
    ],
    'featureList' => [
      '24/7 online booking with real-time availability',
      'Multi-staff calendar management with day view',
      'Automated SMS and email appointment reminders',
      'Client management CRM with full appointment history',
      'Integrated card payment processing',
      'Salon point of sale (POS) system with card reader',
      'Gift cards and membership management',
      'Google Reviews automation',
      'Reserve with Google integration',
      'Custom branded website builder',
      'Business analytics and reporting dashboard',
      'No-show deposit protection',
    ],
    'publisher' => ['@id'=>'https://certxa.com/#organization'],
  ],
  [
    '@type'        => 'FAQPage',
    'mainEntity'   => [
      [
        '@type'          => 'Question',
        'name'           => 'What is Certxa?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Certxa is an all-in-one salon management software platform designed for beauty and wellness professionals. It includes online booking, client management, payment processing, an integrated POS system, automated SMS and email reminders, a website builder, and business analytics — all in a single, beautifully designed platform.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'How much does Certxa cost?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Certxa offers a free 60-day trial with no credit card required. After your trial, plans start from $29/month (Starter), $69/month (Scale), or $129/month (Enterprise). All plans include unlimited bookings, online booking, client management, and integrated payments with no hidden fees.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'Does Certxa work for solo stylists and small salons?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Yes — Certxa is designed to scale from solo beauty professionals all the way to multi-location salon chains. The Starter plan is built for independent stylists and nail technicians, while Scale and Enterprise plans support unlimited staff and multiple locations.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'Can I migrate from GlossGenius, Vagaro, or another booking platform?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Yes. Certxa offers free data migration from all major platforms including GlossGenius, Vagaro, Square Appointments, Booksy, and Fresha. Your client list, appointment history, and service menu are imported for you — typically in minutes.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'How does Certxa reduce no-shows?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Certxa sends automated SMS and email reminders at intervals you choose — typically 72 hours and 24 hours before each appointment. Salons using Certxa report an average 68% reduction in no-shows. You can also require a deposit at booking for additional protection.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'Is Certxa available on iPhone and Android?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Yes — Certxa has native apps on both iOS (iPhone and iPad) and Android. Your clients can also book through any web browser with no app download required on their end.'],
      ],
    ],
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- ══════════════ HERO — DARK ══════════════ -->
<section class="hero-dark-section">
  <!-- animated gradient orbs -->
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <div class="container">
    <div class="hero-dark-inner">

      <!-- left copy -->
      <div class="hero-dark-copy animate-fade-up">
        <div class="hero-stars-row">
          <span class="stars-badge">
            <span class="stars-gold">★★★★★</span>
            <span>Rated #1 by 50,000+ beauty professionals</span>
          </span>
        </div>

        <div style="display:inline-flex;align-items:center;gap:7px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:50px;padding:5px 14px;margin-bottom:16px;">
          <span style="font-size:.68rem;font-weight:700;color:var(--gold-bright);text-transform:uppercase;letter-spacing:.12em;">Powered by SalonOS</span>
        </div>

        <h1 class="hero-dark-headline word-split">
          Salon software that <em>grows your</em> business.
        </h1>

        <p class="hero-dark-sub">
          Bookings, front desk, POS, loyalty rewards, check-in, waitlist, and Google reviews — all connected in <a href="/salonos" style="color:var(--gold-bright);text-decoration:underline;text-underline-offset:3px;">SalonOS by Certxa</a>.
        </p>

        <div class="hero-dark-actions">
          <a href="/auth?mode=register" class="btn btn-gold btn-lg">Start Free Trial</a>
          <a href="/pricing" class="btn btn-outline-white btn-lg">See Pricing</a>
        </div>

        <div class="hero-dark-trust">
          <div class="avatar-stack">
            <div class="av-dot" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">JM</div>
            <div class="av-dot" style="background:linear-gradient(135deg,#f9a8d4,#ec4899)">RP</div>
            <div class="av-dot" style="background:linear-gradient(135deg,#fcd34d,#f59e0b)">DK</div>
            <div class="av-dot" style="background:linear-gradient(135deg,#6ee7b7,#059669)">SL</div>
          </div>
          <span class="trust-text"><strong>50,000+</strong> salons trust Certxa</span>
        </div>
      </div>

      <!-- right dashboard mockup -->
      <div class="hero-dark-visual animate-fade-up animate-delay-2">
        <div class="dash-shell">

          <!-- sidebar -->
          <div class="dash-sidebar">
            <div class="dash-sidebar-logo">SQ</div>
            <div class="dash-sidebar-nav">
              <div class="dash-nav-item active" title="Dashboard">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 11l8-8 8 8v7a1 1 0 01-1 1H3a1 1 0 01-1-1v-7z"/></svg>
              </div>
              <div class="dash-nav-item" title="Bookings">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"/></svg>
              </div>
              <div class="dash-nav-item" title="Clients">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              </div>
              <div class="dash-nav-item" title="Payments">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/></svg>
              </div>
              <div class="dash-nav-item" title="Reviews">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
            </div>
          </div>

          <!-- main content -->
          <div class="dash-main">
            <div class="dash-topbar">
              <div class="dash-greeting">
                <div class="dash-greeting-sub">Good morning, Sophie 👋</div>
                <div class="dash-greeting-title">Thursday, 30 April</div>
              </div>
              <div class="dash-topbar-right">
                <div class="dash-notif-btn">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-2.83-2h5.66A3 3 0 0110 18z"/></svg>
                  <span class="notif-pip"></span>
                </div>
                <div class="dash-avatar">SC</div>
              </div>
            </div>

            <div class="dash-stats-row">
              <div class="dash-stat-pill dash-stat-primary">
                <div class="dsp-label">Revenue this month</div>
                <div class="dsp-value">$8,462</div>
                <div class="dsp-change up">↑ 23% vs last month</div>
              </div>
              <div class="dash-stat-pill">
                <div class="dsp-label">Bookings today</div>
                <div class="dsp-value">12</div>
                <div class="dsp-change up">↑ 4 more than yesterday</div>
              </div>
              <div class="dash-stat-pill">
                <div class="dsp-label">Fill rate</div>
                <div class="dsp-value">94%</div>
                <div class="dsp-bar"><div class="dsp-bar-fill" style="width:94%"></div></div>
              </div>
            </div>

            <!-- mini bar chart -->
            <div class="dash-chart">
              <div class="dash-chart-label">Revenue — last 7 days</div>
              <div class="dash-bars">
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:42%"></div><span>Mon</span></div>
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:67%"></div><span>Tue</span></div>
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:53%"></div><span>Wed</span></div>
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:88%"></div><span>Thu</span></div>
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:74%"></div><span>Fri</span></div>
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:95%;background:linear-gradient(180deg,#F59E0B,#B45309)"></div><span>Sat</span></div>
                <div class="dash-bar-wrap"><div class="dash-bar" style="height:60%"></div><span>Sun</span></div>
              </div>
            </div>

            <!-- upcoming -->
            <div class="dash-section-title">Today's appointments</div>
            <div class="dash-appt-list">
              <div class="dash-appt">
                <div class="dash-appt-time">09:00</div>
                <div class="dash-appt-av" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">EC</div>
                <div class="dash-appt-info">
                  <div class="dash-appt-name">Emma Clarke</div>
                  <div class="dash-appt-service">Balayage + Toner</div>
                </div>
                <div class="dash-appt-price">$145</div>
                <div class="ui-badge confirmed">Confirmed</div>
              </div>
              <div class="dash-appt">
                <div class="dash-appt-time">10:30</div>
                <div class="dash-appt-av" style="background:linear-gradient(135deg,#f9a8d4,#ec4899)">SH</div>
                <div class="dash-appt-info">
                  <div class="dash-appt-name">Sophie Hart</div>
                  <div class="dash-appt-service">Blowout + Style</div>
                </div>
                <div class="dash-appt-price">$65</div>
                <div class="ui-badge confirmed">Confirmed</div>
              </div>
              <div class="dash-appt">
                <div class="dash-appt-time">12:00</div>
                <div class="dash-appt-av" style="background:linear-gradient(135deg,#6ee7b7,#059669)">JL</div>
                <div class="dash-appt-info">
                  <div class="dash-appt-name">Jessica Lee</div>
                  <div class="dash-appt-service">Cut + Colour</div>
                </div>
                <div class="dash-appt-price">$110</div>
                <div class="ui-badge pending">Pending</div>
              </div>
            </div>
          </div>
        </div>

        <!-- floating badges -->
        <div class="float-badge float-badge-top hero-notif-pop">
          <div class="float-badge-icon">🔔</div>
          <div class="float-badge-body"><strong>New Booking</strong><span>Hannah just booked a balayage</span></div>
        </div>
        <div class="float-badge float-badge-bottom hero-notif-pop hero-notif-pop-2">
          <div class="float-badge-icon">💳</div>
          <div class="float-badge-body"><strong>Payment received</strong><span>$145 from Emma Clarke</span></div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════ TRUST / LOGO STRIP ══════════════ -->
<section class="logo-strip-section">
  <div class="container">
    <p class="logo-strip-label">Trusted by teams at</p>
    <div class="logo-strip-row">
      <div class="logo-pill">💇 Luxe Atelier</div>
      <div class="logo-sep"></div>
      <div class="logo-pill">✂ Studio Noir</div>
      <div class="logo-sep"></div>
      <div class="logo-pill">🌿 Sage Beauty</div>
      <div class="logo-sep"></div>
      <div class="logo-pill">💅 The Nail Room</div>
      <div class="logo-sep"></div>
      <div class="logo-pill">✨ Bloom &amp; Co</div>
      <div class="logo-sep"></div>
      <div class="logo-pill">🪞 Maison Beauté</div>
    </div>
  </div>
</section>

<!-- ══════════════ STATS STRIP ══════════════ -->
<section class="stats-strip">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item reveal">
        <div class="stat-value"><span data-count="50" data-suffix="K+">0K+</span></div>
        <div class="stat-label">Beauty professionals</div>
      </div>
      <div class="stat-item reveal">
        <div class="stat-value">$<span data-count="2" data-suffix="B+">0B+</span></div>
        <div class="stat-label">Processed annually</div>
      </div>
      <div class="stat-item reveal">
        <div class="stat-value"><span data-count="40" data-suffix="%">0%</span></div>
        <div class="stat-label">Average revenue increase</div>
      </div>
      <div class="stat-item reveal">
        <div class="stat-value"><span data-count="4.9" data-suffix="★">0★</span></div>
        <div class="stat-label">App store rating</div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ IMPACT MARQUEE ══════════════ -->
<div class="impact-marquee">
  <?php
  $items = ['Online Booking','Automated Reminders','Card Payments','No-Show Deposits','Client Drift Engine','Revenue Leakage Report','Dead Seat Intelligence','No-Show Prediction','Client Profiles','Reserve with Google','Google Reviews','Website Builder','Gift Cards','Memberships','POS System','Rebooking Rate by Stylist','LTV + Churn Risk Score','Growth Score','SMS Notifications','Colour Formulas','Multi-Staff Calendar','Instant Payouts'];
  // duplicate for seamless loop
  $all = array_merge($items, $items);
  ?>
  <div class="impact-marquee-track">
    <?php foreach ($all as $item): ?>
    <span class="impact-marquee-item">
      <em><?= $item ?></em>
      <span class="impact-marquee-dot"></span>
    </span>
    <?php endforeach; ?>
  </div>
</div>

<!-- ══════════════ FEATURE BENTO GRID ══════════════ -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Platform Overview</span>
      <h2 class="section-title">One platform.<br><em>Every tool you need.</em></h2>
      <p class="section-subtitle">Stop juggling different apps. Certxa brings everything together so your business runs itself.</p>
    </div>

    <div class="bento">

      <!-- wide featured card -->
      <a href="/online-booking" class="bento-card bento-wide bento-booking-card">
        <div class="bento-card-body">
          <div class="bento-eyebrow">Client Experience</div>
          <h3 class="bento-title">Online Booking</h3>
          <p class="bento-text">Let clients book 24/7 from your website, Instagram bio, or straight from Google — no back-and-forth.</p>
          <span class="bento-link">Explore →</span>
        </div>
        <div class="bento-booking-widget">
          <div class="bbw-header">Book an Appointment</div>
          <div class="bbw-services">
            <div class="bbw-service selected">Balayage <span>$145</span></div>
            <div class="bbw-service">Cut &amp; Style <span>$75</span></div>
            <div class="bbw-service">Blow-dry <span>$45</span></div>
          </div>
          <div class="bbw-slots">
            <div class="bbw-slot">9:00</div>
            <div class="bbw-slot sel">10:30</div>
            <div class="bbw-slot">12:00</div>
            <div class="bbw-slot">14:30</div>
          </div>
          <div class="bbw-btn">Confirm Booking</div>
        </div>
      </a>

      <!-- tall card: client management -->
      <a href="/client-management" class="bento-card bento-tall bento-clients-card">
        <div class="bento-eyebrow">Client Experience</div>
        <h3 class="bento-title">Client Management</h3>
        <p class="bento-text">Detailed profiles, appointment history, notes and preferences — every client, perfectly remembered.</p>
        <span class="bento-link">Explore →</span>
        <div class="bento-client-list">
          <div class="bcl-item">
            <div class="bcl-av" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">EC</div>
            <div class="bcl-info">
              <div class="bcl-name">Emma Clarke</div>
              <div class="bcl-meta">Balayage · Last visit 3d ago</div>
            </div>
            <div class="bcl-spend">$680</div>
          </div>
          <div class="bcl-item">
            <div class="bcl-av" style="background:linear-gradient(135deg,#f9a8d4,#ec4899)">SH</div>
            <div class="bcl-info">
              <div class="bcl-name">Sophie Hart</div>
              <div class="bcl-meta">Regular cut · Last visit 1w ago</div>
            </div>
            <div class="bcl-spend">$420</div>
          </div>
          <div class="bcl-item">
            <div class="bcl-av" style="background:linear-gradient(135deg,#6ee7b7,#059669)">JL</div>
            <div class="bcl-info">
              <div class="bcl-name">Jessica Lee</div>
              <div class="bcl-meta">Colour · Last visit 2w ago</div>
            </div>
            <div class="bcl-spend">$310</div>
          </div>
          <div class="bcl-item">
            <div class="bcl-av" style="background:linear-gradient(135deg,#fcd34d,#f59e0b)">AL</div>
            <div class="bcl-info">
              <div class="bcl-name">Ava Liu</div>
              <div class="bcl-meta">Extensions · Last visit 1m ago</div>
            </div>
            <div class="bcl-spend">$1,240</div>
          </div>
        </div>
      </a>

      <!-- card: payments -->
      <a href="/payments" class="bento-card bento-payments-card">
        <div class="bento-eyebrow">Revenue</div>
        <h3 class="bento-title">Payments &amp; POS</h3>
        <p class="bento-text">Accept payments online and in person. Instant payouts. No monthly fees.</p>
        <span class="bento-link">Explore →</span>
        <div class="bento-payment-pill">
          <div class="bpp-amount">$185.00</div>
          <div class="bpp-label">Paid · Apple Pay</div>
        </div>
      </a>

      <!-- card: notifications -->
      <a href="/client-notifications" class="bento-card bento-notif-card">
        <div class="bento-eyebrow">Automation</div>
        <h3 class="bento-title">Smart Reminders</h3>
        <p class="bento-text">Automated SMS &amp; email reminders that slash no-shows by up to 70%.</p>
        <span class="bento-link">Explore →</span>
        <div class="bento-notif-preview">
          <div class="bnp-msg">📱 <strong>Reminder:</strong> Emma, your balayage is tomorrow at 10:30. Reply C to confirm.</div>
          <div class="bnp-tag confirmed">Confirmed ✓</div>
        </div>
      </a>

      <!-- card: reviews -->
      <a href="/client-reviews" class="bento-card bento-reviews-card">
        <div class="bento-eyebrow">Reputation</div>
        <h3 class="bento-title">5-Star Reviews</h3>
        <p class="bento-text">Collect glowing reviews on autopilot and watch new clients find you on Google.</p>
        <span class="bento-link">Explore →</span>
        <div class="bento-stars-display">
          <div class="bsd-stars">★★★★★</div>
          <div class="bsd-score">4.9</div>
          <div class="bsd-count">from 2,847 reviews</div>
        </div>
      </a>

      <!-- wide card: website builder -->
      <a href="/custom-website-builder" class="bento-card bento-wide bento-website-card">
        <div class="bento-card-body">
          <div class="bento-eyebrow">Build Your Brand</div>
          <h3 class="bento-title">Branded Website Builder</h3>
          <p class="bento-text">Create a stunning, bookable website in minutes — no design skills needed. Your brand, your way.</p>
          <span class="bento-link">Explore →</span>
        </div>
        <div class="bento-website-preview">
          <div class="bwp-header">
            <div class="bwp-dot"></div><div class="bwp-dot"></div><div class="bwp-dot"></div>
            <div class="bwp-url">luxeatelier.certxa.com</div>
          </div>
          <div class="bwp-nav">Luxe Atelier <span>Book Now</span></div>
          <div class="bwp-hero-text">Award-winning colour <em>specialists</em></div>
          <div class="bwp-btn">Book an appointment</div>
        </div>
      </a>

      <!-- wide card: Revenue Intelligence -->
      <a href="/salonos#revenue-intelligence" class="bento-card bento-wide" style="background:linear-gradient(135deg,#0d0017,#1a0035,#0d001f);border:1px solid rgba(167,139,250,.3);position:relative;overflow:hidden;text-decoration:none;">
        <div style="position:absolute;top:-60px;right:-60px;width:250px;height:250px;background:radial-gradient(circle,rgba(109,40,217,.3) 0%,transparent 70%);pointer-events:none;"></div>
        <div class="bento-card-body" style="position:relative;z-index:1;">
          <div class="bento-eyebrow" style="color:#c4b5fd;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);border-radius:50px;display:inline-block;padding:3px 12px;">Revenue Intelligence</div>
          <h3 class="bento-title" style="color:#fff;">Revenue Co-Pilot</h3>
          <p class="bento-text" style="color:#9ca3af;">Finds your quietly drifting clients, calculates how much revenue you're losing, and automatically brings them back. No other salon platform does this.</p>
          <span class="bento-link" style="color:#a78bfa;">See how it works →</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;padding:0 24px 24px;position:relative;z-index:1;">
          <div style="background:rgba(0,0,0,.4);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:.72rem;">
              <div style="color:#a78bfa;font-weight:700;margin-bottom:2px;">📡 Client Drift Engine</div>
              <div style="color:#6b7280;">Sarah G. is 7 weeks past her cadence</div>
            </div>
            <div style="background:rgba(167,139,250,.2);color:#c4b5fd;font-size:.65rem;font-weight:700;padding:4px 10px;border-radius:50px;white-space:nowrap;">SMS sent ✓</div>
          </div>
          <div style="background:rgba(0,0,0,.4);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:.72rem;">
              <div style="color:#fbbf24;font-weight:700;margin-bottom:2px;">💸 Revenue Leakage</div>
              <div style="color:#6b7280;">8 lapsed clients · est. $3,200/yr lost</div>
            </div>
            <div style="background:rgba(251,191,36,.15);color:#fbbf24;font-size:.65rem;font-weight:700;padding:4px 10px;border-radius:50px;white-space:nowrap;">Recover →</div>
          </div>
          <div style="background:rgba(0,0,0,.4);border:1px solid rgba(74,222,128,.2);border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:.72rem;">
              <div style="color:#4ade80;font-weight:700;margin-bottom:2px;">📈 Growth Score</div>
              <div style="color:#6b7280;">74 / 100 · ↑ +6 from last month</div>
            </div>
            <div style="font-size:1.8rem;font-weight:800;color:#a78bfa;line-height:1;">74</div>
          </div>
        </div>
      </a>

    </div>
  </div>
</section>

<!-- ══════════════ STATEMENT SECTION ══════════════ -->
<section class="statement-section">
  <div class="container">
    <h2 class="statement-headline reveal">
      The only salon platform that tells you <em>exactly</em> where your revenue is leaking — and automatically goes to get it back.
    </h2>
    <p class="statement-sub reveal">
      Every other platform manages your calendar. SalonOS watches your data 24/7, catches clients going quiet before you do, fills dead seats, predicts no-shows, and recovers cancelled appointments — automatically.
    </p>
    <div class="statement-pills reveal">
      <?php foreach ([
        '60-day free trial', 'No credit card required', 'Setup in 5 minutes',
        '50,000+ pros trust Certxa', 'Rated 4.9 ★', 'Cancel any time',
        'Free card reader included', 'Free data migration', '24/7 live support',
      ] as $p): ?>
      <span class="statement-pill"><?= $p ?></span>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ══════════════ FEATURE SPOTLIGHT ══════════════ -->
<section class="spotlight-section">
  <div class="container">

    <div class="spotlight">
      <div class="spotlight-copy">
        <span class="tag tag-plum">Calendar &amp; Booking</span>
        <h2 class="spotlight-title">Your diary,<br><em>perfectly filled.</em></h2>
        <p class="spotlight-text">Certxa shows you gaps, suggests ideal booking times, and even sends rebooking nudges to clients who are overdue. On average our clients add 8 more bookings per week within the first month.</p>
        <ul class="feature-list">
          <li>Real-time availability synced across all channels</li>
          <li>Multi-staff, multi-location calendar management</li>
          <li>Google, Instagram &amp; Facebook booking integration</li>
          <li>Intelligent rebooking reminders sent automatically</li>
        </ul>
        <a href="/online-booking" class="btn btn-primary">Explore Online Booking →</a>
      </div>
      <div class="spotlight-visual spotlight-calendar">
        <div class="cal-shell">
          <div class="cal-header">
            <div class="cal-month">April 2026</div>
            <div class="cal-nav">‹ ›</div>
          </div>
          <div class="cal-days-header">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
          <div class="cal-grid">
            <div class="cal-day empty"></div>
            <div class="cal-day empty"></div>
            <div class="cal-day">1</div>
            <div class="cal-day booked">2<div class="cal-dot"></div></div>
            <div class="cal-day booked">3<div class="cal-dot"></div></div>
            <div class="cal-day booked full">4<div class="cal-dot gold"></div></div>
            <div class="cal-day">5</div>
            <div class="cal-day booked">6<div class="cal-dot"></div></div>
            <div class="cal-day booked">7<div class="cal-dot"></div></div>
            <div class="cal-day booked">8<div class="cal-dot"></div></div>
            <div class="cal-day booked full">9<div class="cal-dot gold"></div></div>
            <div class="cal-day booked full">10<div class="cal-dot gold"></div></div>
            <div class="cal-day booked">11<div class="cal-dot"></div></div>
            <div class="cal-day">12</div>
            <div class="cal-day booked">13<div class="cal-dot"></div></div>
            <div class="cal-day booked">14<div class="cal-dot"></div></div>
            <div class="cal-day today booked">15<div class="cal-dot gold"></div></div>
            <div class="cal-day booked">16<div class="cal-dot"></div></div>
            <div class="cal-day booked full">17<div class="cal-dot gold"></div></div>
            <div class="cal-day booked full">18<div class="cal-dot gold"></div></div>
            <div class="cal-day">19</div>
            <div class="cal-day booked">20<div class="cal-dot"></div></div>
            <div class="cal-day booked">21<div class="cal-dot"></div></div>
            <div class="cal-day booked">22<div class="cal-dot"></div></div>
            <div class="cal-day booked">23<div class="cal-dot"></div></div>
            <div class="cal-day booked full">24<div class="cal-dot gold"></div></div>
            <div class="cal-day booked full">25<div class="cal-dot gold"></div></div>
            <div class="cal-day">26</div>
            <div class="cal-day booked">27<div class="cal-dot"></div></div>
            <div class="cal-day booked">28<div class="cal-dot"></div></div>
            <div class="cal-day booked">29<div class="cal-dot"></div></div>
            <div class="cal-day booked full">30<div class="cal-dot gold"></div></div>
          </div>
          <div class="cal-legend">
            <span><span class="legend-dot"></span> Booked</span>
            <span><span class="legend-dot gold"></span> Fully booked</span>
          </div>
        </div>
        <div class="cal-stat-badge">
          <div class="csb-value">94%</div>
          <div class="csb-label">booking fill rate</div>
        </div>
      </div>
    </div>

    <div class="spotlight spotlight-reverse">
      <div class="spotlight-copy">
        <span class="tag tag-gold">Payments</span>
        <h2 class="spotlight-title">Get paid.<br><em>Every time.</em></h2>
        <p class="spotlight-text">From online deposits that eliminate no-shows to instant in-person payments — Certxa makes getting paid effortless. Funds land in your bank by next day, guaranteed.</p>
        <ul class="feature-list">
          <li>Accept cards, Apple Pay, Google Pay &amp; cash</li>
          <li>Require deposits at booking — protect your time</li>
          <li>Send payment links via SMS in seconds</li>
          <li>Next-day payouts, every time</li>
        </ul>
        <a href="/payments" class="btn btn-primary">Explore Payments →</a>
      </div>
      <div class="spotlight-visual spotlight-payments-vis">
        <div class="pv-shell">
          <div class="pv-header">Payment Request</div>
          <div class="pv-amount-block">
            <div class="pv-service">BALAYAGE + COLOUR TREATMENT</div>
            <div class="pv-amount">$185<span>.00</span></div>
            <div class="pv-client">Sophie Hartley · 14 May 2026</div>
          </div>
          <div class="pv-methods">
            <div class="pv-method">🍎 Apple Pay</div>
            <div class="pv-method active">G Pay</div>
            <div class="pv-method">💳 Card</div>
          </div>
          <div class="pv-confirm-btn">Pay $185.00 →</div>
          <div class="pv-secure">🔒 PCI-DSS Secured · Bank-grade encryption</div>
        </div>
        <div class="pv-payout-badge">
          <span>⚡</span>
          <div><strong>Instant Payout</strong><small>Money in your bank today</small></div>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- ══════════════ REVENUE CO-PILOT SPOTLIGHT ══════════════ -->
<section style="background:linear-gradient(160deg,#0d0017 0%,#130025 60%,#0d001f 100%);padding:96px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-150px;right:-150px;width:500px;height:500px;background:radial-gradient(circle,rgba(109,40,217,.2) 0%,transparent 70%);pointer-events:none;"></div>
  <div style="position:absolute;bottom:-80px;left:-80px;width:350px;height:350px;background:radial-gradient(circle,rgba(167,139,250,.1) 0%,transparent 70%);pointer-events:none;"></div>
  <div class="container" style="position:relative;z-index:1;">

    <div class="spotlight" style="align-items:center;">
      <div class="spotlight-copy">
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.3);border-radius:50px;padding:5px 16px;margin-bottom:20px;">
          <span style="width:6px;height:6px;border-radius:50%;background:#a78bfa;box-shadow:0 0 8px #a78bfa;display:inline-block;"></span>
          <span style="font-size:.68rem;font-weight:700;color:#c4b5fd;letter-spacing:.12em;text-transform:uppercase;">Revenue Co-Pilot · Exclusive to SalonOS</span>
        </div>
        <h2 style="font-family:'Instrument Sans',sans-serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:800;line-height:1.1;letter-spacing:-.04em;color:#fff;margin-bottom:20px;">
          The only salon platform<br>
          that finds your<br>
          <em style="font-style:normal;color:#a78bfa;">missing revenue for you.</em>
        </h2>
        <p style="font-size:1rem;color:#9ca3af;line-height:1.75;margin-bottom:24px;">
          Every other platform manages your bookings. SalonOS also watches your data 24/7, spots clients going quiet before you do, and automatically reaches out to bring them back. Then it tells you exactly where every dollar is going and where it's leaking out.
        </p>
        <ul style="list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:10px;">
          <?php foreach ([
            ['📡', 'Client Drift Engine — auto-texts clients drifting past their personal cadence'],
            ['💸', 'Revenue Leakage Report — shows exactly which clients lapsed and how much it costs'],
            ['💺', 'Dead Seat Intelligence — fills your chronically slow time slots with one tap'],
            ['⚠️', 'No-Show Prediction — flags high-risk appointments every morning'],
            ['🎯', 'LTV + Churn Risk — surfaces your most valuable at-risk clients before you lose them'],
            ['📈', 'Growth Score — one 0–100 health number updated every day'],
          ] as [$icon, $label]): ?>
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:.88rem;color:#d1d5db;">
            <span style="font-size:1rem;line-height:1.5;flex-shrink:0;"><?= $icon ?></span>
            <span><?= $label ?></span>
          </li>
          <?php endforeach; ?>
        </ul>
        <a href="/salonos" class="btn btn-primary" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;margin-right:12px;">See Revenue Intelligence →</a>
        <a href="/auth?mode=register" style="color:#a78bfa;font-size:.88rem;font-weight:600;text-decoration:underline;text-underline-offset:3px;">Start free trial</a>
      </div>

      <!-- UI Visual -->
      <div class="spotlight-visual" style="background:rgba(255,255,255,.03);border:1px solid rgba(167,139,250,.2);border-radius:20px;padding:24px;min-height:400px;">

        <!-- Growth Score widget -->
        <div style="background:rgba(0,0,0,.4);border:1px solid rgba(167,139,250,.25);border-radius:14px;padding:20px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-size:.65rem;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;">Business Growth Score</div>
              <div style="font-family:'Instrument Sans',sans-serif;font-size:3.5rem;font-weight:800;color:#a78bfa;line-height:1;">74</div>
              <div style="font-size:.72rem;color:#4ade80;margin-top:4px;">↑ +6 from last month</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:.65rem;color:#6b7280;margin-bottom:8px;">Components</div>
              <?php foreach ([['Retention','88%','#4ade80'],['Rebooking','54%','#f87171'],['Utilization','71%','#fbbf24'],['Avg Ticket','↑ 12%','#60a5fa']] as [$l,$v,$c]): ?>
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:3px;font-size:.72rem;">
                <span style="color:#6b7280;"><?= $l ?></span><span style="color:<?= $c ?>;font-weight:700;"><?= $v ?></span>
              </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>

        <!-- At-risk alert -->
        <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:12px;padding:14px 16px;margin-bottom:12px;">
          <div style="font-size:.65rem;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;">⚠️ At-Risk This Week</div>
          <?php foreach ([['Emma Clarke','$1,240 LTV','High risk'],['Priya Shah','$890 LTV','Critical'],['Ava Liu','$2,100 LTV','High risk']] as [$n,$ltv,$risk]): ?>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.78rem;">
            <span style="color:#e5e7eb;"><?= $n ?></span>
            <span style="color:#fbbf24;"><?= $ltv ?></span>
            <span style="color:#f87171;font-size:.65rem;background:rgba(239,68,68,.15);padding:2px 8px;border-radius:50px;"><?= $risk ?></span>
          </div>
          <?php endforeach; ?>
          <div style="margin-top:10px;font-size:.72rem;color:#a78bfa;font-weight:600;cursor:pointer;">→ Send winback SMS to all 3 &nbsp;<span style="background:rgba(167,139,250,.2);padding:2px 8px;border-radius:50px;">One tap</span></div>
        </div>

        <!-- Revenue leakage summary -->
        <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:12px;padding:14px 16px;">
          <div style="font-size:.65rem;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;">💸 Revenue Leakage · This Month</div>
          <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px;">
            <span style="color:#9ca3af;">Lapsed clients</span><span style="color:#e5e7eb;font-weight:600;">8 clients</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.82rem;">
            <span style="color:#9ca3af;">Est. lost annual revenue</span><span style="color:#fbbf24;font-weight:700;">$3,200</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</section>

<!-- ══════════════ TESTIMONIALS — DARK ══════════════ -->
<section class="testi-dark-section">
  <div class="orb orb-gold-1"></div>
  <div class="container" style="position:relative;z-index:2;">
    <div class="section-header" style="color:var(--white);">
      <span class="tag tag-dark">Loved by Professionals</span>
      <h2 class="section-title" style="color:var(--white);">Real results.<br><em style="color:var(--gold-bright);">Real salons.</em></h2>
    </div>
    <div class="testi-dark-grid">
      <div class="testi-dark-card reveal">
        <div class="tdc-top">
          <div class="tdc-stars">★★★★★</div>
          <div class="tdc-metric-pill">
            <span class="tdc-metric-stat">+40%</span>
            <span class="tdc-metric-label">more bookings</span>
          </div>
        </div>
        <p class="tdc-quote">"Since switching to Certxa, my bookings are up 40% and no-shows have practically disappeared. The automated reminders alone pay for the entire subscription."</p>
        <div class="tdc-author">
          <div class="tdc-av" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">JM</div>
          <div class="tdc-info">
            <div class="tdc-name">Jessica Mitchell</div>
            <div class="tdc-role">Colour Specialist · London</div>
          </div>
        </div>
      </div>
      <div class="testi-dark-card reveal">
        <div class="tdc-top">
          <div class="tdc-stars">★★★★★</div>
          <div class="tdc-metric-pill">
            <span class="tdc-metric-stat">$320</span>
            <span class="tdc-metric-label">extra/month</span>
          </div>
        </div>
        <p class="tdc-quote">"The website builder is genuinely stunning. My clients constantly ask who built my site — I built it myself in an afternoon with zero tech experience. Absolutely worth it."</p>
        <div class="tdc-author">
          <div class="tdc-av" style="background:linear-gradient(135deg,#f9a8d4,#ec4899)">RP</div>
          <div class="tdc-info">
            <div class="tdc-name">Rachel Park</div>
            <div class="tdc-role">Nail Artist · Manchester</div>
          </div>
        </div>
      </div>
      <div class="testi-dark-card reveal">
        <div class="tdc-top">
          <div class="tdc-stars">★★★★★</div>
          <div class="tdc-metric-pill">
            <span class="tdc-metric-stat">6</span>
            <span class="tdc-metric-label">stylists managed</span>
          </div>
        </div>
        <p class="tdc-quote">"I run a team of 6 and Certxa keeps everything smooth. Client profiles are a game-changer — I know exactly what each person wants before they even sit down."</p>
        <div class="tdc-author">
          <div class="tdc-av" style="background:linear-gradient(135deg,#6ee7b7,#059669)">DK</div>
          <div class="tdc-info">
            <div class="tdc-name">David Kurosawa</div>
            <div class="tdc-role">Salon Owner · Birmingham</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ FAQ ══════════════ -->
<section class="section" style="background:var(--cream);">
  <div class="container" style="max-width:760px;">
    <div class="section-header">
      <span class="tag tag-plum">Common Questions</span>
      <h2 class="section-title">Everything you need to know about Certxa salon software</h2>
      <p class="section-subtitle">Can't find the answer you're looking for? <a href="#" style="color:var(--plum);font-weight:600;">Chat with our team →</a></p>
    </div>
    <div class="accordion">

      <div class="accordion-item">
        <button class="accordion-btn">What is Certxa? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Certxa is an all-in-one salon management software platform designed for beauty and wellness professionals. It combines online booking, client management, integrated payment processing, a POS system, automated SMS and email reminders, a website builder, and detailed analytics — all in one beautifully designed platform. Over 50,000 beauty professionals use Certxa to run and grow their businesses.</div>
      </div>

      <div class="accordion-item">
        <button class="accordion-btn">How much does Certxa cost? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Certxa offers a free 60-day trial with no credit card required. After your trial, plans start at just $29/month (Starter), $69/month (Scale), or $129/month (Enterprise). Every plan includes unlimited bookings, online booking, client management, and integrated payments — with no hidden fees and no long-term contracts.</div>
      </div>

      <div class="accordion-item">
        <button class="accordion-btn">Does Certxa work for solo stylists and small salons? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Absolutely. Certxa scales from solo beauty professionals all the way to multi-location salon chains. The Starter plan is designed specifically for independent stylists, nail technicians, and lash artists, while Scale and Enterprise plans support unlimited staff and multiple locations.</div>
      </div>

      <div class="accordion-item">
        <button class="accordion-btn">Can I migrate from GlossGenius, Vagaro, or another platform? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Yes — we handle the migration for you, completely free. We import your client list, appointment history, and service menu from all major platforms including GlossGenius, Vagaro, Square Appointments, Booksy, and Fresha. Most migrations complete in under an hour.</div>
      </div>

      <div class="accordion-item">
        <button class="accordion-btn">How does Certxa reduce no-shows? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Certxa sends fully automated SMS and email reminders at intervals you control — typically 72 hours and 24 hours before each appointment. Salons using Certxa report an average 68% reduction in no-shows. You can also require an upfront deposit at the time of booking for additional protection on high-value services.</div>
      </div>

      <div class="accordion-item">
        <button class="accordion-btn">Is Certxa available on iPhone and Android? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Yes — Certxa has native apps for both iOS (iPhone and iPad) and Android so you can manage your business from anywhere. Your clients can also book through any web browser without downloading anything. Your salon is always open, even when you're not.</div>
      </div>

    </div>
  </div>
</section>

<!-- INTERNAL LINKING: Salon Types & Resources -->
<section style="background:var(--cream);padding:48px 0;border-top:1px solid var(--light-grey);">
  <div class="container" style="max-width:960px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;">
      <div>
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--plum);margin-bottom:14px;">Built for your salon type</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/hair-salon-software" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>✂️</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Hair salon scheduling software</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
          <a href="/nail-salon-software" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>💅</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Nail salon management software</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
          <a href="/barbershop-software" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>💈</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Barbershop booking software</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
        </div>
      </div>
      <div>
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--plum);margin-bottom:14px;">Compare & explore</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/vs-glossgenius" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>⚖️</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Certxa vs GlossGenius</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
          <a href="/vs-vagaro" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>⚖️</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Certxa vs Vagaro</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
          <a href="/case-studies" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>⭐</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Success stories & case studies</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
          <a href="/blog" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:10px 14px;background:var(--white);border:1px solid var(--light-grey);border-radius:var(--radius-sm);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)'">
            <span>📖</span><span style="font-size:.88rem;font-weight:600;color:var(--charcoal);">Salon business blog & guides</span><span style="margin-left:auto;color:var(--plum);font-size:.8rem;">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ CTA ══════════════ -->
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <span class="tag tag-dark" style="margin-bottom:18px;display:inline-block;">Get Started Today</span>
    <h2 class="cta-title">Ready to grow your<br><em>salon business?</em></h2>
    <p class="cta-text">Join over 50,000 beauty professionals who trust Certxa to run their business every day.</p>
    <div class="cta-actions">
      <a href="/auth?mode=register" class="btn btn-gold btn-lg">Start Free Trial — It's Free</a>
      <a href="/pricing" class="btn btn-outline-white btn-lg">See Pricing</a>
    </div>
    <p class="cta-note">60-day free trial &middot; No credit card required &middot; Cancel any time</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
