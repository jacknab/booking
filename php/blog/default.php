<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Salon Business Blog | Tips, Guides & Insights for Beauty Professionals — Certxa');
define('PAGE_DESC',     'The Certxa blog — practical guides and insights to help salon owners, hair stylists, nail technicians, and barbers grow their business. Booking tips, marketing advice, software guides, and more.');
define('PAGE_KEYWORDS', 'salon business blog, salon owner tips, beauty salon marketing, how to grow a salon, salon booking tips, hairdresser business advice, nail salon tips, barbershop marketing, salon software guides, reduce no-shows salon');
define('PAGE_CANONICAL','https://certxa.com/blog');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
  ['name'=>'Blog','url'=>'https://certxa.com/blog'],
]));
require 'includes/header.php';
require 'includes/nav.php';

$featured = [
  'title'   => 'How to Reduce No-Shows in Your Salon: 7 Proven Strategies for 2026',
  'excerpt' => 'No-shows cost the average salon over $26,000 a year. Here are seven battle-tested strategies — from smart deposit policies to the perfect reminder sequence — that Certxa users use to slash their no-show rate by up to 68%.',
  'tag'     => 'Operations',
  'read'    => '8 min read',
  'date'    => 'April 28, 2026',
  'color'   => 'var(--plum)',
];

$articles = [
  ['How to Get More Google Reviews for Your Salon (Without Asking Awkwardly)','The difference between a 4.1 and a 4.8 Google rating is worth thousands of dollars a year in new clients. Here\'s exactly how to build your review count on autopilot.','Marketing','5 min read','April 22, 2026','#ec4899'],
  ['Best Salon Software in 2026: Certxa vs GlossGenius vs Vagaro vs Square','We tested all four platforms across booking, payments, ease of use, and support. Here\'s the honest verdict from a salon owner\'s perspective.','Software','12 min read','April 15, 2026','#7c3aed'],
  ['The Complete Guide to Salon Pricing: How to Charge What You\'re Worth','Undercharging is the #1 mistake salon owners make. This guide walks you through how to price services based on your costs, time, and the market — and how to raise prices without losing clients.','Business','10 min read','April 10, 2026','#059669'],
  ['How Reserve with Google Brought One Salon 34 New Clients in a Month','Emma\'s hair salon was getting found on Google — but clients were leaving without booking. Here\'s how one feature changed everything.','Growth','6 min read','April 3, 2026','#b45309'],
  ['Salon Instagram Strategy: How to Turn Followers into Booked Clients','Posting beautiful photos is great. But most salons waste 90% of their Instagram audience. Here\'s a proven system to turn likes into actual bookings.','Marketing','7 min read','March 28, 2026','#ec4899'],
  ['How to Build a Loyal Salon Client Base: The Retention Playbook','Acquiring a new client costs 5x more than keeping an existing one. Here\'s the complete playbook for turning first-timers into regulars who refer their friends.','Clients','9 min read','March 20, 2026','#7c3aed'],
  ['Setting Up Online Booking for Your Salon: Step-by-Step Guide','A complete walkthrough for getting your salon\'s online booking live in under 30 minutes — from choosing your services to sharing your booking link everywhere.','Guides','11 min read','March 12, 2026','#059669'],
  ['How Deposits Changed My Salon Business: A Colour Specialist\'s Story','Jessica switched to requiring deposits for all balayage bookings. Here\'s what happened to her no-show rate, her revenue, and her stress levels.','Success Story','5 min read','March 5, 2026','#b45309'],
];
?>

<!-- HERO -->
<section style="background:var(--cream);padding:80px 0 60px;border-bottom:1px solid var(--light-grey);">
  <div class="container">
    <div style="text-align:center;margin-bottom:48px;">
      <span class="tag tag-plum" style="margin-bottom:16px;display:inline-block;">The Certxa Blog</span>
      <h1 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:600;color:var(--charcoal);margin-bottom:12px;">Grow your salon.<br><em style="color:var(--plum);">One insight at a time.</em></h1>
      <p style="color:var(--mid-grey);font-size:1rem;max-width:520px;margin:0 auto;">Practical tips and proven strategies for salon owners, stylists, nail technicians, and barbers.</p>
    </div>

    <!-- FEATURED ARTICLE -->
    <div style="background:var(--white);border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--light-grey);box-shadow:var(--shadow-md);display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:900px;margin:0 auto;">
      <div style="background:linear-gradient(145deg,var(--plum),#1e0040);padding:48px 40px;display:flex;flex-direction:column;justify-content:center;">
        <span style="background:rgba(255,255,255,.15);color:#fff;font-size:.72rem;font-weight:700;padding:4px 12px;border-radius:50px;display:inline-block;margin-bottom:16px;letter-spacing:.08em;width:fit-content;"><?= $featured['tag'] ?> · <?= $featured['read'] ?></span>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:600;color:#fff;line-height:1.25;margin-bottom:14px;"><?= $featured['title'] ?></h2>
        <p style="color:rgba(255,255,255,.75);font-size:.88rem;line-height:1.65;margin-bottom:24px;"><?= $featured['excerpt'] ?></p>
        <div style="display:flex;align-items:center;gap:12px;">
          <a href="#" class="btn btn-gold" style="font-size:.82rem;">Read Article →</a>
          <span style="color:rgba(255,255,255,.5);font-size:.76rem;"><?= $featured['date'] ?></span>
        </div>
      </div>
      <div style="background:linear-gradient(145deg,#f8f4ff,#ede9fe);display:flex;align-items:center;justify-content:center;padding:40px;min-height:300px;">
        <div style="text-align:center;">
          <div style="font-size:4rem;margin-bottom:12px;">📉</div>
          <div style="font-size:2rem;font-weight:800;color:var(--plum);">68%</div>
          <div style="font-size:.85rem;color:var(--mid-grey);">Fewer no-shows with the right system</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ARTICLE GRID -->
<section class="section">
  <div class="container" style="max-width:1040px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:12px;">
      <h2 style="font-size:1.2rem;font-weight:700;color:var(--charcoal);">Latest Articles</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <?php foreach (['All','Marketing','Operations','Business','Software','Clients','Guides'] as $cat): ?>
        <span style="padding:6px 14px;border-radius:50px;font-size:.75rem;font-weight:600;background:<?= $cat==='All' ? 'var(--plum)' : 'var(--cream)' ?>;color:<?= $cat==='All' ? '#fff' : 'var(--mid-grey)' ?>;cursor:pointer;border:1px solid <?= $cat==='All' ? 'var(--plum)' : 'var(--light-grey)' ?>;"><?= $cat ?></span>
        <?php endforeach; ?>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <?php foreach ($articles as $a): ?>
      <article style="background:var(--white);border-radius:var(--radius-lg);border:1px solid var(--light-grey);overflow:hidden;transition:var(--transition);cursor:pointer;" onmouseenter="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-3px)'" onmouseleave="this.style.boxShadow='none';this.style.transform='none'">
        <div style="background:linear-gradient(135deg,<?= $a[5] ?>22,<?= $a[5] ?>44);height:120px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:2.5rem;"><?php
            $emojis = ['📋','🌟','💰','📍','📱','🤝','📅','💳'];
            echo $emojis[array_search($a, $articles) % count($emojis)];
          ?></span>
        </div>
        <div style="padding:24px;">
          <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;">
            <span style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:<?= $a[5] ?>;background:<?= $a[5] ?>18;padding:3px 8px;border-radius:50px;"><?= $a[2] ?></span>
            <span style="font-size:.7rem;color:var(--mid-grey);"><?= $a[3] ?></span>
          </div>
          <h3 style="font-size:.95rem;font-weight:700;color:var(--charcoal);line-height:1.35;margin-bottom:8px;"><?= $a[0] ?></h3>
          <p style="font-size:.8rem;color:var(--mid-grey);line-height:1.55;margin-bottom:14px;"><?= substr($a[1],0,100) ?>…</p>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:.72rem;color:var(--mid-grey);"><?= $a[4] ?></span>
            <a href="#" style="font-size:.78rem;font-weight:600;color:var(--plum);">Read →</a>
          </div>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- NEWSLETTER CTA -->
<section style="background:var(--cream);padding:64px 0;border-top:1px solid var(--light-grey);">
  <div class="container" style="max-width:560px;text-align:center;">
    <span class="tag tag-plum" style="margin-bottom:16px;display:inline-block;">Newsletter</span>
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:var(--charcoal);margin-bottom:12px;">Salon growth tips, every week.</h2>
    <p style="color:var(--mid-grey);font-size:.9rem;margin-bottom:24px;">Join 18,000+ beauty professionals who get our weekly guide to growing a thriving salon business.</p>
    <div style="display:flex;gap:8px;max-width:420px;margin:0 auto;">
      <input type="email" placeholder="your@email.com" style="flex:1;padding:12px 16px;border:1px solid var(--light-grey);border-radius:var(--radius-sm);font-size:.88rem;outline:none;">
      <button style="background:var(--plum);color:#fff;border:none;padding:12px 20px;border-radius:var(--radius-sm);font-weight:600;font-size:.88rem;cursor:pointer;">Subscribe</button>
    </div>
    <p style="font-size:.72rem;color:var(--mid-grey);margin-top:10px;">No spam, ever. Unsubscribe any time.</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
