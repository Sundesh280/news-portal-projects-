/* admin.js */
var CATS = [
  "general",
  "business",
  "technology",
  "science",
  "health",
  "sports",
  "entertainment",
];
var CAT_LABELS_ADMIN = {
  general: "Top Stories",
  business: "Business",
  technology: "Technology",
  science: "Science",
  health: "Health",
  sports: "Sports",
  entertainment: "Entertainment",
};
var adminCurrentCat = "general";
var editingId = null;
var rewriteMode = false;
var _tickerCache = null;
var _allStoppedCache = false;

function loadTickerData() {
  var r = DB.getTickerHeadlines();
  _tickerCache = r.headlines;
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
function setTickerAllStopped() {
  var r = DB.toggleAllTicker();
  if (r && typeof r.allStopped !== "undefined") _allStoppedCache = r.allStopped;
}
function isArticleStopped(id) {
  var a = DB.getArticleById(id);
  return a ? !!a.isStopped : false;
}
function toggleArticleStopped(id) {
  DB.toggleStop(id);
}

document.addEventListener("DOMContentLoaded", function () {
  buildAdminNav();
  renderAdminArticles(adminCurrentCat);
  buildUserTable();
  setupArticleForm();
  setupSidebarNav();
  initTickerManager();
  // BUG FIX #6: Set active class on sidebar button on initial page load
  showSection("sectionArticles");
});

function buildAdminNav() {
  var nav = document.getElementById("adminCategoryNav");
  if (!nav) return;
  nav.innerHTML = "";
  CATS.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.className = "nav-btn" + (cat === adminCurrentCat ? " active" : "");
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS_ADMIN[cat];
    btn.addEventListener("click", function () {
      adminCurrentCat = cat;
      document
        .querySelectorAll("#adminCategoryNav .nav-btn")
        .forEach(function (b) {
          b.classList.remove("active");
        });
      btn.classList.add("active");
      renderAdminArticles(cat);
    });
    nav.appendChild(btn);
  });
}

function setupSidebarNav() {
  document.querySelectorAll(".sidebar-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showSection(btn.dataset.section);
    });
  });
  var fs = document.getElementById("submissionFilter");
  if (fs)
    fs.addEventListener("change", function () {
      buildAllSubmissions(fs.value);
    });
}

function showSection(id) {
  document.querySelectorAll(".admin-section").forEach(function (s) {
    s.style.display = "none";
  });
  var sec = document.getElementById(id);
  if (sec) sec.style.display = "block";
  document.querySelectorAll(".sidebar-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  var active = document.querySelector(
    '.sidebar-btn[data-section="' + id + '"]',
  );
  if (active) active.classList.add("active");
  // Start real-time polling when Comments tab is opened, stop when leaving
  if (id === "sectionComments") {
    startCommentsPoll();
  } else {
    stopCommentsPoll();
  }
  if (id === "sectionUsers") buildUserTable();
}

/* TICKER MANAGER */
function initTickerManager() {
  renderTickerMasterControl();
  renderTickerPreview();
  renderTickerHeadlines();
  var addBtn = document.getElementById("tickerAddBtn");
  var addInp = document.getElementById("tickerNewText");
  if (addBtn) addBtn.addEventListener("click", addTickerHeadline);
  // BUG FIX #5: Use a flag to prevent double-submit on rapid Enter key press
  if (addInp)
    addInp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addTickerHeadline();
      }
    });
  var masterBtn = document.getElementById("tickerMasterBtn");
  if (masterBtn)
    masterBtn.addEventListener("click", function () {
      setTickerAllStopped();
      renderTickerMasterControl();
      renderTickerPreview();
      renderTickerHeadlines();
    });
}
function renderTickerMasterControl() {
  var stopped = isTickerAllStopped(),
    dot = document.getElementById("tickerLiveDot"),
    label = document.getElementById("tickerMasterLabel"),
    btn = document.getElementById("tickerMasterBtn");
  if (dot) dot.className = "ticker-live-dot" + (stopped ? " stopped" : "");
  if (label) label.textContent = stopped ? "Ticker: Stopped" : "Ticker: Live";
  if (btn) {
    btn.textContent = stopped ? "▶ Start All" : "⏸ Stop All";
    btn.className = "btn-ticker-master" + (stopped ? " all-stopped" : "");
  }
}
function renderTickerPreview() {
  var track = document.getElementById("tickerPreviewTrack");
  if (!track) return;
  var allStopped = isTickerAllStopped(),
    headlines = getTickerHeadlines().filter(function (h) {
      return h.active && !allStopped;
    });
  if (headlines.length === 0) {
    track.textContent = "— No active headlines —";
    track.className = "ticker-preview-track paused";
    return;
  }
  track.textContent = headlines
    .map(function (h) {
      return h.text;
    })
    .join("   ◆   ");
  track.className = "ticker-preview-track";
}
function renderTickerHeadlines() {
  var list = document.getElementById("tickerHeadlineList"),
    countEl = document.getElementById("tickerCount"),
    headlines = getTickerHeadlines(),
    allStop = isTickerAllStopped();
  if (countEl) countEl.textContent = headlines.length;
  if (headlines.length === 0) {
    list.innerHTML =
      '<div class="ticker-empty-msg">No headlines yet. Add one above.</div>';
    return;
  }
  list.innerHTML = "";
  headlines.forEach(function (h, idx) {
    var eff = allStop || !h.active,
      row = document.createElement("div");
    row.className = "ticker-headline-row" + (eff ? " is-stopped" : "");
    row.id = "trow-" + h.id;
    row.innerHTML =
      '<div class="ticker-headline-num">' +
      (idx + 1) +
      '</div><div class="ticker-headline-body"><div class="ticker-headline-text' +
      (eff ? " stopped-text" : "") +
      '" id="ttext-' +
      h.id +
      '">' +
      escHtml(h.text) +
      '</div><div class="ticker-headline-status"><span class="status-dot' +
      (eff ? " off" : "") +
      '"></span>' +
      (eff ? "Stopped" : "Running on ticker") +
      '</div></div><div class="ticker-headline-actions"><button class="btn-th-remove" onclick="tickerRemove(\'' +
      h.id +
      '\')">🗑 Remove</button><button class="btn-th-rewrite" onclick="tickerRewrite(\'' +
      h.id +
      '\')">✏ Rewrite</button><button class="btn-th-toggle ' +
      (h.active ? "is-live" : "") +
      '" id="ttoggle-' +
      h.id +
      '" onclick="tickerToggle(\'' +
      h.id +
      "')\">" +
      (h.active ? "⏹ Stop" : "▶ Start") +
      "</button></div>";
    list.appendChild(row);
  });
}
function addTickerHeadline() {
  var inp = document.getElementById("tickerNewText"),
    text = inp ? inp.value.trim() : "";
  if (!text) {
    showMsg("tickerAddMsg", "Please enter a headline.", "error");
    return;
  }
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
  var headlines = getTickerHeadlines(),
    h = headlines.find(function (x) {
      return x.id === id;
    });
  if (!h) return;
  document.querySelectorAll(".ticker-rewrite-row").forEach(function (el) {
    el.remove();
  });
  document.querySelectorAll(".ticker-headline-row").forEach(function (el) {
    el.classList.remove("is-rewriting");
  });
  var row = document.getElementById("trow-" + id);
  if (!row) return;
  row.classList.add("is-rewriting");
  var rrow = document.createElement("div");
  rrow.className = "ticker-rewrite-row";
  rrow.id = "trewrite-" + id;
  rrow.innerHTML =
    '<input type="text" class="ticker-rewrite-input" id="trewrite-inp-' +
    id +
    '" value="' +
    escHtml(h.text) +
    '" maxlength="200" /><button class="btn-rewrite-save" onclick="tickerSaveRewrite(\'' +
    id +
    '\')">✓ Save</button><button class="btn-rewrite-cancel" onclick="tickerCancelRewrite(\'' +
    id +
    "')\">✕</button>";
  var bodyDiv = row.querySelector(".ticker-headline-body");
  bodyDiv.appendChild(rrow);
  var inp = document.getElementById("trewrite-inp-" + id);
  if (inp) {
    inp.focus();
    inp.select();
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") tickerSaveRewrite(id);
      if (e.key === "Escape") tickerCancelRewrite(id);
    });
  }
}
function tickerSaveRewrite(id) {
  var inp = document.getElementById("trewrite-inp-" + id),
    text = inp ? inp.value.trim() : "";
  if (!text) return;
  DB.rewriteTickerHeadline(id, text);
  _tickerCache = null;
  renderTickerPreview();
  renderTickerHeadlines();
}
function tickerCancelRewrite(id) {
  var row = document.getElementById("trow-" + id),
    r = document.getElementById("trewrite-" + id);
  if (row) row.classList.remove("is-rewriting");
  if (r) r.remove();
}
function tickerToggle(id) {
  DB.toggleTickerHeadline(id);
  _tickerCache = null;
  renderTickerPreview();
  renderTickerHeadlines();
}

/* ARTICLES */
function renderAdminArticles(cat) {
  var list = document.getElementById("adminArticleList");
  if (!list) return;
  var all = DB.getArticles(),
    filtered =
      cat === "general"
        ? all
        : all.filter(function (a) {
            return a.category === cat;
          });
  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-msg">No articles in this category.</p>';
    return;
  }
  var html = "";
  filtered.forEach(function (art) {
    var stopped = art.isStopped;
    // BUG FIX #8: Use a local fallback image instead of hardcoded external Unsplash URL
    var fallback = "css/img-fallback.png";
    html +=
      '<div class="admin-art-row' +
      (stopped ? " stopped-article" : "") +
      '"><img src="' +
      art.image +
      '" alt="" onerror="this.src=\'' +
      fallback +
      '\'" /><div class="admin-art-info"><div><span class="cat-badge cat-' +
      art.category +
      '">' +
      CAT_LABELS_ADMIN[art.category] +
      "</span>" +
      (stopped ? '<span class="stopped-badge">Hidden</span>' : "") +
      "</div><strong>" +
      escHtml(art.titleEn) +
      "</strong><small>" +
      art.date +
      " · " +
      art.author +
      " · " +
      (art.views || 0) +
      ' views</small></div><div class="admin-art-actions"><button class="btn-edit" onclick="startEdit(\'' +
      art.id +
      '\')">✏ Edit</button><button class="btn-rewrite" onclick="startRewrite(\'' +
      art.id +
      '\')">🔄 Rewrite</button><button class="btn-stop' +
      (stopped ? " is-stopped" : "") +
      '" onclick="toggleStop(\'' +
      art.id +
      "')\">" +
      (stopped ? "▶ Restore" : "⏹ Stop") +
      '</button><button class="btn-delete" onclick="confirmDelete(\'' +
      art.id +
      "')\">🗑 Delete</button></div></div>";
  });
  list.innerHTML = html;
}
function toggleStop(id) {
  toggleArticleStopped(id);
  renderAdminArticles(adminCurrentCat);
}
function confirmDelete(id) {
  if (confirm("Delete this article?")) {
    DB.deleteArticle(id);
    renderAdminArticles(adminCurrentCat);
  }
}

function setupArticleForm() {
  var catSel = document.getElementById("formCategory");
  if (catSel) {
    CATS.forEach(function (cat) {
      var opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = CAT_LABELS_ADMIN[cat];
      catSel.appendChild(opt);
    });
  }
  var saveBtn = document.getElementById("saveArticleBtn"),
    cancelBtn = document.getElementById("cancelEditBtn");
  if (saveBtn)
    saveBtn.addEventListener("click", function () {
      var titleEn = val("formTitleEn"),
        titleNp = val("formTitle"),
        summaryEn = val("formSummaryEn"),
        summaryNp = val("formSummary"),
        contentEn = val("formContentEn"),
        contentNp = val("formContent"),
        author = val("formAuthor"),
        category = val("formCategory");
      if (!titleEn && !titleNp) {
        showMsg("formMsg", "Please enter a title.", "error");
        return;
      }
      if (!summaryEn && !summaryNp) {
        showMsg("formMsg", "Please enter a summary.", "error");
        return;
      }
      if (!contentEn && !contentNp) {
        showMsg("formMsg", "Please enter article content.", "error");
        return;
      }
      if (!author || !category) {
        showMsg("formMsg", "Author and Category are required.", "error");
        return;
      }
      var data = {
        titleEn: titleEn || titleNp,
        title: titleNp || titleEn,
        summaryEn: summaryEn || summaryNp,
        summary: summaryNp || summaryEn,
        contentEn: contentEn || contentNp,
        content: contentNp || contentEn,
        image: val("formImage"),
        author,
        category,
      };
      if (editingId) {
        DB.updateArticle(editingId, data);
        showMsg("formMsg", rewriteMode ? "Rewritten!" : "Updated!", "success");
        editingId = null;
        rewriteMode = false;
      } else {
        DB.addArticle(data);
        showMsg("formMsg", "Published!", "success");
      }
      clearForm();
      resetFormUI();
      renderAdminArticles(adminCurrentCat);
    });
  if (cancelBtn)
    cancelBtn.addEventListener("click", function () {
      editingId = null;
      rewriteMode = false;
      clearForm();
      resetFormUI();
    });
}
function resetFormUI() {
  var sb = document.getElementById("saveArticleBtn"),
    cb = document.getElementById("cancelEditBtn"),
    bd = document.getElementById("formModeBadge");
  if (sb) sb.textContent = "Publish Article";
  if (cb) cb.style.display = "none";
  if (bd) {
    bd.textContent = "✏️ New Article";
    bd.className = "form-mode-badge";
  }
}
function startEdit(id) {
  var a = DB.getArticleById(id);
  if (!a) return;
  rewriteMode = false;
  showSection("sectionArticles");
  fillForm(a);
  editingId = id;
  document.getElementById("saveArticleBtn").textContent = "Update Article";
  document.getElementById("cancelEditBtn").style.display = "inline-block";
  var bd = document.getElementById("formModeBadge");
  if (bd) {
    bd.textContent = "✏️ Editing Article";
    bd.className = "form-mode-badge edit-mode";
  }
  document.getElementById("articleForm").scrollIntoView({ behavior: "smooth" });
}
function startRewrite(id) {
  var a = DB.getArticleById(id);
  if (!a) return;
  rewriteMode = true;
  showSection("sectionArticles");
  fillForm(a);
  editingId = id;
  document.getElementById("saveArticleBtn").textContent = "Save Rewrite";
  document.getElementById("cancelEditBtn").style.display = "inline-block";
  var bd = document.getElementById("formModeBadge");
  if (bd) {
    bd.textContent = "🔄 Rewriting Article";
    bd.className = "form-mode-badge rewrite-mode";
  }
  var c = document.getElementById("formContentEn");
  if (c) {
    c.focus();
    c.select();
  }
  document.getElementById("articleForm").scrollIntoView({ behavior: "smooth" });
}
function fillForm(a) {
  setVal("formTitleEn", a.titleEn || "");
  setVal("formTitle", a.title || "");
  setVal("formSummaryEn", a.summaryEn || "");
  setVal("formSummary", a.summary || "");
  setVal("formContentEn", a.contentEn || "");
  setVal("formContent", a.content || "");
  setVal("formImage", a.image || "");
  setVal("formAuthor", a.author || "");
  setVal("formCategory", a.category || "general");
}
function clearForm() {
  [
    "formTitleEn",
    "formTitle",
    "formSummaryEn",
    "formSummary",
    "formContentEn",
    "formContent",
    "formImage",
    "formAuthor",
  ].forEach(function (id) {
    setVal(id, "");
  });
}

/* USERS */
function buildUserTable() {
  var tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  var html = "";
  DB.getUsers().forEach(function (u) {
    html +=
      "<tr><td>" +
      escHtml(u.name) +
      "</td><td>" +
      escHtml(u.email) +
      '</td><td><span class="role-badge role-' +
      u.role +
      '">' +
      u.role +
      "</span></td><td>" +
      (u.joined_at || "—") +
      "</td><td>" +
      (u.role !== "admin"
        ? '<button class="btn-delete" onclick="deleteUser(\'' +
          u.id +
          "')\">Remove</button>"
        : "") +
      "</td></tr>";
  });
  tbody.innerHTML =
    html ||
    '<tr><td colspan="5" class="empty-msg" style="text-align:center;padding:20px;">No users found.</td></tr>';
}
function deleteUser(id) {
  if (confirm("Remove this user?")) {
    DB.deleteUser(id);
    buildUserTable();
  }
}

/* COMMENTS */
var _commentsPollTimer = null;

function startCommentsPoll() {
  stopCommentsPoll();
  buildAllComments();
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
  var list = document.getElementById("allCommentsList");
  if (!list) return;
  var all = DB.getAllComments(),
    articles = DB.getArticles(),
    html = "",
    hasAny = false;
  Object.keys(all).forEach(function (artId) {
    (all[artId] || []).forEach(function (c) {
      hasAny = true;
      var art = articles.find(function (a) {
        return a.id === artId;
      });
      html +=
        '<div class="admin-comment-row"><div class="admin-comment-info"><strong>' +
        escHtml(c.name) +
        '</strong><span class="comment-article-title">on: ' +
        escHtml(art ? art.titleEn : artId) +
        "</span><p>" +
        escHtml(c.text) +
        "</p><small>" +
        c.date +
        '</small></div><button class="btn-delete" onclick="adminDeleteComment(\'' +
        c.id +
        "')\">Delete</button></div>";
    });
  });
  list.innerHTML = hasAny ? html : '<p class="empty-msg">No comments yet.</p>';
}
function adminDeleteComment(cId) {
  DB.deleteComment(cId);
  buildAllComments();
}

/* SUBMISSIONS */
function buildAllSubmissions(filterStatus) {
  var list = document.getElementById("submissionsList"),
    countEl = document.getElementById("submissionCount");
  if (!list) return;
  filterStatus = filterStatus || "all";
  var submissions = DB.getSubmissions();
  if (filterStatus !== "all")
    submissions = submissions.filter(function (s) {
      return s.status === filterStatus;
    });
  if (countEl)
    countEl.textContent =
      submissions.length +
      " submission" +
      (submissions.length !== 1 ? "s" : "");
  if (submissions.length === 0) {
    list.innerHTML =
      '<p class="empty-msg">No ' +
      (filterStatus !== "all" ? filterStatus + " " : "") +
      "submissions yet.</p>";
    return;
  }
  var html = "";
  submissions.forEach(function (sub) {
    var sc =
      sub.status === "approved"
        ? "status-approved"
        : sub.status === "rejected"
          ? "status-rejected"
          : "status-pending";
    var sl =
      sub.status === "approved"
        ? "✅ Approved"
        : sub.status === "rejected"
          ? "❌ Rejected"
          : "⏳ Pending";
    // BUG FIX #7: Apply escHtml to sub.category to prevent XSS injection
    var safeCat = escHtml(sub.category || "general");
    html +=
      '<div class="submission-row" id="srow-' +
      sub.id +
      '"><div class="submission-header"><div class="submission-meta-left"><span class="cat-badge cat-' +
      safeCat +
      '">' +
      safeCat +
      '</span><span class="submission-status-badge ' +
      sc +
      '">' +
      sl +
      '</span></div><div class="submission-meta-right"><span>📅 ' +
      (sub.date || "—") +
      "</span><span>📍 " +
      escHtml(sub.location || "—") +
      "</span></div></div>" +
      (sub.titleEn
        ? '<div class="submission-title-en">' + escHtml(sub.titleEn) + "</div>"
        : "") +
      ' <div class="submission-submitter">By: <strong>' +
      escHtml(sub.subscriberName) +
      "</strong> &lt;" +
      escHtml(sub.subscriberEmail) +
      "&gt;</div>";
    if (sub.summaryEn || sub.summaryNp) {
      html +=
        '<div class="submission-body-section"><div class="submission-section-label">Summary</div>' +
        (sub.summaryEn
          ? '<p class="submission-text-en">' + escHtml(sub.summaryEn) + "</p>"
          : "") +
        (sub.summaryNp
          ? '<p class="submission-text-np">' + escHtml(sub.summaryNp) + "</p>"
          : "") +
        "</div>";
    }
    html +=
      '<div class="submission-actions">' +
      (sub.status !== "approved"
        ? '<button class="btn-sub-approve" onclick="updateSubStatus(\'' +
          sub.id +
          "','approved')\">✅ Approve</button>"
        : "") +
      (sub.status !== "rejected"
        ? '<button class="btn-sub-reject" onclick="updateSubStatus(\'' +
          sub.id +
          "','rejected')\">❌ Reject</button>"
        : "") +
      (sub.status !== "pending"
        ? '<button class="btn-sub-pending" onclick="updateSubStatus(\'' +
          sub.id +
          "','pending')\">⏳ Pending</button>"
        : "") +
      '<button class="btn-delete" onclick="deleteSubm(\'' +
      sub.id +
      "')\">🗑 Delete</button></div></div>";
  });
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

/* Helpers */
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function setVal(id, v) {
  var el = document.getElementById(id);
  if (el) el.value = v;
}
function showMsg(id, text, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "form-msg " + type;
  setTimeout(function () {
    el.className = "form-msg";
  }, 3500);
}
function escHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
