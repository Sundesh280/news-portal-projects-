/* auth.js - Updates the login/logout area in the page header */

// ------------------------------------------------------------------
// updateHeaderAuth - Shows login/register links or user name
// depending on whether someone is logged in
// ------------------------------------------------------------------
function updateHeaderAuth() {
  var session = DB.getSession();

  // Admin session must NEVER show in the regular user header
  var userSession = null;
  if (session && session.role !== "admin") {
    userSession = session; // only use it if it's a normal user
  }

  var loginLink = document.getElementById("headerLogin");
  var regLink   = document.getElementById("headerRegister");
  var userInfo  = document.getElementById("headerUser");
  var userName  = document.getElementById("headerUserName");
  var adminLink = document.getElementById("headerAdmin");
  var logoutBtn = document.getElementById("headerLogout");

  if (userSession) {
    // User is logged in — show their name, hide login/register
    if (loginLink) loginLink.style.display = "none";
    if (regLink)   regLink.style.display   = "none";
    if (userInfo)  userInfo.style.display  = "flex";
    if (userName)  userName.textContent    = userSession.name;
    if (adminLink) adminLink.style.display = "none"; // never show admin link to regular users
  } else {
    // No user is logged in — show login/register links
    if (loginLink) loginLink.style.display = "inline-flex";
    if (regLink)   regLink.style.display   = "inline-flex";
    if (userInfo)  userInfo.style.display  = "none";
    if (adminLink) adminLink.style.display = "none";
  }

  // Logout button — log out and go to home page
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      DB.logout();
      window.location.href = "index.php";
    });
  }
}

// Run updateHeaderAuth as soon as the page is fully loaded
document.addEventListener("DOMContentLoaded", updateHeaderAuth);
