/* register.js - Handles the user registration form */

var regMsgEl   = null;
var regNameEl  = null;
var regEmailEl = null;
var regPassEl  = null;
var regPass2El = null;

// Runs when the registration page is fully loaded
document.addEventListener("DOMContentLoaded", function () {

  // If already logged in, go to home
  if (DB.getSession()) {
    window.location.href = "index.php";
    return;
  }

  regMsgEl   = document.getElementById("registerMsg");
  regNameEl  = document.getElementById("regName");
  regEmailEl = document.getElementById("regEmail");
  regPassEl  = document.getElementById("regPassword");
  regPass2El = document.getElementById("regPassword2");

  var submitBtn = document.getElementById("registerSubmit");
  if (submitBtn) {
    submitBtn.addEventListener("click", doRegister);
  }

  // Show / hide password
  var toggleBtn = document.getElementById("togglePass");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (regPassEl.type === "password") {
        regPassEl.type        = "text";
        toggleBtn.textContent = "🙈";
      } else {
        regPassEl.type        = "password";
        toggleBtn.textContent = "👁";
      }
    });
  }
});

// Validates the form and creates a new user account
function doRegister() {
  var name     = regNameEl  ? regNameEl.value.trim()  : "";
  var email    = regEmailEl ? regEmailEl.value.trim()  : "";
  var password = regPassEl  ? regPassEl.value.trim()   : "";
  var pass2    = regPass2El ? regPass2El.value.trim()  : "";

  // All fields must be filled
  if (!name || !email || !password || !pass2) {
    showMsg(regMsgEl, "Please fill in all fields.", "error");
    return;
  }

  // Both passwords must match
  if (password !== pass2) {
    showMsg(regMsgEl, "Passwords do not match.", "error");
    return;
  }

  // Password must be at least 6 characters
  if (password.length < 6) {
    showMsg(regMsgEl, "Password must be at least 6 characters.", "error");
    return;
  }

  // Basic email format check (must contain @ and a dot after it)
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMsg(regMsgEl, "Please enter a valid email address.", "error");
    return;
  }

  // Try to create the account
  var result = DB.registerUser(name, email, password);
  if (!result.ok) {
    showMsg(regMsgEl, result.error, "error");
    return;
  }

  // Auto-login after registration and go to home
  DB.loginUser(email, password);
  showMsg(regMsgEl, "Account created!", "success");
  setTimeout(function () {
    window.location.href = "../index.php"; // go up from php/ folder to root
  }, 1000);
}

// Shows a message below the form (error = red, success = green)
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent   = text;
  el.className     = "form-msg " + type;
  el.style.display = "block";
}