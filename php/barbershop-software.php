<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Barbershop Software | Online Booking & Management for Barbers — Certxa');
define('PAGE_DESC',     'Certxa barbershop software makes it easy to fill every chair, manage walk-ins alongside bookings, accept card payments, and get more 5-star Google reviews. 60-day free trial for barbershops.');
define('PAGE_KEYWORDS', 'barbershop software, barber booking software, barber shop management software, barber scheduling app, online booking for barbershops, barber POS system, barber shop booking app, barber management system');
define('PAGE_CANONICAL','https://certxa.com/barbershop-software.php');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview.php'],
  ['name'=>'Barbershop Software','url'=>'https://certxa.com/barbershop-software.php'],
]));
define('PAGE_SCHEMA', json_encode([
  ['@type'=>'FAQPage','mainEntity'=>[
    ['@type'=>'Question','name'=>'What is the best software for barbershops?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Certxa is built for modern barbershops that want to take online bookings, manage multiple barbers, accept card payments, and grow their Google review rating — all in one place. It handles both pre-booked appointments and walk-in management with a 60-day free trial.']],
    ['@type'=>'Question','name'=>'Can I manage walk-in clients alongside bookings in Certxa?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Yes — Certxa\'s dashboard makes it easy to see your booked appointments alongside available slots for walk-ins. You can add walk-in clients directly to any barber\'s schedule in seconds.']],
  ]],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<section class="hero-dark-section has-video" style="padding:100px 0 80px;">
  <div class="hero-video-bg">
    <video autoplay muted loop playsinline preload="metadata" poster="">
      <source src="/videos/barbershop.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hero-video-overlay"></div>
  <div class="orb orb-1"></div><div class="orb orb-2"></div>
  <div class="container">
    <div class="hero-dark-inner">
      <div class="hero-dark-copy animate-fade-up">
        <div class="hero-stars-row">
          <span class="stars-badge"><span>💈</span><span>Built for Barbershops</span></span>
        </div>
        <h1 class="hero-dark-headline">Barbershop<br>software. No<br><em>frills. All results.</em></h1>
        <p class="hero-dark-sub">Fill every chair with online bookings, handle walk-ins with ease, get paid fast, and build a Google reputation that brings in new clients every week.</p>
        <div class="hero-dark-actions">
          <a href="#" class="btn btn-gold btn-lg">Start 60-Day Free Trial</a>
          <a href="/pricing.php" class="btn-play-wrap"><span class="btn-play-icon">→</span><span>See pricing</span></a>
        </div>
        <div style="margin-top:28px;font-size:.82rem;color:rgba(255,255,255,.6);">No credit card required &middot; Works for 1 or 10 barbers</div>
      </div>
      <div class="hero-dark-visual animate-fade-up animate-delay-2">
        <div class="ui-card" style="max-width:320px;width:100%;">
          <div style="font-size:.72rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;">Today's Chairs — 9 May 2026</div>
          <?php $chairs = [
            ['Jake P.','9:00am','Men\'s Cut','confirmed'],
            ['Tom Walsh','10:00am','Cut & Beard','confirmed'],
            ['Walk-in','11:30am','Men\'s Cut','walk-in'],
            ['Sam Fox','1:30pm','Fade + Design','confirmed'],
            ['David K.','3:00pm','Cut & Beard','pending'],
          ];
          foreach ($chairs as $c): ?>
          <div class="ui-row">
            <div>
              <div style="font-weight:600;font-size:.85rem;"><?= $c[0] ?></div>
              <div style="font-size:.75rem;color:var(--mid-grey);"><?= $c[1] ?> · <?= $c[2] ?></div>
            </div>
            <span class="ui-badge <?= $c[3] === 'walk-in' ? 'pending' : $c[3] ?>" style="<?= $c[3]==='walk-in' ? 'background:#FEF3C7;color:#92400E;' : '' ?>"><?= ucfirst($c[3]) ?></span>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="stats-strip">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value"><span>3x</span></div><div class="stat-label">More Google reviews in 90 days</div></div>
      <div class="stat-item"><div class="stat-value"><span>60</span>%</div><div class="stat-label">Of bookings made outside opening hours</div></div>
      <div class="stat-item"><div class="stat-value"><span>Free</span></div><div class="stat-label">Card reader included</div></div>
      <div class="stat-item"><div class="stat-value"><span>60</span>day</div><div class="stat-label">Free trial — no card needed</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:900px;">
    <div class="section-header"><span class="tag tag-plum">Built for Barbers</span><h2 class="section-title">Everything your barbershop needs to grow</h2></div>
    <div class="bento">
      <?php $feats = [
        ['Online Booking 24/7','Clients book their favourite barber any time from your website, Instagram, or Google. You wake up to a full schedule without picking up the phone.','bento-card'],
        ['Walk-In Management','Booked and walk-in clients managed side by side. Add walk-ins to any barber\'s schedule in seconds — no paper system, no confusion.','bento-card'],
        ['Reserve with Google','A "Book Now" button in your Google listing captures new clients the moment they search "barber near me". Certxa connects this automatically.','bento-card bento-wide'],
        ['Google Reviews on Autopilot','After every cut, Certxa sends an automatic review request. Watch your star rating climb without asking a single client yourself.','bento-card'],
        ['Fast Card Payments','Accept card, tap, and contactless in-chair with our free card reader. Tips handled automatically — no cash fumbling, no paper receipts.','bento-card'],
        ['Multi-Barber Scheduling','Manage two chairs or twenty. Each barber has their own calendar, services, and hours. See the whole shop at a glance every morning.','bento-card bento-wide'],
      ];
      foreach ($feats as $f): ?>
      <div class="<?= $f[2] ?>"><h3 class="bento-title"><?= $f[0] ?></h3><p class="bento-text"><?= $f[1] ?></p></div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="testi-dark-section">
  <div class="container" style="max-width:900px;">
    <div class="section-header" style="text-align:center;margin-bottom:40px;">
      <h2 class="section-title" style="color:var(--white);">Barbershops that switched to Certxa.</h2>
    </div>
    <div class="testi-dark-grid">
      <?php $quotes = [
        ['"I went from 12 Google reviews to 94 in three months. The automatic review requests after every cut did the whole job."','Marcus J.','Barbershop Owner, Chicago','82 new reviews'],
        ['"My clients book at 11pm for the next morning. Used to be I\'d lose that business. Now my chairs are full before I open."','James T.','Master Barber, Atlanta','+55% bookings'],
        ['"The card reader is slick and the tips screen is brilliant. My barbers love it and so do the customers."','David K.','The Fade Room, New York','★★★★★'],
      ];
      foreach ($quotes as $q): ?>
      <div class="testi-dark-card reveal">
        <div class="tdc-stars">★★★★★</div>
        <p class="tdc-quote"><?= $q[0] ?></p>
        <div class="tdc-author">
          <div class="tdc-av" style="background:linear-gradient(135deg,#6ee7b7,#059669)"><?= substr($q[1],0,2) ?></div>
          <div><div class="tdc-name"><?= $q[1] ?></div><div class="tdc-role"><?= $q[2] ?></div></div>
          <div class="tdc-metric"><span><?= $q[3] ?></span></div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:720px;">
    <div class="section-header"><span class="tag tag-plum">FAQ</span><h2 class="section-title">Barbershop software — common questions</h2></div>
    <div class="accordion">
      <div class="accordion-item"><button class="accordion-btn">Does Certxa handle walk-in clients? <span class="accordion-icon">+</span></button><div class="accordion-body">Yes — Certxa shows your booked appointments alongside open slots on each barber's calendar so you can add walk-in clients in seconds. Walk-ins are logged in the system just like booked clients, so you build a full client database over time.</div></div>
      <div class="accordion-item"><button class="accordion-btn">Can clients book a specific barber online? <span class="accordion-icon">+</span></button><div class="accordion-body">Yes — clients can choose their preferred barber when booking online, or select "any available" for maximum flexibility. Each barber has their own profile, calendar, and service list.</div></div>
      <div class="accordion-item"><button class="accordion-btn">How does Certxa help get more Google reviews? <span class="accordion-icon">+</span></button><div class="accordion-body">After every appointment, Certxa automatically sends the client a personalised follow-up message with a direct link to leave a Google review. This runs on autopilot — no chasing, no awkward asks. Most barbershops using Certxa triple their review count within 90 days.</div></div>
      <div class="accordion-item"><button class="accordion-btn">What card reader does Certxa use for barbershops? <span class="accordion-icon">+</span></button><div class="accordion-body">Certxa provides a free, sleek card reader that accepts chip, tap (contactless), and swipe payments. It connects wirelessly and syncs every transaction directly to your dashboard. Tips are built into the checkout screen — no separate device or app needed.</div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <h2 class="cta-title">The barbershop software<br><em>that works as hard as you do.</em></h2>
    <p class="cta-text">Online bookings, walk-ins, card payments, Google reviews — all in one place. Free for 60 days.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold btn-lg">Start 60-Day Free Trial</a>
      <a href="/pricing.php" class="btn btn-outline-white">See Pricing</a>
    </div>
    <p class="cta-note">60-day free trial &middot; No credit card &middot; Works for 1 or 10 barbers</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
