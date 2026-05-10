<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Certxa vs GlossGenius — The Better Salon Software in 2026');
define('PAGE_DESC',     'Comparing Certxa vs GlossGenius for your salon? See the full feature comparison — trial length, pricing, POS, website builder, Reserve with Google, and more. Certxa wins on every major feature.');
define('PAGE_KEYWORDS', 'certxa vs glossgenius, glossgenius alternative, glossgenius competitor, best salon booking software, glossgenius review, salon software comparison 2026, switch from glossgenius');
define('PAGE_CANONICAL','https://certxa.com/vs-glossgenius');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
  ['name'=>'Certxa vs GlossGenius','url'=>'https://certxa.com/vs-glossgenius'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'      => 'FAQPage',
    'mainEntity' => [
      ['@type'=>'Question','name'=>'Is Certxa better than GlossGenius?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Certxa offers a longer free trial (60 days vs 14), an integrated POS and card reader, Reserve with Google, multi-location support, and full website builder — features GlossGenius either lacks or charges extra for. Most salon owners switching to Certxa report more bookings and lower payment processing costs within the first month.']],
      ['@type'=>'Question','name'=>'Can I migrate from GlossGenius to Certxa?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Yes — Certxa offers free data migration from GlossGenius. We import your full client list, appointment history, service menu, and staff settings. Most migrations complete in under an hour with zero downtime.']],
      ['@type'=>'Question','name'=>'How does Certxa pricing compare to GlossGenius?','acceptedAnswer'=>['@type'=>'Answer','text'=>'Certxa starts at $29/month with a 60-day free trial and no hidden fees. GlossGenius starts at $24/month but charges extra for add-ons like text reminders and advanced reporting. When you account for all features, Certxa typically works out cheaper for most salons.']],
    ],
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';

$rows = [
  ['Free trial period',                   '60 days',           '14 days',          true],
  ['Starting price',                       '$29/month',         '$24/month',        false],
  ['Integrated POS & card reader',         '✓ Free card reader','✗ Add-on cost',    true],
  ['Full website builder',                 '✓ Included',        '✗ Basic only',     true],
  ['Reserve with Google',                  '✓ Built-in',        '✗ Not available',  true],
  ['Multi-staff calendar',                 '✓ Unlimited staff', 'Limited',          true],
  ['Client CRM & profiles',                '✓ Full',            '✓ Basic',          false],
  ['Automated SMS reminders',              '✓ Unlimited',       '✓ Limited',        false],
  ['No-show deposit protection',           '✓ Included',        '✓ Included',       false],
  ['Gift cards',                           '✓ Included',        '✓ Included',       false],
  ['Membership & packages',                '✓ Included',        '✓ Included',       false],
  ['Multi-location management',            '✓ Enterprise plan', '✗ Not available',  true],
  ['Google Reviews automation',            '✓ Built-in',        '✗ Not available',  true],
  ['Transaction fee',                      '2.49% + 15¢',       '2.6% + 10¢',       true],
  ['Free data migration',                  '✓ Full migration',  '✗ Self-service',   true],
  ['Customer support',                     '24/7 live chat',    'Business hours',   true],
  ['API access',                           '✓ Enterprise',      '✗ Not available',  true],
];
?>

<section class="hero-dark-section" style="padding:100px 0 70px;">
  <div class="orb orb-1"></div><div class="orb orb-2"></div>
  <div class="container" style="max-width:820px;text-align:center;">
    <span class="stars-badge" style="margin-bottom:20px;display:inline-flex;">
      <span>⚖️</span><span>Side-by-side comparison · Updated May 2026</span>
    </span>
    <h1 class="hero-dark-headline" style="font-size:clamp(2.4rem,5vw,3.8rem);margin-bottom:20px;">
      Certxa vs GlossGenius<br><em>The honest comparison.</em>
    </h1>
    <p class="hero-dark-sub" style="max-width:600px;margin:0 auto 36px;">
      If you're choosing between Certxa and GlossGenius for your salon, you deserve a clear, feature-by-feature breakdown — no fluff, no spin.
    </p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="#" class="btn btn-gold btn-lg">Start 60-Day Free Trial</a>
      <a href="#compare" class="btn btn-outline-white">See Full Comparison ↓</a>
    </div>
  </div>
</section>

<!-- WINNER BADGES -->
<section class="stats-strip">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-value" style="font-size:1.6rem;">60</div><div class="stat-label">Day free trial vs 14 days</div></div>
      <div class="stat-item"><div class="stat-value" style="font-size:1.6rem;">Free</div><div class="stat-label">Card reader included</div></div>
      <div class="stat-item"><div class="stat-value" style="font-size:1.6rem;">✓</div><div class="stat-label">Reserve with Google — not on GlossGenius</div></div>
      <div class="stat-item"><div class="stat-value" style="font-size:1.6rem;">Free</div><div class="stat-label">Full data migration from GlossGenius</div></div>
    </div>
  </div>
</section>

<!-- COMPARISON TABLE -->
<section class="section" id="compare">
  <div class="container" style="max-width:860px;">
    <div class="section-header">
      <span class="tag tag-plum">Feature Comparison</span>
      <h2 class="section-title">Certxa vs GlossGenius — feature by feature</h2>
      <p class="section-subtitle">Every feature that matters to a salon owner, compared honestly.</p>
    </div>

    <div class="comparison-table-scroll" style="border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--light-grey);box-shadow:var(--shadow-md);">
      <!-- header row -->
      <div style="display:grid;grid-template-columns:1fr 160px 160px;background:var(--plum);color:#fff;padding:16px 24px;font-weight:700;font-size:.85rem;">
        <div>Feature</div>
        <div style="text-align:center;">Certxa</div>
        <div style="text-align:center;opacity:.7;">GlossGenius</div>
      </div>
      <?php foreach ($rows as $i => $r): ?>
      <div style="display:grid;grid-template-columns:1fr 160px 160px;padding:14px 24px;background:<?= $i % 2 === 0 ? 'var(--white)' : 'var(--cream)' ?>;border-top:1px solid var(--light-grey);font-size:.88rem;align-items:center;">
        <div style="font-weight:500;color:var(--charcoal);"><?= $r[0] ?></div>
        <div style="text-align:center;font-weight:600;color:<?= $r[3] ? 'var(--plum)' : 'var(--charcoal)' ?>;"><?= $r[1] ?></div>
        <div style="text-align:center;color:var(--mid-grey);"><?= $r[2] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
    <p style="text-align:center;font-size:.75rem;color:var(--mid-grey);margin-top:12px;">Based on publicly available information as of May 2026. Verify current pricing at each provider's website.</p>
  </div>
</section>

<!-- 3 KEY WINS -->
<section class="section section-alt">
  <div class="container" style="max-width:900px;">
    <div class="section-header">
      <span class="tag tag-plum">Why Salons Switch</span>
      <h2 class="section-title">3 reasons salons choose Certxa over GlossGenius</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <?php
      $wins = [
        ['🗓️','A 60-day trial — not 14','GlossGenius gives you two weeks to judge their platform. Certxa gives you two full months of real bookings, real clients, and real revenue before you pay a cent.','60 days free'],
        ['📍','Reserve with Google — built in','When someone searches "hair salon near me", a Reserve with Google button puts your booking link directly in the Google result. GlossGenius doesn\'t offer this integration. Certxa does, on every plan.','Zero extra cost'],
        ['💳','Free card reader included','Certxa ships you a card reader and the POS software is fully built in. GlossGenius routes in-person payments through separate providers, often with added fees and friction.','Free hardware'],
      ];
      foreach ($wins as $w): ?>
      <div class="ui-card" style="text-align:center;padding:36px 28px;">
        <div style="font-size:2rem;margin-bottom:12px;"><?= $w[0] ?></div>
        <h3 style="font-size:1rem;font-weight:700;margin-bottom:10px;color:var(--charcoal);"><?= $w[1] ?></h3>
        <p style="font-size:.85rem;color:var(--mid-grey);line-height:1.6;margin-bottom:16px;"><?= $w[2] ?></p>
        <span style="background:var(--plum-light);color:var(--plum);font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:50px;"><?= $w[3] ?></span>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- MIGRATION CTA -->
<section class="section" style="background:var(--cream);">
  <div class="container" style="max-width:680px;text-align:center;">
    <span class="tag tag-plum" style="margin-bottom:16px;display:inline-block;">Switching is painless</span>
    <h2 class="section-title">We'll move everything from GlossGenius for you — free.</h2>
    <p class="section-subtitle">Your full client list, appointment history, service menu, and staff setup — imported and ready to go. Most salons are live on Certxa within the hour.</p>
    <a href="#" class="btn btn-primary" style="margin-top:8px;">Start My Free Migration</a>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="container" style="max-width:720px;">
    <div class="section-header">
      <span class="tag tag-plum">FAQ</span>
      <h2 class="section-title">Certxa vs GlossGenius — common questions</h2>
    </div>
    <div class="accordion">
      <div class="accordion-item">
        <button class="accordion-btn">Is Certxa better than GlossGenius? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Certxa offers a longer free trial (60 days vs 14), an integrated POS and card reader, Reserve with Google, multi-location support, and a full website builder — features GlossGenius either lacks or charges extra for. Most salon owners who switch report more bookings and lower overall costs within their first month.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">Can I migrate from GlossGenius to Certxa? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Yes — we handle the full migration for free. We import your client list, appointment history, service menu, and staff settings directly from GlossGenius. Most migrations complete in under an hour with zero downtime for your salon.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">How does Certxa pricing compare to GlossGenius? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Certxa starts at $29/month with a 60-day free trial and no hidden add-ons. GlossGenius starts lower but charges separately for SMS reminders and other features. When you factor in all the features most salons actually need, Certxa typically works out cheaper — and includes more.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">Will my clients notice any disruption when I switch? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">No — the migration runs in the background. Your existing bookings carry over and your new Certxa booking link is live the same day. We send you a step-by-step guide and our team is available to help every step of the way.</div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;">
    <span class="tag tag-dark" style="margin-bottom:18px;display:inline-block;">Ready to switch?</span>
    <h2 class="cta-title">Try Certxa free for 60 days.<br><em>No card. No catch.</em></h2>
    <p class="cta-text">Join thousands of salon owners who made the switch from GlossGenius and never looked back.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold btn-lg">Start Free Trial</a>
      <a href="/pricing" class="btn btn-outline-white">See Pricing</a>
    </div>
    <p class="cta-note">60-day free trial &middot; Free migration from GlossGenius &middot; Cancel any time</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
