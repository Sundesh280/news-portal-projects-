<?php
session_name('nk_user');
session_start();
// If already logged in as a regular user, redirect to home
if (!empty($_SESSION['user_id']) && $_SESSION['user_role'] !== 'admin') {
    header('Location: ../index.php');
    exit;
}
?>
<!-- Login Form -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign In — Nepal Khabar</title>
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
  <!-- Without this, data.js would look for php/php/users.php (wrong!) -->
  <script>window.__NK_BASE = '';</script>
  <script src="../js/data.js"></script>
  <script src="../js/login.js"></script>
</body>
</html>