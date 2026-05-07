<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/data/templates.php';

define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'launchit-admin');

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . BASE_PATH . '/admin.php');
    exit;
}

// Login POST
$login_error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: ' . BASE_PATH . '/admin.php');
        exit;
    } else {
        $login_error = 'Incorrect password. Please try again.';
    }
}

$is_authed = !empty($_SESSION['admin_logged_in']);

// Flash messages from redirects
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);

// Stats
$hair_count  = count(array_filter($all_templates, fn($t) => $t['category'] === 'Hair Salon'));
$barb_count  = count(array_filter($all_templates, fn($t) => $t['category'] === 'Barbershop'));
$nail_count  = count(array_filter($all_templates, fn($t) => $t['category'] === 'Nail Salon'));
$total_count = count($all_templates);
$thumbs_dir  = __DIR__ . '/assets/img/thumbs';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Launchit Admin — Certxa</title>
<link rel="stylesheet" href="<?php echo BASE_PATH; ?>/assets/css/admin.css">
</head>
<body class="admin-body">

<?php if (!$is_authed): ?>
<!-- ── Login ── -->
<div class="admin-login-wrap">
    <div class="admin-login-box">
        <div class="admin-login-logo">🚀</div>
        <div class="admin-login-title">Launchit Admin</div>
        <div class="admin-login-sub">Sign in to manage templates</div>
        <?php if ($login_error): ?>
        <div class="admin-login-error"><?php echo htmlspecialchars($login_error); ?></div>
        <?php endif; ?>
        <form method="POST" action="">
            <input type="password" name="password" class="form-input" placeholder="Admin password" autofocus required>
            <button type="submit" class="btn-admin btn-admin--primary" style="width:100%;justify-content:center;">Sign In</button>
        </form>
        <p style="margin-top:18px;font-size:0.75rem;color:rgba(255,255,255,0.2);">
            Set the <code>ADMIN_PASSWORD</code> environment variable to change the password.
        </p>
    </div>
</div>

<?php else: ?>
<!-- ── Dashboard ── -->
<header class="admin-header">
    <a class="admin-header__brand" href="<?php echo BASE_PATH; ?>/admin.php">
        <div class="admin-header__logo">🚀</div>
        Launchit Admin
        <span class="admin-header__tag">Certxa</span>
    </a>
    <div class="admin-header__actions">
        <span class="admin-header__user">Catalog Manager</span>
        <a href="<?php echo BASE_PATH; ?>/" target="_blank" class="admin-logout">View Catalog ↗</a>
        <a href="?logout=1" class="admin-logout">Sign Out</a>
    </div>
</header>

<div class="admin-layout">
    <div class="admin-page-title">Template Catalog</div>
    <div class="admin-page-sub">Upload, manage, and preview all salon website templates.</div>

    <!-- Stats -->
    <div class="admin-stats">
        <div class="admin-stat admin-stat--purple">
            <div class="admin-stat__num"><?php echo $total_count; ?></div>
            <div class="admin-stat__label">Total Templates</div>
        </div>
        <div class="admin-stat">
            <div class="admin-stat__num"><?php echo $hair_count; ?></div>
            <div class="admin-stat__label">Hair Salons</div>
        </div>
        <div class="admin-stat">
            <div class="admin-stat__num"><?php echo $barb_count; ?></div>
            <div class="admin-stat__label">Barbershops</div>
        </div>
        <div class="admin-stat admin-stat--green">
            <div class="admin-stat__num"><?php echo $nail_count; ?></div>
            <div class="admin-stat__label">Nail Salons</div>
        </div>
    </div>

    <?php if ($flash): ?>
    <div class="flash-msg flash-msg--<?php echo htmlspecialchars($flash['type']); ?>" id="flashMsg">
        <span class="flash-msg__icon"><?php echo $flash['type'] === 'success' ? '✅' : '❌'; ?></span>
        <span><?php echo htmlspecialchars($flash['msg']); ?></span>
        <button class="flash-msg__close" onclick="this.parentElement.remove()">✕</button>
    </div>
    <?php endif; ?>

    <!-- Template List -->
    <div class="admin-card">
        <div class="admin-card__header">
            <span class="admin-card__title">All Templates</span>
            <div style="display:flex;gap:8px;align-items:center;">
                <button class="btn-admin btn-admin--ghost btn-admin--sm" onclick="openMediaLibModal()">🖼️ Image Library</button>
                <a href="#upload" class="btn-admin btn-admin--orange btn-admin--sm">+ Upload New Template</a>
            </div>
        </div>
        <div class="admin-card__body" style="padding:0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Template</th>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Thumbnail</th>
                        <th>Hours</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($all_templates as $id => $t):
                        $thumb_ok = file_exists($thumbs_dir . '/' . $id . '.jpg');
                        $type     = $t['type'] ?? 'php';
                    ?>
                    <tr>
                        <td class="tbl-name" data-id="<?php echo htmlspecialchars($id); ?>">
                            <span class="tpl-name-text"><?php echo htmlspecialchars($t['name']); ?></span><button class="tpl-name-edit-btn" title="Rename">✎</button>
                            <span class="tpl-name-editing" style="display:none;">
                                <input type="text" class="tpl-name-input"
                                       value="<?php echo htmlspecialchars($t['name']); ?>">
                                <button class="tpl-name-save" title="Save">✓</button>
                                <button class="tpl-name-cancel" title="Cancel">✕</button>
                            </span>
                        </td>
                        <td class="tbl-id"><?php echo htmlspecialchars($id); ?></td>
                        <td class="tbl-cat"><?php echo htmlspecialchars($t['category']); ?></td>
                        <td>
                            <span class="tbl-badge tbl-badge--<?php echo $type; ?>">
                                <?php echo strtoupper($type); ?>
                            </span>
                        </td>
                        <td>
                            <span class="thumb-dot thumb-dot--<?php echo $thumb_ok ? 'ok' : 'missing'; ?>"></span>
                            <?php echo $thumb_ok ? 'OK' : 'Missing'; ?>
                        </td>
                        <td class="tbl-hours">
                            <?php
                            $hrs = $t['hours'] ?? null;
                            if ($hrs):
                                echo '<span class="hours-compact">' . htmlspecialchars($hrs) . '</span>';
                            else: ?>
                            <span class="hours-compact">Mon–Fri 9am–6pm<br>Sat 10am–4pm<br>Sun Closed</span>
                            <?php endif; ?>
                        </td>
                        <td class="tbl-actions">
                            <a href="<?php echo BASE_PATH; ?>/preview.php?id=<?php echo urlencode($id); ?>"
                               target="_blank" class="tbl-link">Preview ↗</a>
                            <?php if ($type === 'react'): ?>
                            <button class="tbl-link tbl-link--replace btn-replace"
                                    data-id="<?php echo htmlspecialchars($id); ?>"
                                    data-name="<?php echo htmlspecialchars($t['name']); ?>">
                                Replace
                            </button>
                            <?php $has_source = is_dir(dirname(__DIR__) . '/artifacts/template-' . $id); ?>
                            <?php if ($has_source): ?>
                            <form method="POST" action="<?php echo BASE_PATH; ?>/admin-detect.php" style="display:inline;">
                                <input type="hidden" name="template_id" value="<?php echo htmlspecialchars($id); ?>">
                                <button type="submit" class="tbl-link tbl-link--sync"
                                        title="Re-scan source code and update name, colors, hero text &amp; thumbnail">
                                    Re-sync
                                </button>
                            </form>
                            <?php endif; ?>
                            <?php endif; ?>
                            <form method="POST" action="<?php echo BASE_PATH; ?>/admin-thumb.php" style="display:inline;">
                                <input type="hidden" name="template_id" value="<?php echo htmlspecialchars($id); ?>">
                                <button type="submit" class="tbl-link tbl-link--regen">Regen Thumb</button>
                            </form>
                            <button class="tbl-link tbl-link--upload btn-upload-thumb"
                                    data-id="<?php echo htmlspecialchars($id); ?>"
                                    data-name="<?php echo htmlspecialchars($t['name']); ?>">
                                Upload Image
                            </button>
                            <button class="tbl-link tbl-link--dupe btn-duplicate"
                                    data-id="<?php echo htmlspecialchars($id); ?>"
                                    data-name="<?php echo htmlspecialchars($t['name']); ?>"
                                    data-type="<?php echo htmlspecialchars($type); ?>"
                                    data-category="<?php echo htmlspecialchars($t['category']); ?>">
                                Duplicate
                            </button>
                            <button class="tbl-link tbl-link--edit btn-edit"
                                    data-id="<?php echo htmlspecialchars($id); ?>">
                                Edit
                            </button>
                            <button class="tbl-link tbl-link--delete btn-delete"
                                    data-id="<?php echo htmlspecialchars($id); ?>"
                                    data-name="<?php echo htmlspecialchars($t['name']); ?>"
                                    data-type="<?php echo htmlspecialchars($type); ?>">
                                Delete
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Delete Modal -->
    <div id="deleteModal" class="modal-backdrop" style="display:none;">
        <div class="modal-box">
            <div class="modal-header">
                <div class="modal-title">Delete Template</div>
                <button class="modal-close" onclick="closeDeleteModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-template-info modal-template-info--danger" id="deleteTemplateName"></div>
                <p class="modal-desc" style="color:rgba(248,113,113,0.8);">
                    This will permanently remove the template from the catalog and delete all associated files.
                    This cannot be undone.
                </p>
                <div id="deleteReactNote" class="modal-delete-note" style="display:none;">
                    The following will be deleted:
                    <ul class="modal-delete-list">
                        <li>Catalog registration in <code>data/templates.php</code></li>
                        <li>Built site files in <code>launchsite-php/templates/{id}/</code></li>
                        <li>Source files in <code>artifacts/template-{id}/</code></li>
                        <li>Thumbnail image</li>
                    </ul>
                </div>
                <div id="deletePhpNote" class="modal-delete-note" style="display:none;">
                    The following will be deleted:
                    <ul class="modal-delete-list">
                        <li>Catalog registration in <code>data/templates.php</code></li>
                        <li>Thumbnail image</li>
                    </ul>
                    <p style="margin-top:8px;color:rgba(255,255,255,0.3);font-size:0.75rem;">
                        PHP template files are not deleted — remove them manually if needed.
                    </p>
                </div>
                <form id="deleteForm" method="POST" action="<?php echo BASE_PATH; ?>/admin-delete.php"
                      onsubmit="return confirmDelete()">
                    <input type="hidden" name="template_id" id="deleteTemplateId">
                    <div class="form-group" style="margin-top:18px;">
                        <label class="form-label" style="color:rgba(248,113,113,0.7);">
                            Type the template ID to confirm
                        </label>
                        <input type="text" id="deleteConfirmInput" class="form-input form-input--danger"
                               placeholder="e.g. luxury-nails-spa" autocomplete="off" spellcheck="false">
                        <span class="form-hint" id="deleteConfirmHint"></span>
                    </div>
                    <div class="modal-actions" style="margin-top:20px;">
                        <button type="submit" class="btn-admin btn-admin--danger" id="deleteBtn" disabled>
                            🗑️ Delete Permanently
                        </button>
                        <button type="button" class="btn-admin btn-admin--ghost" onclick="closeDeleteModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Image Library Modal -->
    <div id="mediaLibModal" class="modal-backdrop" style="display:none;">
        <div class="modal-box modal-box--media">
            <div class="modal-header">
                <div class="modal-title">🖼️ Image Library</div>
                <button class="modal-close" onclick="closeMediaLibModal()">✕</button>
            </div>
            <div class="modal-body modal-body--media" id="mediaLibContent">
                <div class="media-lib-loading">Loading…</div>
            </div>
        </div>
    </div>

    <!-- Edit Template Modal -->
    <div id="editModal" class="modal-backdrop" style="display:none;">
        <div class="modal-box modal-box--wide">
            <div class="modal-header">
                <div class="modal-title">Edit Template Entry</div>
                <button class="modal-close" onclick="closeEditModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-template-info" id="editTemplateName"></div>
                <form id="editForm" method="POST"
                      action="<?php echo BASE_PATH; ?>/admin-edit.php"
                      onsubmit="return confirmEdit()">
                    <input type="hidden" name="template_id" id="editTemplateId">

                    <div class="edit-grid">
                        <div class="form-group">
                            <label class="form-label">Display name</label>
                            <input type="text" name="name" id="editName" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select name="category" id="editCategory" class="form-select" required>
                                <option value="Hair Salon">Hair Salon</option>
                                <option value="Barbershop">Barbershop</option>
                                <option value="Nail Salon">Nail Salon</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Style tag</label>
                            <input type="text" name="style" id="editStyle" class="form-input"
                                   placeholder="e.g. Modern, Classic, Luxury">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Badge</label>
                            <select name="badge" id="editBadge" class="form-select">
                                <option value="">— none —</option>
                                <option value="new">new</option>
                                <option value="popular">popular</option>
                                <option value="premium">premium</option>
                            </select>
                        </div>
                        <div class="form-group edit-grid__full">
                            <label class="form-label">Description</label>
                            <textarea name="desc" id="editDesc" class="form-input form-textarea"
                                      rows="3" placeholder="Short catalog card description"></textarea>
                        </div>
                        <div class="form-group edit-grid__full">
                            <label class="form-label">Features <span style="color:rgba(255,255,255,0.35);font-weight:400;">comma-separated</span></label>
                            <input type="text" name="features" id="editFeatures" class="form-input"
                                   placeholder="e.g. Booking, Gallery, Services">
                        </div>
                        <div class="form-group edit-grid__full">
                            <label class="form-label">Hero tagline</label>
                            <input type="text" name="hero_tagline" id="editHeroTagline" class="form-input">
                        </div>
                        <div class="form-group edit-grid__full">
                            <label class="form-label">Hero sub-heading</label>
                            <input type="text" name="hero_sub" id="editHeroSub" class="form-input">
                        </div>
                        <div class="form-group edit-grid__full">
                            <label class="form-label">Business name</label>
                            <input type="text" name="business_name" id="editBusinessName" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Accent color</label>
                            <div class="color-row">
                                <input type="color" id="editAccentPicker" class="color-swatch"
                                       oninput="document.getElementById('editAccent').value=this.value">
                                <input type="text" name="accent" id="editAccent" class="form-input form-input--color"
                                       placeholder="#a855f7" maxlength="7"
                                       oninput="syncPicker('editAccentPicker',this.value)">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dark bg color</label>
                            <div class="color-row">
                                <input type="color" id="editDarkPicker" class="color-swatch"
                                       oninput="document.getElementById('editDark').value=this.value">
                                <input type="text" name="dark" id="editDark" class="form-input form-input--color"
                                       placeholder="#0a0b15" maxlength="7"
                                       oninput="syncPicker('editDarkPicker',this.value)">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Light bg color</label>
                            <div class="color-row">
                                <input type="color" id="editLightPicker" class="color-swatch"
                                       oninput="document.getElementById('editLight').value=this.value">
                                <input type="text" name="light" id="editLight" class="form-input form-input--color"
                                       placeholder="#1c1d27" maxlength="7"
                                       oninput="syncPicker('editLightPicker',this.value)">
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions" style="margin-top:24px;">
                        <button type="submit" class="btn-admin btn-admin--primary" id="editSaveBtn">
                            💾 Save Changes
                        </button>
                        <button type="button" class="btn-admin btn-admin--ghost" onclick="closeEditModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Duplicate Template Modal -->
    <div id="duplicateModal" class="modal-backdrop" style="display:none;">
        <div class="modal-box">
            <div class="modal-header">
                <div class="modal-title">Duplicate Template</div>
                <button class="modal-close" onclick="closeDuplicateModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-template-info" id="dupeSourceName"></div>
                <p class="modal-desc" id="dupeDesc"></p>
                <form id="duplicateForm" method="POST"
                      action="<?php echo BASE_PATH; ?>/admin-duplicate.php"
                      onsubmit="return confirmDuplicate()">
                    <input type="hidden" name="source_id"  id="dupeSourceId">
                    <input type="hidden" name="source_type" id="dupeSourceType">
                    <div class="form-group" style="margin-top:4px;">
                        <label class="form-label">New template ID <span style="color:rgba(255,255,255,0.35);font-weight:400;">(letters, numbers, hyphens)</span></label>
                        <input type="text" name="new_id" id="dupeNewId" class="form-input"
                               placeholder="e.g. luxury-nails-v2"
                               autocomplete="off" spellcheck="false" required>
                        <span class="form-hint" id="dupeIdHint"></span>
                    </div>
                    <div class="form-group" style="margin-top:14px;">
                        <label class="form-label">Display name <span style="color:rgba(255,255,255,0.35);font-weight:400;">(shown on catalog card)</span></label>
                        <input type="text" name="new_name" id="dupeNewName" class="form-input"
                               placeholder="e.g. Luxury Nails v2" autocomplete="off">
                        <span class="form-hint">Leave blank to use "Copy of [original name]"</span>
                    </div>
                    <div class="modal-actions" style="margin-top:20px;">
                        <button type="submit" class="btn-admin btn-admin--primary" id="dupeBtn">
                            ⧉ Duplicate
                        </button>
                        <button type="button" class="btn-admin btn-admin--ghost" onclick="closeDuplicateModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Upload Thumbnail Modal -->
    <div id="uploadThumbModal" class="modal-backdrop" style="display:none;">
        <div class="modal-box">
            <div class="modal-header">
                <div class="modal-title">Upload Catalog Image</div>
                <button class="modal-close" onclick="closeUploadThumbModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-template-info" id="uploadThumbTemplateName"></div>
                <p class="modal-desc">
                    Upload any JPG, PNG, or WebP image. It will be automatically resized and cropped to
                    900×620 px and saved as the catalog card image for this template.
                </p>
                <form id="uploadThumbForm" method="POST"
                      action="<?php echo BASE_PATH; ?>/admin-upload-thumb.php"
                      enctype="multipart/form-data" onsubmit="return confirmUploadThumb()">
                    <input type="hidden" name="template_id" id="uploadThumbTemplateId">
                    <div class="upload-drop upload-drop--compact" id="uploadThumbDropZone"
                         onclick="document.getElementById('uploadThumbFile').click()">
                        <div class="upload-drop__icon" style="font-size:1.8rem;margin-bottom:6px;">🖼️</div>
                        <div class="upload-drop__title" id="uploadThumbDropTitle">Drop image here, or click to browse</div>
                        <div class="upload-drop__sub">JPG · PNG · WebP · up to 20 MB</div>
                        <div id="uploadThumbPreviewWrap" style="display:none;margin-top:12px;">
                            <img id="uploadThumbPreview"
                                 style="max-width:100%;max-height:160px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);object-fit:cover;">
                        </div>
                        <input type="file" name="thumbimage" id="uploadThumbFile"
                               accept="image/jpeg,image/png,image/webp" required>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-admin btn-admin--primary" id="uploadThumbBtn">
                            💾 Save as Catalog Image
                        </button>
                        <button type="button" class="btn-admin btn-admin--ghost"
                                onclick="closeUploadThumbModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Replace Modal -->
    <div id="replaceModal" class="modal-backdrop" style="display:none;">
        <div class="modal-box">
            <div class="modal-header">
                <div class="modal-title">Replace Template</div>
                <button class="modal-close" onclick="closeReplaceModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-template-info" id="modalTemplateName"></div>
                <p class="modal-desc">
                    Upload a new ZIP to rebuild this template. The category stays the same.
                    Name, colors, and hero text are re-detected from your new source files.
                </p>
                <form id="replaceForm" method="POST" action="<?php echo BASE_PATH; ?>/admin-replace.php"
                      enctype="multipart/form-data" onsubmit="return confirmReplace()">
                    <input type="hidden" name="template_id" id="replaceTemplateId">
                    <div class="upload-drop upload-drop--compact" id="replaceDropZone"
                         onclick="document.getElementById('replaceZip').click()">
                        <div class="upload-drop__icon" style="font-size:1.8rem;margin-bottom:6px;">📦</div>
                        <div class="upload-drop__title" id="replaceDropTitle">Drop new ZIP here, or click to browse</div>
                        <div class="upload-drop__sub">React/Vite project ZIP · up to 50 MB</div>
                        <input type="file" name="zipfile" id="replaceZip" accept=".zip" required>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-admin btn-admin--orange" id="replaceBtn">
                            🔄 Replace &amp; Rebuild
                        </button>
                        <button type="button" class="btn-admin btn-admin--ghost" onclick="closeReplaceModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Upload New Template -->
    <div class="admin-card" id="upload">
        <div class="admin-card__header">
            <span class="admin-card__title">Upload New React/Vite Template</span>
        </div>
        <div class="admin-card__body">
            <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin-bottom:24px;line-height:1.7;">
                Upload your zipped React/Vite project and select a category. Everything else — the template name,
                colors, hero text, and business name — is detected automatically from your source files.
                Dependencies are installed and the site is built and registered in the catalog automatically.
            </p>

            <form id="uploadForm" method="POST" action="<?php echo BASE_PATH; ?>/admin-install.php"
                  enctype="multipart/form-data" onsubmit="return confirmInstall()">

                <!-- Drop zone -->
                <div class="upload-drop" id="dropZone" onclick="document.getElementById('zipFile').click()">
                    <div class="upload-drop__icon">📦</div>
                    <div class="upload-drop__title">Drop your ZIP file here, or click to browse</div>
                    <div class="upload-drop__sub">Accepts .zip files up to 50 MB · React/Vite projects only</div>
                    <div class="upload-drop__filename" id="fileNameDisplay" style="display:none;"></div>
                    <input type="file" name="zipfile" id="zipFile" accept=".zip" required>
                </div>

                <div class="form-section-title">One required field</div>
                <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:16px;max-width:560px;">
                    <div class="form-group" style="grid-column:1/-1;">
                        <label class="form-label">Category *</label>
                        <select name="category" id="fCategory" class="form-select" required>
                            <option value="">— Select category —</option>
                            <option value="Hair Salon">Hair Salon</option>
                            <option value="Barbershop">Barbershop</option>
                            <option value="Nail Salon">Nail Salon</option>
                        </select>
                        <span class="form-hint">All other info (name, colors, hero text) is read from your source files.</span>
                    </div>
                </div>

                <div class="form-actions" style="margin-top:24px;">
                    <button type="submit" class="btn-admin btn-admin--orange" id="installBtn">
                        🚀 Install Template
                    </button>
                    <span style="color:rgba(255,255,255,0.3);font-size:0.8rem;align-self:center;">
                        Installs dependencies, builds, registers in catalog &amp; generates thumbnail — ~30–90 s
                    </span>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// ── New template upload ──────────────────────────────────────────────────────
const dropZone        = document.getElementById('dropZone');
const zipFile         = document.getElementById('zipFile');
const fileNameDisplay = document.getElementById('fileNameDisplay');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        zipFile.files = dt.files;
        onFileSelected(file);
    }
});
zipFile.addEventListener('change', () => {
    if (zipFile.files[0]) onFileSelected(zipFile.files[0]);
});
function onFileSelected(file) {
    fileNameDisplay.textContent = '📦 ' + file.name;
    fileNameDisplay.style.display = 'block';
    dropZone.querySelector('.upload-drop__title').textContent = 'File selected — ready to install';
}
function confirmInstall() {
    if (!document.getElementById('fCategory').value) {
        alert('Please select a category.');
        return false;
    }
    const btn = document.getElementById('installBtn');
    btn.innerHTML = '<span class="spinner"></span> Installing… (this takes ~60 s)';
    btn.disabled = true;
    return true;
}

// ── Delete modal ─────────────────────────────────────────────────────────────
let _deleteId = '';

document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
        _deleteId = btn.dataset.id;
        const name = btn.dataset.name;
        const type = btn.dataset.type;
        document.getElementById('deleteTemplateId').value   = _deleteId;
        document.getElementById('deleteTemplateName').textContent = name + '  (' + _deleteId + ')';
        document.getElementById('deleteConfirmInput').value  = '';
        document.getElementById('deleteConfirmHint').textContent = 'Must match: ' + _deleteId;
        document.getElementById('deleteBtn').disabled = true;
        document.getElementById('deleteReactNote').style.display = type === 'react' ? 'block' : 'none';
        document.getElementById('deletePhpNote').style.display   = type === 'php'   ? 'block' : 'none';
        // Fill {id} placeholder in the note list
        document.querySelectorAll('#deleteReactNote li').forEach(li => {
            li.innerHTML = li.innerHTML.replace(/\{id\}/g, _deleteId);
        });
        document.getElementById('deleteModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('deleteConfirmInput').focus(), 80);
    });
});

document.getElementById('deleteConfirmInput').addEventListener('input', function() {
    const matches = this.value.trim() === _deleteId;
    document.getElementById('deleteBtn').disabled = !matches;
    this.style.borderColor = this.value ? (matches ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.4)') : '';
});

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
});

function confirmDelete() {
    if (document.getElementById('deleteConfirmInput').value.trim() !== _deleteId) return false;
    const btn = document.getElementById('deleteBtn');
    btn.innerHTML = '<span class="spinner"></span> Deleting…';
    btn.disabled  = true;
    return true;
}

// ── Replace modal ────────────────────────────────────────────────────────────
document.querySelectorAll('.btn-replace').forEach(btn => {
    btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const name = btn.dataset.name;
        document.getElementById('replaceTemplateId').value = id;
        document.getElementById('modalTemplateName').textContent = name + '  (' + id + ')';
        document.getElementById('replaceDropTitle').textContent  = 'Drop new ZIP here, or click to browse';
        document.getElementById('replaceBtn').innerHTML = '🔄 Replace & Rebuild';
        document.getElementById('replaceBtn').disabled  = false;
        // Reset file input
        document.getElementById('replaceZip').value = '';
        document.getElementById('replaceModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

function closeReplaceModal() {
    document.getElementById('replaceModal').style.display = 'none';
    document.body.style.overflow = '';
}

// Close on backdrop click
document.getElementById('replaceModal').addEventListener('click', function(e) {
    if (e.target === this) closeReplaceModal();
});

// Replace drop zone
const replaceDropZone = document.getElementById('replaceDropZone');
const replaceZip      = document.getElementById('replaceZip');

replaceDropZone.addEventListener('dragover', e => { e.preventDefault(); replaceDropZone.classList.add('drag-over'); });
replaceDropZone.addEventListener('dragleave', () => replaceDropZone.classList.remove('drag-over'));
replaceDropZone.addEventListener('drop', e => {
    e.preventDefault();
    replaceDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        replaceZip.files = dt.files;
        onReplaceFileSelected(file.name);
    }
});
replaceZip.addEventListener('change', () => {
    if (replaceZip.files[0]) onReplaceFileSelected(replaceZip.files[0].name);
});
function onReplaceFileSelected(name) {
    document.getElementById('replaceDropTitle').textContent = '📦 ' + name + ' — ready';
}

function confirmReplace() {
    if (!replaceZip.files[0]) { alert('Please select a ZIP file.'); return false; }
    const btn = document.getElementById('replaceBtn');
    btn.innerHTML = '<span class="spinner"></span> Rebuilding… (this takes ~60 s)';
    btn.disabled  = true;
    return true;
}

// ── Upload thumbnail modal ────────────────────────────────────────────────────
document.querySelectorAll('.btn-upload-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const name = btn.dataset.name;
        document.getElementById('uploadThumbTemplateId').value       = id;
        document.getElementById('uploadThumbTemplateName').textContent = name + '  (' + id + ')';
        document.getElementById('uploadThumbDropTitle').textContent   = 'Drop image here, or click to browse';
        document.getElementById('uploadThumbPreviewWrap').style.display = 'none';
        document.getElementById('uploadThumbFile').value  = '';
        document.getElementById('uploadThumbBtn').innerHTML = '💾 Save as Catalog Image';
        document.getElementById('uploadThumbBtn').disabled  = false;
        document.getElementById('uploadThumbModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

document.getElementById('uploadThumbFile').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    document.getElementById('uploadThumbDropTitle').textContent = '🖼️ ' + file.name;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('uploadThumbPreview').src = e.target.result;
        document.getElementById('uploadThumbPreviewWrap').style.display = 'block';
    };
    reader.readAsDataURL(file);
});

const uploadThumbDropZone = document.getElementById('uploadThumbDropZone');
uploadThumbDropZone.addEventListener('dragover', e => { e.preventDefault(); uploadThumbDropZone.classList.add('drag-over'); });
uploadThumbDropZone.addEventListener('dragleave', () => uploadThumbDropZone.classList.remove('drag-over'));
uploadThumbDropZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadThumbDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        document.getElementById('uploadThumbFile').files = dt.files;
        document.getElementById('uploadThumbFile').dispatchEvent(new Event('change'));
    }
});

function closeUploadThumbModal() {
    document.getElementById('uploadThumbModal').style.display = 'none';
    document.body.style.overflow = '';
}
document.getElementById('uploadThumbModal').addEventListener('click', function(e) {
    if (e.target === this) closeUploadThumbModal();
});
function confirmUploadThumb() {
    if (!document.getElementById('uploadThumbFile').files[0]) {
        alert('Please select an image first.');
        return false;
    }
    const btn = document.getElementById('uploadThumbBtn');
    btn.innerHTML = '<span class="spinner"></span> Saving…';
    btn.disabled  = true;
    return true;
}

// ── Edit modal ────────────────────────────────────────────────────────────────
const _tplData = <?php echo json_encode($all_templates, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;

function syncPicker(pickerId, hex) {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        document.getElementById(pickerId).value = hex;
    }
}

document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const t  = _tplData[id];
        if (!t) return;
        document.getElementById('editTemplateId').value        = id;
        document.getElementById('editTemplateName').textContent = t.name + '  (' + id + ')';
        document.getElementById('editName').value              = t.name        || '';
        document.getElementById('editCategory').value          = t.category    || 'Hair Salon';
        document.getElementById('editStyle').value             = t.style       || '';
        document.getElementById('editBadge').value             = t.badge       || '';
        document.getElementById('editDesc').value              = t.desc        || '';
        document.getElementById('editFeatures').value          = (t.features || []).join(', ');
        document.getElementById('editHeroTagline').value       = t.hero_tagline || '';
        document.getElementById('editHeroSub').value           = t.hero_sub     || '';
        document.getElementById('editBusinessName').value      = t.business_name || '';
        // Colors
        const accent = t.accent || '#a855f7';
        const dark   = t.dark   || '#0a0b15';
        const light  = t.light  || '#1c1d27';
        document.getElementById('editAccent').value       = accent;
        document.getElementById('editAccentPicker').value = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#a855f7';
        document.getElementById('editDark').value         = dark;
        document.getElementById('editDarkPicker').value   = /^#[0-9a-fA-F]{6}$/.test(dark)   ? dark   : '#0a0b15';
        document.getElementById('editLight').value        = light;
        document.getElementById('editLightPicker').value  = /^#[0-9a-fA-F]{6}$/.test(light)  ? light  : '#1c1d27';
        // Reset button
        document.getElementById('editSaveBtn').innerHTML = '💾 Save Changes';
        document.getElementById('editSaveBtn').disabled  = false;
        document.getElementById('editModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.body.style.overflow = '';
}
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
});
function confirmEdit() {
    const btn = document.getElementById('editSaveBtn');
    btn.innerHTML = '<span class="spinner"></span> Saving…';
    btn.disabled  = true;
    return true;
}

// ── Duplicate modal ───────────────────────────────────────────────────────────
const _existingIds = <?php echo json_encode(array_keys($all_templates)); ?>;

document.querySelectorAll('.btn-duplicate').forEach(btn => {
    btn.addEventListener('click', () => {
        const id       = btn.dataset.id;
        const name     = btn.dataset.name;
        const type     = btn.dataset.type;
        const category = btn.dataset.category;
        document.getElementById('dupeSourceId').value   = id;
        document.getElementById('dupeSourceType').value = type;
        document.getElementById('dupeSourceName').textContent = name + '  (' + id + ')';
        document.getElementById('dupeDesc').textContent = type === 'react'
            ? 'Creates a new catalog entry and copies the built site files — ready to preview instantly. Source ZIP is not copied.'
            : 'Creates a new catalog entry. PHP template files are shared; update the new entry\'s name, colors, and description as needed.';
        document.getElementById('dupeNewId').value   = '';
        document.getElementById('dupeNewName').value = '';
        document.getElementById('dupeIdHint').textContent = '';
        document.getElementById('dupeNewId').style.borderColor = '';
        document.getElementById('dupeBtn').innerHTML = '⧉ Duplicate';
        document.getElementById('dupeBtn').disabled  = false;
        document.getElementById('duplicateModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('dupeNewId').focus(), 80);
    });
});

document.getElementById('dupeNewId').addEventListener('input', function() {
    const val      = this.value.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
    this.value     = val;
    const taken    = _existingIds.includes(val);
    const empty    = val === '';
    const hint     = document.getElementById('dupeIdHint');
    if (empty) {
        hint.textContent = '';
        this.style.borderColor = '';
    } else if (taken) {
        hint.textContent = 'This ID is already in use — choose a different one.';
        hint.style.color = 'rgba(248,113,113,0.8)';
        this.style.borderColor = 'rgba(248,113,113,0.4)';
    } else {
        hint.textContent = '✓ Available';
        hint.style.color = 'rgba(52,211,153,0.8)';
        this.style.borderColor = 'rgba(52,211,153,0.4)';
    }
});

function closeDuplicateModal() {
    document.getElementById('duplicateModal').style.display = 'none';
    document.body.style.overflow = '';
}
document.getElementById('duplicateModal').addEventListener('click', function(e) {
    if (e.target === this) closeDuplicateModal();
});
function confirmDuplicate() {
    const newId = document.getElementById('dupeNewId').value.trim();
    if (!newId) { alert('Please enter a new template ID.'); return false; }
    if (_existingIds.includes(newId)) { alert('That ID is already in use.'); return false; }
    const btn = document.getElementById('dupeBtn');
    btn.innerHTML = '<span class="spinner"></span> Duplicating…';
    btn.disabled  = true;
    return true;
}

// Close modals on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeReplaceModal();
        closeDeleteModal();
        closeUploadThumbModal();
        closeDuplicateModal();
        closeEditModal();
        closeMediaLibModal();
    }
});

// ── Image Library Modal ───────────────────────────────────────────────────────
let _mediaLibLoaded = false;

function openMediaLibModal() {
    document.getElementById('mediaLibModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (!_mediaLibLoaded) loadMediaLib();
}
function closeMediaLibModal() {
    document.getElementById('mediaLibModal').style.display = 'none';
    document.body.style.overflow = '';
}
document.getElementById('mediaLibModal').addEventListener('click', function(e) {
    if (e.target === this) closeMediaLibModal();
});

async function loadMediaLib(force = false) {
    const container = document.getElementById('mediaLibContent');
    container.innerHTML = '<div class="media-lib-loading">Loading…</div>';
    try {
        const res = await fetch('<?php echo BASE_PATH; ?>/admin-media-library.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        container.innerHTML = await res.text();
        _mediaLibLoaded = !force;
        initMediaLib(container);
    } catch (err) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:30px;text-align:center;">Could not load library — ' + err.message + '</p>';
    }
}

function initMediaLib(root) {
    // Tab switching
    root.querySelectorAll('.media-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            root.querySelectorAll('.media-tab').forEach(t => t.classList.remove('media-tab--active'));
            root.querySelectorAll('.media-panel').forEach(p => p.classList.remove('media-panel--active'));
            tab.classList.add('media-tab--active');
            const panel = root.querySelector('#mpanel-' + tab.dataset.slug);
            if (panel) panel.classList.add('media-panel--active');
        });
    });

    // Upload
    root.querySelectorAll('.media-upload-input').forEach(input => {
        input.addEventListener('change', async () => {
            if (!input.files[0]) return;
            const slug   = input.dataset.slug;
            const status = root.querySelector('#mupload-status-' + slug);
            status.textContent = 'Uploading…';
            status.style.color = 'rgba(255,255,255,0.5)';
            const fd = new FormData();
            fd.append('slug', slug);
            fd.append('image', input.files[0]);
            try {
                const res  = await fetch('<?php echo BASE_PATH; ?>/admin-media-upload.php', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.ok) {
                    status.textContent = '✓ Uploaded';
                    status.style.color = '#4ade80';
                    const name = data.file.replace(/\.[^.]+$/, '');
                    let grid   = root.querySelector('#mgrid-' + slug);
                    if (!grid) {
                        // Was empty — reload the whole panel
                        loadMediaLib(true);
                        return;
                    }
                    const card = document.createElement('div');
                    card.className = 'media-card';
                    card.dataset.file = data.file;
                    card.dataset.slug = slug;
                    card.innerHTML = `<div class="media-card__img" style="background-image:url('${data.url}')"></div>
                        <div class="media-card__footer">
                            <span class="media-card__name">${name}</span>
                            <button class="media-card__del btn-media-del"
                                    data-file="${data.file}" data-slug="${slug}" title="Delete image">✕</button>
                        </div>`;
                    grid.appendChild(card);
                    attachMediaDelHandler(card.querySelector('.btn-media-del'), root);
                    setTimeout(() => { if (status.textContent === '✓ Uploaded') status.textContent = ''; }, 3000);
                } else {
                    status.textContent = '✗ ' + (data.error || 'Upload failed');
                    status.style.color = '#f87171';
                }
            } catch (err) {
                status.textContent = '✗ Network error';
                status.style.color = '#f87171';
            }
            input.value = '';
        });
    });

    // Delete handlers
    root.querySelectorAll('.btn-media-del').forEach(btn => attachMediaDelHandler(btn, root));
}

function attachMediaDelHandler(btn, root) {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Delete this image from the library? This cannot be undone.')) return;
        const file = btn.dataset.file;
        const slug = btn.dataset.slug;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('slug', slug);
        try {
            const res  = await fetch('<?php echo BASE_PATH; ?>/admin-media-delete.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.ok) {
                btn.closest('.media-card').remove();
                // Update tab count
                const panel = root.querySelector('#mpanel-' + slug);
                const tab   = root.querySelector(`.media-tab[data-slug="${slug}"] .media-tab__count`);
                if (tab) {
                    const remaining = panel ? panel.querySelectorAll('.media-card').length : 0;
                    tab.textContent = remaining;
                }
            } else {
                alert('Delete failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Network error — please try again.');
        }
    });
}

// ── Inline name edit ──────────────────────────────────────────────────────────
function cancelInlineEdit(cell) {
    cell.querySelector('.tpl-name-text').style.display = '';
    cell.querySelector('.tpl-name-edit-btn').style.display = '';
    cell.querySelector('.tpl-name-editing').style.display = 'none';
}

document.querySelectorAll('.tpl-name-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cell = btn.closest('.tbl-name');
        cell.querySelector('.tpl-name-text').style.display = 'none';
        btn.style.display = 'none';
        const editing = cell.querySelector('.tpl-name-editing');
        editing.style.display = 'inline-flex';
        editing.querySelector('.tpl-name-input').select();
    });
});

document.querySelectorAll('.tpl-name-cancel').forEach(btn => {
    btn.addEventListener('click', () => cancelInlineEdit(btn.closest('.tbl-name')));
});

document.querySelectorAll('.tpl-name-save').forEach(btn => {
    btn.addEventListener('click', async () => {
        const cell    = btn.closest('.tbl-name');
        const id      = cell.dataset.id;
        const input   = cell.querySelector('.tpl-name-input');
        const newName = input.value.trim();
        if (!newName) { input.focus(); return; }

        const origText = btn.textContent;
        btn.textContent = '…';
        btn.disabled    = true;

        try {
            const fd = new FormData();
            fd.append('template_id', id);
            fd.append('name', newName);
            const res  = await fetch('<?php echo BASE_PATH; ?>/admin-rename.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.ok) {
                cell.querySelector('.tpl-name-text').textContent = newName;
                if (_tplData[id]) _tplData[id].name = newName;
                cancelInlineEdit(cell);
            } else {
                alert('Error: ' + (data.error || 'Could not rename.'));
                btn.textContent = origText;
                btn.disabled    = false;
            }
        } catch (err) {
            alert('Network error — please try again.');
            btn.textContent = origText;
            btn.disabled    = false;
        }
    });
});

document.querySelectorAll('.tpl-name-input').forEach(input => {
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.closest('.tbl-name').querySelector('.tpl-name-save').click();
        }
        if (e.key === 'Escape') {
            cancelInlineEdit(input.closest('.tbl-name'));
        }
    });
});
</script>
<?php endif; ?>
</body>
</html>
