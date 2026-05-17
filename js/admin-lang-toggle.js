/* admin-lang-toggle.js - Language toggle for the Admin Panel (EN ↔ NE)
   Floating button to switch admin panel UI between English and Nepali.
*/

var adminLang = localStorage.getItem("nk_admin_lang") || "en";

// Admin panel UI translations
var ADMIN_TEXT = {
  en: {
    // Header
    adminPanel: "Admin Panel",
    loggedInAs: "Logged in as",
    viewSite: "← View Site",
    logout: "Logout",
    // Sidebar
    manage: "Manage",
    articles: "📰 Articles",
    users: "👥 Users",
    comments: "💬 Comments",
    liveTicker: "📡 Live Ticker",
    liveNews: "🌐 Live News",
    // Ticker
    tickerManager: "📡 Live Ticker Manager",
    tickerLive: "Ticker: Live",
    tickerStopped: "Ticker: Stopped",
    stopAll: "⏸ Stop All",
    startAll: "▶ Start All",
    livePreview: "LIVE PREVIEW",
    addNewHeadline: "➕ Add New Headline",
    headlinePlaceholder: "Type breaking news headline here…",
    addHeadline: "Add Headline",
    allHeadlines: "All Headlines",
    headlineHint: "Each headline has: Remove · Rewrite · Start/Stop",
    // Articles
    manageArticles: "📰 Manage Articles",
    liveUpdates: "🔴 Live Updates",
    newArticle: "✏️ New Article",
    titleEnglish: "Title (English)",
    autoTranslateNe: "— auto-translates to Nepali",
    titleNepali: "शीर्षक (नेपाली)",
    autoTranslateLabel: "— स्वचालित अनुवाद",
    summaryEnglish: "Summary / Lead (English)",
    summaryNepali: "सारांश (नेपाली)",
    bodyEnglish: "Full Article Body (English)",
    bodyNepali: "पूर्ण लेख (नेपाली)",
    autoTranslateHint: "🌐 Auto-translate: Type in any field and click outside — it will auto-translate to the other language. Original text is replaced.",
    articleImage: "Article Image",
    pasteUrl: "🔗 Paste URL",
    uploadDevice: "📁 Upload from Device",
    category: "Category",
    author: "Author Name",
    publishArticle: "📤 Publish Article",
    updateArticle: "💾 Update Article",
    cancelEdit: "Cancel Edit",
    publishedArticles: "Published Articles",
    // Users
    registeredUsers: "👥 Registered Users",
    name: "Name",
    email: "Email",
    actions: "Actions",
    deleteUser: "Delete",
    // Comments
    userComments: "💬 User Comments",
    article: "Article",
    user: "User",
    comment: "Comment",
    date: "Date",
    deleteComment: "Delete",
    // Live News
    liveNewsTitle: "🌐 Live News Feed",
    liveNewsDesc: "Fetch the latest news from international sources and publish directly.",
    fetchNews: "🔄 Fetch News",
    // Toggle
    toggleLabel: "🌐 नेपाली",
    toggleTitle: "Switch to Nepali",
  },
  ne: {
    adminPanel: "प्रशासन प्यानल",
    loggedInAs: "लगइन भएको",
    viewSite: "← साइट हेर्नुहोस्",
    logout: "लगआउट",
    manage: "व्यवस्थापन",
    articles: "📰 लेखहरू",
    users: "👥 प्रयोगकर्ताहरू",
    comments: "💬 टिप्पणीहरू",
    liveTicker: "📡 लाइभ टिकर",
    liveNews: "🌐 लाइभ समाचार",
    tickerManager: "📡 लाइभ टिकर व्यवस्थापक",
    tickerLive: "टिकर: सक्रिय",
    tickerStopped: "टिकर: बन्द",
    stopAll: "⏸ सबै बन्द",
    startAll: "▶ सबै सुरु",
    livePreview: "लाइभ पूर्वावलोकन",
    addNewHeadline: "➕ नयाँ हेडलाइन थप्नुहोस्",
    headlinePlaceholder: "ब्रेकिङ न्यूज हेडलाइन यहाँ टाइप गर्नुहोस्…",
    addHeadline: "हेडलाइन थप्नुहोस्",
    allHeadlines: "सबै हेडलाइनहरू",
    headlineHint: "प्रत्येक हेडलाइनमा: हटाउनुहोस् · पुनर्लेखन · सुरु/बन्द",
    manageArticles: "📰 लेखहरू व्यवस्थापन",
    liveUpdates: "🔴 लाइभ अपडेट",
    newArticle: "✏️ नयाँ लेख",
    titleEnglish: "शीर्षक (अंग्रेजी)",
    autoTranslateNe: "— नेपालीमा स्वतः अनुवाद",
    titleNepali: "शीर्षक (नेपाली)",
    autoTranslateLabel: "— स्वचालित अनुवाद",
    summaryEnglish: "सारांश (अंग्रेजी)",
    summaryNepali: "सारांश (नेपाली)",
    bodyEnglish: "पूर्ण लेख (अंग्रेजी)",
    bodyNepali: "पूर्ण लेख (नेपाली)",
    autoTranslateHint: "🌐 स्वतः अनुवाद: कुनै पनि फिल्डमा टाइप गरेर बाहिर क्लिक गर्नुहोस् — यसले अर्को भाषामा स्वतः अनुवाद गर्छ।",
    articleImage: "लेख तस्बिर",
    pasteUrl: "🔗 URL टाँस्नुहोस्",
    uploadDevice: "📁 उपकरणबाट अपलोड",
    category: "वर्ग",
    author: "लेखक नाम",
    publishArticle: "📤 लेख प्रकाशित गर्नुहोस्",
    updateArticle: "💾 लेख अपडेट गर्नुहोस्",
    cancelEdit: "सम्पादन रद्द गर्नुहोस्",
    publishedArticles: "प्रकाशित लेखहरू",
    registeredUsers: "👥 दर्ता भएका प्रयोगकर्ताहरू",
    name: "नाम",
    email: "इमेल",
    actions: "कार्यहरू",
    deleteUser: "हटाउनुहोस्",
    userComments: "💬 प्रयोगकर्ता टिप्पणीहरू",
    article: "लेख",
    user: "प्रयोगकर्ता",
    comment: "टिप्पणी",
    date: "मिति",
    deleteComment: "हटाउनुहोस्",
    liveNewsTitle: "🌐 लाइभ समाचार फिड",
    liveNewsDesc: "अन्तर्राष्ट्रिय स्रोतहरूबाट नवीनतम समाचार प्राप्त गरी सिधै प्रकाशित गर्नुहोस्।",
    fetchNews: "🔄 समाचार प्राप्त गर्नुहोस्",
    toggleLabel: "🌐 English",
    toggleTitle: "Switch to English",
  }
};

function at(key) {
  return (ADMIN_TEXT[adminLang] && ADMIN_TEXT[adminLang][key]) || ADMIN_TEXT.en[key] || key;
}

// Build floating toggle button
function createAdminLangToggle() {
  var btn = document.createElement("button");
  btn.id = "adminLangToggleBtn";
  btn.className = "lang-toggle-btn";
  btn.innerHTML = at("toggleLabel");
  btn.title = at("toggleTitle");

  btn.addEventListener("click", function () {
    adminLang = adminLang === "en" ? "ne" : "en";
    localStorage.setItem("nk_admin_lang", adminLang);
    btn.innerHTML = at("toggleLabel");
    btn.title = at("toggleTitle");
    translateAdminPage();
  });

  document.body.appendChild(btn);
}

// Translate the entire admin panel UI
function translateAdminPage() {
  // Header
  var panelLabel = document.querySelector(".admin-logo small");
  if (panelLabel) panelLabel.textContent = at("adminPanel");

  var viewSiteBtn = document.querySelector(".btn-admin-logout[href*='index']");
  if (viewSiteBtn) viewSiteBtn.textContent = at("viewSite");

  var logoutBtns = document.querySelectorAll(".btn-admin-logout");
  for (var i = 0; i < logoutBtns.length; i++) {
    if (logoutBtns[i].href && logoutBtns[i].href.indexOf("logout") !== -1) {
      logoutBtns[i].textContent = at("logout");
    }
  }

  // Sidebar
  var sideLabel = document.querySelector(".sidebar-section-label");
  if (sideLabel) sideLabel.textContent = at("manage");

  var sideBtns = document.querySelectorAll(".sidebar-btn");
  var sideKeys = ["articles", "users", "comments", "liveTicker", "liveNews"];
  for (var s = 0; s < sideBtns.length && s < sideKeys.length; s++) {
    sideBtns[s].textContent = at(sideKeys[s]);
  }

  // ── Ticker Section ──
  var tickerTitle = document.querySelector("#sectionTicker .section-title");
  if (tickerTitle) tickerTitle.textContent = at("tickerManager");

  var previewLabel = document.querySelector(".ticker-preview-label");
  if (previewLabel) previewLabel.textContent = at("livePreview");

  var addTitle = document.querySelector(".ticker-add-title");
  if (addTitle) addTitle.textContent = at("addNewHeadline");

  var tickerInput = document.getElementById("tickerNewText");
  if (tickerInput) tickerInput.placeholder = at("headlinePlaceholder");

  var tickerAddBtn = document.getElementById("tickerAddBtn");
  if (tickerAddBtn) tickerAddBtn.textContent = at("addHeadline");

  var headlinesHeader = document.querySelector(".ticker-headlines-header span:first-child");
  if (headlinesHeader) {
    var countBadge = document.getElementById("tickerCount");
    var count = countBadge ? countBadge.textContent : "0";
    headlinesHeader.innerHTML = at("allHeadlines") + ' <span id="tickerCount" class="ticker-count-badge">' + count + '</span>';
  }

  var headlineHint = document.querySelector(".ticker-hint");
  if (headlineHint) headlineHint.textContent = at("headlineHint");

  // ── Articles Section ──
  var artTitle = document.querySelector("#sectionArticles .section-title");
  if (artTitle) {
    artTitle.innerHTML = at("manageArticles") + ' <span style="font-size:0.75rem;color:#27ae60;font-family:\'DM Sans\',sans-serif;font-weight:500;margin-left:10px;">' + at("liveUpdates") + '</span>';
  }

  // Form labels
  var labels = document.querySelectorAll("#articleForm .form-field label");
  var labelMap = [
    { key: "titleEnglish", sub: "autoTranslateNe" },
    { key: "titleNepali", sub: "autoTranslateLabel" },
    { key: "summaryEnglish" },
    { key: "summaryNepali" },
    { key: "bodyEnglish" },
    { key: "bodyNepali" },
  ];
  for (var l = 0; l < labels.length && l < labelMap.length; l++) {
    var lbl = labelMap[l];
    if (lbl.sub) {
      labels[l].innerHTML = at(lbl.key) + ' <span style="font-weight:400;color:#888;">— ' + at(lbl.sub) + '</span>';
    } else {
      labels[l].textContent = at(lbl.key);
    }
  }

  // Auto-translate hint
  var hint = document.querySelector("#articleForm small");
  if (hint) hint.textContent = at("autoTranslateHint");

  // Image label
  var imgLabel = document.querySelector("#articleForm .form-field label[for], #articleForm .form-field:nth-child(7) > label");
  // Use a broader selector for the image label
  var allLabels = document.querySelectorAll("#articleForm label");
  for (var il = 0; il < allLabels.length; il++) {
    if (allLabels[il].textContent.trim() === "Article Image" || allLabels[il].textContent.trim() === "लेख तस्बिर") {
      allLabels[il].textContent = at("articleImage");
    }
    if (allLabels[il].textContent.trim() === "Category" || allLabels[il].textContent.trim() === "वर्ग") {
      allLabels[il].textContent = at("category");
    }
    if (allLabels[il].textContent.trim() === "Author Name" || allLabels[il].textContent.trim() === "लेखक नाम") {
      allLabels[il].textContent = at("author");
    }
  }

  // Image tabs
  var imgTabUrl = document.getElementById("imgTabUrl");
  var imgTabUpload = document.getElementById("imgTabUpload");
  if (imgTabUrl) imgTabUrl.textContent = at("pasteUrl");
  if (imgTabUpload) imgTabUpload.textContent = at("uploadDevice");

  // Publish/Update button
  var pubBtn = document.getElementById("formPublishBtn");
  if (pubBtn) pubBtn.textContent = at("publishArticle");

  var cancelBtn = document.getElementById("formCancelBtn");
  if (cancelBtn) cancelBtn.textContent = at("cancelEdit");

  // Published articles heading
  var pubHeading = document.querySelector("#sectionArticles .section-title:last-of-type, .published-heading");
  var allH2 = document.querySelectorAll("#sectionArticles h2");
  for (var h = 0; h < allH2.length; h++) {
    if (allH2[h].textContent.indexOf("Published") !== -1 || allH2[h].textContent.indexOf("प्रकाशित") !== -1) {
      allH2[h].textContent = at("publishedArticles");
    }
  }

  // ── Users Section ──
  var usersTitle = document.querySelector("#sectionUsers .section-title");
  if (usersTitle) usersTitle.textContent = at("registeredUsers");

  // ── Comments Section ──
  var commentsTitle = document.querySelector("#sectionComments .section-title");
  if (commentsTitle) commentsTitle.textContent = at("userComments");

  // ── Live News Section ──
  var liveTitle = document.querySelector("#sectionLiveNews .section-title");
  if (liveTitle) liveTitle.textContent = at("liveNewsTitle");

  var liveDesc = document.querySelector("#sectionLiveNews .section-title + p, #sectionLiveNews p");
  if (liveDesc) liveDesc.textContent = at("liveNewsDesc");

  var fetchBtn = document.getElementById("liveNewsLoadBtn");
  if (fetchBtn) fetchBtn.innerHTML = at("fetchNews");
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  createAdminLangToggle();
  if (adminLang !== "en") {
    setTimeout(translateAdminPage, 100);
  }
});
