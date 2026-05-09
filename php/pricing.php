<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Salon Software Pricing | Certxa Plans from $9/month — Free 60-Day Trial');
define('PAGE_DESC',     'Simple, transparent salon software pricing. Certxa plans start at $9/month with a free 60-day trial. No hidden fees, no contracts. Online booking, payments, and client management included in every plan.');
define('PAGE_KEYWORDS', 'salon software pricing, salon booking software cost, beauty salon software plans, salon management software price, how much does salon software cost, certxa pricing, salon software free trial, affordable salon software');
define('PAGE_CANONICAL', 'https://certxa.com/pricing.php');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview.php'],
  ['name'=>'Pricing','url'=>'https://certxa.com/pricing.php'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'       => 'WebPage',
    '@id'         => 'https://certxa.com/pricing.php',
    'name'        => 'Salon Software Pricing — Certxa',
    'description' => 'Transparent pricing for Certxa salon management software. Plans from $19/month with a free 60-day trial.',
    'url'         => 'https://certxa.com/pricing.php',
    'isPartOf'    => ['@id'=>'https://certxa.com/#website'],
    'about'       => ['@id'=>'https://certxa.com/#software'],
  ],
  [
    '@type'       => 'SoftwareApplication',
    '@id'         => 'https://certxa.com/#software-pricing',
    'name'        => 'Certxa',
    'applicationCategory' => 'BusinessApplication',
    'offers'      => [
      [
        '@type'           => 'Offer',
        'name'            => 'Solo Plan',
        'price'           => '9',
        'priceCurrency'   => 'USD',
        'description'     => 'Perfect for independent stylists and booth renters. Includes online booking, client management, integrated payments, and automated reminders.',
        'billingIncrement' => 'P1M',
      ],
      [
        '@type'           => 'Offer',
        'name'            => 'Professional Plan',
        'price'           => '22',
        'priceCurrency'   => 'USD',
        'description'     => 'Everything, unlimited — unlimited calendars, unlimited staff, and every feature included for any salon size.',
        'billingIncrement' => 'P1M',
      ],
      [
        '@type'           => 'Offer',
        'name'            => 'Elite Plan',
        'price'           => '79',
        'priceCurrency'   => 'USD',
        'description'     => 'For multi-location businesses. All features, done-for-you setup, API access, 50,000 SMS credits/month, and priority support.',
        'billingIncrement' => 'P1M',
      ],
    ],
  ],
  [
    '@type'      => 'FAQPage',
    'mainEntity' => [
      [
        '@type'          => 'Question',
        'name'           => 'Is there a free trial for Certxa?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Yes — every Certxa plan includes a free 60-day trial with no credit card required. You get full access to all features during your trial.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'Are there any hidden fees or contracts?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'No hidden fees, no setup costs, and no long-term contracts. You pay month-to-month and can cancel any time. Payment processing fees apply separately at 2.49% + 15¢ per transaction.'],
      ],
      [
        '@type'          => 'Question',
        'name'           => 'Can I switch plans at any time?',
        'acceptedAnswer' => ['@type'=>'Answer','text'=>'Yes — you can upgrade or downgrade your Certxa plan at any time. Changes take effect at the start of your next billing cycle.'],
      ],
    ],
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<style>
/* Pricing-specific styles */
.billing-toggle {
  display: inline-flex; background: var(--light-grey); border-radius: 50px;
  padding: 4px; gap: 0;
}
.billing-btn {
  padding: 10px 28px; border-radius: 50px; font-size: .88rem; font-weight: 600;
  border: none; cursor: pointer; transition: var(--transition); background: transparent;
  color: var(--mid-grey);
}
.billing-btn.active { background: var(--white); color: var(--charcoal); box-shadow: var(--shadow-sm); }

.save-badge {
  display: inline-block; background: linear-gradient(135deg, var(--gold-bright), var(--gold));
  color: var(--white); font-size: .7rem; font-weight: 700;
  padding: 3px 10px; border-radius: 50px; margin-left: 10px;
  vertical-align: middle;
}

.plan-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; align-items: start; }

.plan-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 2px solid var(--light-grey); padding: 36px 32px;
  position: relative; transition: var(--transition);
}
.plan-card:hover { border-color: var(--plum-light); box-shadow: var(--shadow-md); }
.plan-card.featured {
  border-color: var(--plum); box-shadow: var(--shadow-lg);
  transform: scale(1.03);
}
.plan-card.featured:hover { transform: scale(1.04); }

.plan-popular {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, var(--plum), var(--plum-mid));
  color: var(--white); font-size: .72rem; font-weight: 700;
  padding: 5px 18px; border-radius: 50px; white-space: nowrap;
  letter-spacing: .06em;
}

.plan-name { font-size: 1.1rem; font-weight: 700; color: var(--charcoal); margin-bottom: 6px; }
.plan-tagline { font-size: .85rem; color: var(--mid-grey); margin-bottom: 24px; line-height: 1.5; }

.plan-price-area { margin-bottom: 20px; }
.plan-price-old { font-size: 1.1rem; color: var(--mid-grey); text-decoration: line-through; font-weight: 500; }
.plan-price {
  font-family: 'Cormorant Garamond', serif; font-size: 3.2rem; font-weight: 600;
  color: var(--plum); line-height: 1;
}
.plan-price sup { font-size: 1.4rem; vertical-align: super; }
.plan-price-period { font-size: .85rem; color: var(--mid-grey); margin-top: 4px; }
.plan-billing-note { font-size: .75rem; color: var(--mid-grey); margin-top: 6px; }

.plan-divider { border: none; border-top: 1px solid var(--light-grey); margin: 24px 0; }

.plan-features { list-style: none; margin-bottom: 32px; }
.plan-features li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: .88rem; color: var(--charcoal); padding: 7px 0;
}
.plan-features li .feat-icon {
  flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: .65rem; font-weight: 700;
}
.feat-check { background: #D1FAE5; color: #065F46; }
.feat-plum  { background: var(--plum-light); color: var(--plum-mid); }
.feat-dim   { color: var(--mid-grey) !important; }
.feat-dim .feat-icon { background: var(--light-grey); color: var(--mid-grey); }
.feat-soon  { background: #EDE9FE; color: #7C3AED; }
.feat-soon-label { font-size: .68rem; font-weight: 700; color: #7C3AED; background: #EDE9FE; padding: 1px 7px; border-radius: 50px; margin-left: 6px; vertical-align: middle; letter-spacing: .04em; }

.plan-card .btn { width: 100%; justify-content: center; margin-bottom: 12px; }
.plan-note { text-align: center; font-size: .78rem; color: var(--mid-grey); }
.plan-fee-note { font-size: .73rem; color: var(--mid-grey); margin-top: 5px; }
.plan-fee-note strong { color: var(--plum-mid); }

.ct-soon { font-size: .75rem; font-weight: 700; color: #7C3AED; background: #EDE9FE; padding: 3px 10px; border-radius: 50px; white-space: nowrap; }

/* Compare table */
.compare-section { padding: 80px 0; background: var(--cream); }
.compare-table-wrap { overflow-x: auto; border-radius: var(--radius-md); box-shadow: var(--shadow-md); }
.compare-table {
  width: 100%; border-collapse: collapse;
  background: var(--white); border-radius: var(--radius-md); overflow: hidden;
}
.compare-table thead th {
  padding: 20px 24px; text-align: center; background: var(--white);
  border-bottom: 2px solid var(--light-grey);
}
.compare-table thead th:first-child { text-align: left; }
.compare-table thead .plan-header { font-size: 1rem; font-weight: 700; color: var(--charcoal); }
.compare-table thead .plan-header.featured-col { color: var(--plum); }
.compare-table thead .plan-header-price { font-size: .85rem; color: var(--mid-grey); font-weight: 500; }

.compare-table .section-row td {
  background: var(--cream); padding: 12px 24px;
  font-size: .72rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--mid-grey);
  border-top: 1px solid var(--light-grey);
}
.compare-table tbody td {
  padding: 14px 24px; text-align: center; font-size: .88rem;
  border-bottom: 1px solid var(--light-grey); color: var(--charcoal);
}
.compare-table tbody td:first-child { text-align: left; font-weight: 500; }
.compare-table tbody tr:last-child td { border-bottom: none; }
.compare-table .featured-col { background: rgba(91,33,182,.04); }
.ct-check  { color: #059669; font-size: 1.1rem; font-weight: 700; }
.ct-cross  { color: #D1D5DB; font-size: 1.1rem; }
.ct-text   { font-size: .82rem; font-weight: 600; color: var(--plum-mid); }

/* Addons */
.addons-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.addon-card {
  background: var(--white); border: 1.5px solid var(--light-grey);
  border-radius: var(--radius-md); padding: 24px; transition: var(--transition);
}
.addon-card:hover { border-color: var(--plum-light); box-shadow: var(--shadow-sm); }
.addon-price { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 600; color: var(--plum); }
.addon-name  { font-weight: 700; font-size: .95rem; margin: 4px 0; }
.addon-desc  { font-size: .82rem; color: var(--mid-grey); line-height: 1.6; }

.solo-upsell-nudge {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: var(--plum-light); border-radius: var(--radius-sm);
  padding: 10px 14px; font-size: .8rem; color: var(--plum-mid); font-weight: 500;
  margin-top: 4px;
}
.sun-icon { font-size: .7rem; color: var(--plum); flex-shrink: 0; }
.sun-link {
  margin-left: auto; font-weight: 700; color: var(--plum);
  text-decoration: none; white-space: nowrap;
}
.sun-link:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .plan-cards { grid-template-columns: 1fr; }
  .plan-card.featured { transform: scale(1); }
  .addons-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .addons-grid { grid-template-columns: 1fr; }
}
</style>

<!-- HERO -->
<section style="background: linear-gradient(160deg, var(--cream) 0%, var(--plum-light) 100%); padding: 90px 0 70px;">
  <div class="container" style="text-align:center;">
    <span class="tag tag-plum" style="margin-bottom:16px;display:inline-block;">Pricing</span>
    <h1 style="font-family:'Cormorant Garamond',serif; font-size:clamp(2.6rem,5vw,4rem); color:var(--plum); line-height:1.12; margin-bottom:18px; letter-spacing:-.02em;">
      Plans that grow<br><em>with your business.</em>
    </h1>
    <p style="font-size:1.05rem; color:var(--mid-grey); max-width:520px; margin:0 auto 36px; line-height:1.75;">
      Everything you need to book, manage, and grow your salon — in one straightforward plan. Start free for 60 days. No credit card required.
    </p>

    <!-- Billing Toggle -->
    <div style="margin-bottom:12px;">
      <div class="billing-toggle">
        <button class="billing-btn" id="btn-annual" onclick="setBilling('annual')">Annual</button>
        <button class="billing-btn active" id="btn-monthly" onclick="setBilling('monthly')">Monthly</button>
      </div>
    </div>
    <div style="font-size:.82rem; color:var(--mid-grey);">
      Switch to annual billing and <strong style="color:var(--plum);">save up to 20%</strong>
      <span class="save-badge">Save 20%</span>
    </div>
  </div>
</section>

<!-- PLAN CARDS -->
<section style="padding: 0 0 80px; background: linear-gradient(to bottom, var(--plum-light) 0%, var(--white) 200px);">
  <div class="container">
    <div class="plan-cards">

      <?php
      $plans = [
        [
          'name'        => 'Solo',
          'tagline'     => 'Built for independent stylists, booth renters, and solo practitioners.',
          'monthly'     => '9',
          'annual'      => '7',
          'old_monthly' => null,
          'old_annual'  => '9',
          'period'      => '/month',
          'billing'     => 'Billed monthly — or $7/mo billed annually',
          'featured'    => false,
          'cta_label'   => 'Start Free Trial',
          'cta_class'   => 'btn-secondary',
          'fee'         => null,
          'features'    => [
            [true,  'Online booking page'],
            [true,  '1 calendar'],
            [true,  '1 staff member (you)'],
            [true,  'Up to 500 client profiles'],
            [true,  'SMS & email reminders (200/mo)'],
            [true,  'Basic website builder'],
            [false, 'Payments & card reader'],
            ['soon','iOS & Android app'],
            [false, 'Reserve With Google'],
            [false, 'Automated review requests'],
            [false, 'Advanced reporting'],
            [false, 'Multi-location support'],
            [false, 'Priority support'],
          ],
        ],
        [
          'name'        => 'Professional',
          'tagline'     => 'Everything, unlimited — for any salon size.',
          'monthly'     => '22',
          'annual'      => '18',
          'old_monthly' => null,
          'old_annual'  => '22',
          'period'      => '/month',
          'billing'     => 'Billed monthly — or $18/mo billed annually',
          'fee'         => '1.4%',
          'featured'    => true,
          'cta_label'   => 'Start Free Trial',
          'cta_class'   => 'btn-primary',
          'features'    => [
            [true,  'Everything in Solo, plus:'],
            [true,  'Unlimited calendars'],
            [true,  'Unlimited staff members'],
            [true,  'SMS & email reminders (unlimited)'],
            [true,  'Premium website builder + custom domain'],
            [true,  'Reserve With Google'],
            [true,  'Automated review requests'],
            [true,  'Client re-engagement campaigns'],
            [true,  'Advanced revenue reporting'],
            [true,  'Birthday & anniversary messages'],
            [true,  'Priority support'],
          ],
        ],
        [
          'name'        => 'Elite',
          'tagline'     => 'For multi-location businesses and high-volume salon groups.',
          'monthly'     => '49',
          'annual'      => '39',
          'old_monthly' => null,
          'old_annual'  => null,
          'period'      => '/month',
          'billing'     => 'Billed monthly — or $39/mo billed annually',
          'fee'         => '1.2%',
          'featured'    => false,
          'cta_label'   => 'See Details',
          'cta_href'    => '/elite-details',
          'cta_class'   => 'btn-secondary',
          'features'    => [
            [true,  'Everything in Professional, plus:'],
            [true,  'Up to 5 locations included'],
            [true,  'Multi-location dashboard'],
            [true,  'Cross-location reporting'],
            [true,  'API access for integrations'],
            [true,  'Priority phone support'],
            [true,  'Staff commission tracking'],
          ],
        ],
      ];

      foreach ($plans as $plan):
        $isF = $plan['featured'];
      ?>
      <div class="plan-card <?= $isF ? 'featured' : '' ?>" id="<?= strtolower($plan['name']) ?>">
        <?php if ($isF): ?>
        <div class="plan-popular">Most Popular</div>
        <?php endif; ?>

        <div class="plan-name"><?= $plan['name'] ?></div>
        <div class="plan-tagline"><?= $plan['tagline'] ?></div>

        <div class="plan-price-area">
          <?php if ($plan['old_annual']): ?>
          <div class="plan-price-old" id="old-<?= strtolower($plan['name']) ?>" style="display:none;">$<?= $plan['old_annual'] ?></div>
          <?php endif; ?>
          <div class="plan-price">
            <sup>$</sup><span class="price-val" data-monthly="<?= $plan['monthly'] ?>" data-annual="<?= $plan['annual'] ?>"><?= $plan['monthly'] ?></span>
          </div>
          <div class="plan-price-period"><?= $plan['period'] ?></div>
          <div class="plan-billing-note" id="note-<?= strtolower($plan['name']) ?>"><?= $plan['billing'] ?></div>
          <?php if (!empty($plan['fee'])): ?>
          <div class="plan-fee-note"><strong><?= $plan['fee'] ?></strong> card processing fee per transaction</div>
          <?php endif; ?>
        </div>

        <a href="<?= $plan['cta_href'] ?? '#' ?>" class="btn <?= $plan['cta_class'] ?>"><?= $plan['cta_label'] ?></a>
        <p class="plan-note">No credit card required</p>

        <hr class="plan-divider">

        <ul class="plan-features">
          <?php foreach ($plan['features'] as $feat): ?>
          <?php $isSoon = ($feat[0] === 'soon'); ?>
          <li class="<?= (!$feat[0] && !$isSoon) ? 'feat-dim' : '' ?>">
            <span class="feat-icon <?= $isSoon ? 'feat-soon' : ($feat[0] ? ($isF ? 'feat-plum' : 'feat-check') : '') ?>">
              <?= $isSoon ? '◷' : ($feat[0] ? '✓' : '–') ?>
            </span>
            <?= $feat[1] ?><?php if ($isSoon): ?><span class="feat-soon-label">Coming Soon</span><?php endif; ?>
          </li>
          <?php endforeach; ?>
        </ul>

        <?php if ($plan['name'] === 'Solo'): ?>
        <div class="solo-upsell-nudge">
          <span class="sun-icon">✦</span>
          <span>Need more calendars or staff?</span>
          <a href="#professional" class="sun-link">See Professional →</a>
        </div>
        <?php endif; ?>

      </div>
      <?php endforeach; ?>

    </div>

    <!-- Enterprise note -->
    <div style="text-align:center; margin-top:40px; padding:28px; background:var(--cream); border-radius:var(--radius-md); border:1px solid var(--light-grey);">
      <strong style="font-size:1rem;">Running more than 5 locations?</strong>
      <span style="color:var(--mid-grey); margin:0 12px;">·</span>
      <span style="font-size:.95rem; color:var(--mid-grey);">We offer custom Enterprise plans with volume pricing, a dedicated success team, and a bespoke contract.</span>
      <a href="#" class="btn btn-secondary" style="margin-left:20px; padding:10px 24px; font-size:.85rem;">Talk to Sales</a>
    </div>
  </div>
</section>

<!-- FEATURE COMPARISON TABLE -->
<section class="compare-section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-plum">Full Comparison</span>
      <h2 class="section-title">What's included in each plan</h2>
      <p class="section-subtitle">Every detail, side by side — so you can choose with complete confidence.</p>
    </div>

    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th style="width:34%;"></th>
            <th><div class="plan-header">Solo</div><div class="plan-header-price">From $7/mo</div></th>
            <th><div class="plan-header featured-col">Professional</div><div class="plan-header-price" style="color:var(--plum-mid);">From $18/mo ⭐</div></th>
            <th><div class="plan-header">Elite</div><div class="plan-header-price">From $39/mo</div></th>
          </tr>
        </thead>
        <tbody>

          <tr class="section-row"><td colspan="4">Booking & Scheduling</td></tr>
          <tr>
            <td>Online booking page</td>
            <td class="ct-check">✓</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Calendars</td>
            <td>1</td><td class="featured-col ct-text">Unlimited</td><td class="ct-text">Unlimited</td>
          </tr>
          <tr>
            <td>Staff members</td>
            <td>1 (solo)</td><td class="featured-col ct-text">Unlimited</td><td class="ct-text">Unlimited</td>
          </tr>
          <tr>
            <td>Reserve With Google</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Deposits &amp; prepayments</td>
            <td class="featured-col" style="background:rgba(91,33,182,.04);"><span class="ct-soon">Coming Soon</span></td>
            <td class="featured-col"><span class="ct-soon">Coming Soon</span></td>
            <td><span class="ct-soon">Coming Soon</span></td>
          </tr>
          <tr>
            <td>Multi-location booking</td>
            <td class="ct-cross">–</td><td class="ct-cross featured-col">–</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Waiting list management</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>

          <tr class="section-row"><td colspan="4">Client Management</td></tr>
          <tr>
            <td>Client profiles</td>
            <td>Up to 500</td><td class="featured-col ct-text">Unlimited</td><td class="ct-text">Unlimited</td>
          </tr>
          <tr>
            <td>Appointment history & notes</td>
            <td class="ct-check">✓</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Allergy & sensitivity alerts</td>
            <td class="ct-check">✓</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Client segments & tags</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Lapsed client alerts</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>

          <tr class="section-row"><td colspan="4">Notifications & Marketing</td></tr>
          <tr>
            <td>Booking confirmations</td>
            <td class="ct-check">✓</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>SMS &amp; email reminders</td>
            <td>200/month</td><td class="featured-col ct-text">Unlimited</td><td class="ct-text">Unlimited</td>
          </tr>
          <tr>
            <td>Birthday & anniversary messages</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Re-engagement campaigns</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Automated review requests</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>

          <tr class="section-row"><td colspan="4">Payments & POS</td></tr>
          <tr>
            <td>Card reader & POS</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Transaction fee (US cards)</td>
            <td class="ct-cross">–</td><td class="featured-col ct-text">1.4%</td><td class="ct-text">1.2%</td>
          </tr>
          <tr>
            <td>Transaction fee (international cards)</td>
            <td class="ct-cross">–</td><td class="featured-col ct-text">3.9%</td><td class="ct-text">3.9%</td>
          </tr>
          <tr>
            <td>Gift cards</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Next-day payouts</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Commission tracking</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>

          <tr class="section-row"><td colspan="4">Website & Branding</td></tr>
          <tr>
            <td>Website builder</td>
            <td>Basic (1 site, 3 templates)</td><td class="featured-col ct-text">Premium (2 sites, 15+ templates)</td><td class="ct-text">Premium (5 sites, 15+ templates)</td>
          </tr>
          <tr>
            <td>Custom domain</td>
            <td class="ct-cross">–</td><td class="ct-check featured-col">✓</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Instagram gallery sync</td>
            <td class="ct-text" style="color:var(--mid-grey);font-style:italic;">Coming Soon</td><td class="ct-text featured-col" style="color:var(--mid-grey);font-style:italic;">Coming Soon</td><td class="ct-text" style="color:var(--mid-grey);font-style:italic;">Coming Soon</td>
          </tr>


          <tr class="section-row"><td colspan="4">Reporting & Support</td></tr>
          <tr>
            <td>Revenue reporting</td>
            <td class="ct-cross">–</td><td class="featured-col ct-text">Advanced</td><td class="ct-text">Advanced + export</td>
          </tr>
          <tr>
            <td>Multi-location dashboard</td>
            <td class="ct-cross">–</td><td class="ct-cross featured-col">–</td><td class="ct-check">✓</td>
          </tr>
          <tr>
            <td>Support</td>
            <td>Email &amp; chat</td><td class="featured-col ct-text">Priority chat</td><td class="ct-text">Phone + account manager</td>
          </tr>
          <tr>
            <td>Onboarding session</td>
            <td class="ct-cross">–</td><td class="ct-cross featured-col">–</td><td class="ct-check">✓</td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- ADD-ONS -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-gold">Optional Add-Ons</span>
      <h2 class="section-title">Extras for when you need more</h2>
      <p class="section-subtitle">Available on all plans — only pay for what you actually need.</p>
    </div>
    <div class="addons-grid">
      <?php
      $addons = [
        ['$9', '/mo', 'Extra Location', 'Add additional salon locations to your account beyond your plan\'s included locations.'],
        ['$12', '/mo', 'Advanced Analytics', 'Deep-dive reporting with custom date ranges, staff breakdowns, and CSV exports for your accountant.'],
        ['$19', '/mo', 'Two-Way SMS', 'Let clients reply to reminder texts directly. Messages land in your Certxa inbox for easy management.'],
        ['$7', '/mo', 'Extra SMS Bundle', '500 additional SMS messages per month for high-volume salons who need more than their plan includes.'],

        ['Free', '', 'Reserve With Google', 'Included on Professional and Elite. Connect your Google listing and take bookings directly from search results.'],
      ];
      foreach ($addons as $a):
      ?>
      <div class="addon-card">
        <div class="addon-price"><?= $a[0] ?><span style="font-size:1rem;font-family:'Inter',sans-serif;font-weight:400;color:var(--mid-grey);"><?= $a[1] ?></span></div>
        <div class="addon-name"><?= $a[2] ?></div>
        <div class="addon-desc"><?= $a[3] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- TRUST STRIP -->
<section style="background:var(--plum); padding:48px 0;">
  <div class="container">
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:24px; text-align:center;">
      <?php
      $trusts = [
        ['60 days', 'Free trial — no card needed'],
        ['Cancel any time', 'No lock-in contracts'],
        ['24/7', 'Platform uptime guarantee'],
        ['50,000+', 'Professionals already using Certxa'],
      ];
      foreach ($trusts as $t):
      ?>
      <div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:600; color:var(--white); line-height:1; margin-bottom:6px;"><?= $t[0] ?></div>
        <div style="font-size:.82rem; color:rgba(255,255,255,.6);"><?= $t[1] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <span class="tag tag-gold">Real Salon Owners</span>
      <h2 class="section-title">"Worth every penny."</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"I was spending $180/month across three different apps for booking, reminders, and payments. Certxa replaces all of them for $39. The maths is obvious. The quality is better too."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">LB</div>
          <div><div class="testimonial-name">Lauren Bradley</div><div class="testimonial-role">Salon Owner, Professional Plan</div></div>
        </div>
      </div>
      <div class="testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"I started on Starter, filled my books within three months, and upgraded to Professional. The ROI is insane — I brought in $1,200 extra last month just from the re-engagement campaigns."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">JR</div>
          <div><div class="testimonial-name">James Richardson</div><div class="testimonial-role">Barber, Professional Plan</div></div>
        </div>
      </div>
      <div class="testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"We run four locations and the Elite plan is perfect. One dashboard, everything in one place, and a dedicated account manager who actually responds within the hour."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">AM</div>
          <div><div class="testimonial-name">Amara Mensah</div><div class="testimonial-role">Salon Group Owner, Elite Plan</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="container" style="max-width:720px;">
    <div class="section-header">
      <span class="tag tag-plum">FAQ</span>
      <h2 class="section-title">Pricing questions, answered</h2>
    </div>
    <div class="accordion">
      <div class="accordion-item">
        <button class="accordion-btn">Is there really no credit card required for the trial? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Correct — you get full access to Certxa for 60 days with absolutely no payment information required upfront. At the end of your trial, you choose a plan and add payment details. If you decide it's not for you, just walk away — no charges, no hassle.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">Can I switch plans after I sign up? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Yes — you can upgrade or downgrade at any time. Upgrades take effect immediately and you're only charged the prorated difference. Downgrades take effect at the end of your current billing period. There are no penalties for changing plans.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">What happens to my data if I cancel? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Your data stays in your account for 90 days after cancellation. You can export everything — client lists, appointment history, financial records — at any time. We make it easy to leave, though we're confident you won't want to.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">Are there any setup fees or hidden costs? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">None. The price you see is the price you pay — monthly or annually. Website hosting, SSL, and your free subdomain are included. The only additional costs are card transaction fees (shown above), any optional add-ons you choose, and if you want a custom domain, your registrar's annual fee (typically $10–15).</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">Does the annual plan auto-renew? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">Yes — annual plans renew automatically at the end of each year. We send a reminder email 30 days before renewal so you have plenty of time to review, change plans, or cancel if needed. You can also turn off auto-renewal from your account settings at any time.</div>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn">Do you offer a discount for new salons or students? <span class="accordion-icon">+</span></button>
        <div class="accordion-body">We offer a 30% discount for newly qualified stylists and therapists in their first year of business — just contact our team with proof of qualification. We also have educational institution pricing for salon schools and colleges training the next generation of professionals.</div>
      </div>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="cta-section">
  <div class="container" style="position:relative;z-index:1;text-align:center;">
    <span class="tag" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:16px;display:inline-block;">Start Today</span>
    <h2 class="cta-title">60 days free.<br><em>No card. No catch.</em></h2>
    <p class="cta-text">Join 50,000+ beauty professionals growing their businesses with Certxa. Pick a plan after your trial — and only pay if you love it.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-gold" style="font-size:1rem;padding:16px 40px;">Start Free Trial</a>
      <a href="#" class="btn btn-outline-white">See Pricing</a>
    </div>
    <p class="cta-note">Questions? Chat with our team — typical response time under 5 minutes.</p>
  </div>
</section>

<script>
// Billing toggle logic
const prices = document.querySelectorAll('.price-val');

function setBilling(type) {
  const isAnnual = type === 'annual';

  document.getElementById('btn-annual').classList.toggle('active', isAnnual);
  document.getElementById('btn-monthly').classList.toggle('active', !isAnnual);

  prices.forEach(el => {
    el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
  });

  // Update billing notes
  const notes = {
    solo:         isAnnual ? 'Billed annually as $84/year — save $24' : 'Billed monthly, cancel any time',
    professional: isAnnual ? 'Billed annually as $216/year — save $48' : 'Billed monthly, cancel any time',
    elite:        isAnnual ? 'Billed annually as $468/year — save $120' : 'Billed monthly, cancel any time',
  };
  Object.keys(notes).forEach(k => {
    const el = document.getElementById('note-' + k);
    if (el) el.textContent = notes[k];
  });
}
</script>

<?php require 'includes/footer.php'; ?>
