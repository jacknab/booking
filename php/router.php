<?php
/**
 * PHP built-in server router for certxa.com
 *
 * - /launchsite/* → served from php/launchsite/ (LaunchSite template catalog)
 *   Exception: /launchsite exactly (no trailing slash) → launchsite/default.php (marketing overview)
 * - /* everything else → served from php/ root (main certxa.com marketing site)
 *
 * Page structure: each page lives in its own directory as default.php
 *   e.g. /overview → overview/default.php
 *        /pricing  → pricing/default.php
 */

$mime_map = [
    'css'   => 'text/css; charset=utf-8',
    'js'    => 'application/javascript; charset=utf-8',
    'json'  => 'application/json',
    'png'   => 'image/png',
    'jpg'   => 'image/jpeg',
    'jpeg'  => 'image/jpeg',
    'gif'   => 'image/gif',
    'svg'   => 'image/svg+xml',
    'ico'   => 'image/x-icon',
    'woff'  => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf'   => 'font/ttf',
    'eot'   => 'application/vnd.ms-fontobject',
    'txt'   => 'text/plain',
    'html'  => 'text/html; charset=utf-8',
    'webp'  => 'image/webp',
    'mp4'   => 'video/mp4',
    'webm'  => 'video/webm',
    'xml'   => 'application/xml',
];

function serve_static(string $path, array $mime_map): void {
    $ext  = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mime = $mime_map[$ext] ?? 'application/octet-stream';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    readfile($path);
    exit;
}

function require_page(string $path): void {
    require $path;
    exit;
}

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($uri === '') $uri = '/';

// ── LaunchSite catalog (/launchsite/*) ────────────────────────────────────────
// Exception: bare /launchsite (no slash) → serve launchsite marketing overview page
if ($uri === '/launchsite') {
    require __DIR__ . '/launchsite/default.php';
    exit;
}

if (strpos($uri, '/launchsite/') === 0) {
    $launch_uri  = preg_replace('#^/launchsite/?#', '/', $uri);
    if ($launch_uri === '') $launch_uri = '/';

    $launch_root = __DIR__ . '/launchsite';
    $launch_file = $launch_root . $launch_uri;

    // Rewrite server vars so included scripts see the clean sub-path
    $_SERVER['REQUEST_URI'] = $launch_uri
        . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== ''
            ? '?' . $_SERVER['QUERY_STRING'] : '');
    $_SERVER['PHP_SELF']    = $launch_uri;
    $_SERVER['SCRIPT_NAME'] = $launch_uri;

    // React SPA directory → serve index.html
    if (is_dir($launch_file)) {
        $index = rtrim($launch_file, '/') . '/index.html';
        if (is_file($index)) {
            header('Content-Type: text/html; charset=utf-8');
            readfile($index);
            exit;
        }
        // Try default.php then index.php for sub-directories
        $base = rtrim($launch_file, '/');
        if (is_file($base . '/default.php')) { require_page($base . '/default.php'); }
        if (is_file($base . '/index.php'))   { require_page($base . '/index.php'); }
    }

    // Static file
    if (is_file($launch_file) && pathinfo($launch_file, PATHINFO_EXTENSION) !== 'php') {
        serve_static($launch_file, $GLOBALS['mime_map']);
    }

    // PHP page routing for launchsite sub-paths
    if ($launch_uri === '/') {
        require $launch_root . '/index.php';
    } elseif (is_file($launch_file) && pathinfo($launch_file, PATHINFO_EXTENSION) === 'php') {
        require $launch_file;
    } elseif (is_file($launch_file . '.php')) {
        require $launch_file . '.php';
    } elseif (is_dir($launch_file) && is_file(rtrim($launch_file,'/') . '/default.php')) {
        require rtrim($launch_file, '/') . '/default.php';
    } elseif (is_dir($launch_file) && is_file(rtrim($launch_file,'/') . '/index.php')) {
        require rtrim($launch_file, '/') . '/index.php';
    } else {
        http_response_code(404);
        echo '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
    }
    exit;
}

// ── Main certxa.com site (everything else) ───────────────────────────────────
$file = __DIR__ . $uri;

// Also check php/public/ subdirectory as an alternate page root.
// e.g. /SalonOS/ → php/public/SalonOS/default.php
$public_root = __DIR__ . '/public';
$public_file = $public_root . $uri;

// Root → index.php
if ($uri === '/') {
    require __DIR__ . '/index.php';
    exit;
}

// ── 301 redirect: old .php URLs → clean URLs ─────────────────────────────────
// e.g. /overview.php → /overview, /pricing.php → /pricing
// Preserves Google rankings on old URLs while consolidating to clean paths.
if (substr($uri, -4) === '.php') {
    $clean = substr($uri, 0, -4);
    // /index.php → / (root)
    if ($clean === '/index') $clean = '/';
    // Only redirect if the clean path actually exists as a directory/page
    // (avoids redirecting PHP internals like /router or /config)
    $is_real_page = ($clean === '/')
        || is_dir(__DIR__ . $clean)
        || is_file(__DIR__ . $clean . '/default.php');
    if ($is_real_page) {
        $qs = isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== ''
            ? '?' . $_SERVER['QUERY_STRING'] : '';
        header('Location: ' . $clean . $qs, true, 301);
        exit;
    }
}

// Static file (non-PHP) — check main root first, then public/
if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) !== 'php') {
    serve_static($file, $mime_map);
}
if (is_file($public_file) && pathinfo($public_file, PATHINFO_EXTENSION) !== 'php') {
    serve_static($public_file, $mime_map);
}

// Directory → prefer default.php, fall back to index.php (main root)
if (is_dir($file)) {
    $base = rtrim($file, '/');
    if (is_file($base . '/default.php')) { require_page($base . '/default.php'); }
    if (is_file($base . '/index.php'))   { require_page($base . '/index.php'); }
}

// Directory → prefer default.php, fall back to index.php (public/ root)
if (is_dir($public_file)) {
    $base = rtrim($public_file, '/');
    if (is_file($base . '/default.php')) { require_page($base . '/default.php'); }
    if (is_file($base . '/index.php'))   { require_page($base . '/index.php'); }
}

// Strip trailing slash and retry as directory (main root)
$stripped = rtrim($file, '/');
if ($stripped !== $file && is_dir($stripped)) {
    if (is_file($stripped . '/default.php')) { require_page($stripped . '/default.php'); }
    if (is_file($stripped . '/index.php'))   { require_page($stripped . '/index.php'); }
}

// Strip trailing slash and retry as directory (public/ root)
$stripped_public = rtrim($public_file, '/');
if ($stripped_public !== $public_file && is_dir($stripped_public)) {
    if (is_file($stripped_public . '/default.php')) { require_page($stripped_public . '/default.php'); }
    if (is_file($stripped_public . '/index.php'))   { require_page($stripped_public . '/index.php'); }
}

// Slug → directory/default.php (main root)
if (is_file($file . '/default.php')) {
    require $file . '/default.php';
    exit;
}

// Slug → directory/default.php (public/ root)
if (is_file($public_file . '/default.php')) {
    require $public_file . '/default.php';
    exit;
}

// Last resort: serve a .php file directly (main root, only PHP internals)
if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
    require $file;
    exit;
}

// Last resort: serve a .php file directly (public/ root)
if (is_file($public_file) && pathinfo($public_file, PATHINFO_EXTENSION) === 'php') {
    require $public_file;
    exit;
}

http_response_code(404);
echo '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
