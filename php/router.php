<?php
/**
 * PHP built-in server router for certxa.com
 *
 * - /launchsite/* → served from php/launchsite/ (LaunchSite template catalog)
 * - /* everything else → served from php/ root (main certxa.com marketing site)
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

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($uri === '') $uri = '/';

// ── LaunchSite catalog (/launchsite/*) ────────────────────────────────────────
if ($uri === '/launchsite' || strpos($uri, '/launchsite/') === 0) {
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
    }

    // Static file
    if (is_file($launch_file) && pathinfo($launch_file, PATHINFO_EXTENSION) !== 'php') {
        serve_static($launch_file, $GLOBALS['mime_map']);
    }

    // PHP page routing
    if ($launch_uri === '/') {
        require $launch_root . '/index.php';
    } elseif (is_file($launch_file) && pathinfo($launch_file, PATHINFO_EXTENSION) === 'php') {
        require $launch_file;
    } elseif (is_file($launch_file . '.php')) {
        require $launch_file . '.php';
    } else {
        http_response_code(404);
        echo '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
    }
    exit;
}

// ── Main certxa.com site (everything else) ───────────────────────────────────
$file = __DIR__ . $uri;

// Directory → try index.php
if (is_dir($file)) {
    $index = rtrim($file, '/') . '/index.php';
    if (is_file($index)) {
        require $index;
        exit;
    }
}

// Static file
if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) !== 'php') {
    serve_static($file, $mime_map);
}

// PHP page routing
if ($uri === '/') {
    require __DIR__ . '/index.php';
} elseif (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
    require $file;
} elseif (is_file($file . '.php')) {
    require $file . '.php';
} else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
}
