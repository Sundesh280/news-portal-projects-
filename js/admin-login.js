/** admin-login.js - Admin Login Page */
var adminEmailEl = null;
var adminPassEl  = null;
var adminMsgEl   = null;

// Runs when the admin login page is fully loaded
document.addEventListener("DOMContentLoaded", function () {

  // Clear cached admin session
  sessionStorage.removeItem("nk__admin_session");

  adminEmailEl = document.getElementById("adminLoginEmail");
  adminPassEl  = document.getElementById("adminLoginPassword");
  adminMsgEl   = document.getElementById("adminLoginMsg");

  var submitBtn = document.getElementById("adminLoginSubmit");

  // Button click logs in
  if (submitBtn) {
    submitBtn.addEventListener("click", doAdminLogin);
  }

  // Enter key in email field also submits
  if (adminEmailEl) {
    adminEmailEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        doAdminLogin();
      }
    });
  }

  // Enter key in password field also submits
  if (adminPassEl) {
    adminPassEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        doAdminLogin();
      }
    });
  }

  // Show / hide password toggle
  var toggleBtn = document.getElementById("adminTogglePass");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (adminPassEl.type === "password") {
        adminPassEl.type      = "text";
        toggleBtn.textContent = "🙈";
      } else {
        adminPassEl.type      = "password";
        toggleBtn.textContent = "👁";
      }
    });
  }
});

// Reads the form and tries to log in as admin
function doAdminLogin() {
  var email    = adminEmailEl ? adminEmailEl.value.trim() : "";
  var password = adminPassEl  ? adminPassEl.value.trim()  : "";

  // Both fields are required
  if (!email || !password) {
    showMsg(adminMsgEl, "Please enter email and password.", "error");
    return;
  }

  // Try to login using the DB helper
  var result = DB.loginUser(email, password);

  if (!result.ok) {
    showMsg(adminMsgEl, result.error, "error");
    return;
  }

  // Only admin accounts are allowed here
  if (result.user.role !== "admin") {
    DB.logout(); // undo the login
    showMsg(adminMsgEl, "This account does not have admin access.", "error");
    return;
  }

  // Save admin session separately so it never mixes with the regular user session
  sessionStorage.setItem("nk__admin_session", JSON.stringify(result.user));

  // Success - go to admin panel
  showMsg(adminMsgEl, "Welcome! Redirecting to admin panel...", "success");
  setTimeout(function () {
    window.location.href = "../admin.php"; // go up from php/ to root
  }, 800);
}

// Shows a message below the form (error = red, success = green)
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent   = text;
  el.className     = "form-msg " + type;
  el.style.display = "block";
}
