<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Hair Salon Software | Scheduling & Management for Hair Salons — Certxa');
define('PAGE_DESC',     'Certxa is the hair salon software loved by stylists and salon owners. Online booking, multi-stylist calendars, automated reminders, client colour formulas, integrated payments & POS. Free 60-day trial.');
define('PAGE_KEYWORDS', 'hair salon software, hair salon booking software, hair salon scheduling software, salon management software for hair salons, hairdresser booking app, hair salon management system, stylist scheduling software, colour salon software, hairdresser software');
define('PAGE_CANONICAL','https://certxa.com/hair-salon-software.php');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview.php'],
  ['name'=>'Hair Salon Software','url'=>'https://certxa.com/hair-salon-software.php'],
]));
define('PAGE_SCHEMA', json_encode([
  ['@type'=>'FAQPage','mainEntity'=>[
    ['@type'=>'Question','name'=>'What is the best software for hair salons?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Certxa is purpose-built for hair salons, from independent stylists to large multi-chair salons. It offers 24/7 online booking, multi-stylist calendars, colour formula storage, automated reminders, integrated payments, Reserve with Google, and a branded website builder — all in one platform with a 60-day free trial.']],
    ['@type'=>'Question','name'=>'Can I store colour formulas for each hair client?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Yes — Certxa client profiles let you record full colour formulas including brand, developer strength, application technique, processing time, and notes. These are available before every appointment so any stylist can recreate the exact result.']],
    ['@type'=>'Question','name'=>'Does Certxa support multiple stylists in a hair salon?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Yes — Certxa supports unlimited staff members, each with their own calendar, service menu, and working hours. Clients can book with a specific stylist or request the next available one. The day-view calendar shows all stylists side by side.']],
  ]],
  ['@type'=>'SoftwareApplication','@id'=>'https://certxa.com/#hair-software','name'=>'Certxa Hair Salon Software','applicationCategory'=>'BusinessApplication','operatingSystem'=>'Web, iOS, Android','offers'=>['@type'=>'Offer','price'=>'0','priceCurrency'=>'USD','description'=>'60-day free trial, then from $29/month'],'aggregateRating'=>['@type'=>'AggregateRating','ratingValue'=>'4.9','bestRating'=>'5','ratingCount'=>'1891']],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<section class="hero-dark-section has-video" style="padding:100px 0 80px;">
  <div class="hero-video-bg">
    <video autoplay muted loop playsinline preload="metadata" poster="">
      <source src="/videos/hair_salon.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hero-video-overlay"></div>
  <div class="orb orb-1"></div><div class="orb orb-2"></div>
  <div class="container">
    <div class="hero-dark-inner">
      <div class="hero-dark-copy animate-fade-up">
        <div class="hero-stars-row">
          <span class="stars-badge"><span>✂️</span><span>Built for Hair Salons & Stylists</span></span>
        </div>
        <h1 class="hero-dark-headline">Hair salon<br>software stylists<br><em>actually love.</em></h1>
        <p class="hero-dark-sub">From a single chair to a full team — manage every booking, every client, and every payment in one beautifully simple platform built for hair salons.</p>
        <div class="hero-dark-actions">
          <a href="#" class="btn btn-gold btn-lg">Start 60-Day Free Trial</a>
          <a href="/pricing.php" class="btn-play-wrap"><span class="btn-play-icon">→</span><span>See pricing</span></a>
        </div>
        <div style="margin-top:28px;font-size:.82rem;color:rgba(255,255,255,.6);">No credit card required &middot; Trusted by 30,000+ stylists</div>
      </div>
      <div class="hero-dark-visual animate-fade-up animate-delay-2">
        <div class="ui-card" style="max-width:340px;width:100%;">
          <div style="font-size:.72rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;">Colour Formula — Emma Clarke</div>
          <?php $formula = [['Base shade','7N — Wella Koleston'],['Highlights','9/16 + 12% developer'],['Toner','T18 Wella / 20vol'],['Processing','45 min + 15 cool'],['Technique','Balayage — freehand'],['Result','★★★★★ Client loved']];
          foreach ($formula as $f): ?>
          <div class="ui-row">
            <span style="font-size:.8rem;color:var(--mid-grey);"><?= $f[0] ?></span>
            <span style="font-size:.8rem;font-weight:600;color:var(--charcoal);"><?= $f[1] ?></span>
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
      <div class="stat-item"><div class="stat-value"><span>40</span>%</div><div class="stat-label">Average increase in bookings</div></div>
      <div class="stat-item"><div class="stat-value"><span>68</span>%</div><div class="stat-label">Fewer no-shows with reminders</div></div>
      <div class="stat-item"><div class="stat-value"><span>70</span>%</div><div class="stat-label">Of bookings come in after hours</div></div>
      <div class="stat-item"><div class="stat-value"><span>60</span>day</div><div class="stat-label">Free trial — no card needed</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:900px;">
    <div class="section-header">
      <span class="tag tag-plum">Made for Hair</span>
      <h2 class="section-title">Every feature a hair salon owner needs</h2>
    </div>
    <div class="bento">
      <?php $feats = [
        ['Colour Formula Storage','Record brand, developer, technique, processing time and results for every client. Any stylist can recreate the exact look — every single time.','bento-card'],
        ['Multi-Stylist Day View','See your entire team\'s schedule side by side — Emma, Sophie, James and the whole crew — in a beautiful day-view calendar. Spot gaps and fill them instantly.','bento-card'],
        ['24/7 Online Booking','Clients book cuts, colours, blowouts, and treatments any time. Your booking page works while you sleep.','bento-card bento-wide'],
        ['Deposit Protection','Require a deposit for balayage and colour services. Protect your longest, highest-value appointments from last-minute cancellations.','bento-card'],
        ['Automated Reminders','SMS and email reminders go out automatically 72h and 24h before each appointment — slashing your no-show rate without any effort.','bento-card'],
        ['Reserve with Google','A "Book Now" button appears directly on your Google Search and Maps listing — capturing clients the exact moment they search for a hair salon near them.','bento-card bento-wide'],
      ];
      foreach ($feats as $f): ?>
      <div class="<?= $f[2] ?>"><h3 class="bento-title"><?= $f[0] ?></h3><p class="bento-text"><?= $f[1] ?></p></div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="testi-dark-section">
  <div class="container" style="max-width:960px;">
    <div class="section-header" style="text-align:center;margin-bottom:48px;">
      <h2 class="section-title" style="color:var(--white);">Stylists and salon owners trust Certxa.</h2>
    </div>
    <div class="testi-dark-grid">
      <?php $quotes = [
        [
          'quote' => 'My no-shows went from 6 a week to under 1 in the first month. The deposit feature changed everything for my colour clients.',
          'name'  => 'Jessica M.', 'role' => 'Colour Specialist, London',
          'stat'  => '+40%', 'stat_label' => 'revenue up',
          'grad'  => 'linear-gradient(135deg,#a78bfa,#7c3aed)',
        ],
        [
          'quote' => "The colour formula storage alone is worth it. I can see every single client's history before they arrive. My clients are blown away.",
          'name'  => 'Rachel P.', 'role' => 'Hair Salon Owner, Manchester',
          'stat'  => '5★', 'stat_label' => 'top rated',
          'grad'  => 'linear-gradient(135deg,#f9a8d4,#ec4899)',
        ],
        [
          'quote' => 'I was sceptical about switching. The migration took 45 minutes and I had a full day\'s bookings by the next morning.',
          'name'  => 'Sophie K.', 'role' => 'Salon Owner, Birmingham',
          'stat'  => 'Day 1', 'stat_label' => 'results',
          'grad'  => 'linear-gradient(135deg,#6ee7b7,#059669)',
        ],
      ];
      foreach ($quotes as $q): ?>
      <div class="testi-dark-card reveal">
        <div class="tdc-top">
          <div class="tdc-stars">★★★★★</div>
          <div class="tdc-metric-pill">
            <span class="tdc-metric-stat"><?= $q['stat'] ?></span>
            <span class="tdc-metric-label"><?= $q['stat_label'] ?></span>
          </div>
        </div>
        <p class="tdc-quote">"<?= $q['quote'] ?>"</p>
        <div class="tdc-author">
          <div class="tdc-av" style="background:<?= $q['grad'] ?>"><?= substr($q['name'],0,2) ?></div>
          <div class="tdc-info">
            <div class="tdc-name"><?= $q['name'] ?></div>
            <div class="tdc-role"><?= $q['role'] ?></div>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:720px;">
    <div class="section-header"><span class="tag tag-plum">FAQ</span><h2 class="section-title">Hair salon software — common questions</h2></div>
    <div class="accordion">
      <div class="accordion-item"><button class="accordion-btn">Does Certxa work for a solo stylist? <span class="accordion-icon">+</span></button><div class="accordion-body">Absolutely — the Starter plan at $29/month is built for independent stylists and solo operators. You get online booking, client management, colour formula storage, automated reminders, integrated payments, and a branded website. Everything you need to run your business professionally, without the overhead of a full salon system.</div></div>
      <div class="accordion-item"><button class="accordion-btn">Can I store colour formulas and service notes per client? <span class="accordion-icon">+</span></button><div class="accordion-body">Yes — each client profile in Certxa has a dedicated notes and formula section where you can record colour brand, developer, technique, processing time, photos, and any personal preferences. These notes are visible to any stylist before the appointment, so every visit delivers a consistent, personalised result.</div></div>
      <div class="accordion-item"><button class="accordion-btn">Does Certxa support multi-stylist hair salons? <span class="accordion-icon">+</span></button><div class="accordion-body">Yes — Certxa supports unlimited staff members, each with their own calendar, service menu, and working hours. The day-view calendar shows all stylists side by side so you can see your whole team's day at a glance and spot any gaps to fill.</div></div>
      <div class="accordion-item"><button class="accordion-btn">How does Reserve with Google work for hair salons? <span class="accordion-icon">+</span></button><div class="accordion-body">Reserve with Google places a "Book Now" button directly in your Google Search and Maps listing. When someone searches "hair salon near me" or your salon's name, they can book instantly without visiting another website. Certxa connects to Reserve with Google automatically — no technical setup required.</div></div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <h2 class="cta-title">The hair salon software<br><em>your clients will thank you for.</em></h2>
    <p class="cta-text">Join 30,000+ stylists and salon owners who run their business on Certxa.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold btn-lg">Start 60-Day Free Trial</a>
      <a href="/pricing.php" class="btn btn-outline-white">See Pricing</a>
    </div>
    <p class="cta-note">60-day free trial &middot; No credit card required &middot; Setup in 5 minutes</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
