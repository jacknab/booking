<?php
$page_title = 'Template Designs';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/header.php';
?>

<!-- HERO -->
<section class="hero">
    <div class="container">
        <div class="hero-badge">
            <span>✦</span> Launchit — Salon Websites, Ready to Go
        </div>
        <h1>Your salon's complete website,<br><em>live in minutes</em></h1>
        <p class="hero-sub">
            Browse our professionally designed salon websites. Pick a design, go live with your domain — and optionally update any text to make it your own.
        </p>
        <div class="hero-actions">
            <a href="#categories" class="btn btn--orange btn--lg">Browse Designs</a>
            <a href="https://certxa.com/launchit" class="btn btn--ghost btn--lg">How It Works</a>
        </div>
        <p class="hero-stat">
            <span>39+ designs available</span> — new sites added every month
        </p>
    </div>
</section>

<!-- TRUST BAR -->
<div class="trust-bar">
    <div class="container">
        <p>Trusted by salons and beauty businesses across the UK</p>
        <div class="trust-logos">
            <span>Sophie's Salon</span>
            <span>Blade &amp; Co</span>
            <span>Nail Atelier</span>
            <span>The Hair Studio</span>
            <span>Glamour Bar</span>
            <span>Urban Cuts</span>
        </div>
    </div>
</div>

<!-- CATEGORY CARDS -->
<section class="categories-section" id="categories">
    <div class="container">
        <div class="section-header">
            <div class="section-label">✦ Browse by Business Type</div>
            <h2>Find the perfect website<br>for your business</h2>
            <p>Every design is fully built, mobile-ready, and launches with your domain. Optionally personalise the text — or go live as-is.</p>
        </div>

        <div class="categories-grid">

            <!-- Hair Salons -->
            <a href="<?php echo BASE_PATH; ?>/hair-salons.php" class="category-card">
                <div class="category-card__image">
                    💇‍♀️
                </div>
                <div class="category-card__body">
                    <div class="category-card__label">Hair Salons</div>
                    <h2 class="category-card__title">Hair Salons</h2>
                    <p class="category-card__desc">
                        Elegant, professional websites for hair salons — showcasing services, stylists, and online booking in a stunning layout.
                    </p>
                    <div class="category-card__footer">
                        <span class="category-card__count">12 designs available</span>
                        <div class="category-card__arrow">→</div>
                    </div>
                </div>
            </a>

            <!-- Barbershops -->
            <a href="<?php echo BASE_PATH; ?>/barbershops.php" class="category-card">
                <div class="category-card__image">
                    ✂️
                </div>
                <div class="category-card__body">
                    <div class="category-card__label">Barbershops</div>
                    <h2 class="category-card__title">Barbershops</h2>
                    <p class="category-card__desc">
                        Bold, sharp websites for modern barbershops. From classic heritage to street-culture — find a look that fits your shop.
                    </p>
                    <div class="category-card__footer">
                        <span class="category-card__count">10 designs available</span>
                        <div class="category-card__arrow">→</div>
                    </div>
                </div>
            </a>

            <!-- Nail Salons -->
            <a href="<?php echo BASE_PATH; ?>/nail-salons.php" class="category-card">
                <div class="category-card__image">
                    💅
                </div>
                <div class="category-card__body">
                    <div class="category-card__label">Nail Salons</div>
                    <h2 class="category-card__title">Nail Salons</h2>
                    <p class="category-card__desc">
                        Chic, vibrant websites for nail salons and nail artists — portfolio, services, and online booking beautifully presented.
                    </p>
                    <div class="category-card__footer">
                        <span class="category-card__count">9 designs available</span>
                        <div class="category-card__arrow">→</div>
                    </div>
                </div>
            </a>

        </div>
    </div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section">
    <div class="container">
        <div class="section-header">
            <div class="section-label">✦ Simple Process</div>
            <h2>Up and running in three steps</h2>
        </div>
        <div class="how-grid">
            <div class="how-step">
                <div class="how-num">1</div>
                <h3>Pick your design</h3>
                <p>Browse our catalogue and choose the website that fits your salon's vibe. Preview it in full before you commit.</p>
            </div>
            <div class="how-step">
                <div class="how-num">2</div>
                <h3>Add your domain</h3>
                <p>Point your existing domain or grab a new one. We handle the hosting, SSL, and setup for you.</p>
            </div>
            <div class="how-step">
                <div class="how-num">3</div>
                <h3>Go live — optionally edit</h3>
                <p>Your site is live instantly. Want to change any text? Log in and update it at any time — no design skills needed.</p>
            </div>
        </div>
    </div>
</section>

<!-- CTA BANNER -->
<section class="container">
    <div class="cta-banner">
        <h2>Ready to launch your salon's website?</h2>
        <p>Pick a design, connect your domain, and go live today. No builders, no drag-and-drop, no design headaches.</p>
        <div class="cta-banner-actions">
            <a href="https://certxa.com/signup" class="btn btn--primary btn--lg">Get Started</a>
            <a href="https://certxa.com/pricing" class="btn btn--ghost btn--lg">View Pricing</a>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
