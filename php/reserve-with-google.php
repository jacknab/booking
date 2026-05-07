<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Reserve With Google for Salons | Book from Google Search & Maps — Certxa');
define('PAGE_DESC',     'Let clients book salon appointments directly from Google Search and Maps. Certxa\'s Reserve with Google integration captures every booking opportunity the moment someone searches for your salon online.');
define('PAGE_KEYWORDS', 'reserve with google salon, book with google salon, google salon booking, salon google maps booking, salon google search booking, beauty salon reserve with google, hair salon google booking, salon book now google');
define('PAGE_CANONICAL', 'https://certxa.com/reserve-with-google.php');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview.php'],
  ['name'=>'Reserve With Google','url'=>'https://certxa.com/reserve-with-google.php'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'       => 'WebPage',
    '@id'         => 'https://certxa.com/reserve-with-google.php',
    'name'        => 'Reserve With Google for Salons — Certxa',
    'description' => 'Enable clients to book salon appointments directly from Google Search and Maps with Certxa Reserve with Google integration.',
    'url'         => 'https://certxa.com/reserve-with-google.php',
    'isPartOf'    => ['@id'=>'https://certxa.com/#website'],
    'about'       => ['@id'=>'https://certxa.com/#software'],
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- HERO -->
<section class="hero hero-google" style="padding:110px 0 90px;">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-copy animate-fade-up">
        <div class="hero-badge"><span class="tag" style="background:#DBEAFE;color:#1E3A8A;">Reserve With Google</span></div>
        <h1 class="hero-headline" style="color:#1E3A8A;">Be booked the moment<br><em style="color:#2563EB;">clients find you.</em></h1>
        <p class="hero-subtext">When someone searches for your salon on Google — or finds you on Maps — they see a Book Now button right there in the search results. One tap and they're booked. No friction, no lost clients.</p>
        <div class="hero-actions">
          <a href="#" class="btn btn-primary">Enable Reserve With Google</a>
          <a href="#" class="btn btn-secondary">Learn How It Works</a>
        </div>
        <p class="hero-note">Setup in under 10 minutes &middot; No extra cost &middot; Works on all devices</p>
      </div>
      <div class="hero-visual animate-fade-up animate-delay-2">
        <div class="hero-mockup" style="background:#fff;">
          <div class="hero-mockup-header">
            <div class="mockup-dot red"></div>
            <div class="mockup-dot yellow"></div>
            <div class="mockup-dot green"></div>
            <div class="mockup-bar" style="font-size:.75rem;">google.com — "hair salon near me"</div>
          </div>
          <!-- Google search result mockup -->
          <div style="background:#fff;border-radius:8px;border:1px solid #E5E7EB;padding:16px;font-family:Arial,sans-serif;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <div style="width:36px;height:36px;border-radius:8px;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">✂️</div>
              <div>
                <div style="font-size:.9rem;font-weight:700;color:#1a0dab;">Aria Hair Studio</div>
                <div style="font-size:.75rem;color:#006621;">Open now &middot; Closes 7pm</div>
              </div>
              <div style="margin-left:auto;font-size:.78rem;font-weight:600;color:#F59E0B;">★★★★★ 4.9 (127)</div>
            </div>
            <div style="font-size:.8rem;color:#4B5563;margin-bottom:14px;line-height:1.5;">Award-winning colour salon in the heart of Shoreditch. Specialists in balayage, highlights, and creative colour.</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
              <div style="background:#1a73e8;color:#fff;border-radius:6px;padding:9px;text-align:center;font-size:.8rem;font-weight:700;cursor:pointer;">📅 Book an appointment</div>
              <div style="background:#F3F4F6;color:#1a0dab;border-radius:6px;padding:9px;text-align:center;font-size:.8rem;font-weight:600;cursor:pointer;">📞 Call now</div>
            </div>
            <div style="font-size:.72rem;color:#9CA3AF;text-align:center;">Powered by <span style="color:#1a73e8;font-weight:600;">Reserve with Google</span></div>
          </div>
        </div>
        <div class="hero-badge-float top-right" style="top:-12px;right:-20px;">
          <div class="badge-icon">🔍</div>
          <div class="badge-text"><strong>Found on Google</strong><span>Booked in 2 taps</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="stats-strip">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value"><span>28</span>%</div><div class="stat-label">More bookings from new clients</div></div>
      <div class="stat-item"><div class="stat-value"><span>5B</span></div><div class="stat-label">Google searches every day</div></div>
      <div class="stat-item"><div class="stat-value"><span>2</span></div><div class="stat-label">Taps from search to booking</div></div>
      <div class="stat-item"><div class="stat-value"><span>10</span>min</div><div class="stat-label">To set up and go live</div></div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">How It Works</span>
      <h2 class="section-title">Turn Google searches into booked appointments</h2>
      <p class="section-subtitle">Google is where your next client is searching right now. Make sure they can book with you before they even think of going elsewhere.</p>
    </div>

    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-plum">Search &amp; Maps</span>
        <h3 class="feature-title">A "Book" button right in Google results</h3>
        <p class="feature-text">When Certxa connects to your Google Business Profile, a "Book an appointment" button appears directly on your Google Search and Google Maps listing. Clients can check availability and confirm a booking without leaving Google — reducing the chance they'll find someone else.</p>
        <ul class="feature-list">
          <li>Book button on Google Search results</li>
          <li>Book button on Google Maps listings</li>
          <li>Real-time availability shown in Google</li>
          <li>Instant confirmation sent to client and you</li>
          <li>Booking synced directly to your Certxa calendar</li>
        </ul>
        <a href="#" class="btn btn-primary">Connect Google Now</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#EFF6FF,#DBEAFE);">
        <div style="width:100%;max-width:300px;">
          <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:var(--shadow-md);margin-bottom:12px;">
            <div style="font-size:.72rem;font-weight:700;color:var(--mid-grey);margin-bottom:10px;text-transform:uppercase;letter-spacing:.08em;">Client selects a time</div>
            <div style="font-size:.85rem;font-weight:600;margin-bottom:10px;">Cut &amp; Blow Dry · 60 min</div>
            <?php
            $times = ['10:00', '11:00', '14:00', '15:30', '16:00'];
            echo '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
            foreach ($times as $i => $t) {
              $active = $i === 2;
              echo '<div style="background:'.($active ? '#1a73e8' : '#F3F4F6').';color:'.($active ? '#fff' : '#374151').';padding:8px;border-radius:6px;text-align:center;font-size:.8rem;font-weight:'.($active ? '700' : '500').';cursor:pointer;">'.$t.'</div>';
            }
            echo '</div>';
            ?>
          </div>
          <div style="background:#1a73e8;color:#fff;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:.88rem;cursor:pointer;">
            Confirm Booking
          </div>
          <div style="text-align:center;font-size:.72rem;color:#9CA3AF;margin-top:8px;">No account needed &middot; Instant confirmation</div>
        </div>
      </div>
    </div>

    <div class="feature-block reverse">
      <div class="feature-content">
        <span class="tag tag-gold">Always Accurate</span>
        <h3 class="feature-title">Your Google availability is always up to date</h3>
        <p class="feature-text">Certxa's two-way sync means whatever changes in your calendar is instantly reflected on Google — and whatever's booked through Google instantly appears in Certxa. You'll never get a double booking or show incorrect availability.</p>
        <ul class="feature-list">
          <li>Real-time two-way calendar sync</li>
          <li>Blocked times, holidays, and breaks respected</li>
          <li>Multi-staff support — clients choose a stylist</li>
          <li>Automatic updates — no manual syncing required</li>
        </ul>
        <a href="#" class="btn btn-primary">Start Free Trial</a>
      </div>
      <div class="feature-visual">
        <div style="text-align:center;width:100%;max-width:300px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:24px;">
            <div style="background:#fff;border-radius:12px;padding:14px;box-shadow:var(--shadow-md);font-size:.85rem;font-weight:700;">Certxa<br><span style="color:var(--plum);">Calendar</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
              <div style="background:var(--plum);color:#fff;padding:4px 10px;border-radius:20px;font-size:.7rem;font-weight:600;">→ Synced</div>
              <div style="background:#1a73e8;color:#fff;padding:4px 10px;border-radius:20px;font-size:.7rem;font-weight:600;">← Synced</div>
            </div>
            <div style="background:#fff;border-radius:12px;padding:14px;box-shadow:var(--shadow-md);font-size:.85rem;font-weight:700;"><span style="color:#1a73e8;font-size:1.2rem;">G</span><br>Google</div>
          </div>
          <div class="integration-pill" style="margin:0 auto 10px;justify-content:center;"><span class="dot"></span>Live sync active</div>
          <div style="font-size:.8rem;color:var(--mid-grey);">Last synced 0 seconds ago</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Quick Setup</span>
      <h2 class="section-title">Live on Google in three steps</h2>
    </div>
    <div class="steps-grid">
      <div class="step">
        <div class="step-number">1</div>
        <h4 class="step-title">Connect your Google Business Profile</h4>
        <p class="step-text">Link your existing Google Business Profile to Certxa in one click. If you don't have one yet, we guide you through setting it up — it takes minutes.</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <h4 class="step-title">Configure your services</h4>
        <p class="step-text">Choose which services you'd like to show on Google and set your availability. Everything is pulled directly from your Certxa account — no duplication.</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <h4 class="step-title">Go live and start booking</h4>
        <p class="step-text">Within minutes your Google listing shows the Book button. New clients can start booking straight from search results and Google Maps immediately.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <span class="tag" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:16px;display:inline-block;">Capture Every Opportunity</span>
    <h2 class="cta-title">Your next client is<br><em>already searching.</em></h2>
    <p class="cta-text">Make it effortless for new clients to find and book you directly from Google — the world's biggest search engine working for your salon, 24 hours a day.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold">Enable Reserve With Google</a>
      <a href="#" class="btn btn-outline-white">See Pricing</a>
    </div>
    <p class="cta-note">Included on all plans &middot; Setup in under 10 minutes</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
