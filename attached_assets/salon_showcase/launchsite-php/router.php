<?php
/**
 * PHP built-in server router
 * Strips the /launchsite prefix so files resolve correctly.
 * NOTE: We cannot use `return false` for static files because PHP would
 * then try to serve using the ORIGINAL (un-stripped) URI and 404.
 * Instead we serve static files manually via readfile().
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Strip /launchsite or /launchsite/ prefix
$uri = preg_replace('#^/launchsite/?#', '/', $uri);
if ($uri === '') $uri = '/';

// Rewrite server vars so included scripts see the clean URI
$_SERVER['REQUEST_URI'] = $uri . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : '');
$_SERVER['PHP_SELF']    = $uri;
$_SERVER['SCRIPT_NAME'] = $uri;

$file = __DIR__ . $uri;

// Serve directory index.html (for built React SPAs under /templates/)
if (is_dir($file)) {
    $index = rtrim($file, '/') . '/index.html';
    if (is_file($index)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($index);
        exit;
    }
}

// Serve static files manually (css, js, images, fonts, etc.)
if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) !== 'php') {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mimes = [
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
    ];
    $mime = $mimes[$ext] ?? 'application/octet-stream';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

// Route to PHP pages
if ($uri === '/' || $uri === '') {
    require __DIR__ . '/index.php';
} elseif (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
    require $file;
} elseif (is_file($file . '.php')) {
    require $file . '.php';
} else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
}
