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

// ── Read & validate inputs ────────────────────────────────────────────────────

$template_id = preg_replace('/[^a-z0-9\-]/', '', strtolower(trim($_POST['template_id'] ?? '')));

if (!$template_id || !isset($all_templates[$template_id])) {
    $_SESSION['flash'] = ['type' => 'error', 'msg' => 'Template not found.'];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

$src  = $all_templates[$template_id];
$type = $src['type'] ?? 'php';

// Editable fields (sanitised)
$name          = trim($_POST['name']          ?? '') ?: $src['name'];
$category      = in_array($_POST['category'] ?? '', ['Hair Salon','Barbershop','Nail Salon'])
                    ? $_POST['category'] : ($src['category'] ?? 'Hair Salon');
$style         = trim($_POST['style']         ?? '');
$desc          = trim($_POST['desc']          ?? '');
$badge         = in_array($_POST['badge'] ?? '', ['','new','popular','premium'])
                    ? $_POST['badge'] : '';
$hero_tagline  = trim($_POST['hero_tagline']  ?? '');
$hero_sub      = trim($_POST['hero_sub']      ?? '');
$business_name = trim($_POST['business_name'] ?? '');

// Features: comma-separated → array
$features_raw  = trim($_POST['features'] ?? '');
$features      = $features_raw === ''
    ? ($src['features'] ?? [])
    : array_values(array_filter(array_map('trim', explode(',', $features_raw))));

// Colors: must be valid hex or keep original
function valid_hex(string $v, string $fallback): string {
    return preg_match('/^#[0-9a-fA-F]{6}$/', $v) ? $v : $fallback;
}
$accent = valid_hex($_POST['accent'] ?? '', $src['accent'] ?? '#a855f7');
$dark   = valid_hex($_POST['dark']   ?? '', $src['dark']   ?? '#0a0b15');
$light  = valid_hex($_POST['light']  ?? '', $src['light']  ?? '#1c1d27');

// ── Build updated entry (keep structural fields from original) ─────────────────

$updated = $src; // carry everything (id, url_slug, type, react_path, …)
$updated['name']          = $name;
$updated['category']      = $category;
$updated['style']         = $style;
$updated['desc']          = $desc;
$updated['badge']         = $badge;
$updated['features']      = $features;
$updated['accent']        = $accent;
$updated['dark']          = $dark;
$updated['light']         = $light;
$updated['hero_tagline']  = $hero_tagline;
$updated['hero_sub']      = $hero_sub;
$updated['business_name'] = $business_name;

// ── Serialise to PHP source ────────────────────────────────────────────────────

function fmt_val(mixed $v): string {
    if (is_array($v)) {
        $items = array_map(fn($i) => "'" . addslashes($i) . "'", $v);
        return '[' . implode(', ', $items) . ']';
    }
    return "'" . addslashes((string)$v) . "'";
}

$field_order = ['id','name','category','style','desc','badge','features',
                'accent','dark','light','url_slug','hero_tagline','hero_sub',
                'business_name','type','react_path'];

$lines   = [];
$lines[] = "    '$template_id' => [";
foreach ($field_order as $f) {
    if (!array_key_exists($f, $updated)) continue;
    $pad     = str_pad("'$f'", 16);
    $lines[] = "        $pad=> " . fmt_val($updated[$f]) . ',';
}
$lines[] = '    ],';
$new_block = "\n" . implode("\n", $lines) . "\n";

// ── Remove old entry, inject updated one ──────────────────────────────────────

$templates_file = __DIR__ . '/data/templates.php';
$content        = file_get_contents($templates_file);

// Back up before writing
$backup = $content;

$content = preg_replace(
    "/\n    '" . preg_quote($template_id, '/') . "' => \[.*?\n    \],\n/s",
    "\n",
    $content
);
// Inject before closing `];`
$content = preg_replace('/\n\];\s*$/', $new_block . '];', $content);

// ── Lint before saving ────────────────────────────────────────────────────────

$tmp  = tempnam(sys_get_temp_dir(), 'tpl');
file_put_contents($tmp, $content);
$lint = shell_exec('php -l ' . escapeshellarg($tmp) . ' 2>&1');
unlink($tmp);

if (!str_contains($lint, 'No syntax errors')) {
    $_SESSION['flash'] = [
        'type' => 'error',
        'msg'  => 'Could not save — generated entry has a syntax error. No changes were made. Please check for special characters.',
    ];
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

file_put_contents($templates_file, $content);

$_SESSION['flash'] = [
    'type' => 'success',
    'msg'  => '"' . htmlspecialchars($name) . '" (' . $template_id . ') updated successfully.',
];
header('Location: ' . BASE_PATH . '/admin.php');
exit;
