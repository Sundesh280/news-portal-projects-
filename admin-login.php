<?php
session_name('nk_admin');
session_start();
// If already logged in as admin, go directly to admin panel
if (!empty($_SESSION['user_id']) && $_SESSION['user_role'] === 'admin') {
    header('Location: admin.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login — Nepal Khabar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/auth.css" />
  <link rel="stylesheet" href="css/admin-login.css" />
</head>
<body class="auth-page">

  <header class="site-header">
    <div class="header-inner">
      <a href="index.php" class="site-logo">Nepal<span>Khabar</span></a>
      <div class="header-actions">
        <a href="index.php" class="btn-header btn-header-outline">← Back to Site</a>
      </div>
    </div>
  </header>

  <main class="auth-main">
    <div class="auth-card admin-card" id="adminLoginForm">
      <span class="admin-login-badge">Admin Access</span>
      <h1 class="auth-title">Admin Panel Login</h1>
      <p class="auth-subtitle">Restricted area — authorised personnel only</p>

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

  <script src="js/data.js"></script>
  <script src="js/admin-login.js"></script>
</body>
</html>