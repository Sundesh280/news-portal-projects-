/* register.js */
document.addEventListener("DOMContentLoaded", function () {
  if (DB.getSession()) {
    window.location.href = "index.php";
    return;
  }
  var msgEl = document.getElementById("registerMsg");
  var nameEl = document.getElementById("regName");
  var emailEl = document.getElementById("regEmail");
  var passEl = document.getElementById("regPassword");
  var pass2El = document.getElementById("regPassword2");
  var submitBtn = document.getElementById("registerSubmit");
  if (submitBtn) submitBtn.addEventListener("click", doRegister);

  function doRegister() {
    var name = nameEl ? nameEl.value.trim() : "";
    var email = emailEl ? emailEl.value.trim() : "";
    var password = passEl ? passEl.value.trim() : "";
    var pass2 = pass2El ? pass2El.value.trim() : "";
    if (!name || !email || !password || !pass2) {
      showMsg(msgEl, "Please fill in all fields.", "error");
      return;
    }
    if (password !== pass2) {
      showMsg(msgEl, "Passwords do not match.", "error");
      return;
    }
    if (password.length < 6) {
      showMsg(msgEl, "Password must be at least 6 characters.", "error");
      return;
    }
    var result = DB.registerUser(name, email, password);
    if (!result.ok) {
      showMsg(msgEl, result.error, "error");
      return;
    }
    DB.loginUser(email, password);
    showMsg(msgEl, "Account created! Redirecting…", "success");
    setTimeout(function () {
      window.location.href = "index.php";
    }, 1000);
  }

  var toggleBtn = document.getElementById("togglePass");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (passEl.type === "password") {
        passEl.type = "text";
        toggleBtn.textContent = "🙈";
      } else {
        passEl.type = "password";
        toggleBtn.textContent = "👁";
      }
    });
  }
});
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = "form-msg " + type;
  el.style.display = "block";
}
