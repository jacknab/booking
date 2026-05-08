<?php
$page_title = 'Barbershop Templates';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/categories.php';

$my_key    = 'Barbershop';
$templates = array_values(array_filter($all_templates, fn($t) => $t['category'] === $my_key));

if (empty($templates)) {
    header('Location: ' . BASE_PATH . '/');
    exit;
}

require_once __DIR__ . '/includes/header.php';
?>

<section class="page-hero">
    <div class="container">
        <div class="section-label">✂️ Barbershops</div>
        <h1>Barbershop <em>Templates</em></h1>
        <p>Bold, masculine, and built to convert. Find the right look for your shop — from classic heritage to modern street culture.</p>
    </div>
</section>

<nav class="category-nav">
    <div class="category-nav-inner">
        <a href="<?php echo BASE_PATH; ?>/" class="category-tab">All Templates</a>
        <?php foreach ($active_categories as $cat): ?>
        <a href="<?php echo BASE_PATH; ?>/<?php echo $cat['page']; ?>" class="category-tab<?php echo $cat['key'] === $my_key ? ' is-active' : ''; ?>">
            <span class="tab-icon"><?php echo $cat['emoji']; ?></span>
            <?php echo htmlspecialchars($cat['label']); ?>
            <?php if ($cat['key'] === $my_key): ?>
            <span class="tab-count"><?php echo $cat['count']; ?></span>
            <?php endif; ?>
        </a>
        <?php endforeach; ?>
    </div>
</nav>

<section class="catalog-section">
    <div class="container">
        <div class="catalog-header">
            <h2>Barbershop Templates</h2>
            <span class="catalog-meta"><?php echo count($templates); ?> design<?php echo count($templates) !== 1 ? 's' : ''; ?> available</span>
        </div>
        <div class="template-grid">
            <?php foreach ($templates as $index => $t): ?>
            <div class="template-card" data-category="barbershop" style="transition-delay: <?php echo $index * 60; ?>ms;">
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
        <h2>Ready to put your barbershop online?</h2>
        <p>Start your free trial, pick a template, and go live with your own domain today.</p>
        <div class="cta-banner-actions">
            <a href="https://certxa.com/signup" class="btn btn--primary btn--lg">Start Free Trial</a>
            <a href="<?php echo BASE_PATH; ?>/" class="btn btn--ghost btn--lg">Browse All Templates</a>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
