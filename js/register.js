/* register.js - Handles the user registration form */

var regMsgEl   = null;
var regNameEl  = null;
var regEmailEl = null;
var regPassEl  = null;
var regPass2El = null;

function translateRegisterPage() {
  var titleEl = document.querySelector('.auth-title');
  var subtitleEl = document.querySelector('.auth-subtitle');
  var labelName = document.querySelector('label[for="regName"]');
  var labelEmail = document.querySelector('label[for="regEmail"]');
  var labelPass = document.querySelector('label[for="regPassword"]');
  var labelPass2 = document.querySelector('label[for="regPassword2"]');
  var submitBtn = document.getElementById('registerSubmit');
  var altLink = document.querySelector('.auth-alt-link');
  var backLink = document.querySelector('.auth-alt-link + .auth-alt-link a');

  if (titleEl) {
    titleEl.textContent = getItemLabel('Create Account', 'खाता सिर्जना गर्नुहोस्');
  }
  if (subtitleEl) {
    subtitleEl.textContent = getItemLabel('Join Nepal Khabar to comment and engage', 'टिप्पणी गर्न र सहभागिता जनाउन नेपाल खबरमा सामेल हुनुहोस्');
  }
  if (labelName) {
    labelName.textContent = getItemLabel('Full Name', 'पूरा नाम');
  }
  if (labelEmail) {
    labelEmail.textContent = getItemLabel('Email Address', 'इमेल ठेगाना');
  }
  if (labelPass) {
    labelPass.textContent = getItemLabel('Password', 'पासवर्ड');
  }
  if (labelPass2) {
    labelPass2.textContent = getItemLabel('Confirm Password', 'पासवर्ड पुष्टि गर्नुहोस्');
  }
  if (regNameEl) {
    regNameEl.placeholder = getItemLabel('Your name', 'तपाईंको नाम');
  }
  if (regEmailEl) {
    regEmailEl.placeholder = getItemLabel('you@example.com', 'तपाईं@उदाहरण.com');
  }
  if (regPassEl) {
    regPassEl.placeholder = getItemLabel('At least 6 characters', 'कम्तिमा 6 वर्ण');
  }
  if (regPass2El) {
    regPass2El.placeholder = getItemLabel('Repeat your password', 'आफ्नो पासवर्ड दोहोरो गर्नुहोस्');
  }
  if (submitBtn) {
    submitBtn.textContent = getItemLabel('Create Account', 'खाता सिर्जना गर्नुहोस्');
  }
  if (altLink) {
    altLink.innerHTML = getItemLabel(
      'Already have an account? <a href="login.php">Sign in</a>',
      'पहिले नै खाता छ? <a href="login.php">लगइन गर्नुहोस्</a>'
    );
  }
  if (backLink) {
    backLink.textContent = getItemLabel('← Back to News', '← समाचारमा फर्कनुहोस्');
  }
  document.title = getItemLabel('Register — Nepal Khabar', 'दर्ता — नेपाल खबर');
}

var onLanguageChanged = translateRegisterPage;

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

  translateRegisterPage();

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
    showMsg(regMsgEl, getItemLabel('Please fill in all fields.', 'कृपया सबै फिल्ड भर्नुहोस्।'), "error");
    return;
  }

  // Both passwords must match
  if (password !== pass2) {
    showMsg(regMsgEl, getItemLabel('Passwords do not match.', 'पासवर्डहरू मिलेन।'), "error");
    return;
  }

  // Password must be at least 6 characters
  if (password.length < 6) {
    showMsg(regMsgEl, getItemLabel('Password must be at least 6 characters.', 'पासवर्ड कम्तिमा ६ वर्णको हुनुपर्छ।'), "error");
    return;
  }

  // Basic email format check (must contain @ and a dot after it)
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMsg(regMsgEl, getItemLabel('Please enter a valid email address.', 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।'), "error");
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
  showMsg(regMsgEl, getItemLabel('Account created!', 'खाता सिर्जना भयो!'), "success");
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