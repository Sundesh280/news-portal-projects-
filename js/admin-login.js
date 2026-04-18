/* ============================================================
   admin-login.js — Nepal Khabar Admin Login Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // If already logged in as admin, go directly to admin panel
  const session = DB.getSession();
  if (session && session.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }
  // If logged in as regular user, send them back to homepage
  if (session && session.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const emailEl  = document.getElementById('adminLoginEmail');
  const passEl   = document.getElementById('adminLoginPassword');
  const submitBtn = document.getElementById('adminLoginSubmit');
  const msgEl    = document.getElementById('adminLoginMsg');
  const toggleBtn = document.getElementById('adminTogglePass');

  submitBtn.addEventListener('click', doAdminLogin);
  document.getElementById('adminLoginForm').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doAdminLogin();
  });

  function doAdminLogin() {
    const email    = emailEl.value.trim();
    const password = passEl.value.trim();

    if (!email || !password) {
      showMsg(msgEl, 'Please enter your admin email and password.', 'error');
      return;
    }

    const result = DB.loginUser(email, password);
    if (!result.ok) {
      showMsg(msgEl, 'Invalid credentials. Access denied.', 'error');
      return;
    }

    // Only allow admin role
    if (result.user.role !== 'admin') {
      DB.logout(); // Immediately log them back out
      showMsg(msgEl, 'This account does not have admin privileges.', 'error');
      return;
    }

    showMsg(msgEl, 'Access granted. Redirecting to admin panel…', 'success');
    setTimeout(function () {
      window.location.href = 'admin.html';
    }, 900);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (passEl.type === 'password') {
        passEl.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        passEl.type = 'password';
        toggleBtn.textContent = '👁';
      }
    });
  }
});

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent   = text;
  el.className     = 'form-msg ' + type;
  el.style.display = 'block';
}
