/* ============================================================
   admin.js — Nepal Khabar Admin Panel v3
   Features: Article management, Stop/Rewrite articles,
             Live Ticker Manager (Remove / Rewrite / Start/Stop)
   ============================================================ */

const CATS = ['general','business','technology','science','health','sports','entertainment'];
const CAT_LABELS_ADMIN = {
  general:'Top Stories', business:'Business', technology:'Technology',
  science:'Science', health:'Health', sports:'Sports', entertainment:'Entertainment'
};

let adminCurrentCat = 'general';
let editingId       = null;
let rewriteMode     = false;

/* TICKER DATA — stored in localStorage Structure: array of { id, text, active } */
const TICKER_STORE_KEY    = 'nk__ticker_headlines';
const TICKER_STOPPED_KEY  = 'nk__ticker_all_stopped';

const DEFAULT_HEADLINES = [
  'Nepal cricket team defeats India by 7 wickets in Asia Cup Qualifier',
  'Nepal Rastra Bank cuts interest rate to 5.0% — industries welcome move',
  '5.2 magnitude earthquake tremors felt in Kathmandu Valley, no casualties reported',
  'Nepal Telecom launches 5G service in Kathmandu Valley',
  'Dengue fever cases rising in Terai districts — Health Ministry issues alert'
];

function getTickerHeadlines() {
  try {
    const raw = localStorage.getItem(TICKER_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  /* Seed defaults */
  const defaults = DEFAULT_HEADLINES.map(function(text, i) {
    return { id: 'th-' + Date.now() + '-' + i, text: text, active: true };
  });
  saveTickerHeadlines(defaults);
  return defaults;
}
function saveTickerHeadlines(arr) {
  localStorage.setItem(TICKER_STORE_KEY, JSON.stringify(arr));
}
function isTickerAllStopped() { return localStorage.getItem(TICKER_STOPPED_KEY) === 'true'; }
function setTickerAllStopped(v) { localStorage.setItem(TICKER_STOPPED_KEY, v ? 'true' : 'false'); }

/* Article stopped state */
const STOPPED_KEY = 'nk__stopped_articles';
function getStoppedArticles() {
  try { return JSON.parse(localStorage.getItem(STOPPED_KEY) || '[]'); } catch(e) { return []; }
}
function isArticleStopped(id) { return getStoppedArticles().includes(id); }
function toggleArticleStopped(id) {
  let arr = getStoppedArticles();
  arr = arr.includes(id) ? arr.filter(function(x){ return x !== id; }) : arr.concat([id]);
  localStorage.setItem(STOPPED_KEY, JSON.stringify(arr));
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const session = DB.getSession();
  if (!session || session.role !== 'admin') {
    window.location.href = 'admin-login.html';
    return;
  }
  setEl('adminName', session.name);
  buildAdminNav();
  renderAdminArticles(adminCurrentCat);
  buildUserTable();
  buildAllComments();
  buildAllSubmissions();
  buildSubscribersTable();
  setupArticleForm();
  setupLogout();
  setupSidebarNav();
  initTickerManager();
  /* Show Articles by default; hide all other sections */
  showSection('sectionArticles');
});

/* ── Admin Category Nav ───────────────────────────────────── */
function buildAdminNav() {
  const nav = document.getElementById('adminCategoryNav');
  if (!nav) return;
  nav.innerHTML = '';
  CATS.forEach(function(cat) {
    const btn = document.createElement('button');
    btn.className   = 'nav-btn' + (cat === adminCurrentCat ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS_ADMIN[cat];
    btn.addEventListener('click', function() {
      adminCurrentCat = cat;
      document.querySelectorAll('#adminCategoryNav .nav-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      renderAdminArticles(cat);
    });
    nav.appendChild(btn);
  });
}

/* ── Sidebar navigation ───────────────────────────────────── */
function setupSidebarNav() {
  document.querySelectorAll('.sidebar-btn').forEach(function(btn) {
    btn.addEventListener('click', function(){ showSection(btn.dataset.section); });
  });
  /* Submission filter */
  const filterSel = document.getElementById('submissionFilter');
  if (filterSel) {
    filterSel.addEventListener('change', function(){ buildAllSubmissions(filterSel.value); });
  }
}
function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(function(s){ s.style.display = 'none'; });
  const sec = document.getElementById(id);
  if (sec) sec.style.display = 'block';
  document.querySelectorAll('.sidebar-btn').forEach(function(b){ b.classList.remove('active'); });
  const active = document.querySelector('.sidebar-btn[data-section="' + id + '"]');
  if (active) active.classList.add('active');
}

/*LIVE TICKER MANAGER*/
function initTickerManager() {
  renderTickerMasterControl();
  renderTickerPreview();
  renderTickerHeadlines();

  /* Add headline */
  const addBtn = document.getElementById('tickerAddBtn');
  const addInp = document.getElementById('tickerNewText');
  if (addBtn) {
    addBtn.addEventListener('click', function() { addTickerHeadline(); });
  }
  if (addInp) {
    addInp.addEventListener('keydown', function(e){ if (e.key === 'Enter') addTickerHeadline(); });
  }

  /* Master stop/start */
  const masterBtn = document.getElementById('tickerMasterBtn');
  if (masterBtn) {
    masterBtn.addEventListener('click', function() {
      setTickerAllStopped(!isTickerAllStopped());
      renderTickerMasterControl();
      renderTickerPreview();
      renderTickerHeadlines();
    });
  }
}

function renderTickerMasterControl() {
  const stopped    = isTickerAllStopped();
  const dot        = document.getElementById('tickerLiveDot');
  const label      = document.getElementById('tickerMasterLabel');
  const btn        = document.getElementById('tickerMasterBtn');
  if (dot)   { dot.className = 'ticker-live-dot' + (stopped ? ' stopped' : ''); }
  if (label) { label.textContent = stopped ? 'Ticker: Stopped' : 'Ticker: Live'; }
  if (btn)   {
    btn.textContent = stopped ? '▶ Start All' : '⏸ Stop All';
    btn.className   = 'btn-ticker-master' + (stopped ? ' all-stopped' : '');
  }
}

function renderTickerPreview() {
  const track = document.getElementById('tickerPreviewTrack');
  if (!track) return;
  const allStopped = isTickerAllStopped();
  const headlines  = getTickerHeadlines().filter(function(h){ return h.active && !allStopped; });

  if (headlines.length === 0) {
    track.textContent = '— No active headlines —';
    track.className   = 'ticker-preview-track paused';
    return;
  }
  track.textContent = headlines.map(function(h){ return h.text; }).join('   ◆   ');
  track.className   = 'ticker-preview-track';
}

function renderTickerHeadlines() {
  const list      = document.getElementById('tickerHeadlineList');
  const countEl   = document.getElementById('tickerCount');
  const headlines = getTickerHeadlines();
  const allStop   = isTickerAllStopped();

  if (countEl) countEl.textContent = headlines.length;

  if (headlines.length === 0) {
    list.innerHTML = '<div class="ticker-empty-msg">No headlines yet. Add one above.</div>';
    return;
  }

  list.innerHTML = '';
  headlines.forEach(function(h, idx) {
    const effectiveStopped = allStop || !h.active;
    const row = document.createElement('div');
    row.className = 'ticker-headline-row' + (effectiveStopped ? ' is-stopped' : '');
    row.id = 'trow-' + h.id;

    row.innerHTML =
      '<div class="ticker-headline-num">' + (idx + 1) + '</div>' +
      '<div class="ticker-headline-body">' +
        '<div class="ticker-headline-text' + (effectiveStopped ? ' stopped-text' : '') + '" id="ttext-' + h.id + '">' + escHtml(h.text) + '</div>' +
        '<div class="ticker-headline-status">' +
          '<span class="status-dot' + (effectiveStopped ? ' off' : '') + '"></span>' +
          (effectiveStopped ? 'Stopped' : 'Running on ticker') +
        '</div>' +
      '</div>' +
      '<div class="ticker-headline-actions">' +
        '<button class="btn-th-remove"  onclick="tickerRemove(\'' + h.id + '\')">🗑 Remove</button>' +
        '<button class="btn-th-rewrite" onclick="tickerRewrite(\'' + h.id + '\')">✏ Rewrite</button>' +
        '<button class="btn-th-toggle ' + (h.active ? 'is-live' : '') + '" id="ttoggle-' + h.id + '" onclick="tickerToggle(\'' + h.id + '\')">' +
          (h.active ? '⏹ Stop' : '▶ Start') +
        '</button>' +
      '</div>';

    list.appendChild(row);
  });
}

/* ── Add headline ─────────────────────────────────────────── */
function addTickerHeadline() {
  const inp  = document.getElementById('tickerNewText');
  const text = inp ? inp.value.trim() : '';
  if (!text) { showMsg('tickerAddMsg', 'Please enter a headline.', 'error'); return; }

  const headlines = getTickerHeadlines();
  headlines.push({ id: 'th-' + Date.now(), text: text, active: true });
  saveTickerHeadlines(headlines);
  if (inp) inp.value = '';

  showMsg('tickerAddMsg', '✅ Headline added and now showing on ticker!', 'success');
  renderTickerPreview();
  renderTickerHeadlines();
}

/* ── Remove headline ──────────────────────────────────────── */
function tickerRemove(id) {
  if (!confirm('Remove this headline from the ticker?')) return;
  const headlines = getTickerHeadlines().filter(function(h){ return h.id !== id; });
  saveTickerHeadlines(headlines);
  renderTickerPreview();
  renderTickerHeadlines();
}

/* ── Rewrite headline (inline) ────────────────────────────── */
function tickerRewrite(id) {
  const headlines = getTickerHeadlines();
  const h = headlines.find(function(x){ return x.id === id; });
  if (!h) return;

  /* Close any other open rewrite inputs */
  document.querySelectorAll('.ticker-rewrite-row').forEach(function(el){ el.remove(); });
  document.querySelectorAll('.ticker-headline-row').forEach(function(el){ el.classList.remove('is-rewriting'); });

  const row     = document.getElementById('trow-' + id);
  const textEl  = document.getElementById('ttext-' + id);
  if (!row || !textEl) return;

  row.classList.add('is-rewriting');

  /* Build inline rewrite controls */
  const rewriteRow = document.createElement('div');
  rewriteRow.className = 'ticker-rewrite-row';
  rewriteRow.id = 'trewrite-' + id;
  rewriteRow.innerHTML =
    '<input type="text" class="ticker-rewrite-input" id="trewrite-inp-' + id + '" value="' + escHtml(h.text) + '" maxlength="200" />' +
    '<button class="btn-rewrite-save"   onclick="tickerSaveRewrite(\'' + id + '\')">✓ Save</button>' +
    '<button class="btn-rewrite-cancel" onclick="tickerCancelRewrite(\'' + id + '\')">✕</button>';

  /* Insert after body div */
  const bodyDiv = row.querySelector('.ticker-headline-body');
  bodyDiv.appendChild(rewriteRow);

  /* Focus and select */
  const inp = document.getElementById('trewrite-inp-' + id);
  if (inp) {
    inp.focus(); inp.select();
    inp.addEventListener('keydown', function(e){
      if (e.key === 'Enter')  tickerSaveRewrite(id);
      if (e.key === 'Escape') tickerCancelRewrite(id);
    });
  }
}

function tickerSaveRewrite(id) {
  const inp  = document.getElementById('trewrite-inp-' + id);
  const text = inp ? inp.value.trim() : '';
  if (!text) return;

  const headlines = getTickerHeadlines();
  const h = headlines.find(function(x){ return x.id === id; });
  if (h) { h.text = text; }
  saveTickerHeadlines(headlines);

  renderTickerPreview();
  renderTickerHeadlines();
}

function tickerCancelRewrite(id) {
  const row      = document.getElementById('trow-' + id);
  const rewrite  = document.getElementById('trewrite-' + id);
  if (row)    row.classList.remove('is-rewriting');
  if (rewrite) rewrite.remove();
}

/* ── Start / Stop individual headline ────────────────────── */
function tickerToggle(id) {
  const headlines = getTickerHeadlines();
  const h = headlines.find(function(x){ return x.id === id; });
  if (h) { h.active = !h.active; }
  saveTickerHeadlines(headlines);
  renderTickerPreview();
  renderTickerHeadlines();
}

/* ================================================================
   ARTICLE MANAGEMENT
   ================================================================ */
function renderAdminArticles(cat) {
  const list = document.getElementById('adminArticleList');
  if (!list) return;
  const all      = DB.getArticles();
  const filtered = cat === 'general' ? all : all.filter(function(a){ return a.category === cat; });

  if (filtered.length === 0) { list.innerHTML = '<p class="empty-msg">No articles in this category.</p>'; return; }

  let html = '';
  filtered.forEach(function(art) {
    const stopped = isArticleStopped(art.id);
    html += '<div class="admin-art-row' + (stopped ? ' stopped-article' : '') + '">';
    html += '  <img src="' + art.image + '" alt="" onerror="this.src=\'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=60\'" />';
    html += '  <div class="admin-art-info">';
    html += '    <div><span class="cat-badge cat-' + art.category + '">' + CAT_LABELS_ADMIN[art.category] + '</span>' + (stopped ? '<span class="stopped-badge">Hidden</span>' : '') + '</div>';
    html += '    <strong>' + escHtml(art.titleEn) + '</strong>';
    html += '    <small>' + art.date + ' · ' + art.author + ' · ' + (art.views||0) + ' views</small>';
    html += '  </div>';
    html += '  <div class="admin-art-actions">';
    html += '    <button class="btn-edit"    onclick="startEdit(\'' + art.id + '\')">✏ Edit</button>';
    html += '    <button class="btn-rewrite" onclick="startRewrite(\'' + art.id + '\')">🔄 Rewrite</button>';
    html += '    <button class="btn-stop' + (stopped ? ' is-stopped' : '') + '" onclick="toggleStop(\'' + art.id + '\')">' + (stopped ? '▶ Restore' : '⏹ Stop') + '</button>';
    html += '    <button class="btn-delete"  onclick="confirmDelete(\'' + art.id + '\')">🗑 Delete</button>';
    html += '  </div>';
    html += '</div>';
  });
  list.innerHTML = html;
}

function toggleStop(id) { toggleArticleStopped(id); renderAdminArticles(adminCurrentCat); }
function confirmDelete(id) {
  if (confirm('Delete this article? This cannot be undone.')) {
    DB.deleteArticle(id);
    renderAdminArticles(adminCurrentCat);
    buildUserTable();
  }
}

function setupArticleForm() {
  const catSel = document.getElementById('formCategory');
  if (catSel) {
    CATS.forEach(function(cat) {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = CAT_LABELS_ADMIN[cat];
      catSel.appendChild(opt);
    });
  }

  const saveBtn   = document.getElementById('saveArticleBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const titleEn   = val('formTitleEn');
      const titleNp   = val('formTitle');
      const summaryEn = val('formSummaryEn');
      const summaryNp = val('formSummary');
      const contentEn = val('formContentEn');
      const contentNp = val('formContent');
      const author    = val('formAuthor');
      const category  = val('formCategory');

      /* Require at least one language for title, summary and content */
      if (!titleEn && !titleNp) {
        showMsg('formMsg', 'कृपया शीर्षक अंग्रेजी वा नेपालीमा लेख्नुहोस्। (Please enter a title in English or Nepali.)', 'error'); return;
      }
      if (!summaryEn && !summaryNp) {
        showMsg('formMsg', 'कृपया सारांश अंग्रेजी वा नेपालीमा लेख्नुहोस्। (Please enter a summary.)', 'error'); return;
      }
      if (!contentEn && !contentNp) {
        showMsg('formMsg', 'कृपया लेखको मुख्य भाग लेख्नुहोस्। (Please enter article content.)', 'error'); return;
      }
      if (!author || !category) {
        showMsg('formMsg', 'लेखक र विभाग आवश्यक छ। (Author and Category are required.)', 'error'); return;
      }

      /* Use Nepali as fallback display if English is missing */
      const data = {
        titleEn:   titleEn   || titleNp,
        title:     titleNp   || titleEn,
        summaryEn: summaryEn || summaryNp,
        summary:   summaryNp || summaryEn,
        contentEn: contentEn || contentNp,
        content:   contentNp || contentEn,
        image:     val('formImage'),
        author,
        category
      };
      if (editingId) {
        DB.updateArticle(editingId, data);
        showMsg('formMsg', rewriteMode ? 'Article rewritten!' : 'Article updated!', 'success');
        editingId = null; rewriteMode = false;
      } else {
        DB.addArticle(data);
        showMsg('formMsg', 'Article published!', 'success');
      }
      clearForm(); resetFormUI(); renderAdminArticles(adminCurrentCat);
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      editingId = null; rewriteMode = false; clearForm(); resetFormUI();
    });
  }
}

function resetFormUI() {
  const saveBtn   = document.getElementById('saveArticleBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const badge     = document.getElementById('formModeBadge');
  if (saveBtn)   saveBtn.textContent     = 'Publish Article';
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (badge)     { badge.textContent = '✏️ New Article'; badge.className = 'form-mode-badge'; }
}

function startEdit(id) {
  const a = DB.getArticleById(id); if (!a) return;
  rewriteMode = false; showSection('sectionArticles'); fillForm(a); editingId = id;
  document.getElementById('saveArticleBtn').textContent = 'Update Article';
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  const badge = document.getElementById('formModeBadge');
  if (badge) { badge.textContent = '✏️ Editing Article'; badge.className = 'form-mode-badge edit-mode'; }
  document.getElementById('articleForm').scrollIntoView({ behavior:'smooth' });
}

function startRewrite(id) {
  const a = DB.getArticleById(id); if (!a) return;
  rewriteMode = true; showSection('sectionArticles'); fillForm(a); editingId = id;
  document.getElementById('saveArticleBtn').textContent = 'Save Rewrite';
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  const badge = document.getElementById('formModeBadge');
  if (badge) { badge.textContent = '🔄 Rewriting Article'; badge.className = 'form-mode-badge rewrite-mode'; }
  const c = document.getElementById('formContentEn');
  if (c) { c.focus(); c.select(); }
  document.getElementById('articleForm').scrollIntoView({ behavior:'smooth' });
}

function fillForm(a) {
  setVal('formTitleEn',   a.titleEn   || '');
  setVal('formTitle',     a.title     || '');
  setVal('formSummaryEn', a.summaryEn || '');
  setVal('formSummary',   a.summary   || '');
  setVal('formContentEn', a.contentEn || '');
  setVal('formContent',   a.content   || '');
  setVal('formImage',     a.image     || '');
  setVal('formAuthor',    a.author    || '');
  setVal('formCategory',  a.category  || 'general');
}
function clearForm() {
  ['formTitleEn','formTitle','formSummaryEn','formSummary','formContentEn','formContent','formImage','formAuthor']
    .forEach(function(id){ setVal(id,''); });
}

/* ── Users Table ──────────────────────────────────────────── */
function buildUserTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  let html = '';
  DB.getUsers().forEach(function(u) {
    html += '<tr>';
    html += '<td>' + escHtml(u.name) + '</td>';
    html += '<td>' + escHtml(u.email) + '</td>';
    html += '<td><span class="role-badge role-' + u.role + '">' + u.role + '</span></td>';
    html += '<td>' + (u.joined || '—') + '</td>';
    html += '<td>' + (u.role !== 'admin' ? '<button class="btn-delete" onclick="deleteUser(\'' + u.id + '\')">Remove</button>' : '') + '</td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;
}
function deleteUser(id) {
  if (confirm('Remove this user?')) {
    DB.saveUsers(DB.getUsers().filter(function(u){ return u.id !== id; }));
    buildUserTable();
  }
}

/* ── All Comments ─────────────────────────────────────────── */
function buildAllComments() {
  const list = document.getElementById('allCommentsList');
  if (!list) return;
  const all = DB.getAllComments(), articles = DB.getArticles();
  let html = '', hasAny = false;
  Object.keys(all).forEach(function(artId) {
    (all[artId] || []).forEach(function(c) {
      hasAny = true;
      const art = articles.find(function(a){ return a.id === artId; });
      html += '<div class="admin-comment-row">';
      html += '  <div class="admin-comment-info">';
      html += '    <strong>' + escHtml(c.name) + '</strong>';
      html += '    <span class="comment-article-title">on: ' + escHtml(art ? art.titleEn : artId) + '</span>';
      html += '    <p>' + escHtml(c.text) + '</p>';
      html += '    <small>' + c.date + '</small>';
      html += '  </div>';
      html += '  <button class="btn-delete" onclick="adminDeleteComment(\'' + artId + '\',\'' + c.id + '\')">Delete</button>';
      html += '</div>';
    });
  });
  list.innerHTML = hasAny ? html : '<p class="empty-msg">No comments yet.</p>';
}
function adminDeleteComment(artId, cId) { DB.deleteComment(artId, cId); buildAllComments(); }

/* ================================================================
   SUBMISSIONS (Citizen News)
   ================================================================ */
function buildAllSubmissions(filterStatus) {
  const list      = document.getElementById('submissionsList');
  const countEl   = document.getElementById('submissionCount');
  if (!list) return;

  filterStatus = filterStatus || 'all';
  let submissions = DB.getSubmissions();
  if (filterStatus !== 'all') {
    submissions = submissions.filter(function(s){ return s.status === filterStatus; });
  }

  if (countEl) countEl.textContent = submissions.length + ' submission' + (submissions.length !== 1 ? 's' : '');

  if (submissions.length === 0) {
    list.innerHTML = '<p class="empty-msg">No ' + (filterStatus !== 'all' ? filterStatus + ' ' : '') + 'submissions yet.</p>';
    return;
  }

  const CAT_LABELS_SUB = {
    general:'Top Stories', business:'Business', technology:'Technology',
    science:'Science', health:'Health', sports:'Sports', entertainment:'Entertainment'
  };

  let html = '';
  submissions.forEach(function(sub) {
    const statusClass = sub.status === 'approved' ? 'status-approved'
                      : sub.status === 'rejected' ? 'status-rejected'
                      : 'status-pending';
    const statusLabel = sub.status === 'approved' ? '✅ Approved'
                      : sub.status === 'rejected' ? '❌ Rejected'
                      : '⏳ Pending';

    html += '<div class="submission-row" id="srow-' + sub.id + '">';

    /* Header */
    html += '<div class="submission-header">';
    html += '  <div class="submission-meta-left">';
    html += '    <span class="cat-badge cat-' + (sub.category||'general') + '">' + (CAT_LABELS_SUB[sub.category]||'General') + '</span>';
    html += '    <span class="submission-status-badge ' + statusClass + '">' + statusLabel + '</span>';
    html += '  </div>';
    html += '  <div class="submission-meta-right">';
    html += '    <span>📅 ' + (sub.date || '—') + '</span>';
    html += '    <span>📍 ' + escHtml(sub.location || '—') + '</span>';
    html += '    <span>🕐 ' + new Date(sub.submittedAt).toLocaleDateString('en-NP') + '</span>';
    html += '  </div>';
    html += '</div>';

    /* Titles */
    if (sub.titleEn) html += '<div class="submission-title-en">' + escHtml(sub.titleEn) + '</div>';
    if (sub.titleNp) html += '<div class="submission-title-np">' + escHtml(sub.titleNp) + '</div>';

    /* Submitter info */
    html += '<div class="submission-submitter">Submitted by: <strong>' + escHtml(sub.subscriberName) + '</strong>';
    html += ' &lt;' + escHtml(sub.subscriberEmail) + '&gt;';
    if (sub.subscriberLocation) html += ' · 📍 ' + escHtml(sub.subscriberLocation);
    html += '</div>';

    /* Summary */
    if (sub.summaryEn || sub.summaryNp) {
      html += '<div class="submission-body-section">';
      html += '<div class="submission-section-label">Summary</div>';
      if (sub.summaryEn) html += '<p class="submission-text-en">' + escHtml(sub.summaryEn) + '</p>';
      if (sub.summaryNp) html += '<p class="submission-text-np">' + escHtml(sub.summaryNp) + '</p>';
      html += '</div>';
    }

    /* Full details — collapsible */
    if (sub.bodyEn || sub.bodyNp) {
      html += '<details class="submission-details">';
      html += '<summary class="submission-details-toggle">📄 View Full Details</summary>';
      html += '<div class="submission-body-section">';
      if (sub.bodyEn) html += '<p class="submission-text-en">' + escHtml(sub.bodyEn).replace(/\n/g,'<br>') + '</p>';
      if (sub.bodyNp) html += '<p class="submission-text-np">' + escHtml(sub.bodyNp).replace(/\n/g,'<br>') + '</p>';
      html += '</div>';
      html += '</details>';
    }

    /* Photo */
    if (sub.photo) {
      html += '<details class="submission-details">';
      html += '<summary class="submission-details-toggle">📷 View Incident Photo</summary>';
      html += '<div style="padding:12px 0;"><img src="' + sub.photo + '" alt="Incident photo" style="max-width:100%;max-height:340px;border-radius:6px;border:1.5px solid #E8E8E8;display:block;" /></div>';
      html += '</details>';
    }

    /* Source */
    if (sub.source) {
      html += '<div class="submission-source">🔍 Source: ' + escHtml(sub.source) + '</div>';
    }

    /* Actions */
    html += '<div class="submission-actions">';
    if (sub.status !== 'approved') {
      html += '<button class="btn-sub-approve" onclick="updateSubmissionStatus(\'' + sub.id + '\',\'approved\')">✅ Approve</button>';
    }
    if (sub.status !== 'rejected') {
      html += '<button class="btn-sub-reject"  onclick="updateSubmissionStatus(\'' + sub.id + '\',\'rejected\')">❌ Reject</button>';
    }
    if (sub.status !== 'pending') {
      html += '<button class="btn-sub-pending" onclick="updateSubmissionStatus(\'' + sub.id + '\',\'pending\')">⏳ Mark Pending</button>';
    }
    html += '<button class="btn-delete" onclick="deleteSubmission(\'' + sub.id + '\')">🗑 Delete</button>';
    html += '</div>';

    html += '</div>'; /* /submission-row */
  });

  list.innerHTML = html;
}

function updateSubmissionStatus(id, status) {
  DB.updateSubmissionStatus(id, status);
  const filterSel = document.getElementById('submissionFilter');
  buildAllSubmissions(filterSel ? filterSel.value : 'all');
}

function deleteSubmission(id) {
  if (!confirm('Delete this submission permanently?')) return;
  DB.deleteSubmission(id);
  const filterSel = document.getElementById('submissionFilter');
  buildAllSubmissions(filterSel ? filterSel.value : 'all');
}

/* ================================================================
   SUBSCRIBERS TABLE
   ================================================================ */
function buildSubscribersTable() {
  const tbody   = document.getElementById('subscribersTableBody');
  const countEl = document.getElementById('subscriberCount');
  if (!tbody) return;

  const subs = DB.getSubscribers();
  if (countEl) countEl.textContent = subs.length + ' subscriber' + (subs.length !== 1 ? 's' : '');

  if (subs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-msg" style="text-align:center;padding:28px;">No subscribers yet.</td></tr>';
    return;
  }

  let html = '';
  subs.forEach(function(s) {
    html += '<tr>';
    html += '<td>' + escHtml(s.firstName + ' ' + s.lastName) + '</td>';
    html += '<td>' + escHtml(s.email) + '</td>';
    html += '<td>' + escHtml(s.location || '—') + '</td>';
    html += '<td>' + escHtml(s.phone || '—') + '</td>';
    html += '<td>' + new Date(s.joinedAt).toLocaleDateString('en-NP') + '</td>';
    html += '<td><button class="btn-delete" onclick="deleteSubscriber(\'' + s.id + '\')">Remove</button></td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;
}

function deleteSubscriber(id) {
  if (!confirm('Remove this subscriber?')) return;
  DB.deleteSubscriber(id);
  buildSubscribersTable();
}

/* ── Logout ───────────────────────────────────────────────── */
function setupLogout() {
  const btn = document.getElementById('adminLogoutBtn');
  if (btn) btn.addEventListener('click', function(){ DB.logout(); window.location.href = 'admin-login.html'; });
}

/* ── Helpers ──────────────────────────────────────────────── */
function val(id)         { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function setVal(id, v)   { const el = document.getElementById(id); if (el) el.value = v; }
function setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text; el.className = 'form-msg ' + type;
  setTimeout(function(){ el.className = 'form-msg'; }, 3500);
}
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
