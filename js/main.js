/* main.js - Nepal Khabar News Portal */

// ---- Global Variables ----

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

// Which language is currently selected: 'en' or 'np'
var currentLang = localStorage.getItem('nk_lang') || "en";

// ---- Utilities ----
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

// ---- Ticker Logic ----
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
        var safeText = getTickerText(activeHeadlines[j]);
        safeText = safeText.replace(/&/g, "&amp;");
        safeText = safeText.replace(/</g, "&lt;");
        safeText = safeText.replace(/>/g, "&gt;");
        items += '<span class="ticker-item">' + safeText + '</span>';
      }
    } else {
      items = '<span class="ticker-item">' + escHtml(getItemLabel('— No active breaking news —', '— कुनै सक्रिय ब्रेकिंग समाचार छैन —')) + '</span>';
    }

    tickerTrack.innerHTML = items;

    // Set animation speed based on content width
    var duration = tickerTrack.scrollWidth / 2 / 80;
    tickerTrack.style.animationDuration = duration + "s";
  }

  // Show paused or active icon
  if (allStopped || activeHeadlines.length === 0) {
    ticker.classList.add("ticker-paused");
    if (label) label.textContent = getItemLabel('⏹ Breaking', '⏹ ब्रेकिंग');
  } else {
    ticker.classList.remove("ticker-paused");
    if (label) label.textContent = getItemLabel('🔴 Breaking', '🔴 ब्रेकिंग');
  }
}

// ---- Page Load ----
// ------------------------------------------------------------------
// Page load - runs when the full HTML page is ready
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  applyTickerState();
  buildCategoryNav();
  renderArticles(currentCat);
  buildSidebar();
  updateLanguageUI();

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
  updateAuthUI();

  // Language toggle button
  var langToggleBtn = document.getElementById("langToggleBtn");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", function () {
      currentLang = currentLang === "en" ? "np" : "en";
      localStorage.setItem('nk_lang', currentLang);
      updateLanguageUI();
      applyTickerState();
      buildCategoryNav();
      renderArticles(currentCat);
      buildSidebar();
      var articleView = document.getElementById("articleView");
      if (articleView && articleView.style.display !== "none") {
        var currentArticleId = articleView.dataset.currentArticleId;
        if (currentArticleId) {
          openArticle(currentArticleId);
        }
      }
    });
  }

  // Logout button click handler
  var logoutBtn = document.getElementById("topBarLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      DB.logout();
      updateAuthUI(); // Update UI without refresh
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

  // Start real-time polling for new news
  startRealTimeNews();
});

// ---- Auth UI ----
// ------------------------------------------------------------------
// updateAuthUI - Updates the login/register area without page reload
// ------------------------------------------------------------------
function updateAuthUI() {
  var session = DB.getSession();
  var userSession = null;

  if (session && session.role !== "admin") {
    userSession = session;
  }

  var loginLink = document.getElementById("topBarLogin");
  var regLink = document.getElementById("topBarRegister");
  var userInfo = document.getElementById("topBarUserInfo");
  var userName = document.getElementById("topBarUserName");

  if (userSession) {
    if (loginLink) loginLink.style.display = "none";
    if (regLink) regLink.style.display = "none";
    if (userInfo) userInfo.style.display = "inline";
    if (userName) userName.textContent = userSession.name;
  } else {
    if (loginLink) loginLink.style.display = "inline-flex";
    if (regLink) regLink.style.display = "inline-flex";
    if (userInfo) userInfo.style.display = "none";
  }
}

// ------------------------------------------------------------------
// Language helpers
// ------------------------------------------------------------------
function getArticleTitle(art) {
  if (currentLang === "np") {
    return art.title || art.titleEn || "";
  }
  return art.titleEn || art.title || "";
}

function getArticleSummary(art) {
  if (currentLang === "np") {
    return art.summary || art.summaryEn || "";
  }
  return art.summaryEn || art.summary || "";
}

function getArticleBody(art) {
  if (currentLang === "np") {
    return art.content || art.contentEn || getArticleSummary(art);
  }
  return art.contentEn || art.content || getArticleSummary(art);
}

var CAT_LABELS_NP = {
  general: "शीर्ष समाचार",
  business: "व्यापार",
  technology: "प्रविधि",
  science: "विज्ञान",
  health: "स्वास्थ्य",
  sports: "खेलकुद",
  entertainment: "मनोरञ्जन"
};

function getCategoryLabel(cat) {
  return currentLang === "np" ? CAT_LABELS_NP[cat] || cat : CAT_LABELS[cat] || cat;
}

function getItemLabel(labelEn, labelNp) {
  return currentLang === "np" ? labelNp : labelEn;
}

function getTickerText(headline) {
  if (!headline) return "";
  if (currentLang === "np") {
    return headline.textNp || headline.text || "";
  }
  return headline.text || headline.textNp || "";
}

// ------------------------------------------------------------------
// updateLanguageUI - Change UI text and button label for selected language
// ------------------------------------------------------------------
function updateLanguageUI() {
  var toggle = document.getElementById("langToggleBtn");
  var tagline = document.getElementById("siteTagline");
  var sectionHeading = document.getElementById("sectionHeading");
  var footerHome = document.getElementById("footerHome");
  var footerLogin = document.getElementById("footerLogin");
  var footerRegister = document.getElementById("footerRegister");
  var topBarLogin = document.getElementById("topBarLogin");
  var topBarRegister = document.getElementById("topBarRegister");
  var topBarLogout = document.getElementById("topBarLogout");
  var searchInput = document.getElementById("searchInput");
  var mostReadTitle = document.getElementById("mostReadTitle");
  var latestTitle = document.getElementById("latestTitle");
  var tickerLabel = document.querySelector(".ticker-label");
  var shareLabel = document.getElementById("shareLabel");
  var commentsTitle = document.getElementById("commentsTitle");
  var commentFormTitle = document.getElementById("commentFormTitle");
  var commentText = document.getElementById("commentText");
  var commentLockedText = document.getElementById("commentLockedText");
  var commentLockedLogin = document.getElementById("commentLockedLogin");
  var commentLockedOr = document.getElementById("commentLockedOr");
  var commentLockedRegister = document.getElementById("commentLockedRegister");
  var commentLockedEnd = document.getElementById("commentLockedEnd");
  var commentSubmit = document.getElementById("commentSubmit");
  var backToHome = document.getElementById("backToHome");

  if (currentLang === "np") {
    if (toggle) toggle.textContent = "En/ने";
    if (tagline) tagline.textContent = "नेपालको विश्वसनीय समाचार स्रोत";
    if (sectionHeading) sectionHeading.innerHTML = getCategoryLabel(currentCat) + ' <span class="live-dot-mini"></span><span style="font-size:0.7rem; color:#888; font-weight:500; vertical-align:middle; margin-left:4px;">' + getItemLabel('LIVE', 'प्रत्यक्ष') + '</span>';
    if (footerHome) footerHome.textContent = "होम";
    if (footerLogin) footerLogin.textContent = "लगइन";
    if (footerRegister) footerRegister.textContent = "रजिष्टर";
    if (topBarLogin) topBarLogin.textContent = "🔐 लगइन";
    if (topBarRegister) topBarRegister.textContent = "📝 दर्ता";
    if (topBarLogout) topBarLogout.textContent = getItemLabel('Logout', 'लगआउट');
    if (searchInput) searchInput.placeholder = "खोज्नुहोस्...";
    if (mostReadTitle) mostReadTitle.textContent = "🔥 सबैभन्दा बढी पढिएका";
    if (latestTitle) latestTitle.textContent = "🕐 नयाँ";
    if (tickerLabel) tickerLabel.textContent = getItemLabel('🔴 Breaking', '🔴 ब्रेकिंग');
    if (shareLabel) shareLabel.textContent = "सेयर:";
    if (commentsTitle) commentsTitle.textContent = "टिप्पणी";
    if (commentFormTitle) commentFormTitle.textContent = "टिप्पणी लेख्नुहोस्";
    if (commentSubmit) commentSubmit.textContent = "टिप्पणी पठाउनुहोस्";
    if (commentText) commentText.placeholder = "यहाँ आफ्नो टिप्पणी लेख्नुहोस्…";
    if (commentLockedText) commentLockedText.textContent = "तपाईंले";
    if (commentLockedLogin) commentLockedLogin.textContent = "लगइन";
    if (commentLockedOr) commentLockedOr.textContent = "वा";
    if (commentLockedRegister) commentLockedRegister.textContent = "दर्ता";
    if (commentLockedEnd) commentLockedEnd.textContent = "टिप्पणी गर्न सक्नुहुन्न।";
    if (backToHome) backToHome.textContent = "← समाचारमा फर्कनुहोस्";
  } else {
    if (toggle) toggle.textContent = "ने/En";
    if (tagline) tagline.textContent = "नेपालको विश्वसनीय समाचार स्रोत";
    if (sectionHeading) sectionHeading.innerHTML = getCategoryLabel(currentCat) + ' <span class="live-dot-mini"></span><span style="font-size:0.7rem; color:#888; font-weight:500; vertical-align:middle; margin-left:4px;">' + getItemLabel('LIVE', 'प्रत्यक्ष') + '</span>';
    if (footerHome) footerHome.textContent = "Home";
    if (footerLogin) footerLogin.textContent = "Login";
    if (footerRegister) footerRegister.textContent = "Register";
    if (topBarLogin) topBarLogin.textContent = "🔐 Login";
    if (topBarRegister) topBarRegister.textContent = "📝 Register";
    if (topBarLogout) topBarLogout.textContent = getItemLabel('Logout', 'लगआउट');
    if (searchInput) searchInput.placeholder = "Search...";
    if (mostReadTitle) mostReadTitle.textContent = "🔥 Most Read";
    if (latestTitle) latestTitle.textContent = "🕐 Latest";
    if (tickerLabel) tickerLabel.textContent = getItemLabel('🔴 Breaking', '🔴 ब्रेकिंग');
    if (shareLabel) shareLabel.textContent = "Share:";
    if (commentsTitle) commentsTitle.textContent = "Comments";
    if (commentFormTitle) commentFormTitle.textContent = "Leave a Comment";
    if (commentSubmit) commentSubmit.textContent = "Post Comment";
    if (commentText) commentText.placeholder = "Write your comment here…";
    if (commentLockedText) commentLockedText.textContent = "You must";
    if (commentLockedLogin) commentLockedLogin.textContent = "sign in";
    if (commentLockedOr) commentLockedOr.textContent = "or";
    if (commentLockedRegister) commentLockedRegister.textContent = "register";
    if (commentLockedEnd) commentLockedEnd.textContent = "to leave a comment.";
    if (backToHome) backToHome.textContent = "← Back to News";
  }
}

// ------------------------------------------------------------------
// REAL TIME POLLING
// ------------------------------------------------------------------
var lastKnownArticleId = null;

function startRealTimeNews() {
  // Store the current latest ID so we know when a NEW one arrives
  lastKnownArticleId = DB.getLatestArticleId();

  // Check every 3 seconds
  setInterval(function () {
    // Only poll if the user is on the Home View
    var homeView = document.getElementById("homeView");
    if (!homeView || homeView.style.display === "none") return;

    var newId = DB.getLatestArticleId();
    if (newId && newId !== lastKnownArticleId) {
      console.log("New article detected: " + newId);
      lastKnownArticleId = newId;

      // Refresh the news feeds
      renderArticles(currentCat);
      buildSidebar();

      // Also refresh the ticker state in case new breaking news came
      applyTickerState();
    }
  }, 8000);
}

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
    btn.textContent = getCategoryLabel(cat);

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

    // Update section heading text, preserving the live badge
    var heading = document.getElementById("sectionHeading");
    if (heading) {
      heading.innerHTML = getCategoryLabel(cat) + ' <span class="live-dot-mini"></span><span style="font-size:0.7rem; color:#888; font-weight:500; vertical-align:middle; margin-left:4px;">' + getItemLabel('LIVE', 'प्रत्यक्ष') + '</span>';
    }

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

    // Loop through filtered news and check if title contains the search word
    for (var s = 0; s < filtered.length; s++) {
      var title = getArticleTitle(filtered[s]).toLowerCase();
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
    grid.innerHTML = '<p class="empty-msg">' + escHtml(getItemLabel('No articles in this category yet.', 'अझ यस श्रेणीमा समाचार छैन।')) + '</p>';
    return;
  }

  // First article goes in the big hero card
  var featured = visible[0];

  // Build hero card HTML
  var heroHtml = '<div class="hero-card" onclick="openArticle(\'' + featured.id + '\')">'
    + '<div class="hero-img-wrap"><img src="' + featured.image + '" alt=""'
    + ' onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80\'" /></div>'
    + '<div class="hero-body">'
    + '<h2 class="hero-title">' + escHtml(getArticleTitle(featured)) + '</h2>'
    + '<p class="hero-summary">' + escHtml(getArticleSummary(featured)) + '</p>'
    + '<div class="hero-labels"><span class="hero-badge">' + escHtml(getItemLabel('TOP STORIES', 'शीर्ष समाचार')) + '</span>'
    + '<span class="hero-category-pill">' + escHtml(getCategoryLabel(featured.category)) + '</span></div>'
    + '<div class="hero-meta"><span>👤 ' + escHtml(featured.author) + '</span>'
    + '<span>🕐 ' + featured.date + '</span></div>'
    + '<div class="hero-scroll-hint">↓ ' + escHtml(getItemLabel('Scroll for more stories', 'अझ समाचार हेर्न तल स्क्रोल गर्नुहोस्')) + '</div>'
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
        + '<span class="cat-badge cat-' + a.category + '">' + escHtml(getCategoryLabel(a.category)) + '</span>'
        + '<h3 class="card-title">' + escHtml(getArticleTitle(a)) + '</h3>'
        + '<p class="card-summary">' + escHtml(getArticleSummary(a)) + '</p>'
        + '<div class="meta"><span>✍ ' + escHtml(a.author) + '</span>'
        + '<span>📅 ' + a.date + '</span></div>'
        + '<button class="read-more-btn" onclick="event.stopPropagation();openArticle(\'' + a.id + '\')">' + escHtml(getItemLabel('Read More →', 'थप पढ्नुहोस् →')) + '</button>'
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
      + '<div class="sidebar-article-item-title">' + escHtml(getArticleTitle(art)) + '</div>'
      + '<div class="sidebar-article-item-meta">📅 ' + art.date + ' · 👁 ' + escHtml(getItemLabel(art.views + ' views', art.views + ' दर्शन')) + '</div>'
      + '</div></div>';
  }

  el.innerHTML = html;
}