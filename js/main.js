/* main.js - Nepal Khabar News Portal */

// List of all categories
var CATEGORIES = ["general", "business", "technology", "science", "health", "sports", "entertainment"];

// Display name for each category
var CAT_LABELS = {
  general: "Top Stories",
  business: "Business",
  technology: "Technology",
  science: "Science",
  health: "Health",
  sports: "Sports",
  entertainment: "Entertainment"
};

// Which category is currently selected
var currentCat = "general";

// ------------------------------------------------------------------
// escHtml - Makes text safe to put inside HTML (prevents XSS)
// ------------------------------------------------------------------
function escHtml(text) {
  if (!text) return "";
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  text = text.replace(/"/g, "&quot;");
  return text;
}

// ------------------------------------------------------------------
// getStoppedIds - Returns an array of article IDs that are stopped
// ------------------------------------------------------------------
function getStoppedIds() {
  var allArticles = DB.getArticles();
  var stoppedIds = [];
  for (var i = 0; i < allArticles.length; i++) {
    if (allArticles[i].isStopped) {
      stoppedIds.push(allArticles[i].id);
    }
  }
  return stoppedIds;
}

// ------------------------------------------------------------------
// applyTickerState - Updates the breaking news ticker bar
// ------------------------------------------------------------------
function applyTickerState() {
  var tickerData = DB.getTickerHeadlines();
  var allStopped = tickerData.allStopped;
  var headlines = tickerData.headlines;

  if (!headlines) {
    headlines = [];
  }

  var ticker = document.querySelector(".ticker-bar");
  if (!ticker) return; // No ticker on this page, stop here

  var label = ticker.querySelector(".ticker-label");

  // Build list of active headlines
  var activeHeadlines = [];
  if (!allStopped) {
    for (var i = 0; i < headlines.length; i++) {
      if (headlines[i].active) {
        activeHeadlines.push(headlines[i]);
      }
    }
  }

  // Build the HTML for ticker items
  var tickerTrack = document.getElementById("tickerTrack");
  if (tickerTrack) {
    var items = "";

    if (activeHeadlines.length > 0) {
      for (var j = 0; j < activeHeadlines.length; j++) {
        // Make text safe before putting in HTML
        var safeText = activeHeadlines[j].text;
        safeText = safeText.replace(/&/g, "&amp;");
        safeText = safeText.replace(/</g, "&lt;");
        safeText = safeText.replace(/>/g, "&gt;");
        items += '<span class="ticker-item">' + safeText + '</span>';
      }
    } else {
      items = '<span class="ticker-item">— No active breaking news —</span>';
    }

    tickerTrack.innerHTML = items;

    // Set animation speed based on content width
    var duration = tickerTrack.scrollWidth / 2 / 80;
    tickerTrack.style.animationDuration = duration + "s";
  }

  // Show paused or active icon
  if (allStopped || activeHeadlines.length === 0) {
    ticker.classList.add("ticker-paused");
    if (label) label.textContent = "⏹ Breaking";
  } else {
    ticker.classList.remove("ticker-paused");
    if (label) label.textContent = "🔴 Breaking";
  }
}

// ------------------------------------------------------------------
// Page load - runs when the full HTML page is ready
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  applyTickerState();
  buildCategoryNav();
  renderArticles(currentCat);
  buildSidebar();

  // Show today's date in the top bar
  var dateEl = document.getElementById("topBarDate");
  if (dateEl) {
    var today = new Date();
    dateEl.textContent = today.toLocaleDateString("en-NP", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  // Check if a user is logged in
  var session = DB.getSession();
  var userSession = null;

  // Admin sessions should never show in the user top bar
  if (session && session.role !== "admin") {
    userSession = session;
  }

  var loginLink = document.getElementById("topBarLogin");
  var regLink = document.getElementById("topBarRegister");
  var userInfo = document.getElementById("topBarUserInfo");
  var userName = document.getElementById("topBarUserName");
  var logoutBtn = document.getElementById("topBarLogout");

  if (userSession) {
    // User is logged in — hide login/register, show name
    if (loginLink) loginLink.style.display = "none";
    if (regLink) regLink.style.display = "none";
    if (userInfo) userInfo.style.display = "inline";
    if (userName) userName.textContent = userSession.name;
  } else {
    // No user logged in — show login/register links
    if (loginLink) loginLink.style.display = "inline-flex";
    if (regLink) regLink.style.display = "inline-flex";
    if (userInfo) userInfo.style.display = "none";
  }

  // Logout button click handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      DB.logout();
      window.location.reload();
    });
  }

  // Search input handler - re-renders articles when user types
  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      // If user starts searching while in article view, switch back to home
      var articleView = document.getElementById("articleView");
      var homeView = document.getElementById("homeView");
      if (articleView && articleView.style.display !== "none") {
        articleView.style.display = "none";
        if (homeView) homeView.style.display = "";
      }

      // Re-render articles based on the new search word
      renderArticles(currentCat);
    });
  }
});

// ------------------------------------------------------------------
// buildCategoryNav - Creates the category buttons in the navigation bar
// ------------------------------------------------------------------
function buildCategoryNav() {
  var nav = document.getElementById("categoryNav");
  if (!nav) return;
  nav.innerHTML = ""; // Clear old buttons

  for (var i = 0; i < CATEGORIES.length; i++) {
    var cat = CATEGORIES[i];

    // Create a button for this category
    var btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS[cat];

    // Mark the currently active category
    if (cat === currentCat) {
      btn.className = "nav-btn active";
    }

    // Use a self-calling function to capture the correct value of 'cat'
    btn.addEventListener("click", makeCatClickHandler(cat, btn));

    nav.appendChild(btn);
  }
}

// Helper: creates a click handler for each category button
// (This pattern is needed so each button remembers its own 'cat' value)
function makeCatClickHandler(cat, btn) {
  return function () {
    currentCat = cat;

    // Remove 'active' class from all buttons
    var allBtns = document.querySelectorAll(".nav-btn");
    for (var i = 0; i < allBtns.length; i++) {
      allBtns[i].classList.remove("active");
    }

    // Mark this button as active
    btn.classList.add("active");

    // Update section heading text
    var heading = document.getElementById("sectionHeading");
    if (heading) heading.textContent = CAT_LABELS[cat];

    // If user is reading an article, go back to the home view first
    var articleView = document.getElementById("articleView");
    var homeView = document.getElementById("homeView");
    if (articleView && articleView.style.display !== "none") {
      articleView.style.display = "none";
      if (homeView) homeView.style.display = "";
    }

    renderArticles(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

// ------------------------------------------------------------------
// renderArticles - Shows articles for the selected category
// ------------------------------------------------------------------
function renderArticles(cat) {
  var heroContainer = document.getElementById("heroContainer");
  var grid = document.getElementById("newsGrid");
  if (!grid) return;

  var stopped = getStoppedIds();
  var allArticles = DB.getArticles();

  // Step 1: filter by category
  var filtered = [];
  for (var i = 0; i < allArticles.length; i++) {
    var art = allArticles[i];
    // "general" shows ALL articles; other categories show only their own
    if (cat === "general" || art.category === cat) {
      filtered.push(art);
    }
  }

  // Step 1.5: Filter by search word
  var searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value.trim() !== "") {
    var searchWord = searchInput.value.trim().toLowerCase();
    var searchedNews = [];

    // Loop through filtered news and check if title starts with search word
    for (var s = 0; s < filtered.length; s++) {
      var title = filtered[s].titleEn.toLowerCase();
      // If news title contains the search word, keep it
      if (title.includes(searchWord)) {
        searchedNews.push(filtered[s]);
      }
    }
    filtered = searchedNews; // Update filtered list
  }

  // Step 2: remove stopped articles
  var visible = [];
  for (var j = 0; j < filtered.length; j++) {
    var isStop = false;
    for (var k = 0; k < stopped.length; k++) {
      if (stopped[k] === filtered[j].id) {
        isStop = true;
        break;
      }
    }
    if (!isStop) {
      visible.push(filtered[j]);
    }
  }

  // Nothing to show
  if (visible.length === 0) {
    if (heroContainer) heroContainer.innerHTML = "";
    grid.innerHTML = '<p class="empty-msg">No articles in this category yet.</p>';
    return;
  }

  // First article goes in the big hero card
  var featured = visible[0];

  // Build hero card HTML
  var heroHtml = '<div class="hero-card" onclick="openArticle(\'' + featured.id + '\')">'
    + '<div class="hero-img-wrap"><img src="' + featured.image + '" alt=""'
    + ' onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80\'" /></div>'
    + '<div class="hero-body">'
    + '<h2 class="hero-title">' + escHtml(featured.titleEn) + '</h2>'
    + '<p class="hero-summary">' + escHtml(featured.summaryEn) + '</p>'
    + '<div class="hero-labels"><span class="hero-badge">TOP STORIES</span>'
    + '<span class="hero-category-pill">' + CAT_LABELS[featured.category] + '</span></div>'
    + '<div class="hero-meta"><span>👤 ' + escHtml(featured.author) + '</span>'
    + '<span>🕐 ' + featured.date + '</span></div>'
    + '<div class="hero-scroll-hint">↓ Scroll for more stories</div>'
    + '</div></div>';

  if (heroContainer) heroContainer.innerHTML = heroHtml;

  // Remaining articles go in the grid
  var gridHtml = "";
  if (visible.length > 1) {
    gridHtml = '<div class="cards-grid">';
    for (var n = 1; n < visible.length; n++) {
      var a = visible[n];
      gridHtml += '<div class="news-card" onclick="openArticle(\'' + a.id + '\')">'
        + '<div class="card-img-wrap"><img src="' + a.image + '" alt=""'
        + ' onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=60\'" /></div>'
        + '<div class="card-body">'
        + '<span class="cat-badge cat-' + a.category + '">' + CAT_LABELS[a.category] + '</span>'
        + '<h3 class="card-title">' + escHtml(a.titleEn) + '</h3>'
        + '<p class="card-summary">' + escHtml(a.summaryEn) + '</p>'
        + '<div class="meta"><span>✍ ' + escHtml(a.author) + '</span>'
        + '<span>📅 ' + a.date + '</span></div>'
        + '<button class="read-more-btn" onclick="event.stopPropagation();openArticle(\'' + a.id + '\')">Read More →</button>'
        + '</div></div>';
    }
    gridHtml += '</div>';
  }

  grid.innerHTML = gridHtml;
}

// ------------------------------------------------------------------
// buildSidebar - Fills Most Read and Latest sections in the sidebar
// ------------------------------------------------------------------
function buildSidebar() {
  var stopped = getStoppedIds();
  var allArticles = DB.getArticles();

  // Get articles that are not stopped
  var visible = [];
  for (var i = 0; i < allArticles.length; i++) {
    var found = false;
    for (var j = 0; j < stopped.length; j++) {
      if (stopped[j] === allArticles[i].id) {
        found = true;
        break;
      }
    }
    if (!found) {
      visible.push(allArticles[i]);
    }
  }

  // Sort by views (most viewed first) — simple bubble sort idea using .sort
  var byViews = visible.slice(); // copy the array
  byViews.sort(function (a, b) {
    return b.views - a.views; // higher views first
  });

  // Sort by date (newest first)
  var byDate = visible.slice(); // copy the array
  byDate.sort(function (a, b) {
    if (b.date > a.date) return 1;
    return -1;
  });

  // Take only top 5 from each
  var mostRead = [];
  for (var m = 0; m < byViews.length && m < 5; m++) {
    mostRead.push(byViews[m]);
  }

  var latest = [];
  for (var l = 0; l < byDate.length && l < 5; l++) {
    latest.push(byDate[l]);
  }

  buildSidebarList("mostReadList", mostRead, true);
  buildSidebarList("latestList", latest, false);
}

// ------------------------------------------------------------------
// buildSidebarList - Renders a list of articles inside a sidebar section
// ------------------------------------------------------------------
function buildSidebarList(elementId, articles, showRank) {
  var el = document.getElementById(elementId);
  if (!el) return;

  var html = "";
  for (var i = 0; i < articles.length; i++) {
    var art = articles[i];
    html += '<div class="sidebar-article-item" onclick="openArticle(\'' + art.id + '\')">'
      + '<img src="' + art.image + '" alt=""'
      + ' onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=60\'" />';

    if (showRank) {
      html += '<div class="sidebar-rank">' + (i + 1) + '</div>';
    }

    html += '<div class="sidebar-article-item-body">'
      + '<div class="sidebar-article-item-title">' + escHtml(art.titleEn) + '</div>'
      + '<div class="sidebar-article-item-meta">📅 ' + art.date + ' · 👁 ' + art.views + '</div>'
      + '</div></div>';
  }

  el.innerHTML = html;
}