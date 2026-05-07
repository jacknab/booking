<?php
session_start();
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

if (empty($_SESSION['admin_logged_in'])) {
    echo json_encode(['ok' => false, 'error' => 'Not authenticated.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'POST required.']);
    exit;
}

require_once __DIR__ . '/data/templates.php';

$template_id = preg_replace('/[^a-z0-9\-]/', '', strtolower(trim($_POST['template_id'] ?? '')));
$name        = trim($_POST['name'] ?? '');

if (!$template_id || !isset($all_templates[$template_id])) {
    echo json_encode(['ok' => false, 'error' => 'Template not found.']);
    exit;
}
if (strlen($name) < 1) {
    echo json_encode(['ok' => false, 'error' => 'Name cannot be empty.']);
    exit;
}
if (strlen($name) > 100) {
    echo json_encode(['ok' => false, 'error' => 'Name too long (max 100 chars).']);
    exit;
}

$templates_file = __DIR__ . '/data/templates.php';
$content = file_get_contents($templates_file);

// Replace the 'name' field within this template's block only
$content = preg_replace_callback(
    "/(\n    '" . preg_quote($template_id, '/') . "' => \[.*?\n    \],)/s",
    function (array $m) use ($name): string {
        return preg_replace(
            "/'name'\s*=>\s*'[^']*'/",
            "'name'          => '" . addslashes($name) . "'",
            $m[0]
        );
    },
    $content
);

// Lint before saving
$tmp = tempnam(sys_get_temp_dir(), 'tpl');
file_put_contents($tmp, $content);
$lint = shell_exec('php -l ' . escapeshellarg($tmp) . ' 2>&1');
unlink($tmp);

if (!str_contains($lint, 'No syntax errors')) {
    echo json_encode(['ok' => false, 'error' => 'Syntax check failed. Avoid unusual characters like single quotes.']);
    exit;
}

file_put_contents($templates_file, $content);
echo json_encode(['ok' => true]);
exit;
