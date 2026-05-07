<?php
// ── Site-wide defaults ─────────────────────────────────
defined('BRAND_NAME')    or define('BRAND_NAME',   'Certxa');
defined('SITE_URL')      or define('SITE_URL',      'https://certxa.com');
defined('PAGE_TITLE')    or define('PAGE_TITLE',    'Certxa — #1 Salon Management Software | Online Booking & Payments');
defined('PAGE_DESC')     or define('PAGE_DESC',     'Certxa is the all-in-one salon management software trusted by 50,000+ beauty professionals. Online booking, client management, payments, POS & more. Free 60-day trial.');
defined('PAGE_KEYWORDS') or define('PAGE_KEYWORDS', 'salon management software, salon booking software, beauty salon software, salon scheduling app, online booking for salons, salon POS system, hair salon software');
defined('PAGE_OG_IMAGE') or define('PAGE_OG_IMAGE', SITE_URL . '/assets/images/og-image.jpg');

// Canonical: prefer explicit constant, fall back to current path
if (!defined('PAGE_CANONICAL')) {
  $path = strtok($_SERVER['REQUEST_URI'] ?? '/overview.php', '?');
  // normalise /index.php and bare / to overview
  if ($path === '/' || $path === '/index.php') $path = '/overview.php';
  define('PAGE_CANONICAL', SITE_URL . $path);
}

// Breadcrumb: array of ['name'=>'...','url'=>'...']
defined('PAGE_BREADCRUMBS') or define('PAGE_BREADCRUMBS', json_encode([
  ['name' => 'Home', 'url' => SITE_URL . '/overview.php']
]));

// JSON-LD: page can define PAGE_SCHEMA as a JSON string
// Base schemas always injected on every page
$_base_schema = [
  [
    '@type'     => 'WebSite',
    '@id'       => SITE_URL . '/#website',
    'url'       => SITE_URL . '/',
    'name'      => BRAND_NAME,
    'description' => 'All-in-one salon management software for beauty professionals',
    'publisher' => ['@id' => SITE_URL . '/#organization'],
    'potentialAction' => [
      '@type'       => 'SearchAction',
      'target'      => ['@type' => 'EntryPoint', 'urlTemplate' => SITE_URL . '/search?q={search_term_string}'],
      'query-input' => 'required name=search_term_string',
    ],
  ],
  [
    '@type' => 'Organization',
    '@id'   => SITE_URL . '/#organization',
    'name'  => BRAND_NAME,
    'url'   => SITE_URL,
    'logo'  => [
      '@type'  => 'ImageObject',
      'url'    => SITE_URL . '/assets/images/logo.png',
      'width'  => 200,
      'height' => 60,
    ],
    'sameAs' => [
      'https://twitter.com/certxa',
      'https://facebook.com/certxa',
      'https://instagram.com/certxa',
      'https://linkedin.com/company/certxa',
    ],
    'contactPoint' => [
      '@type'            => 'ContactPoint',
      'contactType'      => 'customer support',
      'email'            => 'support@certxa.com',
      'availableLanguage'=> 'English',
    ],
  ],
];

// Build breadcrumb schema
$_breadcrumbs = json_decode(PAGE_BREADCRUMBS, true);
if (count($_breadcrumbs) > 1) {
  $_bc_items = [];
  foreach ($_breadcrumbs as $i => $bc) {
    $_bc_items[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $bc['name'], 'item' => $bc['url']];
  }
  $_base_schema[] = ['@type' => 'BreadcrumbList', 'itemListElement' => $_bc_items];
}

// Merge page-specific schema
$_page_schema = defined('PAGE_SCHEMA') ? json_decode(PAGE_SCHEMA, true) : [];
if (!empty($_page_schema)) {
  if (isset($_page_schema['@type'])) {
    // single object
    $_base_schema[] = $_page_schema;
  } else {
    // array of objects
    foreach ($_page_schema as $s) $_base_schema[] = $s;
  }
}

$_schema_output = json_encode(['@context' => 'https://schema.org', '@graph' => $_base_schema],
  JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- ── Favicon ────────────────────────────────── -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.svg" sizes="any">
  <meta name="theme-color" content="#3B0764">

  <!-- ── Primary meta ───────────────────────────── -->
  <title><?= htmlspecialchars(PAGE_TITLE) ?></title>
  <meta name="description" content="<?= htmlspecialchars(PAGE_DESC) ?>">
  <meta name="keywords"    content="<?= htmlspecialchars(PAGE_KEYWORDS) ?>">
  <meta name="author"      content="<?= BRAND_NAME ?>">
  <meta name="robots"      content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical"    href="<?= htmlspecialchars(PAGE_CANONICAL) ?>">

  <!-- ── Open Graph ────────────────────────────── -->
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="<?= BRAND_NAME ?>">
  <meta property="og:title"       content="<?= htmlspecialchars(PAGE_TITLE) ?>">
  <meta property="og:description" content="<?= htmlspecialchars(PAGE_DESC) ?>">
  <meta property="og:url"         content="<?= htmlspecialchars(PAGE_CANONICAL) ?>">
  <meta property="og:image"       content="<?= htmlspecialchars(PAGE_OG_IMAGE) ?>">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height"content="630">
  <meta property="og:locale"      content="en_US">

  <!-- ── Twitter Card ──────────────────────────── -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:site"        content="@certxa">
  <meta name="twitter:title"       content="<?= htmlspecialchars(PAGE_TITLE) ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars(PAGE_DESC) ?>">
  <meta name="twitter:image"       content="<?= htmlspecialchars(PAGE_OG_IMAGE) ?>">

  <!-- ── Sitemap hint ──────────────────────────── -->
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">

  <!-- ── Preconnect / fonts ────────────────────── -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..700,50..100,0..1;1,9..144,300..700,50..100,0..1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- ── Stylesheet ────────────────────────────── -->
  <link rel="stylesheet" href="/assets/css/style.css">

  <!-- ── JSON-LD Structured Data ───────────────── -->
  <script type="application/ld+json"><?= $_schema_output ?></script>
</head>
<body>
