<?php
$page_title = 'Template Designs';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/categories.php';
require_once __DIR__ . '/includes/header.php';

$total = array_sum(array_column($active_categories, 'count'));

// Build template JSON for client-side search
$tpl_json = json_encode(array_values(array_map(fn($t) => [
    'id'       => $t['id'],
    'name'     => $t['name'],
    'category' => $t['category'],
    'style'    => $t['style'] ?? '',
    'desc'     => $t['desc'] ?? '',
    'badge'    => $t['badge'] ?? '',
    'tagline'  => $t['hero_tagline'] ?? '',
], $all_templates)), JSON_UNESCAPED_UNICODE);

// Collect distinct styles for chips, sorted by frequency
$style_counts = [];
foreach ($all_templates as $t) {
    $s = $t['style'] ?? '';
    if ($s) $style_counts[$s] = ($style_counts[$s] ?? 0) + 1;
}
arsort($style_counts);
$chip_styles = array_keys($style_counts);
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
            <a href="#search" class="btn btn--orange btn--lg">Browse Designs</a>
            <a href="https://certxa.com/launchit" class="btn btn--ghost btn--lg">How It Works</a>
        </div>
        <p class="hero-stat">
            <span><?php echo $total; ?>+ designs available</span> — new sites added every month
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

<!-- SEARCH & FILTER -->
<section class="search-section" id="search">
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

<!-- SEARCH RESULTS (shown while filtering) -->
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

<!-- CATEGORY CARDS (hidden while searching) -->
<section class="categories-section" id="categories">
    <div class="container">
        <div class="section-header">
            <div class="section-label">✦ Browse by Business Type</div>
            <h2>Find the perfect website<br>for your business</h2>
            <p>Every design is fully built, mobile-ready, and launches with your domain. Optionally personalise the text — or go live as-is.</p>
        </div>

        <div class="categories-grid">
            <?php foreach ($active_categories as $cat): ?>
            <a href="<?php echo BASE_PATH; ?>/<?php echo $cat['page']; ?>" class="category-card">
                <div class="category-card__image">
                    <?php echo $cat['emoji']; ?>
                </div>
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

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<script>
(function () {
    var TEMPLATES = <?php echo $tpl_json; ?>;
    var BASE = '<?php echo BASE_PATH; ?>';

    var searchInput   = document.getElementById('tpl-search');
    var searchClear   = document.getElementById('search-clear');
    var chipsEl       = document.getElementById('filter-chips');
    var resultsSection= document.getElementById('search-results');
    var categoriesSec = document.getElementById('categories');
    var resultsGrid   = document.getElementById('results-grid');
    var resultsCount  = document.getElementById('results-count');
    var resultsEmpty  = document.getElementById('results-empty');
    var resultsClear  = document.getElementById('results-clear');
    var emptyClear    = document.getElementById('results-empty-clear');

    var activeStyle = 'all';
    var searchQuery = '';

    function normalize(s) { return (s || '').toLowerCase(); }

    function matchesTemplate(t, q, style) {
        if (style !== 'all') {
            if (!normalize(t.style).includes(normalize(style))) return false;
        }
        if (!q) return true;
        var hay = [t.name, t.category, t.style, t.desc, t.tagline].join(' ');
        return normalize(hay).includes(q);
    }

    function badgeHtml(badge) {
        if (!badge) return '';
        var label = badge.charAt(0).toUpperCase() + badge.slice(1);
        return '<span class="template-card__badge badge--' + badge + '">' + label + '</span>';
    }

    function cardHtml(t, idx) {
        var img = BASE + '/assets/img/thumbs/' + encodeURIComponent(t.id) + '.jpg';
        return '<div class="template-card" style="transition-delay:' + (idx * 45) + 'ms">'
            + '<a href="' + BASE + '/preview.php?id=' + encodeURIComponent(t.id) + '" class="template-card__thumb-link">'
            + '<div class="template-card__thumb">'
            + badgeHtml(t.badge)
            + '<img src="' + img + '" alt="' + t.name + '" class="template-card__img" loading="lazy">'
            + '<div class="result-cat-tag">' + t.category + '</div>'
            + '</div></a>'
            + '<div class="template-card__body">'
            + '<div class="result-meta"><span class="result-style-tag">' + t.style + '</span></div>'
            + '<h3 class="template-card__title">' + t.name + '</h3>'
            + '<div class="template-card__actions">'
            + '<a href="' + BASE + '/preview.php?id=' + encodeURIComponent(t.id) + '" class="tc-btn tc-btn--preview">Preview</a>'
            + '<a href="' + BASE + '/select.php?id=' + encodeURIComponent(t.id) + '" class="tc-btn tc-btn--start">Start</a>'
            + '</div></div></div>';
    }

    function render() {
        var q = normalize(searchQuery);
        var isActive = q.length > 0 || activeStyle !== 'all';

        searchClear.hidden = !isActive;

        if (!isActive) {
            resultsSection.hidden = true;
            categoriesSec.removeAttribute('style');
            return;
        }

        categoriesSec.style.display = 'none';

        var filtered = TEMPLATES.filter(function (t) {
            return matchesTemplate(t, q, activeStyle);
        });

        var n = filtered.length;
        var styleLabel = activeStyle !== 'all' ? ' in <strong>' + activeStyle + '</strong>' : '';
        resultsCount.innerHTML = '<strong>' + n + '</strong> design' + (n !== 1 ? 's' : '') + ' found' + styleLabel;

        if (n === 0) {
            resultsGrid.innerHTML = '';
            resultsEmpty.hidden = false;
        } else {
            resultsEmpty.hidden = true;
            resultsGrid.innerHTML = filtered.map(cardHtml).join('');
            // Trigger entrance animation
            requestAnimationFrame(function () {
                resultsGrid.querySelectorAll('.template-card').forEach(function (c) {
                    c.classList.add('in-view');
                });
            });
        }

        resultsSection.hidden = false;
    }

    // Search input
    searchInput.addEventListener('input', function () {
        searchQuery = this.value.trim();
        render();
    });

    // Clear button
    function clearSearch() {
        searchInput.value = '';
        searchQuery = '';
        activeStyle = 'all';
        chipsEl.querySelectorAll('.filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c.dataset.style === 'all');
        });
        render();
        searchInput.focus();
    }
    searchClear.addEventListener('click', clearSearch);
    resultsClear.addEventListener('click', clearSearch);
    emptyClear.addEventListener('click', clearSearch);

    // Chip filters
    chipsEl.addEventListener('click', function (e) {
        var chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeStyle = chip.dataset.style;
        chipsEl.querySelectorAll('.filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c === chip);
        });
        render();
    });
})();
</script>
