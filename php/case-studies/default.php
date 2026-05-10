<?php
define('BRAND_NAME',    'Certxa');
define('PAGE_TITLE',    'Salon Success Stories & Case Studies | Real Results with Certxa');
define('PAGE_DESC',     'See how real salons, nail studios, and barbershops transformed their business with Certxa. From solo stylists to multi-location chains — read the numbers, hear the stories.');
define('PAGE_KEYWORDS', 'salon software success stories, certxa case studies, salon booking software results, hair salon testimonials, nail salon software reviews, barbershop software results, certxa reviews, salon management software testimonials');
define('PAGE_CANONICAL','https://certxa.com/case-studies');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home','url'=>'https://certxa.com/overview'],
  ['name'=>'Success Stories','url'=>'https://certxa.com/case-studies'],
]));
define('PAGE_SCHEMA', json_encode([
  [
    '@type'      => 'ItemList',
    'name'       => 'Certxa Salon Customer Success Stories',
    'itemListElement' => [
      ['@type'=>'ListItem','position'=>1,'name'=>'Jessica Mitchell — 40% more bookings in 60 days','url'=>'https://certxa.com/case-studies.php#jessica'],
      ['@type'=>'ListItem','position'=>2,'name'=>'Marcus Johnson — 82 Google reviews in 3 months','url'=>'https://certxa.com/case-studies.php#marcus'],
      ['@type'=>'ListItem','position'=>3,'name'=>'Ava Laurent — Nail studio revenue up 52%','url'=>'https://certxa.com/case-studies.php#ava'],
      ['@type'=>'ListItem','position'=>4,'name'=>'David Kurosawa — Managing 6 stylists with zero chaos','url'=>'https://certxa.com/case-studies.php#david'],
    ],
  ],
  [
    '@type'      => 'AggregateRating',
    'itemReviewed' => ['@id'=>'https://certxa.com/#software'],
    'ratingValue'=> '4.9',
    'bestRating' => '5',
    'ratingCount'=> '2847',
    'reviewCount'=> '2847',
  ],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- HERO -->
<section class="hero-dark-section" style="padding:90px 0 70px;text-align:center;">
  <div class="orb orb-1"></div><div class="orb orb-2"></div>
  <div class="container" style="max-width:760px;">
    <span class="stars-badge" style="margin-bottom:20px;display:inline-flex;"><span>⭐</span><span>Rated 4.9/5 by 2,847 beauty professionals</span></span>
    <h1 class="hero-dark-headline" style="font-size:clamp(2.2rem,5vw,3.6rem);margin-bottom:20px;">
      Real salons.<br><em>Real results.</em>
    </h1>
    <p class="hero-dark-sub" style="max-width:560px;margin:0 auto 40px;">Numbers don't lie. See exactly what happened when these salon owners, nail techs, and barbers switched to Certxa.</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:680px;margin:0 auto;">
      <?php foreach ([['50,000+','Beauty pros'],['4.9★','Average rating'],['68%','No-show reduction'],['40%','Avg booking boost']] as $s): ?>
      <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:var(--radius-md);padding:16px 12px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:var(--gold-bright);"><?= $s[0] ?></div>
        <div style="font-size:.72rem;color:rgba(255,255,255,.6);margin-top:4px;"><?= $s[1] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- CASE STUDY 1 -->
<section class="section" id="jessica">
  <div class="container" style="max-width:920px;">
    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-plum">Hair Salon · London</span>
        <h2 class="feature-title">"40% more bookings. 68% fewer no-shows. In 60 days."</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">
          <?php foreach ([['Before','4–6 no-shows/week','No-shows'],['After','Under 1/week','No-shows'],['Revenue','Up 40%','First 60 days']] as $m): ?>
          <div style="background:<?= $m[0]==='After' ? 'var(--plum-light)' : 'var(--cream)' ?>;border-radius:var(--radius-md);padding:16px;text-align:center;border:1px solid <?= $m[0]==='After' ? 'var(--plum)' : 'var(--light-grey)' ?>;">
            <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mid-grey);margin-bottom:4px;"><?= $m[0] ?></div>
            <div style="font-size:1.1rem;font-weight:800;color:<?= $m[0]==='After' ? 'var(--plum)' : 'var(--charcoal)' ?>;"><?= $m[1] ?></div>
            <div style="font-size:.72rem;color:var(--mid-grey);"><?= $m[2] ?></div>
          </div>
          <?php endforeach; ?>
        </div>
        <p class="feature-text">"I was losing hundreds of pounds a week to no-shows, especially on balayage and colour days. The moment I turned on deposits in Certxa and set up the automated reminders, everything changed. My no-show rate dropped from 5–6 a week to less than 1. And because my clients were booking themselves online 24/7, my total bookings jumped 40% in the first two months."</p>
        <p style="font-weight:700;color:var(--charcoal);font-size:.88rem;">— Jessica Mitchell, Colour Specialist &amp; Salon Owner, London</p>
        <div style="margin-top:20px;display:flex;gap:10px;">
          <a href="#" class="btn btn-primary">Start My Free Trial</a>
          <a href="/online-booking" style="font-size:.85rem;color:var(--plum);font-weight:600;display:flex;align-items:center;gap:4px;">Online Booking features →</a>
        </div>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#f5f3ff,#ede9fe);">
        <div style="text-align:center;padding:16px;">
          <div style="font-size:.75rem;font-weight:700;color:var(--plum);text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;">Weekly No-Show Rate</div>
          <?php foreach ([['Before Certxa',85,'#e5e7eb'],['Month 1',45,'#c4b5fd'],['Month 2',12,'var(--plum)']] as $b): ?>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="font-size:.75rem;color:var(--mid-grey);width:90px;text-align:right;"><?= $b[0] ?></div>
            <div style="flex:1;background:#f3f4f6;border-radius:50px;height:12px;overflow:hidden;">
              <div style="width:<?= $b[1] ?>%;background:<?= $b[2] ?>;height:100%;border-radius:50px;transition:width 1s;"></div>
            </div>
            <div style="font-size:.75rem;font-weight:700;color:var(--charcoal);width:30px;"><?= $b[1] ?>%</div>
          </div>
          <?php endforeach; ?>
          <div style="margin-top:20px;background:var(--plum);color:#fff;border-radius:10px;padding:14px;">
            <div style="font-size:1.6rem;font-weight:800;">68%</div>
            <div style="font-size:.8rem;opacity:.85;">Reduction in no-shows</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CASE STUDY 2 -->
<section class="section section-alt" id="marcus">
  <div class="container" style="max-width:920px;">
    <div class="feature-block reverse">
      <div class="feature-content">
        <span class="tag tag-gold">Barbershop · Chicago</span>
        <h2 class="feature-title">"82 new Google reviews. 3 months. Zero effort."</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">
          <?php foreach ([['Before','12 reviews','Google rating: 4.1'],['After','94 reviews','Google rating: 4.8'],['New Clients','+28/month','From Google search']] as $m): ?>
          <div style="background:<?= $m[0]==='After' ? '#FEF3C7' : 'var(--cream)' ?>;border-radius:var(--radius-md);padding:16px;text-align:center;border:1px solid <?= $m[0]==='After' ? '#FCD34D' : 'var(--light-grey)' ?>;">
            <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mid-grey);margin-bottom:4px;"><?= $m[0] ?></div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--charcoal);"><?= $m[1] ?></div>
            <div style="font-size:.72rem;color:var(--mid-grey);"><?= $m[2] ?></div>
          </div>
          <?php endforeach; ?>
        </div>
        <p class="feature-text">"We had 12 Google reviews when I signed up for Certxa. I turned on the automatic review request feature — after every appointment, the client gets a text with a direct link to our Google page. Three months later, we had 94 reviews and our rating went from 4.1 to 4.8. We're now the top-rated barbershop in our area on Google Maps. That's brought in 28 new clients a month we never would have got otherwise."</p>
        <p style="font-weight:700;color:var(--charcoal);font-size:.88rem;">— Marcus Johnson, Owner, The Fade Room, Chicago</p>
        <div style="margin-top:20px;display:flex;gap:10px;">
          <a href="#" class="btn btn-primary">Start My Free Trial</a>
          <a href="/client-reviews" style="font-size:.85rem;color:var(--plum);font-weight:600;display:flex;align-items:center;gap:4px;">Client Reviews features →</a>
        </div>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#fffbeb,#fef3c7);">
        <div style="text-align:center;padding:16px;">
          <div style="font-size:2.4rem;margin-bottom:4px;">⭐⭐⭐⭐⭐</div>
          <div style="font-size:3rem;font-weight:900;color:var(--charcoal);">4.8</div>
          <div style="font-size:.8rem;color:var(--mid-grey);margin-bottom:16px;">Google rating · 94 reviews</div>
          <div style="background:var(--white);border-radius:10px;padding:14px;text-align:left;border:1px solid var(--light-grey);">
            <div style="font-size:.72rem;font-weight:700;color:var(--mid-grey);margin-bottom:8px;">Latest review</div>
            <div style="font-size:.8rem;color:var(--charcoal);line-height:1.5;">"Best barbershop I've been to. Marcus remembered exactly how I like my fade. Booked again already!"</div>
            <div style="font-size:.72rem;color:var(--mid-grey);margin-top:6px;">— Jake P. · 2 days ago</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CASE STUDY 3 -->
<section class="section" id="ava">
  <div class="container" style="max-width:920px;">
    <div class="feature-block">
      <div class="feature-content">
        <span class="tag tag-plum">Nail Studio · New York</span>
        <h2 class="feature-title">"Revenue up 52%. No-shows down to almost zero."</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">
          <?php foreach ([['Revenue','Up 52%','First 3 months'],['No-shows','Down 91%','With deposits on'],['Online Bookings','78%','Of all appointments']] as $m): ?>
          <div style="background:var(--plum-light);border-radius:var(--radius-md);padding:16px;text-align:center;border:1px solid rgba(59,7,100,.15);">
            <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--mid-grey);margin-bottom:4px;"><?= $m[0] ?></div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--plum);"><?= $m[1] ?></div>
            <div style="font-size:.72rem;color:var(--mid-grey);"><?= $m[2] ?></div>
          </div>
          <?php endforeach; ?>
        </div>
        <p class="feature-text">"I run a nail studio with two techs and before Certxa, no-shows were killing us. Full-set appointments are two hours minimum — a no-show wastes the whole slot. I turned on deposits for all gel and acrylic bookings and the no-shows practically vanished. Combined with 24/7 online booking, my revenue is up 52% in the first three months because I'm filling slots I was previously losing."</p>
        <p style="font-weight:700;color:var(--charcoal);font-size:.88rem;">— Ava Laurent, Owner, Studio Lux Nails, New York</p>
        <div style="margin-top:20px;display:flex;gap:10px;">
          <a href="#" class="btn btn-primary">Start My Free Trial</a>
          <a href="/nail-salon-software" style="font-size:.85rem;color:var(--plum);font-weight:600;display:flex;align-items:center;gap:4px;">Nail salon features →</a>
        </div>
      </div>
      <div class="feature-visual" style="background:linear-gradient(145deg,#fdf2f8,#fce7f3);">
        <div style="text-align:center;padding:16px;">
          <div style="font-size:.75rem;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;">Revenue Growth</div>
          <?php foreach ([['Month 1','$4,200',40],['Month 2','$5,800',70],['Month 3','$6,380',85]] as $r): ?>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="font-size:.75rem;color:var(--mid-grey);width:60px;text-align:right;"><?= $r[0] ?></div>
            <div style="flex:1;background:#f3f4f6;border-radius:50px;height:20px;overflow:hidden;">
              <div style="width:<?= $r[2] ?>%;background:linear-gradient(90deg,#f9a8d4,#ec4899);height:100%;border-radius:50px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;">
                <span style="font-size:.65rem;font-weight:700;color:#fff;"><?= $r[1] ?></span>
              </div>
            </div>
          </div>
          <?php endforeach; ?>
          <div style="margin-top:16px;background:#ec4899;color:#fff;border-radius:10px;padding:14px;">
            <div style="font-size:1.6rem;font-weight:800;">+52%</div>
            <div style="font-size:.8rem;opacity:.9;">Revenue increase in 90 days</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- RATINGS STRIP -->
<section style="background:var(--plum);padding:48px 0;">
  <div class="container" style="max-width:860px;text-align:center;">
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:#fff;margin-bottom:8px;">Join 50,000+ beauty professionals already on Certxa.</h2>
    <p style="color:rgba(255,255,255,.7);margin-bottom:28px;">Rated 4.9 out of 5 across 2,847 reviews.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:28px;">
      <?php foreach ([
        ['"Honestly the best decision I made for my business."','Priya M., Nail Studio'],
        ['"The support team is incredible. They helped me set everything up in an hour."','Tom W., Barbershop'],
        ['"My clients love the booking experience. So professional."','Rachel K., Hair Salon'],
      ] as $r): ?>
      <div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:var(--radius-md);padding:18px 20px;max-width:260px;text-align:left;">
        <div style="color:var(--gold-bright);font-size:.85rem;margin-bottom:8px;">★★★★★</div>
        <p style="color:rgba(255,255,255,.85);font-size:.82rem;line-height:1.55;font-style:italic;margin-bottom:10px;"><?= $r[0] ?></p>
        <div style="font-size:.72rem;color:rgba(255,255,255,.5);"><?= $r[1] ?></div>
      </div>
      <?php endforeach; ?>
    </div>
    <a href="#" class="btn btn-gold btn-lg">Start Your 60-Day Free Trial</a>
    <p style="color:rgba(255,255,255,.5);font-size:.78rem;margin-top:12px;">No credit card required &middot; No setup fees &middot; Cancel any time</p>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
