<?php
/**
 * login.php — User Sign-In Page
 * ─────────────────────────────
 * Security measures:
 *  • Opens a secure session with HttpOnly + SameSite=Strict cookie flags
 *  • Generates a CSRF token and embeds it as a hidden field in the form
 *  • Redirects already-authenticated users away from this page
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

// If already logged in as a regular user, send them home
if (!empty($_SESSION['user_id']) && ($_SESSION['user_role'] ?? '') !== 'admin') {
    header('Location: ../index.php');
    exit;
}

// Generate (or retrieve) the CSRF token for this session
require_once 'csrf.php';
$csrfToken = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign In — Nepal Khabar</title>
  <meta name="description" content="Sign in to your Nepal Khabar account to comment and engage with the latest news." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="../css/auth.css" />
</head>
<body class="auth-page">
  <header class="site-header">
    <div class="header-inner">
      <a href="../index.php" class="site-logo">Nepal<span>Khabar</span></a>
      <div class="header-actions">
        <a href="register.php" class="btn-header btn-header-red">Register</a>
      </div>
    </div>
  </header>

  <main class="auth-main">
    <div class="auth-card" id="loginForm">
      <h1 class="auth-title">Welcome Back</h1>
      <p class="auth-subtitle">Sign in to your Nepal Khabar account</p>

      <!--
        CSRF hidden field — the token value is written server-side (PHP).
        The JavaScript layer reads this value and sends it in the
        X-CSRF-Token request header with every POST call.
      -->
      <input type="hidden" id="csrf_token" name="csrf_token"
             value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">

      <div class="form-group">
        <label for="loginEmail">Email Address</label>
        <input type="email" id="loginEmail" placeholder="you@example.com" autocomplete="email" />
      </div>

      <div class="form-group">
        <label for="loginPassword">Password</label>
        <div class="pass-wrap">
          <input type="password" id="loginPassword" placeholder="Enter your password" autocomplete="current-password" />
          <button type="button" class="toggle-pass" id="togglePass" title="Show/hide password">👁</button>
        </div>
      </div>

      <button class="btn-auth-submit" id="loginSubmit">Sign In</button>
      <div id="loginMsg" class="form-msg"></div>

      <p class="auth-alt-link">Don't have an account? <a href="register.php">Register here</a></p>
      <p class="auth-alt-link" style="margin-top:8px;"><a href="../index.php">← Back to News</a></p>
    </div>
  </main>

  <footer class="site-footer">
    <p>© 2026 <strong>Nepal Khabar</strong> · नेपाल खबर</p>
  </footer>

  <!-- Set base path to empty so data.js finds php/users.php correctly -->
  <script>window.__NK_BASE = '';</script>
  <script src="../js/data.js"></script>
  <script src="../js/login.js"></script>
</body>
</html>