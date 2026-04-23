<?php
session_name('nk_user');
session_start();
// If already logged in, redirect to home
if (!empty($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}
?>
<!-- Register Form -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Register — Nepal Khabar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/auth.css" />
</head>
<body class="auth-page">

  <header class="site-header">
    <div class="header-inner">
      <a href="index.php" class="site-logo">Nepal<span>Khabar</span></a>
      <div class="header-actions">
        <a href="login.php" class="btn-header btn-header-outline">Sign In</a>
      </div>
    </div>
  </header>

  <main class="auth-main">
    <div class="auth-card">
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Join Nepal Khabar to comment and engage</p>

      <div class="form-group">
        <label for="regName">Full Name</label>
        <input type="text" id="regName" placeholder="Your name" autocomplete="name" />
      </div>

      <div class="form-group">
        <label for="regEmail">Email Address</label>
        <input type="email" id="regEmail" placeholder="you@example.com" autocomplete="email" />
      </div>

      <div class="form-group">
        <label for="regPassword">Password</label>
        <div class="pass-wrap">
          <input type="password" id="regPassword" placeholder="At least 6 characters" autocomplete="new-password" />
          <button type="button" class="toggle-pass" id="togglePass" title="Show/hide password">👁</button>
        </div>
      </div>

      <div class="form-group">
        <label for="regPassword2">Confirm Password</label>
        <input type="password" id="regPassword2" placeholder="Repeat your password" autocomplete="new-password" />
      </div>

      <button class="btn-auth-submit" id="registerSubmit">Create Account</button>

      <div id="registerMsg" class="form-msg"></div>

      <p class="auth-alt-link">Already have an account? <a href="login.php">Sign in</a></p>
      <p class="auth-alt-link" style="margin-top:8px;"><a href="index.php">← Back to News</a></p>
    </div>
  </main>

  <footer class="site-footer">
    <p>© 2026 <strong>Nepal Khabar</strong> · नेपाल खबर</p>
  </footer>

  <script src="js/data.js"></script>
  <script src="js/register.js"></script>
</body>
</html>