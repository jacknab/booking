<?php
$page_title = 'Template Designs';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/categories.php';
require_once __DIR__ . '/includes/header.php';

$total = array_sum(array_column($active_categories, 'count'));

// Build template JSON for client-side search
$tpl_json = json_encode(array_values(array_map(fn($t) => [
    'id'           => $t['id'],
    'name'         => $t['name'],
    'category'     => $t['category'],
    'style'        => $t['style'] ?? '',
    'desc'         => $t['desc'] ?? '',
    'badge'        => $t['badge'] ?? '',
    'tagline'      => $t['hero_tagline'] ?? '',
    'type'         => $t['type'] ?? 'php',
    'react_path'   => $t['react_path'] ?? '',
    'scraped_path' => $t['scraped_path'] ?? '',
], $all_templates)), JSON_UNESCAPED_UNICODE);

// Collect distinct styles for chips, sorted by frequency
$style_counts = [];
foreach ($all_templates as $t) {
    $s = $t['style'] ?? '';
    if ($s) $style_counts[$s] = ($style_counts[$s] ?? 0) + 1;
}
arsort($style_counts);
$chip_styles = array_keys($style_counts);

// Shelf data
$popular_templates = array_values(array_filter($all_templates, fn($t) => ($t['badge'] ?? '') === 'popular'));
$new_templates     = array_values(array_filter($all_templates, fn($t) => ($t['badge'] ?? '') === 'new'));
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
            <a href="#business-picker" class="btn btn--orange btn--lg">Browse Designs</a>
            <a href="https://certxa.com/launchit" class="btn btn--ghost btn--lg">How It Works</a>
        </div>
        <p class="hero-stat">
            <span><?php echo $total; ?>+ designs available</span> — new sites added every month
        </p>
    </div>
</section>

<!-- ═══════════════════════════════════════════════
     BUSINESS TYPE PICKER — step 1
     ═══════════════════════════════════════════════ -->
<section class="bizpicker-section" id="business-picker">
    <div class="container">
        <div class="bizpicker-header">
            <div class="bizpicker-step">Step 1</div>
            <h2 class="bizpicker-title">What type of business are you?</h2>
            <p class="bizpicker-sub">Choose your category to see designs built for your salon type.</p>
        </div>
        <div class="bizpicker-grid">
            <?php foreach ($active_categories as $cat): ?>
            <button
                class="bizpicker-card"
                data-category="<?php echo htmlspecialchars($cat['key']); ?>"
                aria-pressed="false"
            >
                <div class="bizpicker-card__label"><?php echo htmlspecialchars($cat['label']); ?></div>
                <div class="bizpicker-card__count"><?php echo $cat['count']; ?> design<?php echo $cat['count'] !== 1 ? 's' : ''; ?></div>
            </button>
            <?php endforeach; ?>
            <button class="bizpicker-card bizpicker-card--all" data-category="all" aria-pressed="true">
                <div class="bizpicker-card__label">Show All</div>
                <div class="bizpicker-card__count"><?php echo $total; ?> designs</div>
            </button>
        </div>
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

<!-- SEARCH & FILTER -->
<section class="search-section" id="search" hidden>
    <div class="container">
        <div class="search-wrap">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
                type="text"
                id="tpl-search"
                class="tpl-search-input"
                placeholder="Search by name, style or keyword — e.g. luxury, dark, minimal…"
                autocomplete="off"
                spellcheck="false"
            >
            <button class="search-clear" id="search-clear" aria-label="Clear search" hidden>✕</button>
        </div>

        <div class="filter-chips" id="filter-chips" role="group" aria-label="Filter by style">
            <button class="filter-chip is-active" data-style="all">All styles</button>
            <?php foreach ($chip_styles as $style): ?>
            <button class="filter-chip" data-style="<?php echo htmlspecialchars($style); ?>">
                <?php echo htmlspecialchars($style); ?>
            </button>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- SEARCH RESULTS (shown after category is picked or while filtering) -->
<section class="search-results-section" id="search-results" hidden>
    <div class="container">
        <div class="results-header">
            <span id="results-count" class="results-count"></span>
            <button class="results-clear-btn" id="results-clear">Clear search</button>
        </div>
        <div class="template-grid" id="results-grid"></div>
        <p class="results-empty" id="results-empty" hidden>
            No designs match — try a different keyword or
            <button class="results-link-btn" id="results-empty-clear">clear the search</button>.
        </p>
    </div>
</section>

<!-- ═══════════════════════════════════════════════
     POPULAR & NEW SHELVES
     (hidden while search/filter is active)
     ═══════════════════════════════════════════════ -->
<div id="shelves" hidden>

    <?php if (!empty($popular_templates)): ?>
    <!-- ── Popular this week ── -->
    <section class="shelf-section">
        <div class="container">
            <div class="shelf-header">
                <div class="shelf-heading">
                    <span class="shelf-icon" aria-hidden="true">🔥</span>
                    <div>
                        <h2 class="shelf-title">Popular this week</h2>
                        <p class="shelf-sub">The designs customers are choosing most right now</p>
                    </div>
                </div>
            </div>

            <div class="template-grid">
                <?php foreach ($popular_templates as $index => $t):
                    $thumb = BASE_PATH . '/assets/img/thumbs/' . urlencode($t['id']) . '.jpg';
                    $preview_url = BASE_PATH . '/preview.php?id=' . urlencode($t['id']);
                    $start_url   = BASE_PATH . '/select.php?id='  . urlencode($t['id']);
                ?>
                <?php
                    $iframe_src = isset($t['type']) && $t['type'] === 'react'
                        ? htmlspecialchars($t['react_path'] ?? '')
                        : BASE_PATH . '/preview-render.php?id=' . urlencode($t['id']);
                ?>
                <div class="template-card" style="transition-delay:<?php echo $index * 60; ?>ms">
                    <a href="<?php echo $preview_url; ?>" class="template-card__thumb-link tpl-preview-trigger" data-preview-url="<?php echo $iframe_src; ?>" data-template-name="<?php echo htmlspecialchars($t['name']); ?>">
                        <div class="template-card__thumb">
                            <span class="template-card__badge badge--popular">Popular</span>
                            <div class="tpl-thumb-frame-wrap"><iframe class="tpl-thumb-frame" src="<?php echo $iframe_src; ?>" scrolling="no" tabindex="-1" loading="lazy" aria-hidden="true"></iframe></div>
                            <div class="result-cat-tag"><?php echo htmlspecialchars($t['category']); ?></div>
                        </div>
                    </a>
                    <div class="template-card__body">
                        <div class="result-meta"><span class="result-style-tag"><?php echo htmlspecialchars($t['style']); ?></span></div>
                        <h3 class="template-card__title"><?php echo htmlspecialchars($t['name']); ?></h3>
                        <div class="template-card__actions">
                            <button class="tc-btn tc-btn--preview tpl-preview-trigger" data-preview-url="<?php echo $iframe_src; ?>" data-full-url="<?php echo $preview_url; ?>" data-template-name="<?php echo htmlspecialchars($t['name']); ?>">Preview</button>
                            <a href="<?php echo $start_url; ?>"   class="tc-btn tc-btn--start">Start</a>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <?php if (!empty($new_templates)): ?>
    <!-- ── Recently added ── -->
    <section class="shelf-section shelf-section--new">
        <div class="container">
            <div class="shelf-header">
                <div class="shelf-heading">
                    <span class="shelf-icon" aria-hidden="true">✨</span>
                    <div>
                        <h2 class="shelf-title">Recently added</h2>
                        <p class="shelf-sub">Fresh designs just landed in the catalogue</p>
                    </div>
                </div>
                <span class="shelf-new-count"><?php echo count($new_templates); ?> new designs</span>
            </div>
        </div>

        <!-- Full-bleed horizontal scroll -->
        <div class="shelf-scroll-outer">
            <div class="shelf-scroll-track">
                <?php foreach ($new_templates as $index => $t):
                    $thumb = BASE_PATH . '/assets/img/thumbs/' . urlencode($t['id']) . '.jpg';
                    $preview_url = BASE_PATH . '/preview.php?id=' . urlencode($t['id']);
                    $start_url   = BASE_PATH . '/select.php?id='  . urlencode($t['id']);
                ?>
                <?php
                    $shelf_iframe_src = isset($t['type']) && $t['type'] === 'react'
                        ? htmlspecialchars($t['react_path'] ?? '')
                        : BASE_PATH . '/preview-render.php?id=' . urlencode($t['id']);
                ?>
                <div class="shelf-card" style="transition-delay:<?php echo $index * 40; ?>ms">
                    <a href="<?php echo $preview_url; ?>" class="shelf-card__thumb-link tpl-preview-trigger" data-preview-url="<?php echo $shelf_iframe_src; ?>" data-template-name="<?php echo htmlspecialchars($t['name']); ?>">
                        <div class="shelf-card__thumb">
                            <span class="shelf-card__badge">New</span>
                            <div class="tpl-thumb-frame-wrap"><iframe class="tpl-thumb-frame tpl-thumb-frame--sm" src="<?php echo $shelf_iframe_src; ?>" scrolling="no" tabindex="-1" loading="lazy" aria-hidden="true"></iframe></div>
                            <div class="shelf-card__cat"><?php echo htmlspecialchars($t['category']); ?></div>
                        </div>
                    </a>
                    <div class="shelf-card__body">
                        <span class="shelf-card__style"><?php echo htmlspecialchars($t['style']); ?></span>
                        <h3 class="shelf-card__name"><?php echo htmlspecialchars($t['name']); ?></h3>
                        <div class="shelf-card__actions">
                            <button class="tc-btn tc-btn--preview tpl-preview-trigger" data-preview-url="<?php echo $shelf_iframe_src; ?>" data-full-url="<?php echo $preview_url; ?>" data-template-name="<?php echo htmlspecialchars($t['name']); ?>">Preview</button>
                            <a href="<?php echo $start_url; ?>"   class="tc-btn tc-btn--start">Start</a>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

</div><!-- /#shelves -->

<!-- CATEGORY CARDS (hidden while searching) -->
<section class="categories-section" id="categories" hidden>
    <div class="container">
        <div class="section-header">
            <div class="section-label">✦ Browse by Business Type</div>
            <h2>Find the perfect website<br>for your business</h2>
            <p>Every design is fully built, mobile-ready, and launches with your domain. Optionally personalise the text — or go live as-is.</p>
        </div>

        <div class="categories-grid">
            <?php foreach ($active_categories as $cat): ?>
            <a href="<?php echo BASE_PATH; ?>/<?php echo $cat['page']; ?>" class="category-card">
                <div class="category-card__body">
                    <div class="category-card__label"><?php echo htmlspecialchars($cat['label']); ?></div>
                    <h2 class="category-card__title"><?php echo htmlspecialchars($cat['label']); ?></h2>
                    <p class="category-card__desc"><?php echo htmlspecialchars($cat['desc']); ?></p>
                    <div class="category-card__footer">
                        <span class="category-card__count">
                            <?php echo $cat['count']; ?> design<?php echo $cat['count'] !== 1 ? 's' : ''; ?> available
                        </span>
                        <div class="category-card__arrow">→</div>
                    </div>
                </div>
            </a>
            <?php endforeach; ?>
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

<!-- ═══════════════════════════════════════════════
     PREVIEW MODAL
     ═══════════════════════════════════════════════ -->
<div id="tpl-preview-modal" class="preview-modal" role="dialog" aria-modal="true" aria-label="Template preview" hidden>
    <div class="preview-modal__backdrop"></div>
    <div class="preview-modal__shell">
        <div class="preview-modal__bar">
            <span class="preview-modal__name" id="preview-modal-name"></span>
            <div class="preview-modal__bar-actions">
                <a id="preview-modal-open" href="#" class="preview-modal__open-btn" target="_blank" rel="noopener">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Open full page
                </a>
                <button class="preview-modal__close" id="preview-modal-close" aria-label="Close preview">✕</button>
            </div>
        </div>
        <div class="preview-modal__iframe-wrap">
            <iframe id="preview-modal-iframe" class="preview-modal__iframe" src="" title="Template preview" loading="lazy"></iframe>
            <div class="preview-modal__loading" id="preview-modal-loading">
                <div class="preview-modal__spinner"></div>
                <p>Loading preview…</p>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<script>
(function () {
    var TEMPLATES = <?php echo $tpl_json; ?>;
    var BASE = '<?php echo BASE_PATH; ?>';

    var searchInput    = document.getElementById('tpl-search');
    var searchClear    = document.getElementById('search-clear');
    var chipsEl        = document.getElementById('filter-chips');
    var searchSection  = document.getElementById('search');
    var resultsSection = document.getElementById('search-results');
    var resultsGrid    = document.getElementById('results-grid');
    var resultsCount   = document.getElementById('results-count');
    var resultsEmpty   = document.getElementById('results-empty');
    var resultsClear   = document.getElementById('results-clear');
    var emptyClear     = document.getElementById('results-empty-clear');

    /* Active state — null means no category chosen yet (landing state) */
    var activeCategory = null;
    var activeStyle    = 'all';
    var searchQuery    = '';

    /* ── Helpers ── */
    function normalize(s) { return (s || '').toLowerCase(); }

    function thumbSrc(t) {
        if (t.type === 'react' && t.react_path)     return t.react_path;
        if (t.type === 'scraped' && t.scraped_path) return BASE + t.scraped_path;
        return BASE + '/preview-render.php?id=' + encodeURIComponent(t.id);
    }

    function badgeHtml(badge) {
        if (!badge) return '';
        var label = badge.charAt(0).toUpperCase() + badge.slice(1);
        return '<span class="template-card__badge badge--' + badge + '">' + label + '</span>';
    }

    function cardHtml(t, idx) {
        var src        = thumbSrc(t);
        var fullPageUrl = BASE + '/preview.php?id=' + encodeURIComponent(t.id);
        var esc        = t.name.replace(/"/g, '&quot;');
        return '<div class="template-card" style="transition-delay:' + (idx * 45) + 'ms">'
            + '<a href="' + fullPageUrl + '" class="template-card__thumb-link tpl-preview-trigger"'
            + ' data-preview-url="' + src + '" data-full-url="' + fullPageUrl + '" data-template-name="' + esc + '">'
            + '<div class="template-card__thumb">'
            + badgeHtml(t.badge)
            + '<div class="tpl-thumb-frame-wrap"><iframe class="tpl-thumb-frame" src="' + src + '"'
            + ' scrolling="no" tabindex="-1" loading="lazy" aria-hidden="true"></iframe></div>'
            + '<div class="result-cat-tag">' + t.category + '</div>'
            + '</div></a>'
            + '<div class="template-card__body">'
            + '<div class="result-meta"><span class="result-style-tag">' + t.style + '</span></div>'
            + '<h3 class="template-card__title">' + t.name + '</h3>'
            + '<div class="template-card__actions">'
            + '<button class="tc-btn tc-btn--preview tpl-preview-trigger"'
            + ' data-preview-url="' + src + '" data-full-url="' + fullPageUrl + '" data-template-name="' + esc + '">Preview</button>'
            + '<a href="' + BASE + '/select.php?id=' + encodeURIComponent(t.id) + '" class="tc-btn tc-btn--start">Start</a>'
            + '</div></div></div>';
    }

    /* ── Render filtered results into the grid ── */
    function renderGrid(filtered, countHtml) {
        var n = filtered.length;
        resultsCount.innerHTML = countHtml || ('<strong>' + n + '</strong> design' + (n !== 1 ? 's' : '') + ' found');
        if (n === 0) {
            resultsGrid.innerHTML = '';
            resultsEmpty.hidden = false;
        } else {
            resultsEmpty.hidden = true;
            resultsGrid.innerHTML = filtered.map(cardHtml).join('');
            requestAnimationFrame(function () {
                resultsGrid.querySelectorAll('.template-card').forEach(function (c) {
                    c.classList.add('in-view');
                });
            });
        }
        searchSection.removeAttribute('hidden');
        resultsSection.hidden = false;
    }

    /* ── Apply current filters (search query + style chip) within active category ── */
    function applyFilters() {
        var q = normalize(searchQuery);
        var base = activeCategory && activeCategory !== 'all'
            ? TEMPLATES.filter(function (t) { return t.category === activeCategory; })
            : TEMPLATES;

        var filtered = base.filter(function (t) {
            if (activeStyle !== 'all' && normalize(t.style) !== normalize(activeStyle)) return false;
            if (!q) return true;
            var hay = [t.name, t.category, t.style, t.desc, t.tagline].join(' ');
            return normalize(hay).includes(q);
        });

        var styleLabel = activeStyle !== 'all' ? ' in <strong>' + activeStyle + '</strong>' : '';
        var catLabel   = activeCategory && activeCategory !== 'all'
            ? ' for <strong>' + activeCategory + 's</strong>' : '';
        var countHtml  = '<strong>' + filtered.length + '</strong> design'
            + (filtered.length !== 1 ? 's' : '') + ' found' + catLabel + styleLabel;

        searchClear.hidden = !(q || activeStyle !== 'all');
        renderGrid(filtered, countHtml);
    }

    /* ── Business-type picker ── */
    var pickerCards = document.querySelectorAll('.bizpicker-card');
    pickerCards.forEach(function (card) {
        card.addEventListener('click', function () {
            activeCategory = card.dataset.category;
            pickerCards.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
            card.setAttribute('aria-pressed', 'true');

            /* Reset search/style when switching category */
            searchQuery    = '';
            searchInput.value = '';
            activeStyle    = 'all';
            chipsEl.querySelectorAll('.filter-chip').forEach(function (c) {
                c.classList.toggle('is-active', c.dataset.style === 'all');
            });

            var label = activeCategory !== 'all'
                ? '<strong>' + TEMPLATES.filter(function(t){return t.category===activeCategory;}).length + '</strong> design'
                    + (TEMPLATES.filter(function(t){return t.category===activeCategory;}).length !== 1 ? 's' : '')
                    + ' for <strong>' + activeCategory + 's</strong>'
                : '<strong>' + TEMPLATES.length + '</strong> designs';

            renderGrid(
                activeCategory === 'all'
                    ? TEMPLATES
                    : TEMPLATES.filter(function (t) { return t.category === activeCategory; }),
                label
            );

            searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ── Search input ── */
    searchInput.addEventListener('input', function () {
        searchQuery = this.value.trim();
        if (activeCategory === null) return; /* no category chosen yet — ignore */
        applyFilters();
    });

    /* ── Style chips ── */
    chipsEl.addEventListener('click', function (e) {
        var chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeStyle = chip.dataset.style;
        chipsEl.querySelectorAll('.filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c === chip);
        });
        if (activeCategory !== null) applyFilters();
    });

    /* ── Clear search (stays within current category) ── */
    function clearSearch() {
        searchInput.value = '';
        searchQuery = '';
        activeStyle = 'all';
        chipsEl.querySelectorAll('.filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c.dataset.style === 'all');
        });
        if (activeCategory !== null) applyFilters();
        searchInput.focus();
    }
    searchClear.addEventListener('click', clearSearch);
    resultsClear.addEventListener('click', clearSearch);
    emptyClear.addEventListener('click', clearSearch);

    /* ── Preview Modal ── */
    var modal         = document.getElementById('tpl-preview-modal');
    var modalIframe   = document.getElementById('preview-modal-iframe');
    var modalName     = document.getElementById('preview-modal-name');
    var modalOpen     = document.getElementById('preview-modal-open');
    var modalClose    = document.getElementById('preview-modal-close');
    var modalLoading  = document.getElementById('preview-modal-loading');
    var modalBackdrop = modal.querySelector('.preview-modal__backdrop');

    function openPreviewModal(renderUrl, fullPageUrl, name) {
        modalName.textContent = name;
        /* "Open full page" goes to the full preview.php chrome */
        modalOpen.href = fullPageUrl || renderUrl;
        modalIframe.src = '';
        modalLoading.hidden = false;
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        /* Load the render URL (no outer chrome) directly in the modal iframe */
        setTimeout(function () { modalIframe.src = renderUrl; }, 80);
    }

    function closePreviewModal() {
        modal.setAttribute('hidden', '');
        modalIframe.src = '';
        document.body.style.overflow = '';
    }

    modalIframe.addEventListener('load', function () { modalLoading.hidden = true; });
    modalClose.addEventListener('click', closePreviewModal);
    modalBackdrop.addEventListener('click', closePreviewModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closePreviewModal();
    });

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('.tpl-preview-trigger');
        if (!trigger) return;
        e.preventDefault();
        var renderUrl   = trigger.dataset.previewUrl;
        var fullPageUrl = trigger.dataset.fullUrl || renderUrl;
        var name        = trigger.dataset.templateName;
        if (renderUrl) openPreviewModal(renderUrl, fullPageUrl, name || 'Template Preview');
    });
})();
</script>
