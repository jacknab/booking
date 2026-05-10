<?php defined('BRAND_NAME') or define('BRAND_NAME', 'Certxa'); ?>
</main>

<!-- Switching CTA banner -->
<div style="background:#eef2f7;padding:80px 24px;text-align:center;">
  <h2 style="font-size:clamp(2rem,5vw,3.2rem);font-weight:800;letter-spacing:-.03em;color:#0f172a;line-height:1.15;margin:0 auto 20px;max-width:600px;font-family:'Inter',sans-serif;">
    Switching to Certxa has<br>never been easier
  </h2>
  <p style="font-size:clamp(.95rem,2vw,1.05rem);color:#475569;line-height:1.65;max-width:520px;margin:0 auto 36px;font-family:'Inter',sans-serif;">
    Sign up for our free data transfer service, and we'll import all of your appointments,
    services, inventory, and client lists for you.
  </p>
  <a href="/data-transfer"
     style="display:inline-block;padding:14px 32px;border-radius:9999px;border:1.5px solid #0f172a;background:transparent;color:#0f172a;font-size:.95rem;font-weight:500;text-decoration:none;font-family:'Inter',sans-serif;transition:background .18s,color .18s;"
     onmouseover="this.style.background='#0f172a';this.style.color='#fff';"
     onmouseout="this.style.background='transparent';this.style.color='#0f172a';">
    Get your free data transfer
  </a>
</div>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/overview" class="footer-logo"><?= BRAND_NAME ?><span>.</span></a>
        <p class="footer-tagline">The all-in-one platform that helps beauty and wellness professionals book more clients, get paid faster, and build a brand they love.</p>
        <div class="footer-payment-icons">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Amex</span>
          <span>Apple Pay</span>
          <span>Google Pay</span>
          <span>PCI-DSS</span>
        </div>
      </div>
      <div>
        <p class="footer-col-title">Company</p>
        <ul class="footer-col-links">
          <li><a href="/case-studies">Success Stories</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Help Centre</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>

      <div>
        <p class="footer-col-title">SalonOS</p>
        <ul class="footer-col-links">
          <li><a href="/salonos">SalonOS Overview</a></li>
          <li><a href="/salonos#booking">Online Booking</a></li>
          <li><a href="/salonos#pos">Built-in POS</a></li>
          <li><a href="/salonos#loyalty">Loyalty Rewards</a></li>
          <li><a href="/salonos#checkin">Client Check-In</a></li>
          <li><a href="/salonos#waitlist">Waitlist</a></li>
          <li><a href="/salonos#reviews">Google Reviews</a></li>
        </ul>
      </div>

      <div>
        <p class="footer-col-title">Launchit!</p>
        <ul class="footer-col-links">
          <li><a href="/launchsite">Launchit! Overview</a></li>
          <li><a href="/launchsite/">Templates</a></li>
          <li><a href="/launchsite#how-it-works">How It Works</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/launchsite#domains">Custom Domains</a></li>
          <li><a href="/launchsite#seo">SEO Tools</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-col-title">Features</p>
        <ul class="footer-col-links">
          <li><a href="/overview">Platform Overview</a></li>
          <li><a href="/online-booking">Online Booking</a></li>
          <li><a href="/client-management">Client Management</a></li>
          <li><a href="/client-notifications">Notifications</a></li>
          <li><a href="/payments">Payment Solutions</a></li>
          <li><a href="/card-reader-pos">Card Reader &amp; POS</a></li>
          <li><a href="/reserve-with-google">Reserve With Google</a></li>
          <li><a href="/client-reviews">Client Reviews</a></li>
          <li><a href="/data-transfer">Free Data Transfer</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-col-title">Salon Types</p>
        <ul class="footer-col-links">
          <li><a href="/hair-salon-software">Hair Salon Software</a></li>
          <li><a href="/nail-salon-software">Nail Salon Software</a></li>
          <li><a href="/barbershop-software">Barbershop Software</a></li>
        </ul>
        <p class="footer-col-title" style="margin-top:20px;">Login Access</p>
        <ul class="footer-col-links">
          <li><a href="/auth">SalonOS Login</a></li>
          <li><a href="/staff-auth">Staff Login</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-left">&copy; <?= date('Y') ?> <?= BRAND_NAME ?>. All rights reserved.</div>
      <div class="footer-bottom-right">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
      </div>
    </div>
  </div>
</footer>
<script src="/assets/js/main.js"></script>
</body>
</html>
