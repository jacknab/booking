<?php
$page_title = 'Hair Salon Templates';
require_once __DIR__ . '/config.php';

require_once __DIR__ . '/data/templates.php';
$templates = array_values(array_filter($all_templates, fn($t) => $t['category'] === 'Hair Salon'));

require_once __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container">
        <div class="section-label">💇‍♀️ Hair Salons</div>
        <h1>Hair Salon <em>Templates</em></h1>
        <p>Elegant, conversion-focused designs built for hair salons of every style — from boutique studios to high-end ateliers.</p>
    </div>
</section>

<nav class="category-nav">
    <div class="category-nav-inner">
        <a href="<?php echo BASE_PATH; ?>/" class="category-tab">All Templates</a>
        <a href="<?php echo BASE_PATH; ?>/hair-salons.php" class="category-tab is-active">
            <span class="tab-icon">💇‍♀️</span> Hair Salons <span class="tab-count"><?php echo count($templates); ?></span>
        </a>
        <a href="<?php echo BASE_PATH; ?>/barbershops.php" class="category-tab">
            <span class="tab-icon">✂️</span> Barbershops
        </a>
        <a href="<?php echo BASE_PATH; ?>/nail-salons.php" class="category-tab">
            <span class="tab-icon">💅</span> Nail Salons
        </a>
    </div>
</nav>

<section class="catalog-section">
    <div class="container">
        <div class="catalog-header">
            <h2>Hair Salon Templates</h2>
            <span class="catalog-meta"><?php echo count($templates); ?> designs available</span>
        </div>
        <div class="template-grid">
            <?php foreach ($templates as $index => $t): ?>
            <div class="template-card" data-category="hair-salon" style="transition-delay: <?php echo $index * 60; ?>ms;">
                <div class="template-card__thumb">
                    <?php if (!empty($t['badge'])): ?>
                    <span class="template-card__badge badge--<?php echo htmlspecialchars($t['badge']); ?>">
                        <?php echo ucfirst($t['badge']); ?>
                    </span>
                    <?php endif; ?>
                    <img
                        src="<?php echo BASE_PATH; ?>/assets/img/thumbs/<?php echo urlencode($t['id']); ?>.jpg"
                        alt="<?php echo htmlspecialchars($t['name']); ?> template preview"
                        class="template-card__img"
                        loading="lazy"
                    >
                </div>
                <div class="template-card__body">
                    <h3 class="template-card__title"><?php echo htmlspecialchars($t['name']); ?></h3>
                    <div class="template-card__actions">
                        <a href="<?php echo BASE_PATH; ?>/preview.php?id=<?php echo urlencode($t['id']); ?>" class="tc-btn tc-btn--preview">Preview</a>
                        <a href="<?php echo BASE_PATH; ?>/select.php?id=<?php echo urlencode($t['id']); ?>" class="tc-btn tc-btn--start">Start</a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="container">
    <div class="cta-banner">
        <h2>Ready to launch your salon website?</h2>
        <p>Start your free trial, pick a template, and go live with your own domain today.</p>
        <div class="cta-banner-actions">
            <a href="https://certxa.com/signup" class="btn btn--primary btn--lg">Start Free Trial</a>
            <a href="<?php echo BASE_PATH; ?>/" class="btn btn--ghost btn--lg">Browse All Templates</a>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
