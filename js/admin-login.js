/* admin-login.js */
document.addEventListener('DOMContentLoaded', function() {
  var existing = DB.getSession();
  if (existing && existing.role === 'admin') { window.location.href='admin.php'; return; }

  var emailEl   = document.getElementById('adminLoginEmail');
  var passEl    = document.getElementById('adminLoginPassword');
  var submitBtn = document.getElementById('adminLoginSubmit');
  var msgEl     = document.getElementById('adminLoginMsg');

  if (submitBtn) submitBtn.addEventListener('click', doAdminLogin);
  if (emailEl)   emailEl.addEventListener('keydown', function(e){ if(e.key==='Enter') doAdminLogin(); });
  if (passEl)    passEl.addEventListener('keydown',  function(e){ if(e.key==='Enter') doAdminLogin(); });

  function doAdminLogin() {
    var email    = emailEl ? emailEl.value.trim() : '';
    var password = passEl  ? passEl.value.trim()  : '';
    if (!email||!password) { showMsg(msgEl,'Please enter email and password.','error'); return; }
    var result = DB.loginUser(email, password);
    if (!result.ok) { showMsg(msgEl, result.error, 'error'); return; }
    if (result.user.role !== 'admin') {
      DB.logout();
      showMsg(msgEl,'This account does not have admin access.','error');
      return;
    }
    showMsg(msgEl,'Welcome! Redirecting to admin panel…','success');
    setTimeout(function(){ window.location.href='admin.php'; }, 800);
  }

  var toggleBtn = document.getElementById('adminTogglePass');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      if (passEl.type==='password'){ passEl.type='text'; toggleBtn.textContent='🙈'; }
      else { passEl.type='password'; toggleBtn.textContent='👁'; }
    });
  }
});
function showMsg(el,text,type){ if(!el)return; el.textContent=text; el.className='form-msg '+type; el.style.display='block'; }
