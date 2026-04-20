/* login.js */
document.addEventListener('DOMContentLoaded', function() {
  var existing = DB.getSession();
  // Only redirect if already logged in as a regular user — admin session must NOT take over user login page
  if (existing && existing.role !== 'admin') {
    window.location.href = 'index.php';
    return;
  }
  var form      = document.getElementById('loginForm');
  var msgEl     = document.getElementById('loginMsg');
  var emailEl   = document.getElementById('loginEmail');
  var passEl    = document.getElementById('loginPassword');
  var submitBtn = document.getElementById('loginSubmit');

  if (submitBtn) submitBtn.addEventListener('click', doLogin);
  if (form) form.addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });

  function doLogin() {
    var email    = emailEl  ? emailEl.value.trim()  : '';
    var password = passEl   ? passEl.value.trim()   : '';
    if (!email || !password) { showMsg(msgEl,'Please enter email and password.','error'); return; }
    var result = DB.loginUser(email, password);
    if (!result.ok) { showMsg(msgEl, result.error, 'error'); return; }
    if (result.user.role === 'admin') {
      showMsg(msgEl,'Admin accounts must use the Admin Login page.','error');
      DB.logout();
      setTimeout(function(){ window.location.href='admin-login.php'; }, 1500);
      return;
    }
    showMsg(msgEl,'Login successful! Redirecting…','success');
    setTimeout(function(){ window.location.href='index.php'; }, 900);
  }

  var toggleBtn = document.getElementById('togglePass');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      if (passEl.type==='password'){ passEl.type='text'; toggleBtn.textContent='🙈'; }
      else { passEl.type='password'; toggleBtn.textContent='👁'; }
    });
  }
});

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text; el.className = 'form-msg '+type; el.style.display='block';
}
