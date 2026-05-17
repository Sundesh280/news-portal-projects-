/* lang-toggle.js - Full page language toggle (EN ↔ NE)
   Switches ALL text AND auto-translates articles via MyMemory API.
   Caches translations in localStorage for instant switching.
*/

var currentLang = localStorage.getItem("nk_lang") || "en";

// Translation cache stored in localStorage
var _transCache = {};
try {
  var stored = localStorage.getItem("nk_trans_cache");
  if (stored) _transCache = JSON.parse(stored);
} catch (e) { _transCache = {}; }

function saveTransCache() {
  try { localStorage.setItem("nk_trans_cache", JSON.stringify(_transCache)); } catch (e) {}
}

// All static UI translations
var UI_TEXT = {
  en: {
    login: "🔐 Login", register: "📝 Register", logout: "Logout",
    tagline: "Nepal's Trusted News Source",
    general: "Top Stories", business: "Business", technology: "Technology",
    science: "Science", health: "Health", sports: "Sports", entertainment: "Entertainment",
    searchPlaceholder: "Search...",
    sectionHeading: "📰 Top Stories", liveLabel: "LIVE",
    heroTopStories: "TOP STORIES",
    scrollHint: "↓ Scroll for more stories", readMore: "Read More →",
    mostRead: "🔥 Most Read", latest: "🕐 Latest",
    backToNews: "← Back to News", comments: "Comments",
    leaveComment: "Leave a Comment", postComment: "Post Comment",
    commentLocked: "🔒 You must sign in or register to leave a comment.",
    noComments: "No comments yet.", noContent: "No article content available.",
    breakingLive: "🔴 Breaking", breakingPaused: "⏹ Breaking",
    footerRights: "© 2026 Nepal Khabar · नेपाल खबर · All rights reserved",
    noArticles: "No articles in this category yet.",
    shareLabel: "Share:",
    toggleLabel: "🌐 नेपाली", toggleTitle: "Switch to Nepali",
    views: "views",
  },
  ne: {
    login: "🔐 लगइन", register: "📝 दर्ता", logout: "लगआउट",
    tagline: "नेपालको विश्वसनीय समाचार स्रोत",
    general: "शीर्ष समाचार", business: "व्यापार", technology: "प्रविधि",
    science: "विज्ञान", health: "स्वास्थ्य", sports: "खेलकुद", entertainment: "मनोरञ्जन",
    searchPlaceholder: "खोज्नुहोस्...",
    sectionHeading: "📰 शीर्ष समाचार", liveLabel: "प्रत्यक्ष",
    heroTopStories: "शीर्ष समाचार",
    scrollHint: "↓ थप समाचारको लागि तल स्क्रोल गर्नुहोस्",
    readMore: "थप पढ्नुहोस् →",
    mostRead: "🔥 सबैभन्दा पढिएको", latest: "🕐 नवीनतम",
    backToNews: "← समाचारमा फर्कनुहोस्", comments: "टिप्पणी",
    leaveComment: "टिप्पणी लेख्नुहोस्", postComment: "टिप्पणी पोस्ट गर्नुहोस्",
    commentLocked: "🔒 टिप्पणी गर्न लगइन वा दर्ता गर्नुहोस्।",
    noComments: "अहिलेसम्म कुनै टिप्पणी छैन।",
    noContent: "लेख सामग्री उपलब्ध छैन।",
    breakingLive: "🔴 ब्रेकिङ", breakingPaused: "⏹ ब्रेकिङ",
    footerRights: "© २०२६ नेपाल खबर · Nepal Khabar · सर्वाधिकार सुरक्षित",
    noArticles: "यस वर्गमा अहिलेसम्म कुनै लेख छैन।",
    shareLabel: "सेयर:",
    toggleLabel: "🌐 English", toggleTitle: "Switch to English",
    views: "पटक हेरिएको",
  }
};

function t(key) {
  return (UI_TEXT[currentLang] && UI_TEXT[currentLang][key]) || UI_TEXT.en[key] || key;
}

function getCatLabel(cat) {
  return t(cat) || cat;
}

// ========== TRANSLATION HELPER ==========
// Translate a single text via PHP proxy, with caching
function translateForDisplay(text, fromLang, toLang, callback) {
  if (!text || !text.trim()) { callback(""); return; }

  // Check cache first
  var cacheKey = fromLang + "|" + toLang + "|" + text.trim().substring(0, 200);
  if (_transCache[cacheKey]) {
    callback(_transCache[cacheKey]);
    return;
  }

  var xhr = new XMLHttpRequest();
  var url = "php/translate.php?text=" + encodeURIComponent(text.trim())
    + "&from=" + fromLang + "&to=" + toLang;
  xhr.open("GET", url, true);
  xhr.timeout = 15000;
  xhr.onload = function () {
    try {
      var res = JSON.parse(xhr.responseText);
      if (res.ok && res.translated) {
        _transCache[cacheKey] = res.translated;
        saveTransCache();
        callback(res.translated);
      } else {
        callback(text); // fallback to original
      }
    } catch (e) { callback(text); }
  };
  xhr.onerror = function () { callback(text); };
  xhr.ontimeout = function () { callback(text); };
  xhr.send();
}

// ========== GET DISPLAY TEXT ==========
// Returns proper text for current language (sync — uses cache or stored field)
function getLangTitle(art) {
  if (currentLang === "ne") {
    // If valid Nepali title exists and is not garbled
    if (art.title && art.title.trim() && !isGarbled(art.title)) return art.title;
    // Check translation cache
    var cacheKey = "en|ne|" + (art.titleEn || "").trim().substring(0, 200);
    if (_transCache[cacheKey]) return _transCache[cacheKey];
    return art.titleEn || ""; // fallback, will be translated async
  }
  return art.titleEn || art.title || "";
}

function getLangSummary(art) {
  if (currentLang === "ne") {
    if (art.summary && art.summary.trim() && !isGarbled(art.summary)) return art.summary;
    var cacheKey = "en|ne|" + (art.summaryEn || "").trim().substring(0, 200);
    if (_transCache[cacheKey]) return _transCache[cacheKey];
    return art.summaryEn || "";
  }
  return art.summaryEn || art.summary || "";
}

// Check if text is garbled (contains mostly ? or replacement characters)
function isGarbled(text) {
  if (!text) return true;
  var qCount = 0;
  for (var i = 0; i < text.length; i++) {
    if (text[i] === "?" || text.charCodeAt(i) === 65533) qCount++;
  }
  return qCount > text.length * 0.3; // more than 30% is ? or replacement chars
}

// ========== AUTO-TRANSLATE ARTICLES ON PAGE ==========
// Batch translate all articles missing Nepali text, then re-render ONCE
var _translatePending = 0;
var _translateDone = false;

function autoTranslateVisibleArticles() {
  if (currentLang !== "ne" || _translateDone) return;

  var articles = (typeof DB !== "undefined") ? DB.getArticles() : [];
  _translatePending = 0;
  var needsRerender = false;

  for (var i = 0; i < articles.length; i++) {
    var art = articles[i];
    var hasNeTitle = art.title && art.title.trim() && !isGarbled(art.title);
    var hasNeSummary = art.summary && art.summary.trim() && !isGarbled(art.summary);

    // Check if already cached
    var titleCacheKey = "en|ne|" + (art.titleEn || "").trim().substring(0, 200);
    var sumCacheKey = "en|ne|" + (art.summaryEn || "").trim().substring(0, 200);

    if (!hasNeTitle && art.titleEn && !_transCache[titleCacheKey]) {
      _translatePending++;
      translateForDisplay(art.titleEn, "en", "ne", function () {
        _translatePending--;
        if (_translatePending <= 0) rerenderOnce();
      });
    }
    if (!hasNeSummary && art.summaryEn && !_transCache[sumCacheKey]) {
      _translatePending++;
      translateForDisplay(art.summaryEn, "en", "ne", function () {
        _translatePending--;
        if (_translatePending <= 0) rerenderOnce();
      });
    }
  }

  // If nothing needed translation, mark done
  if (_translatePending === 0) _translateDone = true;
}

// Re-render once after all translations complete
function rerenderOnce() {
  _translateDone = true;
  if (typeof renderArticles === "function") {
    renderArticles(typeof currentCat !== "undefined" ? currentCat : "general");
  }
  if (typeof buildSidebar === "function") {
    buildSidebar();
  }
}

// ========== TOGGLE BUTTON ==========
function createLangToggle() {
  var btn = document.createElement("button");
  btn.id = "langToggleBtn";
  btn.className = "lang-toggle-btn";
  updateToggleLabel(btn);

  btn.addEventListener("click", function () {
    currentLang = currentLang === "en" ? "ne" : "en";
    localStorage.setItem("nk_lang", currentLang);
    _translateDone = false; // allow fresh translations
    updateToggleLabel(btn);
    translateWholePage();
  });

  document.body.appendChild(btn);
}

function updateToggleLabel(btn) {
  btn.innerHTML = t("toggleLabel");
  btn.title = t("toggleTitle");
}

// ========== TRANSLATE ENTIRE PAGE ==========
function translateWholePage() {
  // 1. Header tagline
  var tagline = document.querySelector(".header-tagline");
  if (tagline) tagline.textContent = t("tagline");

  // 2. Top bar links
  var loginLink = document.getElementById("topBarLogin");
  var regLink = document.getElementById("topBarRegister");
  var logoutLink = document.getElementById("topBarLogout");
  if (loginLink) loginLink.textContent = t("login");
  if (regLink) regLink.textContent = t("register");
  if (logoutLink) logoutLink.textContent = t("logout");

  // 3. Category nav buttons
  var navBtns = document.querySelectorAll("#categoryNav .nav-btn");
  for (var i = 0; i < navBtns.length; i++) {
    var cat = navBtns[i].dataset.cat;
    if (cat) navBtns[i].textContent = getCatLabel(cat);
  }

  // 4. Search
  var searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.placeholder = t("searchPlaceholder");

  // 5. Section heading
  var heading = document.getElementById("sectionHeading");
  if (heading) {
    heading.innerHTML = t("sectionHeading")
      + ' <span class="live-dot-mini"></span>'
      + '<span style="font-size:0.7rem; color:#888; font-weight:500; vertical-align:middle; margin-left:4px;">'
      + t("liveLabel") + '</span>';
  }

  // 6. Sidebar widget titles
  var widgetTitles = document.querySelectorAll(".sidebar-widget-title");
  if (widgetTitles[0]) widgetTitles[0].textContent = t("mostRead");
  if (widgetTitles[1]) widgetTitles[1].textContent = t("latest");

  // 7. Ticker
  var tickerLabel = document.querySelector(".ticker-label");
  if (tickerLabel) {
    var isPaused = document.querySelector(".ticker-bar.ticker-paused");
    tickerLabel.textContent = isPaused ? t("breakingPaused") : t("breakingLive");
  }

  // 8. Article view elements
  var backLink = document.getElementById("backToHome");
  if (backLink) backLink.textContent = t("backToNews");

  var commentsTitle = document.querySelector(".comments-title");
  if (commentsTitle) commentsTitle.textContent = t("comments");

  var commentFormTitle = document.querySelector(".comment-form-title");
  if (commentFormTitle) commentFormTitle.textContent = t("leaveComment");

  var commentBtn = document.getElementById("commentSubmit");
  if (commentBtn) commentBtn.textContent = t("postComment");

  var commentLocked = document.getElementById("commentLocked");
  if (commentLocked) commentLocked.innerHTML = t("commentLocked");

  var shareLabel = document.querySelector(".share-label");
  if (shareLabel) shareLabel.textContent = t("shareLabel");

  // 9. Footer
  var footerP = document.querySelector(".site-footer p");
  if (footerP) footerP.innerHTML = t("footerRights");

  // 10. Re-render articles and sidebar
  if (typeof renderArticles === "function") {
    renderArticles(typeof currentCat !== "undefined" ? currentCat : "general");
  }
  if (typeof buildSidebar === "function") {
    buildSidebar();
  }

  // 11. Auto-translate articles that don't have Nepali text
  autoTranslateVisibleArticles();

  // 12. If article view is open, translate it too
  var artView = document.getElementById("articleView");
  if (artView && artView.style.display !== "none") {
    var submitBtn = document.getElementById("commentSubmit");
    if (submitBtn && submitBtn.dataset.artId) {
      applyArticleLang(submitBtn.dataset.artId);
    }
  }
}

// Apply language to the article detail view
function applyArticleLang(id) {
  var art = DB.getArticleById(id);
  if (!art) return;

  var titleEnEl = document.getElementById("artTitleEn");
  var titleNpEl = document.getElementById("artTitle");
  var summaryEl = document.getElementById("artSummaryEn");
  var bodyEl = document.getElementById("artBody");
  var viewsEl = document.getElementById("artViews");

  if (currentLang === "ne") {
    var neTitle = getLangTitle(art);
    if (titleEnEl) titleEnEl.textContent = neTitle;
    if (titleNpEl) titleNpEl.textContent = "";
    if (summaryEl) summaryEl.textContent = getLangSummary(art);

    // If title is still English (not yet translated), translate it
    if ((!art.title || isGarbled(art.title)) && art.titleEn) {
      translateForDisplay(art.titleEn, "en", "ne", function (translated) {
        if (titleEnEl) titleEnEl.textContent = translated;
      });
    }
    if ((!art.summary || isGarbled(art.summary)) && art.summaryEn) {
      translateForDisplay(art.summaryEn, "en", "ne", function (translated) {
        if (summaryEl) summaryEl.textContent = translated;
      });
    }

    // Body
    var rawText = art.content || art.contentEn || art.summary || art.summaryEn || "";
    if ((!art.content || isGarbled(art.content)) && art.contentEn) {
      translateForDisplay(art.contentEn, "en", "ne", function (translated) {
        rebuildArticleBody(bodyEl, translated);
      });
    } else {
      rebuildArticleBody(bodyEl, rawText);
    }
  } else {
    if (titleEnEl) titleEnEl.textContent = art.titleEn || art.title || "";
    if (titleNpEl) titleNpEl.textContent = art.title && !isGarbled(art.title) ? art.title : "";
    if (summaryEl) summaryEl.textContent = art.summaryEn || art.summary || "";
    var rawText = art.contentEn || art.content || art.summaryEn || art.summary || "";
    rebuildArticleBody(bodyEl, rawText);
  }

  if (viewsEl) viewsEl.textContent = (art.views || 0) + " " + t("views");
}

// Helper to rebuild article body paragraphs
function rebuildArticleBody(bodyEl, rawText) {
  if (!bodyEl) return;
  if (!rawText) { bodyEl.innerHTML = '<p style="color:#aaa;">' + t("noContent") + '</p>'; return; }

  if (rawText.toUpperCase().indexOf("ONLY AVAILABLE IN PAID PLANS") !== -1) rawText = "";

  var cutIndex = rawText.indexOf("[+");
  if (cutIndex !== -1 && rawText.indexOf("chars]") !== -1) rawText = rawText.substring(0, cutIndex).trim();

  var paragraphs = rawText.split("\n\n");
  if (paragraphs.length <= 1) paragraphs = rawText.split("\n");
  if (paragraphs.length <= 1 && rawText.length > 400) {
    var sentences = rawText.match(/[^.!?।]+[.!?।]+/g);
    if (sentences && sentences.length > 3) {
      paragraphs = [];
      var chunk = "";
      for (var s = 0; s < sentences.length; s++) {
        chunk += sentences[s];
        if ((s + 1) % 3 === 0) { paragraphs.push(chunk.trim()); chunk = ""; }
      }
      if (chunk.trim()) paragraphs.push(chunk.trim());
    }
  }

  var html = "";
  for (var i = 0; i < paragraphs.length; i++) {
    var para = paragraphs[i].trim();
    if (para && !(typeof isCodeJunk === "function" && isCodeJunk(para))) {
      if (!para.toLowerCase().startsWith("source: http")) {
        html += "<p>" + escHtml(para) + "</p>";
      }
    }
  }
  if (!html) html = '<p style="color:#aaa;">' + t("noContent") + '</p>';
  bodyEl.innerHTML = html;
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  createLangToggle();
  if (currentLang !== "en") {
    setTimeout(function () { translateWholePage(); }, 200);
  }
});
