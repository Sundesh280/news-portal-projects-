/* login.js - Handles the user login form */

var loginMsgEl   = null;
var loginEmailEl = null;
var loginPassEl  = null;

function translateLoginPage() {
  var titleEl = document.querySelector('.auth-title');
  var subtitleEl = document.querySelector('.auth-subtitle');
  var labelEmail = document.querySelector('label[for="loginEmail"]');
  var labelPass = document.querySelector('label[for="loginPassword"]');
  var submitBtn = document.getElementById('loginSubmit');
  var altLink = document.querySelector('.auth-alt-link');
  var backLink = document.querySelector('.auth-alt-link + .auth-alt-link a');

  if (titleEl) {
    titleEl.textContent = getItemLabel('Welcome Back', 'फिर्ता स्वागत छ');
  }
  if (subtitleEl) {
    subtitleEl.textContent = getItemLabel('Sign in to your Nepal Khabar account', 'नेपाल खबरमा लगइन गर्नुहोस्');
  }
  if (labelEmail) {
    labelEmail.textContent = getItemLabel('Email Address', 'इमेल ठेगाना');
  }
  if (labelPass) {
    labelPass.textContent = getItemLabel('Password', 'पासवर्ड');
  }
  if (loginEmailEl) {
    loginEmailEl.placeholder = getItemLabel('you@example.com', 'तपाईं@उदाहरण.com');
  }
  if (loginPassEl) {
    loginPassEl.placeholder = getItemLabel('Enter your password', 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्');
  }
  if (submitBtn) {
    submitBtn.textContent = getItemLabel('Sign In', 'लगइन गर्नुहोस्');
  }
  if (altLink) {
    altLink.innerHTML = getItemLabel(
      'Don\'t have an account? <a href="register.php">Register here</a>',
      'खाता छैन? <a href="register.php">यहाँ दर्ता गर्नुहोस्</a>'
    );
  }
  if (backLink) {
    backLink.textContent = getItemLabel('← Back to News', '← समाचारमा फर्कनुहोस्');
  }
  document.title = getItemLabel('Sign In — Nepal Khabar', 'लगइन — नेपाल खबर');
}

var onLanguageChanged = translateLoginPage;

// Runs when the login page is fully loaded
document.addEventListener("DOMContentLoaded", function () {

  // If user is already logged in, send them to home
  var existing = DB.getSession();
  if (existing && existing.role !== "admin") {
    window.location.href = "../index.php"; // go up from php/ to root
    return;
  }

  var form      = document.getElementById("loginForm");
  loginMsgEl    = document.getElementById("loginMsg");
  loginEmailEl  = document.getElementById("loginEmail");
  loginPassEl   = document.getElementById("loginPassword");
  var submitBtn = document.getElementById("loginSubmit");

  translateLoginPage();

  // Button click logs in
  if (submitBtn) {
    submitBtn.addEventListener("click", doLogin);
  }

  // Enter key also logs in
  if (form) {
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        doLogin();
      }
    });
  }

  // Show / hide password
  var toggleBtn = document.getElementById("togglePass");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (loginPassEl.type === "password") {
        loginPassEl.type      = "text";
        toggleBtn.textContent = "🙈";
      } else {
        loginPassEl.type      = "password";
        toggleBtn.textContent = "👁";
      }
    });
  }
});

// Try to log the user in with the entered email and password
function doLogin() {
  var email    = loginEmailEl ? loginEmailEl.value.trim() : "";
  var password = loginPassEl  ? loginPassEl.value.trim()  : "";

  if (!email || !password) {
    showMsg(loginMsgEl, getItemLabel('Please enter email and password.', 'कृपया इमेल र पासवर्ड प्रविष्ट गर्नुहोस्।'), "error");
    return;
  }

  var result = DB.loginUser(email, password);

  if (!result.ok) {
    showMsg(loginMsgEl, result.error, "error");
    return;
  }

  // Admin accounts must use the admin login page
  if (result.user.role === "admin") {
    showMsg(loginMsgEl, getItemLabel('Admin accounts must use the Admin Login page.', 'एडमिन खाताहरूले एडमिन लगइन पृष्ठ प्रयोग गर्नुपर्छ।'), "error");
    DB.logout();
    setTimeout(function () {
      window.location.href = "admin-login.php"; // same php/ folder
    }, 1500);
    return;
  }

  // Success - go to home page
  showMsg(loginMsgEl, getItemLabel('Login successful! Redirecting...', 'लगइन सफल भयो! पुनर्निर्देशन गर्दै...'), "success");
  setTimeout(function () {
    window.location.href = "../index.php"; // go up from php/ to root
  }, 900);
}

// Shows a message below the form (error = red, success = green)
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent   = text;
  el.className     = "form-msg " + type;
  el.style.display = "block";
}