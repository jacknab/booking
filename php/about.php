<?php
define('BRAND_NAME',     'Certxa');
define('PAGE_TITLE',     'About Certxa | Salon Software Built by People Who Get It');
define('PAGE_DESC',      'Certxa was built to give salon, barbershop, and spa owners a single platform to run their entire business — bookings, payments, client management, and Google reviews. No per-feature charges. No complexity.');
define('PAGE_KEYWORDS',  'about certxa, certxa story, salon software company, who made certxa, beauty industry software');
define('PAGE_CANONICAL', 'https://certxa.com/about');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home',  'url'=>'https://certxa.com/overview.php'],
  ['name'=>'About', 'url'=>'https://certxa.com/about'],
]));
require 'includes/header.php';
require 'includes/nav.php';
?>

<style>
.about-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 100px 24px 80px;
  text-align: center;
  color: #fff;
}
.about-hero h1 {
  font-family: 'Inter', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -.035em;
  margin: 0 0 20px;
  line-height: 1.1;
}
.about-hero h1 em { font-style: normal; color: #a78bfa; }
.about-hero p {
  color: #94a3b8;
  font-size: 1.1rem;
  max-width: 580px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  line-height: 1.65;
}
.about-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 80px 24px 100px;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  line-height: 1.75;
}
.about-wrap h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin: 60px 0 16px;
  letter-spacing: -.03em;
}
.about-wrap p {
  font-size: 1rem;
  color: #475569;
  margin-bottom: 16px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 48px 0;
}
.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
}
.stat-card .num {
  font-size: 2.4rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -.04em;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-card .label {
  font-size: .85rem;
  color: #64748b;
  font-weight: 500;
}
.values-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 32px;
}
.value-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
}
.value-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}
.value-card p { font-size: .9rem; color: #64748b; margin: 0; }
.contact-banner {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  margin-top: 72px;
  color: #fff;
}
.contact-banner h2 { color: #fff; margin: 0 0 12px; font-size: 1.8rem; }
.contact-banner p { color: rgba(255,255,255,.8); margin: 0 0 24px; font-size: 1rem; }
.contact-banner a {
  display: inline-block;
  background: #fff;
  color: #6366f1;
  font-weight: 700;
  font-size: .95rem;
  padding: 14px 32px;
  border-radius: 9999px;
  text-decoration: none;
}
@media (max-width: 640px) {
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .values-grid { grid-template-columns: 1fr; }
  .contact-banner { padding: 36px 24px; }
}
</style>

<div class="about-hero">
  <h1>Built for the <em>people</em><br>who make you feel great</h1>
  <p>Certxa is the all-in-one business platform for salons, barbershops, and spas — built so you can focus on your craft, not your software.</p>
</div>

<div class="about-wrap">

  <div class="stat-grid">
    <div class="stat-card">
      <div class="num">50K+</div>
      <div class="label">beauty professionals trust Certxa</div>
    </div>
    <div class="stat-card">
      <div class="num">$2B+</div>
      <div class="label">processed through our platform</div>
    </div>
    <div class="stat-card">
      <div class="num">4.9★</div>
      <div class="label">average rating from our users</div>
    </div>
  </div>

  <h2>Our Story</h2>
  <p>Certxa started with a simple observation: salon and barbershop owners are some of the most talented entrepreneurs in any city — but they're drowning in software that was never built for them. Three tools for booking. A separate one for payments. Another for texting clients. And Google reviews piling up on a phone no one has time to answer.</p>
  <p>We built Certxa to collapse all of that into one focused platform. Appointments, point-of-sale, client management, loyalty programs, SMS marketing, and Google review management — all in one place, all included, no per-feature add-ons.</p>
  <p>Today, over 50,000 beauty professionals rely on Certxa every day to run their businesses. From solo booth renters to multi-location salon groups, Certxa scales with you.</p>

  <h2>What We Build</h2>
  <p>Every feature in Certxa solves a real problem we heard from real salon owners:</p>
  <ul>
    <li><strong>Online booking</strong> — clients book 24/7, you never miss a fill-in</li>
    <li><strong>Built-in POS</strong> — take any payment, sell products, track everything</li>
    <li><strong>Client management</strong> — full history, notes, preferences, and intake forms</li>
    <li><strong>SMS & email reminders</strong> — cut no-shows dramatically</li>
    <li><strong>Google Reviews</strong> — read and respond to all your reviews in one place, powered by the Google Business Profile API</li>
    <li><strong>Loyalty &amp; gift cards</strong> — keep clients coming back</li>
    <li><strong>LaunchSite</strong> — a professional salon website, live in minutes</li>
  </ul>

  <h2>Our Values</h2>
  <div class="values-grid">
    <div class="value-card">
      <h3>Honesty first</h3>
      <p>No hidden fees. No bait-and-switch pricing. What you see is what you pay.</p>
    </div>
    <div class="value-card">
      <h3>Your data, your business</h3>
      <p>We never sell your data. We never use your client list to advertise to your competitors. Your data is yours.</p>
    </div>
    <div class="value-card">
      <h3>Built for real workflows</h3>
      <p>Every feature ships only after testing with actual salon owners in live shops.</p>
    </div>
    <div class="value-card">
      <h3>Reliability you can count on</h3>
      <p>We know your calendar going down during your Saturday rush is catastrophic. Uptime is our #1 engineering priority.</p>
    </div>
  </div>

  <div class="contact-banner">
    <h2>Want to talk to a real person?</h2>
    <p>Our support team is made up of people who've worked in salons. We get it.</p>
    <a href="/contact.php">Get in touch</a>
  </div>

</div>

<?php require 'includes/footer.php'; ?>
