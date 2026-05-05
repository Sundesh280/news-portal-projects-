<?php
/**
 * admin-login.php — Admin Panel Sign-In Page
 * ──────────────────────────────────────────
 * Security measures:
 *  • Opens the 'nk_user' session (shared CSRF token source) with secure flags
 *  • Generates a CSRF token embedded in the form as a hidden field
 *  • Redirects already-authenticated admins to the admin panel
 *
 * Note: We use 'nk_user' here (not 'nk_admin') because the CSRF token is
 * generated before we know the user's role.  After a successful admin login,
 * users.php?action=login switches to the 'nk_admin' session automatically.
 */

session_name('nk_user');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,   // ← set TRUE on HTTPS/production
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

// If already logged in as admin, go directly to admin panel
// (Check the admin session separately)
session_write_close();
session_name('nk_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

if (!empty($_SESSION['user_id']) && ($_SESSION['user_role'] ?? '') === 'admin') {
    header('Location: ../admin.php');
    exit;
}
session_write_close();

// Re-open nk_user to generate the CSRF token for the form
session_name('nk_user');
session_start();

require_once 'csrf.php';
$csrfToken = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login — Nepal Khabar</title>
  <meta name="description" content="Nepal Khabar admin panel login. Restricted to authorised personnel only." />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="../css/auth.css" />
  <link rel="stylesheet" href="../css/admin-login.css" />
</head>
<body class="auth-page">

  <header class="site-header">
    <div class="header-inner">
      <a href="../index.php" class="site-logo">Nepal<span>Khabar</span></a>
      <div class="header-actions">
        <a href="../index.php" class="btn-header btn-header-outline">← Back to Site</a>
      </div>
    </div>
  </header>

  <main class="auth-main">
    <div class="auth-card admin-card" id="adminLoginForm">
      <span class="admin-login-badge">Admin Access</span>
      <h1 class="auth-title">Admin Panel Login</h1>
      <p class="auth-subtitle">Restricted area — authorised personnel only</p>

      <!--
        CSRF hidden field — the token value is written server-side (PHP).
        The JavaScript layer reads this value and sends it in the
        X-CSRF-Token request header with every POST call.
      -->
      <input type="hidden" id="csrf_token" name="csrf_token"
             value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">

      <div class="form-group">
        <label for="adminLoginEmail">Admin Email</label>
        <input type="email" id="adminLoginEmail" placeholder="admin@nepalkhabar.com" autocomplete="email" />
      </div>

      <div class="form-group">
        <label for="adminLoginPassword">Password</label>
        <div class="pass-wrap">
          <input type="password" id="adminLoginPassword" placeholder="Enter admin password" autocomplete="current-password" />
          <button type="button" class="toggle-pass" id="adminTogglePass" title="Show/hide password">👁</button>
        </div>
      </div>

      <button class="btn-auth-submit" id="adminLoginSubmit">Sign In to Admin Panel</button>

      <div id="adminLoginMsg" class="form-msg"></div>

      <p class="back-to-user-login">
        Not an admin? <a href="login.php">User login →</a>
      </p>
    </div>
  </main>

  <footer class="site-footer">
    <p>© 2026 <strong>Nepal Khabar</strong> · नेपाल खबर</p>
  </footer>

  <!-- Set base path so data.js finds php/users.php correctly -->
  <script>window.__NK_BASE = '';</script>
  <script src="../js/data.js"></script>
  <script src="../js/admin-login.js"></script>
</body>
</html>