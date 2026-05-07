<?php defined('BRAND_NAME') or define('BRAND_NAME', 'Certxa'); ?>
<nav class="nav" id="main-nav">
  <div class="container">
    <div class="nav-inner">
      <a href="/overview.php" class="nav-logo"><?= BRAND_NAME ?><span>.</span></a>

      <ul class="nav-links" id="main-menu" role="list">

        <!-- SalonOS — top-level prominent link -->
        <li>
          <a href="/salonos.php" style="font-weight:700;color:var(--plum);">SalonOS</a>
        </li>

        <li class="has-dropdown">
          <a href="#">How It Works</a>
          <div class="dropdown">
            <div class="dropdown-section">Client Experience</div>
            <a href="/overview.php"><span class="nav-dot"></span>Platform Overview</a>
            <a href="/online-booking.php"><span class="nav-dot"></span>Online Booking</a>
            <a href="/client-management.php"><span class="nav-dot"></span>Client Management</a>
            <a href="/client-notifications.php"><span class="nav-dot"></span>Client Notifications</a>
            <div class="dropdown-section" style="margin-top:10px;">Payments &amp; Revenue</div>
            <a href="/payments.php"><span class="nav-dot"></span>Payment Solutions</a>
            <a href="/card-reader-pos.php"><span class="nav-dot"></span>Card Reader &amp; POS</a>
            <div class="dropdown-section" style="margin-top:10px;">Build Your Brand</div>
            <a href="/reserve-with-google.php"><span class="nav-dot"></span>Reserve With Google</a>
            <a href="/client-reviews.php"><span class="nav-dot"></span>Client Reviews</a>
            <a href="/launchsite.php"><span class="nav-dot"></span>LaunchSite Builder</a>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="#">Solutions</a>
          <div class="dropdown">
            <div class="dropdown-section">By Salon Type</div>
            <a href="/hair-salon-software.php"><span class="nav-dot"></span>Hair Salons</a>
            <a href="/nail-salon-software.php"><span class="nav-dot"></span>Nail Studios</a>
            <a href="/barbershop-software.php"><span class="nav-dot"></span>Barbershops</a>
            <div class="dropdown-section" style="margin-top:10px;">Website Builder</div>
            <a href="/launchsite.php" style="font-weight:600;color:#6366f1;"><span class="nav-dot"></span>LaunchSite</a>
            <div class="dropdown-section" style="margin-top:10px;">Compare</div>
            <a href="/vs-glossgenius.php"><span class="nav-dot"></span>Certxa vs GlossGenius</a>
            <a href="/vs-vagaro.php"><span class="nav-dot"></span>Certxa vs Vagaro</a>
          </div>
        </li>

        <li><a href="/pricing.php">Pricing</a></li>

        <li class="has-dropdown">
          <a href="#">Customers</a>
          <div class="dropdown">
            <a href="/case-studies.php"><span class="nav-dot"></span>Success Stories</a>
            <a href="/case-studies.php"><span class="nav-dot"></span>Case Studies</a>
            <a href="#"><span class="nav-dot"></span>Community</a>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="#">Resources</a>
          <div class="dropdown">
            <a href="/blog.php"><span class="nav-dot"></span>Blog</a>
            <a href="#"><span class="nav-dot"></span>Help Centre</a>
            <a href="#"><span class="nav-dot"></span>Webinars</a>
            <a href="/contact.php"><span class="nav-dot"></span>Contact Us</a>
          </div>
        </li>

      </ul>

      <div class="nav-actions">
        <a href="/auth" class="btn-login">Log In</a>
        <a href="/auth?mode=register" class="btn-trial">Start Free Trial</a>
      </div>

      <button class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="main-menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>
<main id="main-content">
