<?php
/**
 * LaunchSite Templates Gallery
 * Dynamic template showcase page that reads from templates.json
 */

require_once 'includes/TemplateManager.php';

$pageTitle = 'Website Templates | LaunchSite by Certxa';
$pageDescription = 'Browse our collection of 50+ professional website templates designed specifically for salons, barbershops, and nail studios.';

$manager = getTemplateManager();
$categories = $manager->getCategories();
$availableCategories = $manager->getAvailableCategories();
$stats = $manager->getStats();
$allStyles = $manager->getAllStyles();

// Get filter parameters
$selectedCategory = isset($_GET['category']) ? $_GET['category'] : null;
$selectedStyle = isset($_GET['style']) ? $_GET['style'] : null;
$searchQuery = isset($_GET['search']) ? trim($_GET['search']) : null;

// Build filtered templates array
$templates = [];

foreach ($categories as $category) {
    // Skip if category filter is set and doesn't match
    if ($selectedCategory && $category['id'] !== $selectedCategory) {
        continue;
    }
    
    foreach ($category['designs'] ?? [] as $design) {
        foreach ($design['themes'] ?? [] as $theme) {
            // Skip if style filter is set and doesn't match
            if ($selectedStyle && $theme['style'] !== $selectedStyle) {
                continue;
            }
            
            // Skip if search query doesn't match
            if ($searchQuery) {
                $searchable = strtolower($design['name'] . ' ' . $design['description'] . ' ' . $theme['name'] . ' ' . $theme['style']);
                if (!str_contains($searchable, strtolower($searchQuery))) {
                    continue;
                }
            }
            
            $templates[] = [
                'category' => $category,
                'design' => $design,
                'theme' => $theme,
                'editorUrl' => $manager->getEditorUrl($category['id'], $design['id'], $theme['id'])
            ];
        }
    }
}

require 'includes/header.php';
require 'includes/nav.php';
?>

<!-- ══════════════ HERO SECTION ══════════════ -->
<section class="hero-section" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 100px 0 60px; position: relative; overflow: hidden;">
  <div class="hero-orb" style="position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top: -200px; right: -200px; border-radius: 50%;"></div>
  
  <div class="container" style="position: relative; z-index: 2;">
    <div style="text-align: center; max-width: 700px; margin: 0 auto;">
      <span style="display: inline-block; background: rgba(99,102,241,0.2); color: #818cf8; padding: 6px 16px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
        <?= number_format($stats['themes']) ?>+ Designs
      </span>
      
      <h1 class="hero-headline" style="font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 600; line-height: 1.1; color: #ffffff; margin-bottom: 20px;">
        Professional templates for your salon
      </h1>
      
      <p class="hero-sub" style="font-size: 1.125rem; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 32px;">
        Browse our collection of industry-specific website templates. Each one is designed to help you attract clients and grow your business.
      </p>
      
      <!-- Search Bar -->
      <form method="GET" style="max-width: 500px; margin: 0 auto 32px;">
        <div style="display: flex; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; overflow: hidden; backdrop-filter: blur(10px);">
          <input 
            type="text" 
            name="search" 
            value="<?= htmlspecialchars($searchQuery ?? '') ?>"
            placeholder="Search templates..." 
            style="flex: 1; background: transparent; border: none; padding: 14px 20px; color: white; font-size: 1rem; outline: none;"
          >
          <button type="submit" style="background: #6366f1; color: white; border: none; padding: 14px 24px; font-weight: 600; cursor: pointer;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </form>
      
      <!-- Stats -->
      <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; font-weight: 700; color: white;"><?= $stats['availableCategories'] ?></div>
          <div style="font-size: 0.875rem; color: rgba(255,255,255,0.5);">Categories</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; font-weight: 700; color: white;"><?= $stats['designs'] ?></div>
          <div style="font-size: 0.875rem; color: rgba(255,255,255,0.5);">Designs</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; font-weight: 700; color: white;"><?= $stats['themes'] ?></div>
          <div style="font-size: 0.875rem; color: rgba(255,255,255,0.5);">Style Variations</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════ FILTERS SECTION ══════════════ -->
<section style="background: white; border-bottom: 1px solid #e5e7eb; padding: 20px 0; position: sticky; top: 0; z-index: 100;">
  <div class="container">
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
      <!-- Category Filters -->
      <a href="?" style="padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 500; text-decoration: none; <?= !$selectedCategory && !$selectedStyle && !$searchQuery ? 'background: #1f2937; color: white;' : 'background: #f3f4f6; color: #374151;' ?>">
        All Templates
      </a>
      
      <?php foreach ($availableCategories as $category): ?>
        <a 
          href="?category=<?= $category['id'] ?>" 
          style="padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 500; text-decoration: none; display: flex; align-items: center; gap: 6px; <?= $selectedCategory === $category['id'] ? 'background: #6366f1; color: white;' : 'background: #f3f4f6; color: #374151;' ?>">
          <span><?= $category['emoji'] ?></span>
          <?= $category['label'] ?>
        </a>
      <?php endforeach; ?>
      
      <div style="width: 1px; height: 24px; background: #e5e7eb; margin: 0 8px;"></div>
      
      <!-- Style Dropdown -->
      <select 
        onchange="window.location.href=this.value ? '?style='+this.value : '?'" 
        style="padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; border: 1px solid #e5e7eb; background: white; cursor: pointer;">
        <option value="">All Styles</option>
        <?php foreach ($allStyles as $style => $count): ?>
          <option value="<?= $style ?>" <?= $selectedStyle === $style ? 'selected' : '' ?>>
            <?= $style ?> (<?= $count ?>)
          </option>
        <?php endforeach; ?>
      </select>
      
      <?php if ($selectedCategory || $selectedStyle || $searchQuery): ?>
        <a href="?" style="margin-left: auto; color: #6b7280; font-size: 0.875rem; text-decoration: none; display: flex; align-items: center; gap: 4px;">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          Clear filters
        </a>
      <?php endif; ?>
    </div>
  </div>
</section>

<!-- ══════════════ TEMPLATES GRID ══════════════ -->
<section style="padding: 60px 0; background: #f9fafb; min-height: 500px;">
  <div class="container">
    <?php if (empty($templates)): ?>
      <!-- Empty State -->
      <div style="text-align: center; padding: 80px 20px;">
        <div style="font-size: 4rem; margin-bottom: 16px;">🔍</div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: #374151; margin-bottom: 8px;">No templates found</h3>
        <p style="color: #6b7280; margin-bottom: 24px;">Try adjusting your search or filters</p>
        <a href="?" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">View all templates</a>
      </div>
    <?php else: ?>
      <!-- Results Count -->
      <div style="margin-bottom: 24px; color: #6b7280; font-size: 0.875rem;">
        Showing <?= count($templates) ?> template<?= count($templates) !== 1 ? 's' : '' ?>
        <?php if ($searchQuery): ?>
          for "<?= htmlspecialchars($searchQuery) ?>"
        <?php endif; ?>
      </div>
      
      <!-- Templates Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        <?php foreach ($templates as $item): 
          $category = $item['category'];
          $design = $item['design'];
          $theme = $item['theme'];
        ?>
          <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='';this.style.boxShadow='';">
            <!-- Template Preview Image -->
            <div style="position: relative; aspect-ratio: 4/3; overflow: hidden; background: linear-gradient(135deg, <?= $theme['bgColor'] ?> 0%, <?= $theme['accentColor'] ?>20 100%);">
              <img 
                src="<?= $design['heroImage'] ?>" 
                alt="<?= $design['name'] ?> - <?= $theme['name'] ?>"
                style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;"
                loading="lazy"
              >
              <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);"></div>
              
              <!-- Badges -->
              <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px;">
                <span style="background: <?= $theme['accentColor'] ?>; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                  <?= $theme['style'] ?>
                </span>
                <span style="background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; backdrop-filter: blur(4px);">
                  <?= $category['emoji'] ?> <?= $category['label'] ?>
                </span>
              </div>
              
              <!-- Theme Color Indicator -->
              <div style="position: absolute; bottom: 12px; right: 12px; display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); padding: 6px 12px; border-radius: 20px; backdrop-filter: blur(4px);">
                <span style="width: 12px; height: 12px; border-radius: 50%; background: <?= $theme['accentColor'] ?>; border: 2px solid white;"></span>
                <span style="color: white; font-size: 0.75rem; font-weight: 500;"><?= $theme['name'] ?></span>
              </div>
            </div>
            
            <!-- Template Info -->
            <div style="padding: 20px;">
              <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 4px;">
                <?= $design['name'] ?>
              </h3>
              <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 12px;">
                <?= $design['description'] ?>
              </p>
              
              <!-- Features List -->
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
                <?php foreach (array_slice($design['features'], 0, 3) as $feature): ?>
                  <span style="background: #f3f4f6; color: #6b7280; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
                    <?= $feature ?>
                  </span>
                <?php endforeach; ?>
                <?php if (count($design['features']) > 3): ?>
                  <span style="background: #f3f4f6; color: #6b7280; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
                    +<?= count($design['features']) - 3 ?> more
                  </span>
                <?php endif; ?>
              </div>
              
              <!-- Actions -->
              <div style="display: flex; gap: 12px;">
                <a 
                  href="/templates/design.php?category=<?= $category['id'] ?>&design=<?= $design['id'] ?>" 
                  style="flex: 1; text-align: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; color: #374151; font-size: 0.875rem; font-weight: 500; text-decoration: none;">
                  Preview
                </a>
                <a 
                  href="<?= $item['editorUrl'] ?>" 
                  style="flex: 1; text-align: center; padding: 10px; background: #6366f1; border-radius: 8px; color: white; font-size: 0.875rem; font-weight: 500; text-decoration: none;">
                  Use Template
                </a>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

<!-- ══════════════ CATEGORIES PREVIEW ══════════════ -->
<?php if (!$selectedCategory && !$searchQuery): ?>
<section style="padding: 80px 0; background: white;">
  <div class="container">
    <div style="text-align: center; margin-bottom: 48px;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #111827;">Browse by category</h2>
      <p style="color: #6b7280; margin-top: 8px;">Find the perfect template for your business type</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
      <?php foreach ($categories as $category): ?>
        <a 
          href="?category=<?= $category['id'] ?>" 
          style="display: block; background: linear-gradient(135deg, <?= $category['available'] ? '#f9fafb' : '#f3f4f6' ?> 0%, white 100%); border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;"
          onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)';"
          onmouseout="this.style.transform='';this.style.boxBoxShadow='';"
        >
          <?php if (!$category['available']): ?>
            <span style="position: absolute; top: 16px; right: 16px; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Coming Soon</span>
          <?php endif; ?>
          
          <div style="font-size: 3rem; margin-bottom: 16px;"><?= $category['emoji'] ?></div>
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 8px;">
            <?= $category['label'] ?>
          </h3>
          <p style="color: #6b7280; font-size: 0.9375rem; line-height: 1.6; margin-bottom: 16px;">
            <?= $category['description'] ?>
          </p>
          
          <?php if ($category['available']): 
            $designCount = count($category['designs'] ?? []);
            $themeCount = 0;
            foreach ($category['designs'] ?? [] as $d) {
              $themeCount += count($d['themes'] ?? []);
            }
          ?>
            <div style="display: flex; gap: 16px; color: #6366f1; font-size: 0.875rem; font-weight: 500;">
              <span><?= $designCount ?> design<?= $designCount !== 1 ? 's' : '' ?></span>
              <span>•</span>
              <span><?= $themeCount ?> style<?= $themeCount !== 1 ? 's' : '' ?></span>
            </div>
          <?php endif; ?>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ══════════════ STYLES SHOWCASE ══════════════ -->
<?php if (!$selectedStyle && !$searchQuery): ?>
<section style="padding: 80px 0; background: #f9fafb;">
  <div class="container">
    <div style="text-align: center; margin-bottom: 48px;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #111827;">Browse by style</h2>
      <p style="color: #6b7280; margin-top: 8px;">Find the aesthetic that matches your brand</p>
    </div>
    
    <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
      <?php foreach (array_slice(array_keys($allStyles), 0, 12) as $style): ?>
        <a 
          href="?style=<?= urlencode($style) ?>" 
          style="display: inline-block; background: white; border: 1px solid #e5e7eb; padding: 12px 24px; border-radius: 30px; color: #374151; text-decoration: none; font-weight: 500; transition: all 0.2s;"
          onmouseover="this.style.borderColor='#6366f1';this.style.color='#6366f1';"
          onmouseout="this.style.borderColor='#e5e7eb';this.style.color='#374151';"
        >
          <?= $style ?>
          <span style="background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-left: 8px;">
            <?= $allStyles[$style] ?>
          </span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ══════════════ CTA SECTION ══════════════ -->
<section style="padding: 80px 0; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
  <div class="container">
    <div style="text-align: center; max-width: 600px; margin: 0 auto;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.25rem; font-weight: 600; color: white; margin-bottom: 16px;">
        Ready to build your website?
      </h2>
      <p style="color: rgba(255,255,255,0.8); font-size: 1.125rem; margin-bottom: 32px;">
        Start with any template and customize it to match your brand.
      </p>
      <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
        <a href="/editor/" style="background: white; color: #6366f1; padding: 14px 28px; border-radius: 10px; font-weight: 600; text-decoration: none;">
          Start Building Free
        </a>
        <a href="/launchsite.php" style="border: 2px solid rgba(255,255,255,0.3); color: white; padding: 12px 26px; border-radius: 10px; font-weight: 500; text-decoration: none;">
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>

<?php require 'includes/footer.php'; ?>
