<?php
session_start();
require_once __DIR__ . '/config.php';

if (empty($_SESSION['admin_logged_in'])) {
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

require_once __DIR__ . '/data/templates.php';

// ── Validate inputs ───────────────────────────────────────────────────────────

$uuid        = preg_replace('/[^a-f0-9]/', '', trim($_POST['uuid'] ?? ''));
$name        = trim($_POST['name'] ?? '');
$category    = trim($_POST['category'] ?? '');
$template_id = strtolower(trim($_POST['template_id'] ?? ''));
$template_id = preg_replace('/[^a-z0-9\-]/', '-', $template_id);
$template_id = trim(preg_replace('/-+/', '-', $template_id), '-');
$source_url  = trim($_POST['source_url'] ?? '');
$style       = trim($_POST['style'] ?? 'Scraped');
$badge       = in_array(trim($_POST['badge'] ?? ''), ['', 'new', 'popular', 'premium'])
                   ? trim($_POST['badge'] ?? '') : 'new';

$valid_categories = ['Hair Salon', 'Barbershop', 'Nail Salon'];

if (!$uuid || !$name || !$template_id || !in_array($category, $valid_categories)) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Missing required fields. Please go back and fill everything in.'];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

if (isset($all_templates[$template_id])) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Template ID "' . htmlspecialchars($template_id) . '" already exists. Choose a different ID.'];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

$tmpDir = __DIR__ . '/scraped-tmp/' . $uuid;
if (!is_dir($tmpDir) || !file_exists($tmpDir . '/index.html')) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Scraped session not found or expired. Please re-scrape the URL.'];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

// ── Move tmp → templates/{id} ─────────────────────────────────────────────────

$destDir = __DIR__ . '/templates/' . $template_id;

if (!rename($tmpDir, $destDir)) {
    // Fallback: recursive copy then delete
    function sc_copy_dir(string $src, string $dst): void {
        @mkdir($dst, 0755, true);
        $iter = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($iter as $item) {
            $target = $dst . '/' . $iter->getSubPathname();
            $item->isDir() ? @mkdir($target, 0755, true) : copy($item->getPathname(), $target);
        }
    }
    sc_copy_dir($tmpDir, $destDir);
    // Remove tmp
    $tmpIter = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($tmpDir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($tmpIter as $f) {
        $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname());
    }
    @rmdir($tmpDir);
}

if (!is_dir($destDir) || !file_exists($destDir . '/index.html')) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Failed to move scraped files into templates directory. Check server permissions.'];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

// ── Build template entry ──────────────────────────────────────────────────────

$metaPath  = $destDir . '/meta.json';
$meta      = file_exists($metaPath) ? (json_decode(file_get_contents($metaPath), true) ?? []) : [];
$actualSrc = $meta['source_url'] ?? $source_url;

$new_entry = [
    'id'            => $template_id,
    'name'          => $name,
    'category'      => $category,
    'style'         => $style ?: 'Scraped',
    'desc'          => 'Website scraped from ' . ($actualSrc ?: 'external source') . '. Full original layout preserved.',
    'badge'         => $badge,
    'features'      => ['Full Layout', 'Custom Design', 'Scraped'],
    'accent'        => '#a855f7',
    'dark'          => '#0a0b15',
    'light'         => '#1c1d27',
    'url_slug'      => $template_id,
    'hero_tagline'  => $name,
    'hero_sub'      => 'Professional website template.',
    'business_name' => $name,
    'type'          => 'scraped',
    'scraped_path'  => '/launchsite/templates/' . $template_id . '/index.html',
    'source_url'    => $actualSrc,
];

// ── Serialise to PHP source ───────────────────────────────────────────────────

function sc_fmt_val(mixed $v): string {
    if (is_array($v)) {
        $items = array_map(fn($i) => "'" . addslashes((string) $i) . "'", $v);
        return '[' . implode(', ', $items) . ']';
    }
    return "'" . addslashes((string) $v) . "'";
}

$field_order = ['id', 'name', 'category', 'style', 'desc', 'badge', 'features',
                'accent', 'dark', 'light', 'url_slug', 'hero_tagline', 'hero_sub',
                'business_name', 'type', 'scraped_path', 'source_url'];

$lines   = ["    '$template_id' => ["];
foreach ($field_order as $f) {
    if (!array_key_exists($f, $new_entry)) continue;
    $pad     = str_pad("'$f'", 16);
    $lines[] = "        $pad=> " . sc_fmt_val($new_entry[$f]) . ',';
}
$lines[]   = '    ],';
$new_block = "\n" . implode("\n", $lines) . "\n";

$tpl_file = __DIR__ . '/data/templates.php';
$content  = file_get_contents($tpl_file);
$content  = preg_replace('/\n\];\s*$/', $new_block . '];', $content);

// Lint before saving
$tmp  = tempnam(sys_get_temp_dir(), 'tpl_sc_');
file_put_contents($tmp, $content);
$lint = shell_exec('php -l ' . escapeshellarg($tmp) . ' 2>&1');
unlink($tmp);

if (!str_contains((string) $lint, 'No syntax errors')) {
    $_SESSION['flash'] = [
        'type' => 'error',
        'msg'  => 'Template entry generated a PHP syntax error — check for special characters in the name. No changes were saved.',
    ];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

file_put_contents($tpl_file, $content);

$_SESSION['flash'] = [
    'type' => 'success',
    'msg'  => '"' . htmlspecialchars($name) . '" has been added to the catalog. Upload a thumbnail image to complete the card.',
];
header('Location: ' . BASE_PATH . '/admin.php');
exit;
