<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/data/templates.php';

$id = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!$id || !isset($all_templates[$id])) {
    header('Location: ' . BASE_PATH . '/');
    exit;
}

$t = $all_templates[$id];
$page_title = $t['name'] . ' — Preview';

// Determine back URL from category
$category_map = [
    'Hair Salon'  => 'hair-salons.php',
    'Barbershop'  => 'barbershops.php',
    'Nail Salon'  => 'nail-salons.php',
];
$back_url = BASE_PATH . '/' . ($category_map[$t['category']] ?? '');

$is_react = !empty($t['type']) && $t['type'] === 'react';

// Badge variant per category
$badge_class = match($t['category']) {
    'Barbershop' => 'hb--barber',
    'Nail Salon' => 'hb--nail',
    default      => 'hb--hair',
};

// Demo hours used in the preview (typical UK salon schedule)
$demo_hours = [
    'sun' => ['open' => '10:00', 'close' => '16:00', 'closed' => true],
    'mon' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
    'tue' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
    'wed' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
    'thu' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
    'fri' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
    'sat' => ['open' => '10:00', 'close' => '16:00', 'closed' => false],
];

require_once __DIR__ . '/includes/header.php';
?>

<!-- ── Preview chrome bar ── -->
<div class="preview-chrome">
    <a href="<?php echo $back_url; ?>" class="preview-chrome__back">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>
        Back
    </a>
    <div class="preview-chrome__divider"></div>
    <div class="preview-chrome__info">
        <span class="preview-chrome__name"><?php echo htmlspecialchars($t['name']); ?></span>
        <?php if (!empty($t['badge'])): ?>
        <span class="preview-chrome__badge"><?php echo ucfirst($t['badge']); ?></span>
        <?php endif; ?>
        <span class="preview-chrome__url"><?php echo htmlspecialchars($t['url_slug']); ?>.com</span>
    </div>
    <div class="preview-chrome__device-btns">
        <button class="device-btn is-active" id="btnDesktop" title="Desktop" onclick="setDevice('desktop')">
            <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 14h6M8 12v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button class="device-btn" id="btnMobile" title="Mobile" onclick="setDevice('mobile')">
            <svg viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="1" width="8" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="12.5" r="0.75" fill="currentColor"/></svg>
        </button>
    </div>
    <div class="preview-chrome__actions">
        <a href="<?php echo BASE_PATH; ?>/select.php?id=<?php echo urlencode($t['id']); ?>" class="btn btn--orange" style="padding:8px 20px;font-size:0.85rem;">Use This Design</a>
    </div>
</div>

<?php if ($is_react): ?>
<!-- ── React template: iframe preview ── -->
<div class="preview-wrapper preview-wrapper--react">
    <iframe
        id="previewSite"
        src="<?php echo htmlspecialchars($t['react_path']); ?>"
        class="preview-iframe"
        allowfullscreen
        loading="lazy"
    ></iframe>
</div>

<script>
function setDevice(mode) {
    var iframe = document.getElementById('previewSite');
    var btnD = document.getElementById('btnDesktop');
    var btnM = document.getElementById('btnMobile');
    if (mode === 'mobile') {
        iframe.style.width = '390px';
        iframe.style.marginLeft = 'auto';
        iframe.style.marginRight = 'auto';
        iframe.style.display = 'block';
        iframe.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.1), 0 24px 64px rgba(0,0,0,0.6)';
        btnM.classList.add('is-active');
        btnD.classList.remove('is-active');
    } else {
        iframe.style.width = '100%';
        iframe.style.boxShadow = 'none';
        btnD.classList.add('is-active');
        btnM.classList.remove('is-active');
    }
}
</script>

<?php else: ?>
<!-- ── Scrollable preview ── -->
<div class="preview-wrapper">
<div class="preview-site" id="previewSite" style="--accent:<?php echo htmlspecialchars($t['accent']); ?>;--dark:<?php echo htmlspecialchars($t['dark']); ?>;--light:<?php echo htmlspecialchars($t['light']); ?>;">

    <!-- NAV -->
    <nav class="psite-nav">
        <a class="psite-logo" href="#"><?php echo htmlspecialchars($t['business_name']); ?><span>.</span></a>
        <div class="psite-nav-links">
            <a href="#">Services</a>
            <a href="#">Gallery</a>
            <a href="#">Team</a>
            <a href="#">Reviews</a>
            <a href="#">Contact</a>
        </div>
        <a class="psite-nav-cta" href="#">Book Now</a>
    </nav>

    <!-- HERO -->
    <section class="psite-hero">
        <div class="psite-hero__content">
            <?php if ($t['category'] !== 'Barbershop'): ?>
            <div class="hb <?php echo $badge_class; ?>" id="hoursBadge" aria-live="polite" aria-label="Business hours status">
                <span class="hb-dot"></span>
                <span class="hb-text">OPEN</span>
            </div>
            <?php endif; ?>
            <div class="psite-hero__eyebrow"><?php echo htmlspecialchars($t['category']); ?> · <?php echo htmlspecialchars($t['style']); ?></div>
            <h1 class="psite-hero__h1"><?php echo htmlspecialchars($t['hero_tagline']); ?></h1>
            <p class="psite-hero__sub"><?php echo htmlspecialchars($t['hero_sub']); ?></p>
            <div class="psite-hero__actions">
                <span class="psite-btn psite-btn--fill">Book an Appointment</span>
                <span class="psite-btn psite-btn--outline">See Our Work</span>
            </div>
        </div>
        <div class="psite-hero__image">
            <div class="psite-hero__image-placeholder">
                <?php
                $icon = $t['category'] === 'Hair Salon' ? '💇‍♀️' : ($t['category'] === 'Barbershop' ? '✂️' : '💅');
                echo $icon;
                ?>
            </div>
            <?php if ($t['category'] === 'Barbershop'): ?>
            <div class="hb <?php echo $badge_class; ?>" id="hoursBadge" aria-live="polite" aria-label="Business hours status">
                <span class="hb-dot"></span>
                <span class="hb-text">OPEN</span>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- TRUST STRIP -->
    <div class="psite-trust">
        <span class="psite-trust__label">Trusted by</span>
        <div class="psite-trust__items">
            <span>⭐ 4.9 rating</span>
            <span>500+ happy clients</span>
            <span>5+ years serving the community</span>
        </div>
    </div>

    <!-- SERVICES -->
    <section class="psite-section">
        <div class="psite-section__head">
            <span class="psite-eyebrow">What We Offer</span>
            <h2 class="psite-section__h2">Our Services</h2>
            <p class="psite-section__sub">Everything you need, under one roof. Every service is delivered by our skilled team.</p>
        </div>
        <div class="psite-services-grid">
            <?php
            $services = $t['category'] === 'Hair Salon'
                ? [
                    ['✂️', 'Cuts & Styling',   'From classic cuts to avant-garde styles, we shape your hair to perfection.', 'From £35'],
                    ['🎨', 'Colour & Balayage', 'Expert colourists delivering vibrant, blended, and natural-looking results.',  'From £55'],
                    ['💆', 'Treatments',        'Nourishing treatments to restore shine, strength, and vitality to your hair.',  'From £25'],
                  ]
                : ($t['category'] === 'Barbershop'
                ? [
                    ['✂️', 'Haircuts',       'Precision cuts tailored to your face shape and personal style.',                'From £18'],
                    ['🪒', 'Shaves',         'Hot towel, straight razor — the full gentleman\'s grooming ritual.',             'From £22'],
                    ['💈', 'Fades & Tapers', 'Seamless skin fades, high fades, taper fades — done properly.',                 'From £20'],
                  ]
                : [
                    ['💅', 'Gel Manicure',   'Long-lasting, chip-free colour with a flawless high-gloss finish.',            'From £25'],
                    ['✨', 'Nail Art',        'Bespoke designs from minimalist to intricate — your nails, your vision.',       'From £35'],
                    ['🌿', 'Pedicure',        'Relaxing foot treatment with exfoliation, massage, and polish.',                'From £30'],
                  ]);
            foreach ($services as $s): ?>
            <div class="psite-service-card">
                <div class="psite-service-icon"><?php echo $s[0]; ?></div>
                <div class="psite-service-title"><?php echo $s[1]; ?></div>
                <div class="psite-service-desc"><?php echo $s[2]; ?></div>
                <div class="psite-service-price"><?php echo $s[3]; ?></div>
            </div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- GALLERY -->
    <section class="psite-section psite-section--alt">
        <div class="psite-section__head">
            <span class="psite-eyebrow">Our Work</span>
            <h2 class="psite-section__h2">Portfolio Gallery</h2>
            <p class="psite-section__sub">A glimpse of what we do. Every result is a collaboration between you and our team.</p>
        </div>
        <div class="psite-gallery">
            <?php $icons = ['💇‍♀️','✂️','💅','🌟']; foreach ($icons as $icon): ?>
            <div class="psite-gallery__item"><?php echo $icon; ?></div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="psite-section">
        <div class="psite-section__head">
            <span class="psite-eyebrow">Reviews</span>
            <h2 class="psite-section__h2">What our clients say</h2>
        </div>
        <div class="psite-reviews">
            <div class="psite-review">
                <div class="psite-review__stars">★★★★★</div>
                <div class="psite-review__text">"Absolutely incredible experience from start to finish. The team really listened to what I wanted and delivered beyond my expectations."</div>
                <div class="psite-review__author">Sarah M.</div>
                <div class="psite-review__handle">Regular client</div>
            </div>
            <div class="psite-review">
                <div class="psite-review__stars">★★★★★</div>
                <div class="psite-review__text">"I've been coming here for two years and I wouldn't go anywhere else. Consistently great results, every single time."</div>
                <div class="psite-review__author">James R.</div>
                <div class="psite-review__handle">Loyal customer</div>
            </div>
            <div class="psite-review">
                <div class="psite-review__stars">★★★★★</div>
                <div class="psite-review__text">"The atmosphere is fantastic and the skill level is second to none. Highly recommend to anyone looking for something special."</div>
                <div class="psite-review__author">Priya K.</div>
                <div class="psite-review__handle">5-star reviewer</div>
            </div>
        </div>
    </section>

    <!-- CTA BAND -->
    <div class="psite-cta">
        <h2>Ready to book your appointment?</h2>
        <p>Online booking available 24/7. Slots fill up fast — secure yours today.</p>
        <span class="psite-btn--white">Book Now — It's Free</span>
    </div>

    <!-- FOOTER -->
    <footer class="psite-footer">
        <div class="psite-footer__grid">
            <div>
                <div class="psite-footer__brand-name"><?php echo htmlspecialchars($t['business_name']); ?></div>
                <p class="psite-footer__tagline">Professional <?php echo strtolower($t['category']); ?> services. Book online, visit us in person, or give us a call.</p>
            </div>
            <div class="psite-footer__col">
                <h4>Services</h4>
                <ul>
                    <?php foreach ($t['features'] as $f): ?>
                    <li><a href="#"><?php echo htmlspecialchars($f); ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div class="psite-footer__col">
                <h4>Visit Us</h4>
                <ul>
                    <li><a href="#">Opening Hours</a></li>
                    <li><a href="#">Find Us</a></li>
                    <li><a href="#">Parking Info</a></li>
                </ul>
            </div>
            <div class="psite-footer__col">
                <h4>Connect</h4>
                <ul>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Google Reviews</a></li>
                </ul>
            </div>
        </div>
        <div class="psite-footer__bottom">
            &copy; <?php echo date('Y'); ?> <?php echo htmlspecialchars($t['business_name']); ?>. All rights reserved.
            &nbsp;&nbsp;|&nbsp;&nbsp; Website by <a href="https://certxa.com" style="color:rgba(255,255,255,0.4);text-decoration:none;">Launchit</a>
        </div>
    </footer>

</div><!-- /preview-site -->
</div><!-- /preview-wrapper -->

<script src="<?php echo BASE_PATH; ?>/assets/js/hours-badge.js"></script>
<script>
initHoursBadge('hoursBadge', <?php echo json_encode($demo_hours); ?>);
</script>

<script>
function setDevice(mode) {
    var site = document.getElementById('previewSite');
    var btnD = document.getElementById('btnDesktop');
    var btnM = document.getElementById('btnMobile');
    if (mode === 'mobile') {
        site.classList.add('is-mobile');
        btnM.classList.add('is-active');
        btnD.classList.remove('is-active');
    } else {
        site.classList.remove('is-mobile');
        btnD.classList.add('is-active');
        btnM.classList.remove('is-active');
    }
}
</script>

<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
