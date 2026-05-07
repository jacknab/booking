<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'SalonOS by Certxa — The Complete All-in-One Salon Operating System');
define('PAGE_DESC',     'SalonOS by Certxa bundles online booking, front desk calendar, built-in POS, loyalty rewards, client check-in, waitlist management, and Google review automation into one powerful salon operating system.');
define('PAGE_KEYWORDS', 'salon operating system, all-in-one salon software, salon POS booking loyalty, salon front desk software, SalonOS, salon management system, salon check-in software, salon waitlist, salon loyalty program');
define('PAGE_CANONICAL', 'https://certxa.com/salonos.php');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview.php'],
  ['name'=>'SalonOS','url'=>'https://certxa.com/salonos.php'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'       => 'WebPage',
    '@id'         => 'https://certxa.com/salonos.php',
    'name'        => 'SalonOS by Certxa — All-in-One Salon Operating System',
    'description' => 'SalonOS is the complete salon operating system by Certxa, bundling booking, POS, loyalty, check-in, waitlist, and review management into one platform.',
    'url'         => 'https://certxa.com/salonos.php',
    'isPartOf'    => ['@id'=>'https://certxa.com/#website'],
  ],
  [
    '@type'       => 'SoftwareApplication',
    'name'        => 'SalonOS by Certxa',
    'applicationCategory' => 'BusinessApplication',
    'operatingSystem'     => 'Web, iOS, Android',
    'offers' => ['@type'=>'Offer','price'=>'0','priceCurrency'=>'USD','description'=>'60-day free trial. No credit card required.'],
    'aggregateRating' => ['@type'=>'AggregateRating','ratingValue'=>'4.9','bestRating'=>'5','ratingCount'=>'3814'],
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<style>
/* ── SalonOS page-scoped overrides ─────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&display=swap');

.sos-page { background:#F7F3FF; }

.sos-hero {
  background: linear-gradient(160deg, #F7F3FF 0%, #EDE8FF 50%, #F3EEFF 100%);
  padding: 120px 0 100px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* soft blob decorations */
.sos-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.sos-blob-1 { width:500px;height:500px;background:rgba(180,83,9,.07); top:-120px;right:-100px; }
.sos-blob-2 { width:400px;height:400px;background:rgba(109,40,217,.07); bottom:-80px;left:-80px; }

.sos-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #D8CCFF;
  border-radius: 50px;
  padding: 6px 18px;
  margin-bottom: 32px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: .72rem;
  font-weight: 700;
  color: var(--plum);
  letter-spacing: .12em;
  text-transform: uppercase;
  box-shadow: 0 2px 12px rgba(59,7,100,.06);
}

.sos-headline {
  font-family: 'Instrument Sans', sans-serif;
  font-size: clamp(3rem, 7vw, 6.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -.04em;
  color: #1a0033;
  max-width: 900px;
  margin: 0 auto 28px;
}
.sos-headline em {
  font-style: normal;
  color: var(--plum);
}
.sos-headline .sos-gold {
  color: #B45309;
}

.sos-sub {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  color: #5b4a7a;
  max-width: 580px;
  margin: 0 auto 40px;
  line-height: 1.75;
}

/* 7-module pill row */
.sos-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 780px;
  margin: 0 auto 48px;
}
.sos-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #fff;
  border: 1px solid #e5dbff;
  border-radius: 50px;
  padding: 8px 18px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: .82rem;
  font-weight: 600;
  color: #3d2265;
  box-shadow: 0 2px 8px rgba(59,7,100,.06);
  white-space: nowrap;
}
.sos-pill-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sos-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}
.sos-btn-primary {
  font-family: 'Instrument Sans', sans-serif;
  background: var(--plum);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 15px 34px;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(59,7,100,.25);
  transition: transform .2s, box-shadow .2s;
}
.sos-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(59,7,100,.3); }
.sos-btn-outline {
  font-family: 'Instrument Sans', sans-serif;
  background: transparent;
  color: var(--plum);
  border: 1.5px solid #c4b0e8;
  border-radius: 50px;
  padding: 14px 30px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color .2s, background .2s;
}
.sos-btn-outline:hover { background:#f0eaff; border-color:var(--plum); }

.sos-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Inter', sans-serif;
  font-size: .82rem;
  color: #7c6aa0;
}

/* Light pastel background for rest of page */
.sos-stats { background: #fff; border-top:1px solid #ede8ff; border-bottom:1px solid #ede8ff; }
/* Override .stats-strip's default white-on-plum treatment:
   on .sos-stats the background is white, so the numbers need
   a dark colour and the labels a mid-grey. */
.sos-stats::before { display: none; }                        /* kill the gold radial glow — invisible on white anyway */
.sos-stats .stat-value { color: #1a0333; }                    /* deep plum numerals */
.sos-stats .stat-value span { color: #6D28D9; }               /* keep the accent digits in brand plum, not gold */
.sos-stats .stat-label { color: #6b5a85; }                    /* readable muted purple-grey */
.sos-section { background: #F7F3FF; }
.sos-pricing-cta { background: #EDE8FF; border-top:1px solid #d8ccff; }
</style>

<div class="sos-page">

<!-- ── HERO ─────────────────────────────────────────────── -->
<section class="sos-hero">
  <div class="sos-blob sos-blob-1"></div>
  <div class="sos-blob sos-blob-2"></div>

  <div class="container">
    <div class="sos-eyebrow">
      <span style="width:7px;height:7px;border-radius:50%;background:var(--plum);display:inline-block;"></span>
      Introducing SalonOS by Certxa
    </div>

    <h1 class="sos-headline">
      One system.<br>
      <em>Everything</em> your<br>
      salon <span class="sos-gold">needs.</span>
    </h1>

    <p class="sos-sub">
      Stop juggling seven different tools. SalonOS brings booking, your front desk, POS, loyalty, check-in, waitlist, and Google reviews into one beautifully unified platform.
    </p>

    <!-- 7 module pills -->
    <div class="sos-pills">
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#7c3aed;"></span>Online Booking</span>
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#0f766e;"></span>Front Desk Calendar</span>
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#B45309;"></span>Built-in POS</span>
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#be185d;"></span>Loyalty Rewards</span>
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#059669;"></span>Client Check-In</span>
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#2563eb;"></span>Waitlist</span>
      <span class="sos-pill"><span class="sos-pill-dot" style="background:#d97706;"></span>Google Reviews</span>
    </div>

    <div class="sos-actions">
      <a href="#" class="sos-btn-primary">Start 60-Day Free Trial</a>
      <a href="/pricing.php" class="sos-btn-outline">View Pricing →</a>
    </div>

    <div class="sos-trust">
      <div class="avatar-stack">
        <div class="av-dot" style="background:linear-gradient(135deg,#a78bfa,#7c3aed)">JM</div>
        <div class="av-dot" style="background:linear-gradient(135deg,#f9a8d4,#ec4899)">RP</div>
        <div class="av-dot" style="background:linear-gradient(135deg,#fcd34d,#f59e0b)">DK</div>
        <div class="av-dot" style="background:linear-gradient(135deg,#6ee7b7,#059669)">SL</div>
      </div>
      <span><strong style="color:#3d2265;">50,000+</strong> salons running on SalonOS</span>
    </div>
  </div>
</section>

<!-- ── WHAT'S INSIDE SALONOS ─────────────────────────────── -->
<section class="stats-strip sos-stats">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value"><span data-count="7">0</span></div><div class="stat-label">Modules in one system</div></div>
      <div class="stat-item"><div class="stat-value"><span data-count="50">0</span>K+</div><div class="stat-label">Salons on SalonOS</div></div>
      <div class="stat-item"><div class="stat-value"><span data-count="60">0</span>-day</div><div class="stat-label">Free trial, no card needed</div></div>
      <div class="stat-item"><div class="stat-value">4.9<span style="font-size:1.8rem;">★</span></div><div class="stat-label">Average customer rating</div></div>
    </div>
  </div>
</section>

<!-- ── 7 MODULE DEEP DIVES ───────────────────────────────── -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Everything Included</span>
      <h2 class="section-title">Seven tools. One subscription.<br><em style="font-style:italic;color:var(--plum);">Zero switching costs.</em></h2>
      <p class="section-subtitle">Every module in SalonOS is purpose-built for salons and synced in real time — so your booking, your desk, your payments, and your marketing always know what the others are doing.</p>
    </div>

    <?php
    $modules = [
      [
        'num'   => '01',
        'tag'   => 'Online Booking',
        'color' => 'var(--plum)',
        'icon'  => '📅',
        'title' => 'Smart booking your clients love',
        'body'  => 'Let clients book 24/7 from your website, Google, Instagram, or a direct link. SalonOS shows real-time availability, matches clients to the right stylist, and sends automated reminders so no-shows become a thing of the past.',
        'bullets' => ['24/7 booking from any device','Real-time stylist availability','Automated SMS & email reminders','Instant confirmations & rescheduling','Embedded directly on your website'],
        'reverse' => false,
        'ui' => '<div class="ui-card" style="max-width:300px;">
          <div style="font-size:.7rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;">New Booking</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="background:var(--plum-light);border-radius:8px;padding:10px 12px;border-left:3px solid var(--plum);">
              <div style="font-size:.82rem;font-weight:600;color:var(--plum);">Balayage + Toner</div>
              <div style="font-size:.72rem;color:var(--mid-grey);">Thu 2 May · 10:00am · Sophie H.</div>
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:10px 12px;border-left:3px solid #059669;">
              <div style="font-size:.82rem;font-weight:600;color:#059669;">Confirmed ✓</div>
              <div style="font-size:.72rem;color:var(--mid-grey);">Reminder sent · $145 deposit held</div>
            </div>
          </div>
        </div>',
      ],
      [
        'num'   => '02',
        'tag'   => 'Front Desk Calendar',
        'color' => '#7c3aed',
        'icon'  => '🗓',
        'title' => 'A front desk that never sleeps',
        'body'  => 'Your receptionist\'s dream. A live multi-stylist calendar gives your whole team instant visibility of every appointment, break, and booking gap. Drag-and-drop rescheduling, colour-coded by stylist, with a daily run sheet that prints in one click.',
        'bullets' => ['Multi-stylist live calendar view','Drag-and-drop rescheduling','Colour-coded by team member','Printable daily run sheets','Block time, breaks & holidays'],
        'reverse' => true,
        'ui' => '<div class="ui-card" style="max-width:300px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong style="font-size:.85rem;">Thursday, 2 May</strong>
            <span style="font-size:.72rem;color:var(--plum);font-weight:600;">3 stylists</span>
          </div>
          <div style="display:flex;gap:6px;font-size:.65rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">
            <div style="flex:1;text-align:center;">Sophie</div>
            <div style="flex:1;text-align:center;">Emma</div>
            <div style="flex:1;text-align:center;">James</div>
          </div>
          <div style="display:flex;gap:6px;">
            <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
              <div style="background:#ede9fe;border-radius:6px;padding:6px 8px;font-size:.65rem;font-weight:600;color:#7c3aed;border-left:2px solid #7c3aed;">Balayage<br><span style="font-weight:400;color:#9ca3af;">10–12pm</span></div>
              <div style="background:#ede9fe;border-radius:6px;padding:6px 8px;font-size:.65rem;font-weight:600;color:#7c3aed;border-left:2px solid #7c3aed;">Cut+Style<br><span style="font-weight:400;color:#9ca3af;">2–3pm</span></div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
              <div style="background:#fef3c7;border-radius:6px;padding:6px 8px;font-size:.65rem;font-weight:600;color:#d97706;border-left:2px solid #d97706;">Colour<br><span style="font-weight:400;color:#9ca3af;">11–1pm</span></div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
              <div style="background:#d1fae5;border-radius:6px;padding:6px 8px;font-size:.65rem;font-weight:600;color:#059669;border-left:2px solid #059669;">Fade<br><span style="font-weight:400;color:#9ca3af;">9–10am</span></div>
              <div style="background:#d1fae5;border-radius:6px;padding:6px 8px;font-size:.65rem;font-weight:600;color:#059669;border-left:2px solid #059669;">Beard<br><span style="font-weight:400;color:#9ca3af;">11am</span></div>
            </div>
          </div>
        </div>',
      ],
      [
        'num'   => '03',
        'tag'   => 'Built-in POS',
        'color' => 'var(--gold)',
        'icon'  => '💳',
        'title' => 'Checkout in seconds, not minutes',
        'body'  => 'SalonOS\'s built-in point of sale handles services, retail, gift cards, splits, tips, and discounts — all synced instantly to every client record. Pair with Certxa Terminal Pro, Reader Flex, or iPhone Tap to Pay.',
        'bullets' => ['Service + retail in one checkout','Tipping prompts on every transaction','Split payments & gift card redemption','Next-day payouts to your bank','Syncs to client profiles automatically'],
        'reverse' => false,
        'ui' => '<div class="ui-card" style="max-width:300px;background:#1c1c1e;border:1px solid rgba(255,255,255,.1);">
          <div style="font-size:.7rem;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;">Checkout</div>
          <div class="ui-row" style="border-color:rgba(255,255,255,.08);"><span style="color:#D4D4D4;font-size:.82rem;">Balayage &amp; Toner</span><span style="color:#fff;font-weight:600;">$145.00</span></div>
          <div class="ui-row" style="border-color:rgba(255,255,255,.08);"><span style="color:#D4D4D4;font-size:.82rem;">Olaplex Treatment</span><span style="color:#fff;font-weight:600;">$25.00</span></div>
          <div style="border-top:1px solid rgba(255,255,255,.1);margin:10px 0;"></div>
          <div class="ui-row" style="border:none;"><span style="color:#9CA3AF;font-size:.78rem;">Tip (20%)</span><span style="color:var(--gold-bright);">+$34.00</span></div>
          <div class="ui-row" style="border:none;"><span style="color:#fff;font-weight:700;">Total</span><span style="color:#fff;font-weight:800;font-size:1rem;">$204.00</span></div>
          <div style="background:var(--gold-bright);color:#1a0033;text-align:center;padding:11px;border-radius:8px;margin-top:12px;font-weight:700;font-size:.88rem;">Charge $204.00 →</div>
        </div>',
      ],
      [
        'num'   => '04',
        'tag'   => 'Loyalty Rewards',
        'color' => '#ec4899',
        'icon'  => '⭐',
        'title' => 'Punch-card loyalty, built right in',
        'body'  => 'Set up a digital loyalty programme in minutes — no separate app required. Clients earn a stamp with every visit and unlock rewards you define. It\'s the classic punch-card experience, beautifully modernised and fully automated inside SalonOS.',
        'bullets' => ['Custom stamp-per-visit rules','Configurable rewards & tiers','Clients track progress in their booking app','Auto-applied at checkout','Push-notification reward alerts'],
        'reverse' => true,
        'ui' => '<div class="ui-card" style="max-width:300px;">
          <div style="font-size:.7rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;">Loyalty Card · Emma Clarke</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px;">
            '.implode('', array_map(fn($i) => '<div style="aspect-ratio:1;border-radius:10px;background:'.($i<=4?'linear-gradient(135deg,#ec4899,#f472b6)':'rgba(0,0,0,.06)').';display:flex;align-items:center;justify-content:center;font-size:'.($i<=4?'.85':'1').';'.($i<=4?'box-shadow:0 3px 10px rgba(236,72,153,.3);':'border:1.5px dashed #d1d5db;').'">'
              .($i<=4 ? '★' : '').
            '</div>', range(1,10))).'
          </div>
          <div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">
            <div><div style="font-size:.78rem;font-weight:700;color:#ec4899;">4 of 10 stamps</div><div style="font-size:.65rem;color:#9ca3af;">6 more visits to unlock</div></div>
            <div style="font-size:.75rem;font-weight:700;color:#ec4899;background:#fff;border-radius:8px;padding:4px 10px;border:1px solid #fbcfe8;">Free Blow-dry</div>
          </div>
        </div>',
      ],
      [
        'num'   => '05',
        'tag'   => 'Client Check-In',
        'color' => '#10b981',
        'icon'  => '✅',
        'title' => 'Effortless arrival, every time',
        'body'  => 'Clients tap a QR code at your door or check in via their confirmation link. SalonOS notifies the stylist instantly, moves the appointment to "Arrived", and your front desk stays free to focus on the experience rather than the admin.',
        'bullets' => ['QR code self check-in at the door','Instant stylist notification','Auto-updates appointment status','Walk-in check-in from front desk','Works on any device — no app download'],
        'reverse' => false,
        'ui' => '<div class="ui-card" style="max-width:300px;">
          <div style="font-size:.7rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;">Today\'s Check-Ins</div>
          '.implode('', array_map(fn($c) => '
          <div class="ui-row">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,'.($c[2]).'),#fff;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#fff;flex-shrink:0;">'.$c[0][0].'</div>
              <div><div style="font-size:.82rem;font-weight:600;color:var(--charcoal);">'.$c[0].'</div><div style="font-size:.65rem;color:var(--mid-grey);">'.$c[3].'</div></div>
            </div>
            <span style="font-size:.65rem;font-weight:700;color:'.$c[1][1].';background:'.$c[1][0].';border-radius:50px;padding:3px 9px;flex-shrink:0;">'.$c[1][2].'</span>
          </div>', [
            ['Emma Clarke',  ['#d1fae5','#059669','Arrived'],  'linear-gradient(135deg,#a78bfa,#7c3aed)', '10:00am · Balayage'],
            ['Sophie Hart',  ['#fef3c7','#d97706','In Chair'],  'linear-gradient(135deg,#fcd34d,#f59e0b)', '10:30am · Blowout'],
            ['Jessica Lee',  ['#f3f4f6','#6b7280','Waiting'],  'linear-gradient(135deg,#6ee7b7,#059669)', '11:00am · Cut'],
          ])).'
        </div>',
      ],
      [
        'num'   => '06',
        'tag'   => 'Waitlist Management',
        'color' => '#3b82f6',
        'icon'  => '⏳',
        'title' => 'Never lose a walk-in again',
        'body'  => 'When you\'re fully booked, SalonOS captures walk-ins on a live digital waitlist. The moment a slot opens up, the next client is automatically notified and given a one-tap confirmation window. You fill cancellations instantly and clients feel looked after.',
        'bullets' => ['Live digital waitlist for walk-ins','Auto-text when a slot opens','One-tap client confirmation','Priority bumping for loyalty members','Estimated wait time display'],
        'reverse' => true,
        'ui' => '<div class="ui-card" style="max-width:300px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <div style="font-size:.7rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.1em;">Live Waitlist</div>
            <span style="background:#eff6ff;color:#3b82f6;font-size:.65rem;font-weight:700;border-radius:50px;padding:3px 10px;">3 waiting</span>
          </div>
          '.implode('', array_map(fn($w) => '
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--light-grey);">
            <div style="width:26px;height:26px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#3b82f6;flex-shrink:0;">'.$w[0].'</div>
            <div style="flex:1;"><div style="font-size:.8rem;font-weight:600;color:var(--charcoal);">'.$w[1].'</div><div style="font-size:.65rem;color:var(--mid-grey);">'.$w[2].'</div></div>
            <div style="font-size:.65rem;font-weight:700;color:#3b82f6;">'.$w[3].'</div>
          </div>', [
            ['1','Marcus B.','Fade &amp; Beard Trim','~8 min'],
            ['2','Priya S.','Blow-dry &amp; Style','~22 min'],
            ['3','Claire W.','Nail Gel Full Set','~35 min'],
          ])).'
        </div>',
      ],
      [
        'num'   => '07',
        'tag'   => 'Google Review Management',
        'color' => '#f59e0b',
        'icon'  => '🌟',
        'title' => 'More 5-star reviews, on autopilot',
        'body'  => 'After every appointment, SalonOS sends a perfectly timed review request via SMS. Positive reviews are directed straight to Google. Negative ones are captured privately so you can resolve them first. Your rating climbs without you lifting a finger.',
        'bullets' => ['Auto review request after checkout','Direct link to your Google listing','Negative review intercept & private inbox','Track rating trends over time','Works alongside Reserve With Google'],
        'reverse' => false,
        'ui' => '<div class="ui-card" style="max-width:300px;">
          <div style="text-align:center;padding:8px 0 16px;">
            <div style="font-size:2.4rem;font-weight:800;color:var(--charcoal);letter-spacing:-.04em;">4.9</div>
            <div style="color:#F59E0B;font-size:1.1rem;letter-spacing:3px;margin:4px 0;">★★★★★</div>
            <div style="font-size:.72rem;color:var(--mid-grey);">Based on 312 Google reviews</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
            '.implode('', array_map(fn($r) => '
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--mid-grey);width:10px;">'.$r[0].'★</span>
              <div style="flex:1;height:6px;background:var(--light-grey);border-radius:3px;overflow:hidden;"><div style="width:'.$r[1].'%;height:100%;background:'.($r[0]==5?'#F59E0B':($r[0]==4?'#FCD34D':'#d1d5db')).';border-radius:3px;"></div></div>
              <span style="font-size:.65rem;color:var(--mid-grey);width:24px;">'.$r[2].'</span>
            </div>', [[5,88,'274'],[4,9,'28'],[3,2,'7'],[2,1,'2'],[1,0,'1']])).'
          </div>
          <div style="background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(245,158,11,.04));border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:1rem;">📨</span>
            <div><div style="font-size:.72rem;font-weight:700;color:var(--charcoal);">6 new reviews this week</div><div style="font-size:.65rem;color:var(--mid-grey);">All 5-star · 0 negative</div></div>
          </div>
        </div>',
      ],
    ];

    foreach ($modules as $idx => $m):
      $rev = $m['reverse'];
    ?>
    <div class="feature-block <?= $rev ? 'reverse' : '' ?>" style="margin-bottom:80px;">
      <div class="feature-content">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:700;color:<?= $m['color'] ?>;opacity:.3;line-height:1;"><?= $m['num'] ?></span>
          <span class="tag" style="background:<?= $m['color'] ?>18;color:<?= $m['color'] ?>;border:1px solid <?= $m['color'] ?>44;"><?= $m['icon'] ?> <?= $m['tag'] ?></span>
        </div>
        <h3 class="feature-title" style="color:var(--charcoal);"><?= $m['title'] ?></h3>
        <p class="feature-text"><?= $m['body'] ?></p>
        <ul class="feature-list">
          <?php foreach ($m['bullets'] as $b): ?>
          <li><?= $b ?></li>
          <?php endforeach; ?>
        </ul>
        <a href="#" class="btn btn-primary" style="margin-top:24px;">Try <?= $m['tag'] ?> Free</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,var(--cream),var(--cream-dark));">
        <?= $m['ui'] ?>
      </div>
    </div>
    <?php endforeach; ?>

  </div>
</section>

<!-- ── SALONOS PRICING CTA ───────────────────────────────── -->
<section class="sos-pricing-cta" style="padding:72px 0;">
  <div class="container" style="text-align:center;">
    <span class="tag tag-plum" style="margin-bottom:16px;display:inline-block;">Simple Pricing</span>
    <h2 style="font-family:'Instrument Sans',sans-serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:800;color:var(--plum);letter-spacing:-.03em;margin-bottom:16px;">
      All 7 modules.<br>One straightforward price.
    </h2>
    <p style="font-size:1rem;color:#5b4a7a;max-width:500px;margin:0 auto 36px;line-height:1.75;">
      No picking and choosing features. SalonOS gives you everything from day one — booking, POS, loyalty, check-in, waitlist, and reviews — all in one plan.
    </p>
    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
      <a href="#" class="sos-btn-primary">Start 60-Day Free Trial</a>
      <a href="/pricing.php" class="sos-btn-outline">View Plans &amp; Pricing</a>
    </div>
    <p style="font-size:.78rem;color:#7c6aa0;margin-top:16px;">No credit card required &middot; All 7 modules included &middot; Cancel any time</p>
  </div>
</section>

<!-- ── CTA ───────────────────────────────────────────────── -->
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <span class="tag" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:16px;display:inline-block;">SalonOS by Certxa</span>
    <h2 class="cta-title">Your salon's new<br><em>operating system.</em></h2>
    <p class="cta-text">Join 50,000+ beauty professionals running their entire business on SalonOS — the only platform built to handle everything, together.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold">Start Free Trial</a>
      <a href="/contact.php" class="btn btn-outline-white">Talk to Us</a>
    </div>
    <p class="cta-note">60-day free trial &middot; All modules included &middot; No credit card</p>
  </div>
</section>

</div><!-- /sos-page -->

<?php require 'includes/footer.php'; ?>
