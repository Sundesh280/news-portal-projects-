/* login.js - Handles the user login form */

var loginMsgEl   = null;
var loginEmailEl = null;
var loginPassEl  = null;

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
    showMsg(loginMsgEl, "Please enter email and password.", "error");
    return;
  }

  var result = DB.loginUser(email, password);

  if (!result.ok) {
    showMsg(loginMsgEl, result.error, "error");
    return;
  }

  // Admin accounts must use the admin login page
  if (result.user.role === "admin") {
    showMsg(loginMsgEl, "Admin accounts must use the Admin Login page.", "error");
    DB.logout();
    setTimeout(function () {
      window.location.href = "admin-login.php"; // same php/ folder
    }, 1500);
    return;
  }

  // Success - go to home page
  showMsg(loginMsgEl, "Login successful! Redirecting...", "success");
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