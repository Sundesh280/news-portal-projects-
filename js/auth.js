/* auth.js */
function updateHeaderAuth() {
  var session = DB.getSession();
  // Admin session must NEVER show in the user panel header
  var userSession = session && session.role !== "admin" ? session : null;
  var loginLink = document.getElementById("headerLogin");
  var regLink = document.getElementById("headerRegister");
  var userInfo = document.getElementById("headerUser");
  var userName = document.getElementById("headerUserName");
  var adminLink = document.getElementById("headerAdmin");
  var logoutBtn = document.getElementById("headerLogout");
  if (userSession) {
    if (loginLink) loginLink.style.display = "none";
    if (regLink) regLink.style.display = "none";
    if (userInfo) userInfo.style.display = "flex";
    if (userName) userName.textContent = userSession.name;
    if (adminLink) adminLink.style.display = "none";
  } else {
    if (loginLink) loginLink.style.display = "inline-flex";
    if (regLink) regLink.style.display = "inline-flex";
    if (userInfo) userInfo.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      DB.logout();
      window.location.href = "index.php";
    });
  }
}
document.addEventListener("DOMContentLoaded", updateHeaderAuth);
