<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Salon Payment Processing Software | Accept Cards, Deposits & More — Certxa');
define('PAGE_DESC',     'Accept card payments, require deposits, sell gift cards and memberships, and get paid instantly — all integrated into your Certxa salon management software. Low processing fees, no hidden costs.');
define('PAGE_KEYWORDS', 'salon payment processing, beauty salon payment software, salon card payments, salon deposit software, salon gift cards, salon memberships, hair salon payments, instant salon payouts, salon checkout software');
define('PAGE_CANONICAL', 'https://certxa.com/payments');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
  ['name'=>'Payment Solutions','url'=>'https://certxa.com/payments'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'       => 'WebPage',
    '@id'         => 'https://certxa.com/payments',
    'name'        => 'Salon Payment Processing Software — Certxa',
    'description' => 'Accept card payments, deposits, gift cards and memberships in your salon with Certxa integrated payment processing.',
    'url'         => 'https://certxa.com/payments',
    'isPartOf'    => ['@id'=>'https://certxa.com/#website'],
    'about'       => ['@id'=>'https://certxa.com/#software'],
  ],
  [
    '@type'       => 'Service',
    'name'        => 'Certxa Salon Payment Processing',
    'serviceType' => 'Salon Payment Software',
    'provider'    => ['@id'=>'https://certxa.com/#organization'],
    'description' => 'Integrated payment processing for salons: card payments, deposits, gift cards, memberships, and instant payouts in one platform.',
    'offers' => [
      '@type'         => 'Offer',
      'price'         => '0',
      'priceCurrency' => 'USD',
      'description'   => 'Included with all Certxa plans. Transaction fees from 2.49% + 15¢.',
    ],
    'areaServed'     => 'US',
    'availableLanguage' => 'English',
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- HERO -->
<section class="hero hero-payments" style="padding:110px 0 90px;">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-copy animate-fade-up">
        <div class="hero-badge"><span class="tag tag-gold">Payment Solutions</span></div>
        <h1 class="hero-headline">Get paid faster.<br><em>Every time.</em></h1>
        <p class="hero-subtext">Online payments, instant checkout links, deposits, gift cards, and memberships — a complete payment ecosystem designed exclusively for beauty professionals.</p>
        <div class="hero-actions">
          <a href="#" class="btn btn-primary">Start Accepting Payments</a>
          <a href="#" class="btn btn-secondary">View Rates</a>
        </div>
        <p class="hero-note">No setup fees &middot; PCI-DSS compliant &middot; Instant payouts available</p>
      </div>
      <div class="hero-visual animate-fade-up animate-delay-2">
        <div class="payment-hero-card glass-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <span style="font-weight:700;font-size:.9rem;color:var(--charcoal);">Payment Request</span>
            <span class="ui-badge confirmed">Paid</span>
          </div>
          <div style="background:linear-gradient(135deg,var(--plum),#6D28D9);border-radius:14px;padding:20px;margin-bottom:16px;color:#fff;">
            <div style="font-size:.75rem;opacity:.7;margin-bottom:4px;letter-spacing:.08em;text-transform:uppercase;">Balayage + Colour Treatment</div>
            <div style="font-size:2.4rem;font-family:'Cormorant Garamond',serif;font-weight:600;line-height:1;">$185<span style="font-size:1.2rem">.00</span></div>
            <div style="font-size:.78rem;opacity:.65;margin-top:6px;">Sophie Hartley &middot; 14 May 2025</div>
          </div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <div style="flex:1;background:var(--cream);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:1.1rem;margin-bottom:4px;">🍎</div>
              <div style="font-size:.7rem;font-weight:600;color:var(--charcoal);">Apple Pay</div>
            </div>
            <div style="flex:1;background:var(--cream);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:1.1rem;margin-bottom:4px;">G</div>
              <div style="font-size:.7rem;font-weight:600;color:var(--charcoal);">Google Pay</div>
            </div>
            <div style="flex:1;background:var(--cream);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:1.1rem;margin-bottom:4px;">💳</div>
              <div style="font-size:.7rem;font-weight:600;color:var(--charcoal);">Card</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--mid-grey);">
            <span style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block;flex-shrink:0;"></span>
            $185.00 paid &middot; In your account today
          </div>
        </div>
        <div class="hero-badge-float top-right">
          <div class="badge-icon">⚡</div>
          <div class="badge-text"><strong>Instant Payout</strong><span>Money in your bank today</span></div>
        </div>
        <div class="hero-badge-float bottom-left">
          <div class="badge-icon">🔒</div>
          <div class="badge-text"><strong>PCI-DSS Secure</strong><span>Bank-grade encryption</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="stats-strip">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value"><span>99.9</span>%</div><div class="stat-label">Payment success rate</div></div>
      <div class="stat-item"><div class="stat-value"><span>1.4</span>%</div><div class="stat-label">UK card processing rate</div></div>
      <div class="stat-item"><div class="stat-value"><span>0</span>s</div><div class="stat-label">Setup time for online payments</div></div>
      <div class="stat-item"><div class="stat-value"><span>All</span></div><div class="stat-label">Major cards &amp; digital wallets</div></div>
    </div>
  </div>
</section>

<!-- PAYMENT LINKS -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Complete Payment Ecosystem</span>
      <h2 class="section-title">Every way to get paid, all in one place</h2>
      <p class="section-subtitle">From the booking confirmation to the final tip, Certxa handles every payment touchpoint so you can focus on what you love — without chasing money.</p>
    </div>

    <!-- Payment Links -->
    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-gold">Payment Links</span>
        <h3 class="feature-title">Send a link. Get paid instantly.</h3>
        <p class="feature-text">Generate a branded payment link in seconds and send it to any client via SMS, WhatsApp, or email. They pay on any device — you see the money hit your account within minutes. No card machine needed.</p>
        <ul class="feature-list">
          <li>Custom branded checkout page with your salon logo</li>
          <li>Accepts Apple Pay, Google Pay, all major cards</li>
          <li>Send via SMS, email, WhatsApp, or DM</li>
          <li>Automatic receipt sent to client on payment</li>
          <li>Payment logged instantly in client profile</li>
        </ul>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="#" class="btn btn-primary">Try Payment Links</a>
          <a href="#" class="btn btn-secondary">See Example</a>
        </div>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,var(--plum-light),#DDD6FE);">
        <div class="ui-card" style="width:100%;max-width:300px;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--plum),var(--plum-mid));margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">💅</div>
            <div style="font-weight:700;font-size:.95rem;color:var(--charcoal);">The Colour Room</div>
            <div style="font-size:.8rem;color:var(--mid-grey);">Secure payment via Certxa</div>
          </div>
          <div style="background:var(--cream);border-radius:10px;padding:14px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:.85rem;color:var(--mid-grey);">Balayage Treatment</span>
              <span style="font-size:.85rem;font-weight:600;">$145</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:.85rem;color:var(--mid-grey);">Olaplex Add-on</span>
              <span style="font-size:.85rem;font-weight:600;">$25</span>
            </div>
            <div style="border-top:1px solid var(--light-grey);margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;">
              <span style="font-weight:700;font-size:.9rem;">Total</span>
              <span style="font-weight:700;font-size:.9rem;color:var(--plum);">$170</span>
            </div>
          </div>
          <div style="background:var(--plum);color:#fff;text-align:center;padding:13px;border-radius:10px;font-weight:600;font-size:.9rem;cursor:pointer;">Pay $170 Securely →</div>
          <div style="text-align:center;font-size:.72rem;color:var(--mid-grey);margin-top:10px;">🔒 Secured by Certxa Payments</div>
        </div>
      </div>
    </div>

    <!-- Deposits -->
    <div class="feature-block reverse">
      <div class="feature-content">
        <span class="tag tag-plum">Deposit Protection</span>
        <h3 class="feature-title">Stop no-shows before they happen.</h3>
        <p class="feature-text">Require a deposit at booking to protect your time and income. Set the amount — a fixed fee or percentage — and Certxa automatically charges it when a client books. No awkward conversations required.</p>
        <ul class="feature-list">
          <li>Set deposit rules per service, stylist, or salon-wide</li>
          <li>Auto-charge full balance on cancellation or no-show</li>
          <li>Graceful waiver system for VIP clients</li>
          <li>Deposit credited to final bill at checkout</li>
          <li>Clients informed clearly at booking — no surprises</li>
        </ul>
        <a href="#" class="btn btn-primary">Protect Your Revenue</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#1C1917,#292524);">
        <div class="ui-card" style="width:100%;max-width:300px;background:#292524;border:1px solid #44403C;">
          <div style="font-weight:700;font-size:.9rem;color:#fff;margin-bottom:4px;">Booking Deposit Required</div>
          <div style="font-size:.78rem;color:#9CA3AF;margin-bottom:16px;">Colour &amp; Highlights — $165 service</div>
          <div class="deposit-ring" style="width:100px;height:100px;border-radius:50%;background:conic-gradient(var(--gold-bright) 0% 30%,#44403C 30% 100%);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;position:relative;">
            <div style="width:72px;height:72px;border-radius:50%;background:#292524;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <div style="color:var(--gold-bright);font-weight:700;font-size:1.1rem;line-height:1;">$50</div>
              <div style="color:#9CA3AF;font-size:.65rem;">deposit</div>
            </div>
          </div>
          <div class="ui-row" style="border-color:#44403C;">
            <span style="color:#9CA3AF;font-size:.82rem;">Service total</span>
            <span style="color:#D4D4D4;font-weight:600;">$165.00</span>
          </div>
          <div class="ui-row" style="border-color:#44403C;">
            <span style="color:#9CA3AF;font-size:.82rem;">Deposit charged now</span>
            <span style="color:var(--gold-bright);font-weight:600;">$50.00</span>
          </div>
          <div class="ui-row" style="border-color:#44403C;border-bottom:none;">
            <span style="color:#9CA3AF;font-size:.82rem;">Balance due at appointment</span>
            <span style="color:#D4D4D4;font-weight:600;">$115.00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gift Cards -->
    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-gold">Gift Cards &amp; Vouchers</span>
        <h3 class="feature-title">Turn every occasion into a sale.</h3>
        <p class="feature-text">Sell beautifully branded digital gift cards directly from your website, booking page, or in-salon. Track balances, set expiry dates, and apply them seamlessly at checkout. Perfect for Mother's Day, Christmas, and everything in between.</p>
        <ul class="feature-list">
          <li>Branded digital gift cards with your logo and colours</li>
          <li>Sell online 24/7 — no extra setup needed</li>
          <li>Client receives an instant email with their gift card</li>
          <li>Redeemable in-person or for online bookings</li>
          <li>Balance tracked automatically in each client profile</li>
          <li>Partial redemptions and multi-use cards supported</li>
        </ul>
        <a href="#" class="btn btn-primary">Start Selling Gift Cards</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,var(--cream),var(--gold-light));">
        <div style="position:relative;width:280px;">
          <div style="background:linear-gradient(135deg,var(--plum),#6D28D9);border-radius:16px;padding:24px;color:#fff;box-shadow:0 20px 60px rgba(59,7,100,.35);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
              <div>
                <div style="font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;">Gift Card</div>
                <div style="font-size:.72rem;opacity:.7;letter-spacing:.08em;text-transform:uppercase;">The Colour Room</div>
              </div>
              <div style="font-size:1.4rem;">💅</div>
            </div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:600;line-height:1;margin-bottom:8px;">$75</div>
            <div style="font-size:.75rem;opacity:.65;margin-bottom:20px;">Valid until December 2025</div>
            <div style="background:rgba(255,255,255,.15);border-radius:8px;padding:8px 12px;font-size:.75rem;letter-spacing:.15em;font-family:monospace;">GIFT-4829-XR7K</div>
          </div>
          <div style="position:absolute;top:-12px;right:-12px;background:var(--gold-bright);color:#fff;border-radius:10px;padding:8px 14px;font-size:.75rem;font-weight:700;box-shadow:0 4px 12px rgba(245,158,11,.4);">
            Sold online ✓
          </div>
        </div>
      </div>
    </div>

    <!-- Memberships -->
    <div class="feature-block reverse">
      <div class="feature-content">
        <span class="tag tag-plum">Memberships &amp; Packages</span>
        <h3 class="feature-title">Recurring revenue, every month.</h3>
        <p class="feature-text">Create subscription memberships and prepaid service bundles that charge automatically. Clients love the value; you love the predictable monthly revenue. Build a loyal client base that pays before they even walk through the door.</p>
        <ul class="feature-list">
          <li>Monthly, quarterly, or annual subscription plans</li>
          <li>Prepaid service bundles (e.g., 10 blowouts for $200)</li>
          <li>Auto-billing — you never have to chase payment</li>
          <li>Member-only pricing and priority booking slots</li>
          <li>Pause and cancel controls for members</li>
          <li>Revenue forecasting built into your dashboard</li>
        </ul>
        <a href="#" class="btn btn-primary">Create Your First Membership</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,var(--plum),#4C1D95);">
        <div style="width:100%;max-width:300px;">
          <?php
          $plans = [
            ['Blowout Club', '$39/mo', '4 blowouts per month', '#F59E0B'],
            ['Colour VIP', '$89/mo', 'Root touch-up + gloss monthly', '#A78BFA'],
            ['Total Glow', '$149/mo', 'Full treatment + products', '#34D399'],
          ];
          foreach ($plans as $i => $plan):
          ?>
          <div style="background:rgba(255,255,255,<?= $i===0?'.18':($i===1?'.12':'.08') ?>);border-radius:14px;padding:16px;margin-bottom:10px;border:1px solid rgba(255,255,255,.15);<?= $i===0?'border-color:'.$plan[3].';':'' ?>">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="color:#fff;font-weight:700;font-size:.9rem;"><?= $plan[0] ?></span>
              <span style="color:<?= $plan[3] ?>;font-weight:700;font-size:.95rem;"><?= $plan[1] ?></span>
            </div>
            <div style="color:rgba(255,255,255,.6);font-size:.78rem;"><?= $plan[2] ?></div>
            <?php if ($i === 0): ?>
            <div style="margin-top:8px;display:flex;gap:6px;align-items:center;">
              <div style="width:6px;height:6px;border-radius:50%;background:#10B981;"></div>
              <span style="font-size:.72rem;color:#10B981;font-weight:600;">47 active members</span>
            </div>
            <?php endif; ?>
          </div>
          <?php endforeach; ?>
          <div style="text-align:center;font-size:.78rem;color:rgba(255,255,255,.5);margin-top:8px;">Monthly recurring: <span style="color:#F59E0B;font-weight:700;">$4,280</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PAYOUT SPEED -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-gold">Instant Payouts</span>
      <h2 class="section-title">Your money, exactly when you need it</h2>
      <p class="section-subtitle">Stop waiting 3–5 business days for your money. Certxa offers same-day payouts so your cash flow stays healthy and your business keeps moving.</p>
    </div>

    <div class="cards-grid">
      <div class="card premium-card">
        <div class="card-icon" style="background:linear-gradient(135deg,var(--plum),var(--plum-mid));">
          <svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <h3 class="card-title">Same-Day Payouts</h3>
        <p class="card-text">Upgrade to instant payouts and see every card payment in your bank account within hours — not days. Available on Professional and Elite plans.</p>
        <div style="margin-top:16px;padding:10px 14px;background:var(--plum-light);border-radius:var(--radius-sm);font-size:.82rem;color:var(--plum);font-weight:600;">⚡ From 9am to 6pm, Monday–Sunday</div>
      </div>

      <div class="card premium-card">
        <div class="card-icon" style="background:linear-gradient(135deg,#D97706,#F59E0B);">
          <svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <h3 class="card-title">Next-Day Standard</h3>
        <p class="card-text">All plans include next-day payouts as standard. Take $1,200 on a Tuesday and it's in your account by Wednesday morning — automatically.</p>
        <div style="margin-top:16px;padding:10px 14px;background:var(--gold-light);border-radius:var(--radius-sm);font-size:.82rem;color:var(--gold);font-weight:600;">✓ Included on all plans, zero extra cost</div>
      </div>

      <div class="card premium-card">
        <div class="card-icon" style="background:linear-gradient(135deg,#065F46,#059669);">
          <svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <h3 class="card-title">Real-Time Reporting</h3>
        <p class="card-text">Every payout comes with a detailed breakdown of services, retail, tips, and refunds. Your bookkeeper will love you. Tax season becomes simple.</p>
        <div style="margin-top:16px;padding:10px 14px;background:#D1FAE5;border-radius:var(--radius-sm);font-size:.82rem;color:#065F46;font-weight:600;">📊 Export to CSV or connect to Xero/QuickBooks</div>
      </div>
    </div>
  </div>
</section>

<!-- TIPS -->
<section class="section">
  <div class="container">
    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-plum">Tip Management</span>
        <h3 class="feature-title">Make tipping effortless — for everyone.</h3>
        <p class="feature-text">The Certxa card reader displays a tip prompt automatically when clients tap to pay. Set custom tip percentages (10%, 15%, 20%) or let clients enter their own amount. Tips are tracked per-stylist and included in all payroll reports.</p>
        <ul class="feature-list">
          <li>Auto tip prompt on card reader — no awkward asks</li>
          <li>Configurable suggested tip percentages</li>
          <li>Per-stylist tip tracking and reporting</li>
          <li>Tips included in payroll exports automatically</li>
          <li>Custom tip allocation for team environments</li>
        </ul>
        <a href="#" class="btn btn-primary">Set Up Tip Prompts</a>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#F0FDF4,#D1FAE5);">
        <div class="ui-card" style="width:100%;max-width:280px;">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-weight:700;font-size:.95rem;color:var(--charcoal);margin-bottom:4px;">Add a Tip?</div>
            <div style="font-size:.8rem;color:var(--mid-grey);">For Chloe · Balayage $145</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
            <?php foreach (['10%' => '$14.50', '15%' => '$21.75', '20%' => '$29.00'] as $pct => $amt): ?>
            <div style="text-align:center;background:var(--plum-light);border-radius:10px;padding:12px 6px;cursor:pointer;border:1.5px solid <?= $pct === '15%' ? 'var(--plum)' : 'transparent' ?>;">
              <div style="font-weight:700;font-size:.9rem;color:var(--plum);"><?= $pct ?></div>
              <div style="font-size:.72rem;color:var(--mid-grey);"><?= $amt ?></div>
            </div>
            <?php endforeach; ?>
          </div>
          <div style="border:1.5px dashed var(--light-grey);border-radius:10px;padding:12px;text-align:center;font-size:.82rem;color:var(--mid-grey);margin-bottom:12px;">Custom amount...</div>
          <div style="background:#059669;color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:600;font-size:.88rem;">Add $21.75 tip ✓</div>
          <div style="text-align:center;font-size:.75rem;color:var(--mid-grey);margin-top:8px;">Or skip → Pay $145.00</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- COMPARISON -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Rate Comparison</span>
      <h2 class="section-title">The most competitive rates in the industry</h2>
      <p class="section-subtitle">We built our payment infrastructure specifically for beauty businesses. Lower rates, faster payouts, and no hidden fees — ever.</p>
    </div>
    <div style="overflow-x:auto;border-radius:var(--radius-md);box-shadow:var(--shadow-lg);">
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="text-align:left;width:35%;">Feature</th>
            <th style="background:linear-gradient(135deg,var(--plum),var(--plum-mid));">Certxa</th>
            <th>Stripe Terminal</th>
            <th>Square</th>
            <th>GlossGenius</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>In-person card rate (UK)</td><td><strong style="color:#059669;">1.4%</strong></td><td>1.7%</td><td>1.75%</td><td>2.6%</td></tr>
          <tr><td>Online payment rate</td><td><strong style="color:#059669;">1.8%</strong></td><td>1.4% + 20p</td><td>1.9%</td><td>2.6%</td></tr>
          <tr><td>Monthly hardware rental</td><td><span class="check">✓ None</span></td><td class="cross">$0–$29</td><td class="cross">$0–$29</td><td class="cross">$0–$49</td></tr>
          <tr><td>Payout speed (standard)</td><td><strong style="color:#059669;">Next day</strong></td><td class="partial">2 days</td><td class="partial">2 days</td><td class="partial">2 days</td></tr>
          <tr><td>Same-day payout option</td><td><span class="check">✓</span></td><td class="partial">Add-on cost</td><td class="partial">1.5% fee</td><td class="cross">✗</td></tr>
          <tr><td>Payment links</td><td><span class="check">✓ Built-in</span></td><td class="partial">Via Stripe</td><td class="partial">Via Square</td><td class="cross">✗</td></tr>
          <tr><td>Deposit protection</td><td><span class="check">✓ Automated</span></td><td class="cross">✗</td><td class="cross">✗</td><td class="partial">Basic</td></tr>
          <tr><td>Memberships &amp; subscriptions</td><td><span class="check">✓</span></td><td class="cross">✗</td><td class="partial">Add-on</td><td class="partial">Basic</td></tr>
          <tr><td>Gift cards (digital)</td><td><span class="check">✓ Branded</span></td><td class="cross">✗</td><td class="partial">Add-on</td><td class="partial">Basic</td></tr>
          <tr><td>Salon-specific POS</td><td><span class="check">✓</span></td><td class="cross">Generic</td><td class="cross">Generic</td><td class="check">✓</td></tr>
        </tbody>
      </table>
    </div>
    <p style="text-align:center;font-size:.8rem;color:var(--mid-grey);margin-top:16px;">* Rates correct as of May 2025. Competitor rates may vary. All Certxa rates exclude VAT.</p>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-gold">Real Results</span>
      <h2 class="section-title">Stylists love how they get paid</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial premium-testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"The deposit system completely changed my business. I went from 8–10 no-shows per month to basically zero. I recovered $600 in cancellation fees in the first 30 days."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar" style="background:linear-gradient(135deg,var(--plum),var(--plum-mid));">AM</div>
          <div>
            <div class="testimonial-name">Alicia Montgomery</div>
            <div class="testimonial-role">Colour Specialist, Leeds</div>
          </div>
        </div>
      </div>
      <div class="testimonial premium-testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"I set up three membership tiers over a weekend and now have $3,200 in recurring monthly revenue before I've even looked at my bookings. It's the best business decision I've made."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar" style="background:linear-gradient(135deg,#D97706,#F59E0B);">TW</div>
          <div>
            <div class="testimonial-name">Tamara Wilson</div>
            <div class="testimonial-role">Salon Owner, London</div>
          </div>
        </div>
      </div>
      <div class="testimonial premium-testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"We sold $4,800 in gift cards over Christmas week alone — all while I was on holiday. The online storefront runs itself and the money just appears in my account. Phenomenal."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar" style="background:linear-gradient(135deg,#059669,#10B981);">FS</div>
          <div>
            <div class="testimonial-name">Farida Shah</div>
            <div class="testimonial-role">Beauty Studio Owner, Manchester</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section section-alt">
  <div class="container" style="max-width:760px;">
    <div class="section-header">
      <span class="tag tag-plum">Common Questions</span>
      <h2 class="section-title">Everything about payments, answered</h2>
    </div>
    <div class="accordion">
      <?php
      $faqs = [
        ['When do I receive my money?', 'Standard plans receive next-day payouts — money taken on Monday is in your bank on Tuesday. Professional and Elite plans have access to same-day payouts, with funds arriving within a few hours of the transaction, Monday to Sunday.'],
        ['What payment methods does Certxa accept?', 'We accept all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and contactless payments. Online payments support the same methods. We do not currently support cryptocurrency.'],
        ['How do deposits work if a client cancels?', 'You set the rules. You can keep the full deposit, keep a partial amount, or refund in full — whichever you choose. The system does whatever you configure. You can also set different policies for cancellations with more or less than 24 hours notice.'],
        ['Are there any hidden fees or contracts?', 'None. Zero setup fees, no monthly hardware costs, no minimum transaction volume, and no contracts. You pay the transaction rate shown and nothing else. Cancel anytime with no penalty.'],
        ['How do I set up memberships?', 'In your dashboard, go to Memberships → Create Plan, name your plan, set the price and billing frequency, then define what services are included. It takes about 5 minutes. Certxa handles all the recurring billing automatically.'],
        ['Is my customers\' payment data secure?', 'Absolutely. Certxa is PCI-DSS Level 1 compliant — the highest standard for payment security. We use bank-grade 256-bit encryption and never store raw card details. All payment processing is handled by our regulated payment partners.'],
      ];
      foreach ($faqs as $faq):
      ?>
      <div class="accordion-item">
        <button class="accordion-btn"><?= $faq[0] ?><span class="accordion-icon">+</span></button>
        <div class="accordion-body"><?= $faq[1] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Contextual links to related features -->
<section style="background:var(--cream);padding:40px 0;border-top:1px solid var(--light-grey);">
  <div class="container" style="max-width:860px;">
    <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mid-grey);margin-bottom:16px;text-align:center;">Also part of Certxa payments</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
      <a href="/card-reader-pos" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--white);border:1px solid var(--light-grey);border-radius:50px;text-decoration:none;font-size:.84rem;font-weight:600;color:var(--charcoal);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)';this.style.color='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)';this.style.color='var(--charcoal)'">💳 Salon point-of-sale system</a>
      <a href="/online-booking" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--white);border:1px solid var(--light-grey);border-radius:50px;text-decoration:none;font-size:.84rem;font-weight:600;color:var(--charcoal);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)';this.style.color='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)';this.style.color='var(--charcoal)'">📅 Online booking with deposits</a>
      <a href="/client-management" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--white);border:1px solid var(--light-grey);border-radius:50px;text-decoration:none;font-size:.84rem;font-weight:600;color:var(--charcoal);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)';this.style.color='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)';this.style.color='var(--charcoal)'">👤 Client profiles & history</a>
      <a href="/pricing" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--white);border:1px solid var(--light-grey);border-radius:50px;text-decoration:none;font-size:.84rem;font-weight:600;color:var(--charcoal);transition:var(--transition);" onmouseenter="this.style.borderColor='var(--plum)';this.style.color='var(--plum)'" onmouseleave="this.style.borderColor='var(--light-grey)';this.style.color='var(--charcoal)'">💰 See full pricing</a>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <span class="tag" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:16px;display:inline-block;">Start Getting Paid</span>
    <h2 class="cta-title">Every tool to maximise<br><em>your revenue.</em></h2>
    <p class="cta-text">Payment links, deposits, gift cards, memberships, instant payouts — all in one beautifully simple platform. Start your free trial today.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold">Start Free Trial</a>
      <a href="#" class="btn btn-outline-white">View Pricing</a>
    </div>
    <p class="cta-note">60-day free trial &middot; No card required &middot; Set up in under 5 minutes</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
