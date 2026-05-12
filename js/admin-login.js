/* admin-login.js - Admin Login Page */

var adminEmailEl = null;
var adminPassEl  = null;
var adminMsgEl   = null;

function translateAdminLoginPage() {
  var titleEl = document.querySelector('.auth-title');
  var subtitleEl = document.querySelector('.auth-subtitle');
  var badgeEl = document.querySelector('.admin-login-badge');
  var labelEmail = document.querySelector('label[for="adminLoginEmail"]');
  var labelPass = document.querySelector('label[for="adminLoginPassword"]');
  var submitBtn = document.getElementById('adminLoginSubmit');
  var backLink = document.querySelector('.back-to-user-login a');
  var siteLink = document.querySelector('.header-actions a');

  if (badgeEl) {
    badgeEl.textContent = getItemLabel('Admin Access', 'प्रशासन पहुँच');
  }
  if (titleEl) {
    titleEl.textContent = getItemLabel('Admin Panel Login', 'एडमिन प्यानल लगइन');
  }
  if (subtitleEl) {
    subtitleEl.textContent = getItemLabel('Restricted area — authorised personnel only', 'प्रतिबन्धित क्षेत्र — केवल अधिकृत कर्मचारीका लागि');
  }
  if (labelEmail) {
    labelEmail.textContent = getItemLabel('Admin Email', 'एडमिन इमेल');
  }
  if (labelPass) {
    labelPass.textContent = getItemLabel('Password', 'पासवर्ड');
  }
  if (adminEmailEl) {
    adminEmailEl.placeholder = getItemLabel('admin@nepalkhabar.com', 'admin@nepalkhabar.com');
  }
  if (adminPassEl) {
    adminPassEl.placeholder = getItemLabel('Enter admin password', 'एडमिन पासवर्ड प्रविष्ट गर्नुहोस्');
  }
  if (submitBtn) {
    submitBtn.textContent = getItemLabel('Sign In to Admin Panel', 'एडमिन प्यानलमा लगइन गर्नुहोस्');
  }
  if (backLink) {
    backLink.textContent = getItemLabel('User login →', 'प्रयोगकर्ता लगइन →');
  }
  if (siteLink) {
    siteLink.textContent = getItemLabel('← Back to Site', '← साइटमा फर्कनुहोस्');
  }
  document.title = getItemLabel('Admin Login — Nepal Khabar', 'एडमिन लगइन — नेपाल खबर');
}

var onLanguageChanged = translateAdminLoginPage;

// Runs when the admin login page is fully loaded
document.addEventListener("DOMContentLoaded", function () {

  // Clear cached admin session
  sessionStorage.removeItem("nk__admin_session");

  adminEmailEl = document.getElementById("adminLoginEmail");
  adminPassEl  = document.getElementById("adminLoginPassword");
  adminMsgEl   = document.getElementById("adminLoginMsg");

  translateAdminLoginPage();

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
    showMsg(adminMsgEl, getItemLabel('Please enter email and password.', 'कृपया इमेल र पासवर्ड प्रविष्ट गर्नुहोस्।'), "error");
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
    showMsg(adminMsgEl, getItemLabel('This account does not have admin access.', 'यस खातालाई प्रशासन पहुँच छैन।'), "error");
    return;
  }

  // Save admin session separately so it never mixes with the regular user session
  sessionStorage.setItem("nk__admin_session", JSON.stringify(result.user));

  // Success - go to admin panel
  showMsg(adminMsgEl, getItemLabel('Welcome! Redirecting to admin panel...', 'स्वागत छ! एडमिन प्यानलमा पुनर्निर्देशन गर्दै...'), "success");
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
