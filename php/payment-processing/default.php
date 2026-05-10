<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Salon Payment Processing | HMS Merchant Services & Djavoo Terminals — Certxa');
define('PAGE_DESC',     'Certxa partners with HMS (Host Merchant Services) for transparent interchange-plus payment processing and Djavoo for reliable salon terminals. See all rates, fees, and hardware options.');
define('PAGE_KEYWORDS', 'salon payment processing, HMS merchant services salon, Djavoo terminal salon, interchange plus salon payments, salon credit card processing rates, beauty salon POS payment, hair salon card reader fees');
define('PAGE_CANONICAL','https://certxa.com/payment-processing');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
  ['name'=>'Payment Processing','url'=>'https://certxa.com/payment-processing'],
]));
define('PAGE_SCHEMA', json_encode([
  ['@type'=>'FAQPage','mainEntity'=>[
    ['@type'=>'Question','name'=>'What payment processor does Certxa use?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Certxa partners with HMS (Host Merchant Services), one of the most trusted merchant services providers in the US. HMS uses interchange-plus pricing — the most transparent pricing model available — so you always know exactly what you\'re paying and why.']],
    ['@type'=>'Question','name'=>'What is interchange-plus pricing?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Interchange-plus pricing separates the card network\'s base rate (set by Visa/Mastercard/Discover/Amex) from the processor\'s markup. You pay the actual interchange rate plus a small fixed markup. This is more transparent and typically cheaper than flat-rate or tiered pricing.']],
    ['@type'=>'Question','name'=>'What terminals does Certxa support?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Certxa supports Djavoo payment terminals, which accept chip, swipe, tap (NFC), Apple Pay, and Google Pay. Djavoo terminals are EMV-compliant, PCI-certified, and built for high-volume salon environments.']],
  ]],
  ['@type'=>'Service','name'=>'Certxa Salon Payment Processing','serviceType'=>'Payment Processing','provider'=>['@id'=>'https://certxa.com/#organization'],'description'=>'Transparent interchange-plus payment processing through HMS, with Djavoo hardware for salon card payments.'],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- HERO -->
<section class="hero-dark-section" style="padding:110px 0 80px;">
  <div class="orb orb-1"></div><div class="orb orb-2"></div>
  <div class="container" style="max-width:900px;text-align:center;">
    <div class="hero-stars-row" style="justify-content:center;margin-bottom:20px;">
      <span class="stars-badge"><span>💳</span><span>Powered by HMS · Hardware by Djavoo</span></span>
    </div>
    <h1 class="hero-dark-headline" style="font-size:clamp(2.4rem,5vw,3.8rem);text-align:center;">
      Payment processing<br>that's actually<br><em>transparent.</em>
    </h1>
    <p class="hero-dark-sub" style="max-width:620px;margin:0 auto 36px;">
      Certxa partners with HMS (Host Merchant Services) — the only major processor that uses 100% interchange-plus pricing. No surprise fees, no tiered confusion, no flat-rate overcharge.
    </p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/auth?mode=register" class="btn btn-gold btn-lg">Get Started Free</a>
      <a href="#rates" class="btn btn-outline-white">See All Rates ↓</a>
    </div>
  </div>
</section>

<!-- PARTNER LOGOS STRIP -->
<section style="background:#fff;border-bottom:1px solid #f0f0f2;padding:32px 0;">
  <div class="container" style="max-width:800px;">
    <div style="text-align:center;font-size:.75rem;font-weight:700;color:var(--mid-grey);text-transform:uppercase;letter-spacing:.12em;margin-bottom:24px;">Trusted Payment Partners</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap;">
      <div style="text-align:center;">
        <div style="font-size:1.4rem;font-weight:900;color:#1a1a2e;letter-spacing:-0.02em;">HMS</div>
        <div style="font-size:.72rem;color:var(--mid-grey);margin-top:2px;">Host Merchant Services</div>
        <div style="margin-top:6px;display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:20px;padding:3px 10px;">
          <span style="font-size:.65rem;font-weight:700;color:#059669;">PROCESSOR</span>
        </div>
      </div>
      <div style="width:1px;height:48px;background:#f0f0f2;"></div>
      <div style="text-align:center;">
        <div style="font-size:1.4rem;font-weight:900;color:#1a1a2e;letter-spacing:-0.02em;">Djavoo</div>
        <div style="font-size:.72rem;color:var(--mid-grey);margin-top:2px;">Payment Terminals</div>
        <div style="margin-top:6px;display:inline-flex;align-items:center;gap:4px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:20px;padding:3px 10px;">
          <span style="font-size:.65rem;font-weight:700;color:#2563eb;">HARDWARE</span>
        </div>
      </div>
      <div style="width:1px;height:48px;background:#f0f0f2;"></div>
      <div style="text-align:center;">
        <div style="display:flex;gap:4px;justify-content:center;">
          <?php foreach (['Visa','MC','Disc','Amex'] as $card): ?>
          <span style="font-size:.7rem;font-weight:800;color:#fff;background:#374151;padding:4px 8px;border-radius:6px;"><?= $card ?></span>
          <?php endforeach; ?>
        </div>
        <div style="font-size:.72rem;color:var(--mid-grey);margin-top:6px;">All major cards accepted</div>
      </div>
    </div>
  </div>
</section>

<!-- WHAT IS INTERCHANGE PLUS -->
<section class="section" style="background:#fafafa;">
  <div class="container" style="max-width:860px;">
    <div class="section-header">
      <span class="tag tag-plum">Transparency First</span>
      <h2 class="section-title">What is interchange-plus<br><em>and why does it matter?</em></h2>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:48px;align-items:start;">
      <div>
        <h3 style="font-size:1.05rem;font-weight:700;color:var(--charcoal);margin:0 0 12px;">❌ Flat-rate pricing (like Square)</h3>
        <div style="background:#fff;border:1px solid #f0f0f2;border-radius:14px;padding:24px;">
          <p style="font-size:.88rem;color:var(--mid-grey);line-height:1.65;margin:0 0 16px;">Flat-rate processors charge everyone the same — say, 2.6% — regardless of the actual interchange cost. A debit card costs them 0.5% to process, but they charge you 2.6% and keep the difference.</p>
          <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:14px 16px;">
            <div style="font-size:.78rem;font-weight:700;color:#dc2626;margin-bottom:4px;">You pay 2.6% on a $100 = $2.60</div>
            <div style="font-size:.78rem;color:var(--mid-grey);">Processor's actual cost: ~$0.50 → They profit $2.10</div>
          </div>
        </div>
      </div>
      <div>
        <h3 style="font-size:1.05rem;font-weight:700;color:var(--charcoal);margin:0 0 12px;">✅ Interchange-plus pricing (HMS)</h3>
        <div style="background:#fff;border:1px solid rgba(16,185,129,.2);border-radius:14px;padding:24px;">
          <p style="font-size:.88rem;color:var(--mid-grey);line-height:1.65;margin:0 0 16px;">HMS passes through the exact interchange rate set by the card network, then adds a small, fixed markup. You see exactly what the interchange costs and exactly what HMS charges.</p>
          <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:10px;padding:14px 16px;">
            <div style="font-size:.78rem;font-weight:700;color:#059669;margin-bottom:4px;">You pay actual interchange + 0.25% + $0.10</div>
            <div style="font-size:.78rem;color:var(--mid-grey);">No hidden margin. No surprise tiers.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- RATE TABLE -->
<section class="section" style="background:#fff;" id="rates">
  <div class="container" style="max-width:860px;">
    <div class="section-header">
      <span class="tag tag-plum">HMS Rate Schedule</span>
      <h2 class="section-title">Your exact rates.<br><em>Nothing hidden.</em></h2>
      <p class="section-sub">HMS uses interchange-plus pricing. Your rate = Visa/MC/Discover/Amex interchange rate + HMS markup below. Interchange rates are set by card networks and fluctuate; HMS markup is fixed.</p>
    </div>

    <div style="overflow-x:auto;margin-top:40px;">
      <table style="width:100%;border-collapse:collapse;font-size:.88rem;">
        <thead>
          <tr style="background:var(--plum-dark);color:#fff;">
            <th style="text-align:left;padding:14px 18px;font-weight:700;border-radius:12px 0 0 0;">Business Type</th>
            <th style="text-align:center;padding:14px 18px;font-weight:700;">HMS Markup</th>
            <th style="text-align:center;padding:14px 18px;font-weight:700;">Per-Transaction Fee</th>
            <th style="text-align:center;padding:14px 18px;font-weight:700;border-radius:0 12px 0 0;">Example: $100 Sale</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $rates = [
            ['Retail / In-Person Salon',   '+ 0.25%', '+ $0.10', '~$0.35 (+ interchange)', true],
            ['Restaurant / Quick Service',  '+ 0.20%', '+ $0.09', '~$0.29 (+ interchange)', false],
            ['eCommerce / Online Booking',  '+ 0.35%', '+ $0.10', '~$0.45 (+ interchange)', false],
          ];
          foreach ($rates as $i => $r): ?>
          <tr style="border-bottom:1px solid #f0f0f2;background:<?= $r[4] ? 'rgba(91,33,182,.04)' : ($i % 2 === 0 ? '#fff' : '#fafafa') ?>;">
            <td style="padding:14px 18px;font-weight:<?= $r[4] ? '700' : '500' ?>;color:var(--charcoal);">
              <?= $r[0] ?><?= $r[4] ? ' <span style="font-size:.68rem;background:rgba(91,33,182,.1);color:#5b21b6;border-radius:20px;padding:2px 8px;font-weight:700;">Your plan</span>' : '' ?>
            </td>
            <td style="text-align:center;padding:14px 18px;font-weight:700;color:#5b21b6;"><?= $r[1] ?></td>
            <td style="text-align:center;padding:14px 18px;color:var(--mid-grey);"><?= $r[2] ?></td>
            <td style="text-align:center;padding:14px 18px;color:var(--mid-grey);font-size:.82rem;"><?= $r[3] ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <!-- Interchange baseline reference -->
    <div style="margin-top:28px;background:#fafafa;border:1px solid #f0f0f2;border-radius:14px;padding:24px;">
      <h4 style="font-size:.9rem;font-weight:700;color:var(--charcoal);margin:0 0 12px;">📊 Common Baseline Interchange Rates (set by card networks)</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        <?php
        $interchange = [
          ['Visa/MC Debit (in-person)', '~0.05% + $0.22'],
          ['Visa Rewards (in-person)', '~1.65% + $0.10'],
          ['Mastercard World (in-person)', '~1.77% + $0.10'],
          ['Amex OptBlue (in-person)', '~1.80% + $0.10'],
          ['Visa Signature (in-person)', '~2.10% + $0.10'],
          ['Card-not-present (online)', '~1.80–2.30% + $0.10'],
        ];
        foreach ($interchange as $ic): ?>
        <div style="display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #f0f0f2;border-radius:8px;padding:10px 14px;">
          <span style="font-size:.78rem;color:var(--mid-grey);"><?= $ic[0] ?></span>
          <span style="font-size:.78rem;font-weight:700;color:var(--charcoal);"><?= $ic[1] ?></span>
        </div>
        <?php endforeach; ?>
      </div>
      <p style="font-size:.75rem;color:var(--mid-grey);margin:14px 0 0;line-height:1.5;">* Interchange rates are set by Visa, Mastercard, Discover, and Amex. They vary by card type, industry, and whether the card is present. These are representative figures — your actual interchange will appear on your monthly statement. HMS does not mark up interchange.</p>
    </div>
  </div>
</section>

<!-- HMS FEES BREAKDOWN -->
<section class="section" style="background:#fafafa;">
  <div class="container" style="max-width:860px;">
    <div class="section-header">
      <span class="tag tag-plum">Complete Fee Schedule</span>
      <h2 class="section-title">Every HMS fee.<br><em>Listed clearly.</em></h2>
    </div>
    <div style="overflow-x:auto;margin-top:40px;">
      <table style="width:100%;border-collapse:collapse;font-size:.88rem;">
        <thead>
          <tr style="border-bottom:2px solid #f0f0f2;">
            <th style="text-align:left;padding:12px 16px;color:var(--mid-grey);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600;">Fee Type</th>
            <th style="text-align:center;padding:12px 16px;color:var(--mid-grey);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600;">Amount</th>
            <th style="text-align:left;padding:12px 16px;color:var(--mid-grey);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600;">Notes</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $fees = [
            ['Monthly account fee', '$0', 'No monthly fee from HMS'],
            ['Setup / activation fee', '$0', 'No setup or onboarding fees'],
            ['Cancellation fee', '$0', 'No long-term contracts, cancel anytime'],
            ['Chargeback fee', '$25', 'Per disputed transaction, if chargeback is filed'],
            ['ACH / eCheck processing', '0.50% + $0.25', 'For bank transfer payments'],
            ['PCI compliance fee', '$0 – $9.95/mo', 'Waived for compliant merchants'],
            ['Batch settlement', '$0.10/batch', 'Daily settlement fee'],
            ['Monthly minimum', '$0', 'No minimum volume required'],
            ['International card surcharge', '+0.40–0.60%', 'Applied by card networks, passed through at cost'],
            ['Statement fee', '$0', 'Digital statements, no paper fee'],
          ];
          foreach ($fees as $i => $fee): ?>
          <tr style="border-bottom:1px solid #f9f9fb;background:<?= $i % 2 === 0 ? '#fff' : '#fafafa' ?>;">
            <td style="padding:12px 16px;font-weight:500;color:var(--charcoal);"><?= $fee[0] ?></td>
            <td style="text-align:center;padding:12px 16px;font-weight:700;color:<?= $fee[1] === '$0' ? '#059669' : 'var(--charcoal)' ?>;"><?= $fee[1] ?></td>
            <td style="padding:12px 16px;color:var(--mid-grey);font-size:.82rem;"><?= $fee[2] ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <div style="margin-top:16px;padding:14px 18px;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);border-radius:10px;">
      <p style="font-size:.8rem;color:#92400e;margin:0;line-height:1.5;">
        <strong>Note:</strong> All rates shown are HMS's standard rates for salon and beauty businesses. Your specific rates may vary based on processing volume, card mix, and account setup. Contact us for a personalized rate quote. Rates current as of 2025 — contact HMS directly for the most up-to-date schedule.
      </p>
    </div>
  </div>
</section>

<!-- DJAVOO TERMINALS -->
<section class="section" style="background:#fff;">
  <div class="container" style="max-width:900px;">
    <div class="section-header">
      <span class="tag" style="background:rgba(37,99,235,.08);color:#2563eb;border-color:rgba(37,99,235,.2);">Djavoo Hardware</span>
      <h2 class="section-title">Professional terminals<br><em>built for salons.</em></h2>
      <p class="section-sub">Djavoo terminals are used in high-volume retail and salon environments across the US. EMV-certified, PCI-compliant, and built to handle the busiest checkout lines.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-top:48px;">
      <?php
      $terminals = [
        [
          'Djavoo Z1',
          'Countertop Terminal',
          'The workhorse of the Djavoo lineup. Full-size touchscreen, integrated thermal receipt printer, and a fast processing chip. Perfect for busy front desks.',
          ['Chip (EMV)', 'Swipe (MSR)', 'NFC / Tap to Pay', 'Apple Pay & Google Pay', 'Thermal receipt printer', 'Ethernet & WiFi'],
        ],
        [
          'Djavoo Z11',
          'Portable Wireless',
          'Cordless and rechargeable — bring checkout directly to the styling chair. Ideal for stations without a nearby counter or for mobile beauty pros.',
          ['All Z1 features', 'Bluetooth + WiFi', 'Long-life battery', '8-hour runtime', 'Lightweight & compact', 'Ideal for chair-side checkout'],
        ],
        [
          'Djavoo Z9',
          'Mobile + PIN Pad',
          'A sleek PIN pad and payment terminal combo designed for multi-lane checkout. Great for salons with separate cashier and consultation areas.',
          ['Chip & swipe & tap', 'Customer-facing screen', 'Ideal for dual-counter setups', 'Fast thermal print', 'USB & serial connectivity', 'Works with Certxa POS'],
        ],
      ];
      foreach ($terminals as $t): ?>
      <div style="background:#fafafa;border:1px solid #f0f0f2;border-radius:18px;padding:28px;display:flex;flex-direction:column;">
        <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#2563eb;margin-bottom:6px;"><?= $t[1] ?></div>
        <h3 style="font-size:1.2rem;font-weight:800;color:var(--charcoal);margin:0 0 10px;"><?= $t[0] ?></h3>
        <p style="font-size:.84rem;color:var(--mid-grey);line-height:1.6;margin:0 0 18px;"><?= $t[2] ?></p>
        <div style="flex:1;">
          <?php foreach ($t[3] as $feature): ?>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
            <span style="width:16px;height:16px;border-radius:50%;background:rgba(37,99,235,.1);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#2563eb;font-weight:700;flex-shrink:0;">✓</span>
            <span style="font-size:.82rem;color:var(--mid-grey);"><?= $feature ?></span>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <div style="margin-top:28px;background:rgba(37,99,235,.05);border:1px solid rgba(37,99,235,.15);border-radius:14px;padding:22px 24px;">
      <p style="font-size:.84rem;color:#1d4ed8;margin:0;line-height:1.6;">
        <strong>Terminal pricing:</strong> Djavoo terminal hardware pricing is set by your merchant services provider (HMS) and may include purchase, lease, or free-placement options depending on your processing volume and account terms. Contact us to get hardware pricing specific to your account.
      </p>
    </div>
  </div>
</section>

<!-- WHAT'S ACCEPTED -->
<section class="section" style="background:#fafafa;">
  <div class="container" style="max-width:800px;text-align:center;">
    <span class="tag tag-plum">Payment Methods</span>
    <h2 class="section-title" style="margin-top:16px;">Accept everything<br><em>clients want to pay with.</em></h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-top:40px;text-align:center;">
      <?php
      $methods = [
        ['💳', 'Chip & PIN', 'EMV chip cards with PIN entry'],
        ['🔄', 'Swipe', 'Magnetic stripe cards'],
        ['📱', 'Tap to Pay', 'Contactless NFC cards'],
        ['🍎', 'Apple Pay', 'iPhone & Apple Watch'],
        ['🤖', 'Google Pay', 'Android tap payments'],
        ['🏦', 'ACH / Bank', 'Bank transfers & eChecks'],
        ['💵', 'Cash', 'Tracked in Certxa POS'],
        ['🎁', 'Gift Cards', 'Certxa digital gift cards'],
      ];
      foreach ($methods as $m): ?>
      <div style="background:#fff;border:1px solid #f0f0f2;border-radius:14px;padding:22px 16px;">
        <div style="font-size:1.6rem;margin-bottom:10px;"><?= $m[0] ?></div>
        <div style="font-size:.85rem;font-weight:700;color:var(--charcoal);margin-bottom:5px;"><?= $m[1] ?></div>
        <div style="font-size:.75rem;color:var(--mid-grey);line-height:1.4;"><?= $m[2] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- WHY HMS VS OTHERS -->
<section class="section" style="background:#fff;">
  <div class="container" style="max-width:860px;">
    <div class="section-header">
      <span class="tag tag-plum">Why HMS?</span>
      <h2 class="section-title">Not all processors are<br><em>created equal.</em></h2>
    </div>
    <div style="overflow-x:auto;margin-top:40px;">
      <table style="width:100%;border-collapse:collapse;font-size:.88rem;">
        <thead>
          <tr style="border-bottom:2px solid #f0f0f2;">
            <th style="text-align:left;padding:12px 16px;color:var(--mid-grey);font-size:.75rem;text-transform:uppercase;font-weight:600;">Feature</th>
            <th style="text-align:center;padding:12px 16px;color:#5b21b6;font-weight:700;">HMS</th>
            <th style="text-align:center;padding:12px 16px;color:var(--mid-grey);font-weight:600;">Square</th>
            <th style="text-align:center;padding:12px 16px;color:var(--mid-grey);font-weight:600;">Stripe Terminal</th>
          </tr>
        </thead>
        <tbody>
          <?php
          $compare = [
            ['Pricing model', 'Interchange-plus', 'Flat-rate 2.6%', 'Flat-rate 2.7%'],
            ['Monthly fee', '$0', '$0–$60', '$0'],
            ['Cancellation fee', '$0', '$0', '$0'],
            ['Long-term contract', 'None', 'None', 'None'],
            ['Chargeback protection', '✓', 'Limited', 'Limited'],
            ['Industry-specific rates', '✓', '✗', '✗'],
            ['Interchange transparency', 'Full itemization', '✗ Hidden in flat rate', '✗ Hidden in flat rate'],
            ['Dedicated account manager', '✓', '✗', '✗'],
          ];
          foreach ($compare as $i => $row): ?>
          <tr style="border-bottom:1px solid #f9f9fb;background:<?= $i % 2 === 0 ? '#fff' : '#fafafa' ?>;">
            <td style="padding:12px 16px;font-weight:500;color:var(--charcoal);"><?= $row[0] ?></td>
            <td style="text-align:center;padding:12px 16px;font-weight:700;color:#5b21b6;"><?= $row[1] ?></td>
            <td style="text-align:center;padding:12px 16px;color:var(--mid-grey);"><?= $row[2] ?></td>
            <td style="text-align:center;padding:12px 16px;color:var(--mid-grey);"><?= $row[3] ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section cta-section">
  <div class="container" style="max-width:680px;text-align:center;">
    <span class="tag" style="background:rgba(245,158,11,.15);color:#FCD34D;border-color:rgba(245,158,11,.3);margin-bottom:20px;display:inline-flex;">Get started today</span>
    <h2 class="section-title" style="color:#fff;">Ready for transparent<br><em style="color:#F59E0B;">payment processing?</em></h2>
    <p style="color:rgba(255,255,255,.65);font-size:1rem;line-height:1.65;margin-bottom:36px;">Start your 60-day free trial and get access to HMS payment processing, Djavoo terminal integration, and the full Certxa platform — all in one place.</p>
    <a href="/auth?mode=register" class="btn btn-gold btn-lg">Start 60-Day Free Trial</a>
    <div style="margin-top:16px;font-size:.82rem;color:rgba(255,255,255,.4);">No credit card to start · Contact us for custom rate quotes</div>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
