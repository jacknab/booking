<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Salon POS System & Card Reader | Point of Sale for Beauty Salons — Certxa');
define('PAGE_DESC',     'The salon POS system built for beauty professionals. Accept card payments in-person with our sleek card reader, manage your register, and sync every sale instantly with your Certxa dashboard. Free card reader included.');
define('PAGE_KEYWORDS', 'salon POS system, salon point of sale, hair salon card reader, beauty salon POS, salon payment terminal, salon checkout system, nail salon POS, salon card payment machine, beauty POS software');
define('PAGE_CANONICAL', 'https://certxa.com/card-reader-pos');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
  ['name'=>'Card Reader & POS','url'=>'https://certxa.com/card-reader-pos'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'       => 'WebPage',
    '@id'         => 'https://certxa.com/card-reader-pos',
    'name'        => 'Salon POS System & Card Reader — Certxa',
    'description' => 'Accept in-person card payments with the Certxa salon POS system and card reader, built exclusively for beauty professionals.',
    'url'         => 'https://certxa.com/card-reader-pos',
    'isPartOf'    => ['@id'=>'https://certxa.com/#website'],
    'about'       => ['@id'=>'https://certxa.com/#software'],
  ],
  [
    '@type'       => 'Product',
    'name'        => 'Certxa Salon Card Reader & POS System',
    'description' => 'Sleek, purpose-built card reader and point of sale system for hair salons, nail salons, and beauty studios. Accepts chip, tap, and swipe. Syncs instantly with your Certxa dashboard.',
    'brand'       => ['@type'=>'Brand','name'=>'Certxa'],
    'offers' => [
      '@type'         => 'Offer',
      'price'         => '0',
      'priceCurrency' => 'USD',
      'description'   => 'Free card reader included with eligible Certxa plans. No setup fees.',
    ],
    'aggregateRating' => [
      '@type'       => 'AggregateRating',
      'ratingValue' => '4.8',
      'bestRating'  => '5',
      'ratingCount' => '1243',
    ],
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- HERO -->
<section class="hero hero-pos" style="padding:110px 0 90px;">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-copy animate-fade-up">
        <div class="hero-badge"><span class="tag" style="background:rgba(255,255,255,.15);color:#fff;">Card Reader &amp; POS</span></div>
        <h1 class="hero-headline" style="color:#fff;">Payments made<br><em style="color:var(--gold-bright);">beautiful &amp; fast.</em></h1>
        <p class="hero-subtext">Accept every payment effortlessly — cards, contactless, Apple Pay, and Google Pay — with our elegant card reader and fully-integrated point of sale built exclusively for beauty professionals.</p>
        <div class="hero-actions">
          <a href="#" class="btn btn-gold">Get Your Card Reader</a>
          <a href="#" class="btn btn-outline-white">See Pricing</a>
        </div>
        <p class="hero-note" style="color:rgba(255,255,255,.5);">Competitive rates &middot; Next-day payouts &middot; No monthly hardware fee</p>
      </div>
      <div class="hero-visual animate-fade-up animate-delay-2">
        <div class="hero-mockup" style="background:#292524;border:1px solid #44403C;">
          <div class="hero-mockup-header">
            <div class="mockup-dot red"></div>
            <div class="mockup-dot yellow"></div>
            <div class="mockup-dot green"></div>
            <div class="mockup-bar" style="background:#44403C;color:#D4D4D4;">Checkout — Emma Clarke</div>
          </div>
          <div style="padding:4px 0;">
            <?php
            $items = [
              ['Balayage & Toner', '$145.00'],
              ['Olaplex Treatment', '$25.00'],
              ['Style Finish', '$15.00'],
            ];
            foreach ($items as $item):
            ?>
            <div class="ui-row" style="border-color:#44403C;">
              <span style="color:#D4D4D4;font-size:.88rem;"><?= $item[0] ?></span>
              <span style="color:#fff;font-weight:600;"><?= $item[1] ?></span>
            </div>
            <?php endforeach; ?>
            <div style="border-top:1px solid #44403C;margin:14px 0;"></div>
            <div class="ui-row" style="border:none;">
              <span style="color:#9CA3AF;font-size:.85rem;">Subtotal</span>
              <span style="color:#D4D4D4;">$185.00</span>
            </div>
            <div class="ui-row" style="border:none;">
              <span style="color:#9CA3AF;font-size:.85rem;">Discount (10%)</span>
              <span style="color:var(--gold-bright);">−$18.50</span>
            </div>
            <div class="ui-row" style="border:none;margin-top:4px;">
              <span style="color:#fff;font-weight:700;font-size:1rem;">Total</span>
              <span style="color:#fff;font-weight:700;font-size:1.1rem;">$166.50</span>
            </div>
            <div style="background:var(--gold-bright);color:#fff;text-align:center;padding:14px;border-radius:8px;margin-top:14px;font-weight:700;font-size:.95rem;cursor:pointer;">
              Charge $166.50 →
            </div>
            <div style="text-align:center;font-size:.75rem;color:#6B7280;margin-top:10px;">Apple Pay &middot; Google Pay &middot; Card &middot; Cash</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="stats-strip">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value"><span>1.4</span>%</div><div class="stat-label">Transaction fee — UK cards</div></div>
      <div class="stat-item"><div class="stat-value"><span>24h</span></div><div class="stat-label">Next-day payouts to your bank</div></div>
      <div class="stat-item"><div class="stat-value"><span>$0</span></div><div class="stat-label">Monthly hardware rental fee</div></div>
      <div class="stat-item"><div class="stat-value"><span>All</span></div><div class="stat-label">Payment types accepted</div></div>
    </div>
  </div>
</section>

<!-- ══ HARDWARE SHOWCASE ══════════════════════════════════ -->
<section id="hardware" style="background:linear-gradient(180deg,#0f0020 0%,#1a0033 60%,#0f0020 100%);padding:80px 0 90px;overflow:hidden;position:relative;">
  <!-- background orbs -->
  <div style="position:absolute;top:-100px;right:-80px;width:500px;height:500px;background:radial-gradient(circle,rgba(109,40,217,.18) 0%,transparent 65%);pointer-events:none;"></div>
  <div style="position:absolute;bottom:-60px;left:-60px;width:380px;height:380px;background:radial-gradient(circle,rgba(245,158,11,.1) 0%,transparent 65%);pointer-events:none;"></div>

  <div class="container">
    <div class="section-header" style="text-align:center;margin-bottom:64px;">
      <span class="tag tag-dark" style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.8);">Payment Hardware</span>
      <h2 class="section-title" style="color:#fff;">Three ways to get paid.<br><em style="color:var(--gold-bright);">All built into Certxa.</em></h2>
      <p class="section-subtitle" style="color:rgba(255,255,255,.6);">Whether you're at the desk, roaming the floor, or your client is paying on their own device — Certxa has the hardware for every moment.</p>
    </div>

    <div class="hw-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;align-items:start;">

      <!-- ── TERMINAL 1: Countertop Terminal ── -->
      <div style="text-align:center;">
        <!-- Device illustration -->
        <div style="display:flex;justify-content:center;margin-bottom:32px;">
          <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;">
            <!-- Terminal body -->
            <div style="
              width:170px;height:260px;
              background:linear-gradient(160deg,#3a3a3c 0%,#2c2c2e 40%,#1c1c1e 100%);
              border-radius:20px 20px 10px 10px;
              border:1.5px solid rgba(255,255,255,.12);
              box-shadow:0 40px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04),inset 0 1px 0 rgba(255,255,255,.1);
              position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding-top:14px;
            ">
              <!-- Camera/sensor bar -->
              <div style="width:60px;height:6px;background:#111;border-radius:3px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:4px;">
                <div style="width:6px;height:6px;border-radius:50%;background:#2a2a2e;"></div>
              </div>
              <!-- Screen -->
              <div style="
                width:142px;height:148px;
                background:linear-gradient(160deg,#0f0020,#1a0035);
                border-radius:8px;
                border:1px solid rgba(255,255,255,.08);
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                padding:14px 12px;
                position:relative;overflow:hidden;
              ">
                <!-- Screen glow -->
                <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(109,40,217,.25),transparent 70%);pointer-events:none;"></div>
                <div style="font-size:.52rem;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;">Certxa Pay</div>
                <div style="font-size:1.3rem;font-weight:800;color:#fff;letter-spacing:-.02em;margin-bottom:4px;">$166.50</div>
                <div style="font-size:.5rem;color:rgba(255,255,255,.4);margin-bottom:12px;">Emma Clarke · Balayage</div>
                <!-- Contactless rings -->
                <div style="position:relative;width:36px;height:36px;margin-bottom:10px;">
                  <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(245,158,11,.6);animation:nfcPulse 2s ease-out infinite;"></div>
                  <div style="position:absolute;inset:5px;border-radius:50%;border:1.5px solid rgba(245,158,11,.7);animation:nfcPulse 2s ease-out .4s infinite;"></div>
                  <div style="position:absolute;inset:10px;border-radius:50%;border:1.5px solid rgba(245,158,11,.9);animation:nfcPulse 2s ease-out .8s infinite;"></div>
                  <div style="position:absolute;inset:13px;border-radius:50%;background:var(--gold-bright);display:flex;align-items:center;justify-content:center;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                  </div>
                </div>
                <div style="font-size:.5rem;color:rgba(255,255,255,.35);">Tap · Chip · Swipe · Apple Pay</div>
              </div>
              <!-- Card slot -->
              <div style="width:100%;background:#111;height:1px;margin:12px 0 8px;"></div>
              <div style="width:90px;height:5px;background:linear-gradient(90deg,transparent,#111,#111,transparent);border-radius:2px;margin-bottom:8px;position:relative;">
                <div style="position:absolute;inset:1px;background:rgba(0,0,0,.5);border-radius:1px;"></div>
              </div>
              <!-- Keypad dots -->
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:72px;padding-bottom:8px;">
                <?php for($i=1;$i<=9;$i++): ?>
                <div style="height:10px;background:rgba(255,255,255,.06);border-radius:3px;"></div>
                <?php endfor; ?>
              </div>
              <!-- Bottom LED -->
              <div style="width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;margin:4px 0;"></div>
            </div>
            <!-- Base/stand -->
            <div style="width:190px;height:16px;background:linear-gradient(180deg,#3a3a3c,#2a2a2c);border-radius:0 0 12px 12px;border:1.5px solid rgba(255,255,255,.08);border-top:none;box-shadow:0 12px 30px rgba(0,0,0,.5);"></div>
            <div style="width:210px;height:8px;background:linear-gradient(180deg,#2a2a2c,#1a1a1c);border-radius:0 0 8px 8px;box-shadow:0 8px 20px rgba(0,0,0,.4);"></div>
          </div>
        </div>
        <!-- Label -->
        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px 20px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);border-radius:50px;padding:4px 12px;margin-bottom:12px;">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--gold-bright);display:inline-block;"></span>
            <span style="font-size:.68rem;font-weight:700;color:var(--gold-bright);text-transform:uppercase;letter-spacing:.1em;">Free with Scale plan</span>
          </div>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:600;color:#fff;margin-bottom:8px;">Certxa Terminal Pro</h3>
          <p style="font-size:.8rem;color:rgba(255,255,255,.55);line-height:1.6;margin-bottom:16px;">Full countertop terminal with a large touchscreen. Perfect for a reception desk or retail counter.</p>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:7px;text-align:left;">
            <?php foreach(['7" touchscreen display','Chip · contactless · swipe','Tipping &amp; split payments','Connects to Certxa app via Wi-Fi','Accepts Apple Pay &amp; Google Pay'] as $f): ?>
            <li style="font-size:.78rem;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:8px;"><span style="color:var(--gold-bright);">✓</span><?= $f ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>

      <!-- ── TERMINAL 2: Compact Tap-to-Pay & Swipe ── -->
      <div style="text-align:center;">
        <div style="display:flex;justify-content:center;margin-bottom:32px;">
          <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;gap:0;">
            <!-- Device body -->
            <div style="
              width:110px;height:165px;
              background:linear-gradient(160deg,#f0f0f2 0%,#e0e0e5 50%,#d0d0d8 100%);
              border-radius:18px;
              border:1.5px solid rgba(0,0,0,.1);
              box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.5),inset 0 1px 0 rgba(255,255,255,.9);
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              position:relative;overflow:visible;padding:16px 12px;
            ">
              <!-- Swipe slot on top edge -->
              <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:76px;height:5px;background:linear-gradient(180deg,#999,#555);border-radius:0 0 3px 3px;box-shadow:inset 0 2px 4px rgba(0,0,0,.4);"></div>

              <!-- NFC contactless zone / main face -->
              <div style="
                width:80px;height:80px;border-radius:50%;
                background:linear-gradient(145deg,#fff,#f0f0f0);
                border:2px solid rgba(0,0,0,.06);
                box-shadow:0 4px 16px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.8);
                display:flex;align-items:center;justify-content:center;
                position:relative;margin-bottom:14px;
              ">
                <!-- NFC waves SVG -->
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                  <path d="M21 8 C28.7 8 35 14.3 35 22" stroke="#3B0764" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
                  <path d="M21 14 C25.4 14 29 17.6 29 22" stroke="#3B0764" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
                  <path d="M21 20 C22.7 20 24 21.3 24 23" stroke="#3B0764" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
                  <circle cx="21" cy="25" r="2.5" fill="#3B0764" opacity="0.9"/>
                  <path d="M21 8 C13.3 8 7 14.3 7 22" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
                  <path d="M21 14 C16.6 14 13 17.6 13 22" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
                  <path d="M21 20 C19.3 20 18 21.3 18 23" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
                </svg>
              </div>
              <!-- LED status indicator -->
              <div style="display:flex;gap:4px;margin-bottom:10px;">
                <div style="width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;"></div>
                <div style="width:7px;height:7px;border-radius:50%;background:rgba(0,0,0,.12);"></div>
                <div style="width:7px;height:7px;border-radius:50%;background:rgba(0,0,0,.12);"></div>
              </div>
              <!-- Brand mark -->
              <div style="font-size:.5rem;font-weight:800;letter-spacing:.18em;color:rgba(59,7,100,.5);text-transform:uppercase;">CERTXA</div>

              <!-- USB-C port at bottom -->
              <div style="position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);width:22px;height:5px;background:#bbb;border-radius:3px;border:1px solid rgba(0,0,0,.15);box-shadow:inset 0 1px 2px rgba(0,0,0,.2);"></div>
            </div>

            <!-- Status tag floating below -->
            <div style="margin-top:14px;font-size:.62rem;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;">Tap · Swipe · Chip</div>
          </div>
        </div>
        <!-- Label -->
        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px 20px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:50px;padding:4px 12px;margin-bottom:12px;">
            <span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;"></span>
            <span style="font-size:.68rem;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:.1em;">Free on all plans</span>
          </div>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:600;color:#fff;margin-bottom:8px;">Certxa Reader Flex</h3>
          <p style="font-size:.8rem;color:rgba(255,255,255,.55);line-height:1.6;margin-bottom:16px;">Ultra-compact wireless reader with tap &amp; swipe. Fits in a pocket. Works anywhere in your salon.</p>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:7px;text-align:left;">
            <?php foreach(['Contactless tap &amp; swipe slot','Apple Pay · Google Pay · cards','Bluetooth — no cables','8-hour battery life','Charges via USB-C'] as $f): ?>
            <li style="font-size:.78rem;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:8px;"><span style="color:#10b981;">✓</span><?= $f ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>

      <!-- ── TERMINAL 3: iPhone Tap to Pay ── -->
      <div style="text-align:center;">
        <div style="display:flex;justify-content:center;margin-bottom:32px;">
          <div style="position:relative;display:inline-block;">
            <!-- iPhone body -->
            <div style="
              width:148px;height:296px;
              background:linear-gradient(160deg,#2c2c2e 0%,#1c1c1e 60%,#111 100%);
              border-radius:44px;
              border:1.5px solid rgba(255,255,255,.15);
              box-shadow:0 40px 80px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.04),0 0 0 7px rgba(255,255,255,.03),0 0 0 8px rgba(255,255,255,.06);
              position:relative;overflow:hidden;
            ">
              <!-- Volume buttons (left) -->
              <div style="position:absolute;left:-3px;top:72px;width:3px;height:28px;background:#3a3a3c;border-radius:2px 0 0 2px;"></div>
              <div style="position:absolute;left:-3px;top:108px;width:3px;height:42px;background:#3a3a3c;border-radius:2px 0 0 2px;"></div>
              <div style="position:absolute;left:-3px;top:158px;width:3px;height:42px;background:#3a3a3c;border-radius:2px 0 0 2px;"></div>
              <!-- Power button (right) -->
              <div style="position:absolute;right:-3px;top:110px;width:3px;height:56px;background:#3a3a3c;border-radius:0 2px 2px 0;"></div>

              <!-- Screen content -->
              <div style="
                position:absolute;inset:0;
                background:linear-gradient(160deg,#0a001a,#1a0035);
                border-radius:42px;
                display:flex;flex-direction:column;align-items:center;
                padding:0 14px;
                overflow:hidden;
              ">
                <!-- Dynamic Island -->
                <div style="width:68px;height:28px;background:#000;border-radius:0 0 18px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:6px;flex-shrink:0;">
                  <div style="width:8px;height:8px;border-radius:50%;background:#1a1a1a;border:1px solid rgba(255,255,255,.08);"></div>
                  <div style="width:16px;height:10px;border-radius:5px;background:#1a1a1a;border:1px solid rgba(255,255,255,.08);"></div>
                </div>

                <!-- Time / status -->
                <div style="display:flex;justify-content:space-between;width:100%;margin-bottom:14px;flex-shrink:0;">
                  <span style="font-size:.55rem;font-weight:700;color:rgba(255,255,255,.8);">9:41</span>
                  <div style="display:flex;gap:3px;align-items:center;">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="rgba(255,255,255,.7)"><rect x="0" y="4" width="2" height="4"/><rect x="2.5" y="3" width="2" height="5"/><rect x="5" y="1.5" width="2" height="6.5"/><rect x="7.5" y="0" width="2" height="8"/></svg>
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="rgba(255,255,255,.7)"><path d="M4 .5L7 3l-1.1 1.1L4 2.7 2.1 4.1 1 3z"/><path d="M4 2.3L6.3 4.5l-1.1 1L4 4.3l-1.2 1.2-1.1-1z"/><circle cx="4" cy="6" r=".8"/></svg>
                    <div style="display:flex;align-items:center;gap:1px;"><div style="width:16px;height:7px;border:1px solid rgba(255,255,255,.6);border-radius:2px;padding:1px;"><div style="width:70%;height:100%;background:var(--gold-bright);border-radius:1px;"></div></div><div style="width:2px;height:4px;background:rgba(255,255,255,.4);border-radius:0 1px 1px 0;"></div></div>
                  </div>
                </div>

                <!-- App header -->
                <div style="font-size:.5rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.4);margin-bottom:4px;">Certxa POS</div>
                <div style="font-size:.78rem;font-weight:700;color:rgba(255,255,255,.7);margin-bottom:16px;">Emma Clarke</div>

                <!-- Amount display -->
                <div style="font-size:2.2rem;font-weight:800;color:#fff;letter-spacing:-.04em;line-height:1;margin-bottom:4px;">$145</div>
                <div style="font-size:.6rem;color:rgba(255,255,255,.4);margin-bottom:20px;">Balayage + Toner</div>

                <!-- Tap to Pay animation -->
                <div style="position:relative;width:72px;height:72px;margin-bottom:16px;flex-shrink:0;">
                  <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(245,158,11,.3);animation:nfcPulse 2.2s ease-out infinite;"></div>
                  <div style="position:absolute;inset:8px;border-radius:50%;border:1.5px solid rgba(245,158,11,.5);animation:nfcPulse 2.2s ease-out .5s infinite;"></div>
                  <div style="position:absolute;inset:16px;border-radius:50%;border:1.5px solid rgba(245,158,11,.7);animation:nfcPulse 2.2s ease-out 1s infinite;"></div>
                  <div style="position:absolute;inset:22px;border-radius:50%;background:rgba(245,158,11,.15);display:flex;align-items:center;justify-content:center;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold-bright)"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  </div>
                </div>

                <!-- Tap label -->
                <div style="font-size:.62rem;font-weight:600;color:var(--gold-bright);margin-bottom:14px;letter-spacing:.05em;">Hold card or phone near iPhone</div>

                <!-- Payment methods row -->
                <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">
                  <?php foreach(['Apple Pay','Google Pay','Card'] as $m): ?>
                  <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:3px 8px;font-size:.48rem;font-weight:600;color:rgba(255,255,255,.6);"><?= $m ?></div>
                  <?php endforeach; ?>
                </div>

                <!-- Home indicator -->
                <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:44px;height:4px;background:rgba(255,255,255,.25);border-radius:2px;"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- Label -->
        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px 20px;">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);border-radius:50px;padding:4px 12px;margin-bottom:12px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#60a5fa"><path d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-5 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v13z"/></svg>
            <span style="font-size:.68rem;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:.1em;">No hardware needed</span>
          </div>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:600;color:#fff;margin-bottom:8px;">Certxa Tap&nbsp;<span style="color:rgba(255,255,255,.4);font-weight:300;">(iOS)</span></h3>
          <p style="font-size:.8rem;color:rgba(255,255,255,.55);line-height:1.6;margin-bottom:16px;">Accept contactless payments directly on your iPhone — no card reader required. Just open Certxa and tap.</p>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:7px;text-align:left;">
            <?php foreach(['iPhone 15 &amp; later — no hardware','Apple Pay, Google Pay &amp; cards','Tap-to-pay in the Certxa app','Instant checkout from any screen','Requires iOS 16.4+'] as $f): ?>
            <li style="font-size:.78rem;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:8px;"><span style="color:#60a5fa;">✓</span><?= $f ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>

    </div><!-- /grid -->

    <div style="text-align:center;margin-top:48px;">
      <a href="#" class="btn btn-gold btn-lg">Get Your Free Hardware</a>
      <p style="color:rgba(255,255,255,.4);font-size:.78rem;margin-top:12px;">Hardware shipped free with Scale &amp; Enterprise plans &middot; Reader Flex included on all plans</p>
    </div>
  </div>
</section>

<style>
@keyframes nfcPulse {
  0%   { transform:scale(1);   opacity:.8; }
  70%  { transform:scale(1.18);opacity:0; }
  100% { transform:scale(1.18);opacity:0; }
}
</style>

<!-- FEATURES -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Seamless Payments</span>
      <h2 class="section-title">Every payment, perfectly handled</h2>
      <p class="section-subtitle">From checkout to your bank account — Certxa handles the full payment journey with professional hardware and smart software built just for salons.</p>
    </div>

    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-plum">Checkout Software</span>
        <h3 class="feature-title">A checkout experience your clients will love</h3>
        <p class="feature-text">All three Certxa payment options connect directly to the same smart POS — services, retail products, gift cards, discounts, splits, and tips all handled automatically and synced to every client profile.</p>
        <ul class="feature-list">
          <li>Works with Terminal Pro, Reader Flex &amp; iPhone Tap</li>
          <li>Tipping prompt built into every checkout flow</li>
          <li>Split payments across multiple methods</li>
          <li>Branded digital receipts sent via email automatically</li>
          <li>Every sale syncs instantly to client profiles &amp; reports</li>
        </ul>
        <a href="#" class="btn btn-primary">See the Full POS</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#1C1917,#292524);">
        <div style="text-align:center;color:#fff;">
          <div class="ui-card" style="max-width:280px;background:#1c1c1e;border:1px solid rgba(255,255,255,.1);">
            <div style="font-size:.72rem;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;">Checkout — Emma Clarke</div>
            <?php $items=[['Balayage &amp; Toner','$145.00'],['Olaplex Treatment','$25.00'],['Style Finish','$15.00']];
            foreach($items as $it): ?>
            <div class="ui-row" style="border-color:rgba(255,255,255,.08);">
              <span style="color:#D4D4D4;font-size:.85rem;"><?= $it[0] ?></span>
              <span style="color:#fff;font-weight:600;"><?= $it[1] ?></span>
            </div>
            <?php endforeach; ?>
            <div style="border-top:1px solid rgba(255,255,255,.1);margin:12px 0;"></div>
            <div class="ui-row" style="border:none;"><span style="color:#9CA3AF;font-size:.82rem;">Subtotal</span><span style="color:#D4D4D4;">$185.00</span></div>
            <div class="ui-row" style="border:none;"><span style="color:#9CA3AF;font-size:.82rem;">Discount (10%)</span><span style="color:var(--gold-bright);">−$18.50</span></div>
            <div class="ui-row" style="border:none;margin-top:4px;"><span style="color:#fff;font-weight:700;">Total</span><span style="color:#fff;font-weight:800;font-size:1.05rem;">$166.50</span></div>
            <div style="background:var(--gold-bright);color:#1a0033;text-align:center;padding:13px;border-radius:8px;margin-top:14px;font-weight:700;font-size:.9rem;cursor:pointer;">Charge $166.50 →</div>
            <div style="text-align:center;font-size:.7rem;color:#6B7280;margin-top:10px;">Apple Pay · Google Pay · Card · Cash</div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-block reverse">
      <div class="feature-content">
        <span class="tag tag-gold">Point of Sale</span>
        <h3 class="feature-title">A checkout experience your clients will love</h3>
        <p class="feature-text">Your Certxa point of sale handles it all — service checkout, retail product sales, discounts, gift cards, and split payments. Everything flows directly into your reports and client records automatically.</p>
        <ul class="feature-list">
          <li>Add products and retail items with one tap</li>
          <li>Apply percentage or fixed discounts</li>
          <li>Sell and redeem branded gift cards</li>
          <li>Split payments across multiple methods</li>
          <li>Tipping prompt on card reader screen</li>
        </ul>
        <a href="#" class="btn btn-primary">See the Full POS</a>
      </div>
      <div class="feature-visual">
        <div class="ui-card" style="width:100%;max-width:320px;">
          <div style="font-weight:700;font-size:.9rem;margin-bottom:14px;">Today's Sales Summary</div>
          <?php
          $sales = [['Services', '$842.00', '#059669'], ['Retail Products', '$124.50', '#059669'], ['Gift Cards Sold', '$75.00', 'var(--gold)'], ['Tips Collected', '$38.00', 'var(--plum)'], ['Total Revenue', '$1,079.50', 'var(--charcoal)']];
          foreach ($sales as $s):
          ?>
          <div class="ui-row" style="<?= $s[0] === 'Total Revenue' ? 'border-top:2px solid var(--charcoal);padding-top:12px;margin-top:4px;' : '' ?>">
            <span class="ui-row-label" style="<?= $s[0] === 'Total Revenue' ? 'font-weight:700;color:var(--charcoal);' : '' ?>"><?= $s[0] ?></span>
            <span class="ui-row-value" style="color:<?= $s[2] ?>;<?= $s[0] === 'Total Revenue' ? 'font-size:1.05rem;' : '' ?>"><?= $s[1] ?></span>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-plum">Financial Reporting</span>
        <h3 class="feature-title">Know exactly where every penny goes</h3>
        <p class="feature-text">Real-time revenue dashboards, staff performance breakdowns, service profitability analysis, and tax-ready reports — all generated automatically so you always have a clear picture of your business finances.</p>
        <ul class="feature-list">
          <li>Daily, weekly, and monthly revenue reports</li>
          <li>Per-stylist performance and commission tracking</li>
          <li>Tax summary reports for self-assessment</li>
          <li>Export to CSV or send directly to your accountant</li>
        </ul>
        <a href="#" class="btn btn-primary">Try It Free</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,var(--cream),var(--cream-dark));">
        <div class="ui-card" style="width:100%;max-width:320px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <strong style="font-size:.9rem;">Revenue — May 2025</strong>
            <span style="font-size:.8rem;color:#059669;font-weight:600;">↑ 23%</span>
          </div>
          <div style="display:flex;align-items:flex-end;gap:6px;height:90px;margin-bottom:12px;">
            <?php
            $bars = [55, 72, 48, 88, 65, 94, 78, 100, 82, 67, 90, 76];
            $labels = ['1','5','9','13','17','21','25','29','','','',''];
            foreach ($bars as $i => $h):
              $isHighest = $h === 100;
            ?>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:100%;background:<?= $isHighest ? 'var(--plum)' : 'var(--plum-light)' ?>;border-radius:3px 3px 0 0;height:<?= $h ?>%;transition:height .3s;"></div>
            </div>
            <?php endforeach; ?>
          </div>
          <div class="ui-row" style="border:none;padding-top:0;">
            <span style="font-size:.8rem;color:var(--mid-grey);">Month total</span>
            <span style="font-weight:700;color:var(--plum);font-size:1.05rem;">$14,280</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- COMPARISON -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Transparent Pricing</span>
      <h2 class="section-title">The most competitive rates for salon businesses</h2>
    </div>
    <div style="overflow-x:auto;">
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="text-align:left;">Feature</th>
            <th style="background:var(--plum-mid);">Certxa</th>
            <th>Square</th>
            <th>iZettle</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>UK card transaction fee</td><td><strong style="color:#059669;">1.4%</strong></td><td>1.75%</td><td>1.75%</td></tr>
          <tr><td>Monthly hardware fee</td><td><span class="check">✓ None</span></td><td class="cross">✗ $0–$16</td><td class="cross">✗ $0–$29</td></tr>
          <tr><td>Next-day payouts</td><td><span class="check">✓</span></td><td class="partial">2–3 days</td><td class="partial">2–3 days</td></tr>
          <tr><td>Salon-specific POS</td><td><span class="check">✓</span></td><td class="cross">✗</td><td class="cross">✗</td></tr>
          <tr><td>Booking integration</td><td><span class="check">✓ Built-in</span></td><td class="partial">Add-on</td><td class="cross">✗</td></tr>
          <tr><td>Client profiles linked to payments</td><td><span class="check">✓</span></td><td class="cross">✗</td><td class="cross">✗</td></tr>
          <tr><td>Gift cards</td><td><span class="check">✓</span></td><td class="partial">Add-on</td><td class="partial">Add-on</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <span class="tag" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:16px;display:inline-block;">Get Paid Faster</span>
    <h2 class="cta-title">Payments that work as<br><em>hard as you do.</em></h2>
    <p class="cta-text">Start accepting payments in minutes with Certxa's all-in-one card reader and POS system — with the lowest rates and fastest payouts in the industry.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold">Get Your Card Reader</a>
      <a href="#" class="btn btn-outline-white">View Pricing</a>
    </div>
    <p class="cta-note">No setup fees &middot; No monthly hardware costs &middot; Cancel any time</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
