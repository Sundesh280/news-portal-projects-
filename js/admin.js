/* admin.js - Admin Panel */

// List of all categories
var CATS = ["general","business","technology","science","health","sports","entertainment"];

// Display names for each category
var CAT_LABELS_ADMIN = {
  general:"Top Stories", business:"Business", technology:"Technology",
  science:"Science", health:"Health", sports:"Sports", entertainment:"Entertainment"
};

var adminCurrentCat  = "general"; // currently selected category tab
var editingId        = null;      // ID of article being edited (null = adding new)
var rewriteMode      = false;     // true when rewriting an article
var _tickerCache     = null;      // cached ticker headlines from server
var _allStoppedCache = false;     // cached global ticker stopped state

// ---- Page Load ----
document.addEventListener("DOMContentLoaded", function () {
  buildAdminNav();
  renderAdminArticles(adminCurrentCat);
  buildUserTable();
  setupArticleForm();
  setupSidebarNav();
  initTickerManager();
  showSection("sectionArticles");
});

// ---- SIDEBAR NAV ----
function setupSidebarNav() {
  var btns = document.querySelectorAll(".sidebar-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", makeSidebarHandler(btns[i]));
  }
  var fs = document.getElementById("submissionFilter");
  if (fs) {
    fs.addEventListener("change", function () {
      buildAllSubmissions(fs.value);
    });
  }
}

function makeSidebarHandler(btn) {
  return function () {
    showSection(btn.dataset.section);
  };
}

// Show one section, hide all others
function showSection(id) {
  var sections = document.querySelectorAll(".admin-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].style.display = "none";
  }
  var sec = document.getElementById(id);
  if (sec) sec.style.display = "block";

  var btns = document.querySelectorAll(".sidebar-btn");
  for (var j = 0; j < btns.length; j++) {
    btns[j].classList.remove("active");
  }
  var activeBtn = document.querySelector('.sidebar-btn[data-section="' + id + '"]');
  if (activeBtn) activeBtn.classList.add("active");

  if (id === "sectionComments") {
    startCommentsPoll();
  } else {
    stopCommentsPoll();
  }
  if (id === "sectionUsers") buildUserTable();
}

// ---- CATEGORY NAV ----
function buildAdminNav() {
  var nav = document.getElementById("adminCategoryNav");
  if (!nav) return;
  nav.innerHTML = "";
  for (var i = 0; i < CATS.length; i++) {
    var cat = CATS[i];
    var btn = document.createElement("button");
    btn.className   = "nav-btn" + (cat === adminCurrentCat ? " active" : "");
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS_ADMIN[cat];
    btn.addEventListener("click", makeNavHandler(cat, btn));
    nav.appendChild(btn);
  }
}

function makeNavHandler(cat, btn) {
  return function () {
    adminCurrentCat = cat;
    var allBtns = document.querySelectorAll("#adminCategoryNav .nav-btn");
    for (var i = 0; i < allBtns.length; i++) {
      allBtns[i].classList.remove("active");
    }
    btn.classList.add("active");
    renderAdminArticles(cat);
  };
}

// ---- TICKER ----
function loadTickerData() {
  var r = DB.getTickerHeadlines();
  _tickerCache     = r.headlines;
  _allStoppedCache = r.allStopped;
}
function getTickerHeadlines() {
  if (!_tickerCache) loadTickerData();
  return _tickerCache || [];
}
function isTickerAllStopped() {
  if (!_tickerCache) loadTickerData();
  return _allStoppedCache;
}

function initTickerManager() {
  renderTickerMasterControl();
  renderTickerPreview();
  renderTickerHeadlines();

  var addBtn  = document.getElementById("tickerAddBtn");
  var addInp  = document.getElementById("tickerNewText");
  var masterBtn = document.getElementById("tickerMasterBtn");

  if (addBtn) addBtn.addEventListener("click", addTickerHeadline);
  if (addInp) {
    addInp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); addTickerHeadline(); }
    });
  }
  if (masterBtn) {
    masterBtn.addEventListener("click", function () {
      var r = DB.toggleAllTicker();
      if (r && typeof r.allStopped !== "undefined") _allStoppedCache = r.allStopped;
      renderTickerMasterControl();
      renderTickerPreview();
      renderTickerHeadlines();
    });
  }
}

function renderTickerMasterControl() {
  var stopped = isTickerAllStopped();
  var dot     = document.getElementById("tickerLiveDot");
  var label   = document.getElementById("tickerMasterLabel");
  var btn     = document.getElementById("tickerMasterBtn");
  if (dot)   dot.className    = "ticker-live-dot" + (stopped ? " stopped" : "");
  if (label) label.textContent = stopped ? "Ticker: Stopped" : "Ticker: Live";
  if (btn) {
    btn.textContent = stopped ? "▶ Start All" : "⏸ Stop All";
    btn.className   = "btn-ticker-master" + (stopped ? " all-stopped" : "");
  }
}

function renderTickerPreview() {
  var track = document.getElementById("tickerPreviewTrack");
  if (!track) return;
  var allStopped = isTickerAllStopped();
  var headlines  = getTickerHeadlines();
  var active = [];
  for (var i = 0; i < headlines.length; i++) {
    if (headlines[i].active && !allStopped) active.push(headlines[i].text);
  }
  if (active.length === 0) {
    track.textContent = "— No active headlines —";
    track.className   = "ticker-preview-track paused";
    return;
  }
  track.textContent = active.join("   ◆   ");
  track.className   = "ticker-preview-track";
}

function renderTickerHeadlines() {
  var list      = document.getElementById("tickerHeadlineList");
  var countEl   = document.getElementById("tickerCount");
  var headlines = getTickerHeadlines();
  var allStop   = isTickerAllStopped();
  if (countEl) countEl.textContent = headlines.length;
  if (!list) return;
  if (headlines.length === 0) {
    list.innerHTML = '<div class="ticker-empty-msg">No headlines yet. Add one above.</div>';
    return;
  }
  list.innerHTML = "";
  for (var i = 0; i < headlines.length; i++) {
    var h   = headlines[i];
    var eff = allStop || !h.active; // effective: is it stopped?
    var row = document.createElement("div");
    row.className = "ticker-headline-row" + (eff ? " is-stopped" : "");
    row.id = "trow-" + h.id;
    row.innerHTML =
      '<div class="ticker-headline-num">' + (i + 1) + '</div>'
      + '<div class="ticker-headline-body">'
      + '<div class="ticker-headline-text' + (eff ? " stopped-text" : "") + '" id="ttext-' + h.id + '">' + escHtml(h.text) + '</div>'
      + '<div class="ticker-headline-status"><span class="status-dot' + (eff ? " off" : "") + '"></span>' + (eff ? "Stopped" : "Running on ticker") + '</div>'
      + '</div>'
      + '<div class="ticker-headline-actions">'
      + '<button class="btn-th-remove" onclick="tickerRemove(\'' + h.id + '\')">🗑 Remove</button>'
      + '<button class="btn-th-rewrite" onclick="tickerRewrite(\'' + h.id + '\')">✏ Rewrite</button>'
      + '<button class="btn-th-toggle ' + (h.active ? "is-live" : "") + '" onclick="tickerToggle(\'' + h.id + '\')">' + (h.active ? "⏹ Stop" : "▶ Start") + '</button>'
      + '</div>';
    list.appendChild(row);
  }
}

function addTickerHeadline() {
  var inp  = document.getElementById("tickerNewText");
  var text = inp ? inp.value.trim() : "";
  if (!text) { showMsg("tickerAddMsg", "Please enter a headline.", "error"); return; }
  DB.addTickerHeadline(text);
  _tickerCache = null;
  if (inp) inp.value = "";
  showMsg("tickerAddMsg", "✅ Headline added!", "success");
  renderTickerPreview();
  renderTickerHeadlines();
}

function tickerRemove(id) {
  if (!confirm("Remove this headline?")) return;
  DB.deleteTickerHeadline(id);
  _tickerCache = null;
  renderTickerPreview();
  renderTickerHeadlines();
}

function tickerRewrite(id) {
  // Find the headline with this id
  var headlines = getTickerHeadlines();
  var h = null;
  for (var i = 0; i < headlines.length; i++) {
    if (headlines[i].id === id) { h = headlines[i]; break; }
  }
  if (!h) return;

  // Remove any existing rewrite rows
  var existing = document.querySelectorAll(".ticker-rewrite-row");
  for (var j = 0; j < existing.length; j++) existing[j].remove();

  var allRows = document.querySelectorAll(".ticker-headline-row");
  for (var k = 0; k < allRows.length; k++) allRows[k].classList.remove("is-rewriting");

  var row = document.getElementById("trow-" + id);
  if (!row) return;
  row.classList.add("is-rewriting");

  var rrow = document.createElement("div");
  rrow.className = "ticker-rewrite-row";
  rrow.id = "trewrite-" + id;
  rrow.innerHTML =
    '<input type="text" class="ticker-rewrite-input" id="trewrite-inp-' + id + '" value="' + escHtml(h.text) + '" maxlength="200" />'
    + '<button class="btn-rewrite-save" onclick="tickerSaveRewrite(\'' + id + '\')">✓ Save</button>'
    + '<button class="btn-rewrite-cancel" onclick="tickerCancelRewrite(\'' + id + '\')">✕</button>';

  var bodyDiv = row.querySelector(".ticker-headline-body");
  bodyDiv.appendChild(rrow);

  var inp = document.getElementById("trewrite-inp-" + id);
  if (inp) {
    inp.focus();
    inp.select();
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter")  tickerSaveRewrite(id);
      if (e.key === "Escape") tickerCancelRewrite(id);
    });
  }
}

function tickerSaveRewrite(id) {
  var inp  = document.getElementById("trewrite-inp-" + id);
  var text = inp ? inp.value.trim() : "";
  if (!text) return;
  DB.rewriteTickerHeadline(id, text);
  _tickerCache = null;
  renderTickerPreview();
  renderTickerHeadlines();
}

function tickerCancelRewrite(id) {
  var row  = document.getElementById("trow-" + id);
  var rrow = document.getElementById("trewrite-" + id);
  if (row)  row.classList.remove("is-rewriting");
  if (rrow) rrow.remove();
}

function tickerToggle(id) {
  DB.toggleTickerHeadline(id);
  _tickerCache = null;
  renderTickerPreview();
  renderTickerHeadlines();
}

// ---- ARTICLES ----
function renderAdminArticles(cat) {
  var list = document.getElementById("adminArticleList");
  if (!list) return;

  var all      = DB.getArticles();
  var filtered = [];
  for (var i = 0; i < all.length; i++) {
    if (cat === "general" || all[i].category === cat) {
      filtered.push(all[i]);
    }
  }

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-msg">No articles in this category.</p>';
    return;
  }

  var html     = "";
  var fallback = "css/img-fallback.png";
  for (var j = 0; j < filtered.length; j++) {
    var art     = filtered[j];
    var stopped = art.isStopped;
    html += '<div class="admin-art-row' + (stopped ? " stopped-article" : "") + '">'
      + '<img src="' + art.image + '" alt="" onerror="this.src=\'' + fallback + '\'" />'
      + '<div class="admin-art-info">'
      + '<div><span class="cat-badge cat-' + art.category + '">' + CAT_LABELS_ADMIN[art.category] + '</span>'
      + (stopped ? '<span class="stopped-badge">Hidden</span>' : '') + '</div>'
      + '<strong>' + escHtml(art.titleEn) + '</strong>'
      + '<small>' + art.date + ' · ' + art.author + ' · ' + (art.views || 0) + ' views</small>'
      + '</div>'
      + '<div class="admin-art-actions">'
      + '<button class="btn-edit" onclick="startEdit(\'' + art.id + '\')">✏ Edit</button>'
      + '<button class="btn-rewrite" onclick="startRewrite(\'' + art.id + '\')">🔄 Rewrite</button>'
      + '<button class="btn-stop' + (stopped ? " is-stopped" : "") + '" onclick="toggleStop(\'' + art.id + '\')">' + (stopped ? "▶ Restore" : "⏹ Stop") + '</button>'
      + '<button class="btn-delete" onclick="confirmDelete(\'' + art.id + '\')">🗑 Delete</button>'
      + '</div></div>';
  }
  list.innerHTML = html;
}

function toggleStop(id) {
  DB.toggleStop(id);
  renderAdminArticles(adminCurrentCat);
}

function confirmDelete(id) {
  if (confirm("Delete this article?")) {
    DB.deleteArticle(id);
    renderAdminArticles(adminCurrentCat);
  }
}

// ---- ARTICLE FORM ----
function setupArticleForm() {
  // Populate category dropdown
  var catSel = document.getElementById("formCategory");
  if (catSel) {
    for (var i = 0; i < CATS.length; i++) {
      var opt = document.createElement("option");
      opt.value       = CATS[i];
      opt.textContent = CAT_LABELS_ADMIN[CATS[i]];
      catSel.appendChild(opt);
    }
  }

  var saveBtn   = document.getElementById("saveArticleBtn");
  var cancelBtn = document.getElementById("cancelEditBtn");

  if (saveBtn) saveBtn.addEventListener("click", saveArticle);
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      editingId   = null;
      rewriteMode = false;
      clearForm();
      resetFormUI();
    });
  }
}

function saveArticle() {
  var titleEn   = val("formTitleEn");
  var titleNp   = val("formTitle");
  var summaryEn = val("formSummaryEn");
  var summaryNp = val("formSummary");
  var contentEn = val("formContentEn");
  var contentNp = val("formContent");
  var author    = val("formAuthor");
  var category  = val("formCategory");

  // Validate required fields
  if (!titleEn && !titleNp) { showMsg("formMsg", "Please enter a title.", "error"); return; }
  if (!summaryEn && !summaryNp) { showMsg("formMsg", "Please enter a summary.", "error"); return; }
  if (!contentEn && !contentNp) { showMsg("formMsg", "Please enter article content.", "error"); return; }
  if (!author || !category) { showMsg("formMsg", "Author and Category are required.", "error"); return; }

  var data = {
    titleEn:   titleEn   || titleNp,
    title:     titleNp   || titleEn,
    summaryEn: summaryEn || summaryNp,
    summary:   summaryNp || summaryEn,
    contentEn: contentEn || contentNp,
    content:   contentNp || contentEn,
    image:     val("formImage"),
    author:    author,
    category:  category
  };

  if (editingId) {
    DB.updateArticle(editingId, data);
    showMsg("formMsg", rewriteMode ? "Rewritten!" : "Updated!", "success");
    editingId   = null;
    rewriteMode = false;
  } else {
    DB.addArticle(data);
    showMsg("formMsg", "Published!", "success");
  }

  clearForm();
  resetFormUI();
  renderAdminArticles(adminCurrentCat);
}

function resetFormUI() {
  var sb = document.getElementById("saveArticleBtn");
  var cb = document.getElementById("cancelEditBtn");
  var bd = document.getElementById("formModeBadge");
  if (sb) sb.textContent   = "Publish Article";
  if (cb) cb.style.display = "none";
  if (bd) { bd.textContent = "✏️ New Article"; bd.className = "form-mode-badge"; }
}

function startEdit(id) {
  var a = DB.getArticleById(id);
  if (!a) return;
  rewriteMode = false;
  showSection("sectionArticles");
  fillForm(a);
  editingId = id;
  document.getElementById("saveArticleBtn").textContent      = "Update Article";
  document.getElementById("cancelEditBtn").style.display     = "inline-block";
  var bd = document.getElementById("formModeBadge");
  if (bd) { bd.textContent = "✏️ Editing Article"; bd.className = "form-mode-badge edit-mode"; }
  document.getElementById("articleForm").scrollIntoView({ behavior: "smooth" });
}

function startRewrite(id) {
  var a = DB.getArticleById(id);
  if (!a) return;
  rewriteMode = true;
  showSection("sectionArticles");
  fillForm(a);
  editingId = id;
  document.getElementById("saveArticleBtn").textContent      = "Save Rewrite";
  document.getElementById("cancelEditBtn").style.display     = "inline-block";
  var bd = document.getElementById("formModeBadge");
  if (bd) { bd.textContent = "🔄 Rewriting Article"; bd.className = "form-mode-badge rewrite-mode"; }
  var c = document.getElementById("formContentEn");
  if (c) { c.focus(); c.select(); }
  document.getElementById("articleForm").scrollIntoView({ behavior: "smooth" });
}

function fillForm(a) {
  setVal("formTitleEn",   a.titleEn   || "");
  setVal("formTitle",     a.title     || "");
  setVal("formSummaryEn", a.summaryEn || "");
  setVal("formSummary",   a.summary   || "");
  setVal("formContentEn", a.contentEn || "");
  setVal("formContent",   a.content   || "");
  setVal("formImage",     a.image     || "");
  setVal("formAuthor",    a.author    || "");
  setVal("formCategory",  a.category  || "general");
}

function clearForm() {
  var fields = ["formTitleEn","formTitle","formSummaryEn","formSummary",
                "formContentEn","formContent","formImage","formAuthor"];
  for (var i = 0; i < fields.length; i++) {
    setVal(fields[i], "");
  }
}

// ---- USERS ----
function buildUserTable() {
  var tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  var users = DB.getUsers();
  var html  = "";
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var deleteBtn = "";
    if (u.role !== "admin") {
      deleteBtn = '<button class="btn-delete" onclick="deleteUser(\'' + u.id + '\')">Remove</button>';
    }
    html += "<tr>"
      + "<td>" + escHtml(u.name) + "</td>"
      + "<td>" + escHtml(u.email) + "</td>"
      + '<td><span class="role-badge role-' + u.role + '">' + u.role + "</span></td>"
      + "<td>" + (u.joined_at || "—") + "</td>"
      + "<td>" + deleteBtn + "</td>"
      + "</tr>";
  }
  if (!html) {
    html = '<tr><td colspan="5" class="empty-msg" style="text-align:center;padding:20px;">No users found.</td></tr>';
  }
  tbody.innerHTML = html;
}

function deleteUser(id) {
  if (confirm("Remove this user?")) {
    DB.deleteUser(id);
    buildUserTable();
  }
}

// ---- COMMENTS ----
var _commentsPollTimer = null;

function startCommentsPoll() {
  stopCommentsPoll();
  buildAllComments();
  // Refresh comments every 5 seconds while the Comments tab is open
  _commentsPollTimer = setInterval(function () {
    var sec = document.getElementById("sectionComments");
    if (sec && sec.style.display !== "none") {
      buildAllComments();
    }
  }, 5000);
}

function stopCommentsPoll() {
  if (_commentsPollTimer) {
    clearInterval(_commentsPollTimer);
    _commentsPollTimer = null;
  }
}

function buildAllComments() {
  var list     = document.getElementById("allCommentsList");
  if (!list) return;
  var all      = DB.getAllComments();  // object: { articleId: [comments] }
  var articles = DB.getArticles();
  var html     = "";
  var hasAny   = false;

  var artIds = Object.keys(all);
  for (var i = 0; i < artIds.length; i++) {
    var artId    = artIds[i];
    var comments = all[artId] || [];

    // Find the article title for this ID
    var artTitle = artId;
    for (var k = 0; k < articles.length; k++) {
      if (articles[k].id === artId) { artTitle = articles[k].titleEn; break; }
    }

    for (var j = 0; j < comments.length; j++) {
      hasAny = true;
      var c  = comments[j];
      html += '<div class="admin-comment-row">'
        + '<div class="admin-comment-info">'
        + '<strong>' + escHtml(c.name) + '</strong>'
        + '<span class="comment-article-title">on: ' + escHtml(artTitle) + '</span>'
        + '<p>' + escHtml(c.text) + '</p>'
        + '<small>' + c.date + '</small>'
        + '</div>'
        + '<button class="btn-delete" onclick="adminDeleteComment(\'' + c.id + '\')">Delete</button>'
        + '</div>';
    }
  }
  list.innerHTML = hasAny ? html : '<p class="empty-msg">No comments yet.</p>';
}

function adminDeleteComment(cId) {
  DB.deleteComment(cId);
  buildAllComments();
}

// ---- SUBMISSIONS ----
function buildAllSubmissions(filterStatus) {
  var list    = document.getElementById("submissionsList");
  var countEl = document.getElementById("submissionCount");
  if (!list) return;

  filterStatus = filterStatus || "all";
  var all  = DB.getSubmissions();
  var subs = [];

  // Filter by status if needed
  for (var i = 0; i < all.length; i++) {
    if (filterStatus === "all" || all[i].status === filterStatus) {
      subs.push(all[i]);
    }
  }

  if (countEl) {
    countEl.textContent = subs.length + " submission" + (subs.length !== 1 ? "s" : "");
  }

  if (subs.length === 0) {
    list.innerHTML = '<p class="empty-msg">No ' + (filterStatus !== "all" ? filterStatus + " " : "") + 'submissions yet.</p>';
    return;
  }

  var html = "";
  for (var j = 0; j < subs.length; j++) {
    var sub = subs[j];

    // Choose badge style and label based on status
    var statusClass = "status-pending";
    var statusLabel = "⏳ Pending";
    if (sub.status === "approved") { statusClass = "status-approved"; statusLabel = "✅ Approved"; }
    if (sub.status === "rejected") { statusClass = "status-rejected"; statusLabel = "❌ Rejected"; }

    var safeCat = escHtml(sub.category || "general");

    html += '<div class="submission-row" id="srow-' + sub.id + '">'
      + '<div class="submission-header">'
      + '<div class="submission-meta-left">'
      + '<span class="cat-badge cat-' + safeCat + '">' + safeCat + '</span>'
      + '<span class="submission-status-badge ' + statusClass + '">' + statusLabel + '</span>'
      + '</div>'
      + '<div class="submission-meta-right">'
      + '<span>📅 ' + (sub.date || "—") + '</span>'
      + '<span>📍 ' + escHtml(sub.location || "—") + '</span>'
      + '</div></div>';

    if (sub.titleEn) {
      html += '<div class="submission-title-en">' + escHtml(sub.titleEn) + '</div>';
    }

    html += '<div class="submission-submitter">By: <strong>' + escHtml(sub.subscriberName) + '</strong> &lt;' + escHtml(sub.subscriberEmail) + '&gt;</div>';

    if (sub.summaryEn || sub.summaryNp) {
      html += '<div class="submission-body-section"><div class="submission-section-label">Summary</div>';
      if (sub.summaryEn) html += '<p class="submission-text-en">' + escHtml(sub.summaryEn) + '</p>';
      if (sub.summaryNp) html += '<p class="submission-text-np">' + escHtml(sub.summaryNp) + '</p>';
      html += '</div>';
    }

    html += '<div class="submission-actions">';
    if (sub.status !== "approved") html += '<button class="btn-sub-approve" onclick="updateSubStatus(\'' + sub.id + '\',\'approved\')">✅ Approve</button>';
    if (sub.status !== "rejected") html += '<button class="btn-sub-reject"  onclick="updateSubStatus(\'' + sub.id + '\',\'rejected\')">❌ Reject</button>';
    if (sub.status !== "pending")  html += '<button class="btn-sub-pending" onclick="updateSubStatus(\'' + sub.id + '\',\'pending\')">⏳ Pending</button>';
    html += '<button class="btn-delete" onclick="deleteSubm(\'' + sub.id + '\')">🗑 Delete</button>';
    html += '</div></div>';
  }
  list.innerHTML = html;
}

function updateSubStatus(id, status) {
  DB.updateSubmissionStatus(id, status);
  var fs = document.getElementById("submissionFilter");
  buildAllSubmissions(fs ? fs.value : "all");
}

function deleteSubm(id) {
  if (!confirm("Delete this submission?")) return;
  DB.deleteSubmission(id);
  var fs = document.getElementById("submissionFilter");
  buildAllSubmissions(fs ? fs.value : "all");
}

// ---- HELPERS ----

// Get the trimmed value of an input by its ID
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// Set the value of an input by its ID
function setVal(id, v) {
  var el = document.getElementById(id);
  if (el) el.value = v;
}

// Show a temporary message (auto-hides after 3.5 seconds)
function showMsg(id, text, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = "form-msg " + type;
  setTimeout(function () {
    el.className = "form-msg";
  }, 3500);
}

// Make text safe to put in HTML (prevents XSS attacks)
function escHtml(s) {
  if (!s) return "";
  var safe = String(s);
  safe = safe.replace(/&/g, "&amp;");
  safe = safe.replace(/</g, "&lt;");
  safe = safe.replace(/>/g, "&gt;");
  safe = safe.replace(/"/g, "&quot;");
  return safe;
}

// ---------------------------------------------------------
// Live News Fetching Logic (Moved from admin.php)
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

  var loadBtn  = document.getElementById("liveNewsLoadBtn");
  var catSel   = document.getElementById("liveNewsCat");
  var msgEl    = document.getElementById("liveNewsMsg");
  var listEl   = document.getElementById("liveNewsList");

  // When admin clicks "Fetch News", load articles for selected category
  if (loadBtn) {
    loadBtn.addEventListener("click", function () {
      var cat = catSel ? catSel.value : "general";
      loadLiveNews(cat);
    });
  }
});

// Fetches news from our PHP file (which fetches from newsdata.io)
function loadLiveNews(category) {
  var msgEl  = document.getElementById("liveNewsMsg");
  var listEl = document.getElementById("liveNewsList");

  if (msgEl)  msgEl.textContent  = "Fetching news, please wait...";
  if (listEl) listEl.innerHTML   = "";

  // Ask our PHP file for news (PHP will call newsdata.io)
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "php/news-fetch.php?category=" + category, true); // true = async
  xhr.onload = function () {
    if (xhr.status !== 200) {
      if (msgEl) msgEl.textContent = "Server error: " + xhr.status;
      return;
    }
    var data = null;
    try {
      data = JSON.parse(xhr.responseText);
    } catch (e) {
      if (msgEl) msgEl.textContent = "Error reading response from server.";
      return;
    }
    if (!data.ok) {
      if (msgEl) msgEl.textContent = "Error: " + data.error;
      return;
    }

    var articles = data.articles;
    if (msgEl) msgEl.textContent = articles.length + " article(s) fetched for category: " + category;
    showLiveNews(articles);
  };
  xhr.onerror = function () {
    if (msgEl) msgEl.textContent = "Network error. Make sure XAMPP is running.";
  };
  xhr.send();
}

// Displays all fetched news articles in the admin panel
function showLiveNews(articles) {
  var listEl = document.getElementById("liveNewsList");
  if (!listEl) return;

  if (articles.length === 0) {
    listEl.innerHTML = '<p style="color:#aaa;">No articles found for this category.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < articles.length; i++) {
    var a = articles[i];
    // Each article card shows image, title, summary, date, source
    // and a Publish button that admin clicks to save it to the portal
    html += '<div id="ln-card-' + i + '" style="display:flex;gap:16px;background:#fff;border:1px solid #eee;border-radius:10px;padding:14px;margin-bottom:14px;">'
      + '<img src="' + (a.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=160&q=60") + '" alt="" '
      + 'onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=160&q=60\'" '
      + 'style="width:120px;height:90px;object-fit:cover;border-radius:8px;flex-shrink:0;" />'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">'
      + '<span style="background:#c0392b;color:#fff;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:20px;">' + a.category.toUpperCase() + '</span>'
      + '<span style="color:#aaa;font-size:0.8rem;">' + (a.date || '') + '</span>'
      + '</div>'
      + '<div style="font-weight:700;font-size:0.97rem;margin-bottom:4px;">' + escLiveHtml(a.title) + '</div>'
      + '<div style="color:#666;font-size:0.85rem;margin-bottom:8px;">' + escLiveHtml(a.summary) + '</div>'
      + '<div style="display:flex;gap:8px;align-items:center;">'
      + '<span style="color:#aaa;font-size:0.8rem;">Source: ' + escLiveHtml(a.author) + '</span>'
      + '<button onclick="publishLiveArticle(' + i + ')" id="ln-btn-' + i + '" '
      + 'style="margin-left:auto;padding:6px 16px;background:#27ae60;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">'
      + '✅ Publish to Portal</button>'
      + '<a href="' + a.link + '" target="_blank" style="padding:6px 12px;background:#f0f0f0;color:#333;border-radius:6px;text-decoration:none;font-size:0.85rem;">'
      + '🔗 Original</a>'
      + '</div></div></div>';
  }
  listEl.innerHTML = html;

  // Save the articles in a global variable so publishLiveArticle() can access them
  window._liveArticles = articles;
}

function publishLiveArticle(index) {
  var articles = window._liveArticles;
  if (!articles || !articles[index]) return;

  var a   = articles[index];
  var btn = document.getElementById("ln-btn-" + index);
  
  if (btn) {
    btn.textContent = "⏳ Fetching full text...";
    btn.style.background = "#f39c12"; // orange
    btn.disabled = true;
  }

  // 1. Ask our backend scraper to visit the article URL and extract the paragraphs
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "php/scrape-article.php", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  
  xhr.onload = function() {
    var scrapedText = "";
    try {
      var res = JSON.parse(xhr.responseText);
      // If the scraper found a nice big chunk of text (more than 50 characters)
      if (res.ok && res.text && res.text.length > 50) {
        scrapedText = res.text; 
      }
    } catch (e) {}

    // 2. Prepare the data
    var rawContent = a.content || "";
    if (rawContent.toUpperCase().indexOf("ONLY AVAILABLE IN PAID PLANS") !== -1) {
      rawContent = a.summary || "";
    }
    
    // If our scraper successfully grabbed the BIG article, use it! 
    // Otherwise, fall back to the raw content or summary.
    var finalContent = scrapedText || rawContent || a.summary || "";
    
    var articleData = {
      titleEn:   a.title,
      title:     a.title,
      summaryEn: a.summary,
      summary:   a.summary,
      contentEn: finalContent,
      content:   finalContent,
      image:     a.image,
      author:    a.author || "NewsData.io",
      category:  a.category
    };

    // 3. Save to our database using the existing DB helper
    var result = DB.addArticle(articleData);

    if (result && result.id) {
      // Mark this card as published so admin knows
      if (btn) {
        btn.textContent = "✓ Published!";
        btn.style.background = "#95a5a6";
        btn.disabled = true;
      }
    } else {
      if (btn) {
        btn.textContent = "Failed - try again";
        btn.style.background = "#e74c3c";
        btn.disabled = false;
      }
    }
  };
  
  // Send the URL to our scraper script
  xhr.send("url=" + encodeURIComponent(a.link || ""));
}

// Makes text safe to put in HTML (prevents broken HTML from news content)
function escLiveHtml(text) {
  if (!text) return "";
  var safe = String(text);
  safe = safe.replace(/&/g, "&amp;");
  safe = safe.replace(/</g, "&lt;");
  safe = safe.replace(/>/g, "&gt;");
  safe = safe.replace(/"/g, "&quot;");
  return safe;
}
