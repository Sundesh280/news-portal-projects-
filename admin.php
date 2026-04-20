<?php
session_name('nk_admin');
session_start();
// Block non-admins from accessing this page directly
if (empty($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header('Location: admin-login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel — Nepal Khabar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/admin.css" />
</head>
<body class="admin-page">

  <!-- ADMIN HEADER -->
  <header class="admin-header">
    <div class="admin-logo">
      Nepal<span>Khabar</span>
      <small>Admin Panel</small>
    </div>
    <div class="admin-user-info">
      <span>Logged in as <strong><?php echo htmlspecialchars($_SESSION['user_name']); ?></strong></span>
      <a href="index.php?from=admin" class="btn-admin-logout" style="margin-right:4px;">← View Site</a>
      <a href="logout-admin.php" class="btn-admin-logout" onclick="sessionStorage.removeItem('nk__admin_session');">Logout</a>
    </div>
  </header>

  <!-- CATEGORY NAV -->
  <nav class="admin-cat-nav-bar">
    <div id="adminCategoryNav"></div>
  </nav>

  <!-- ADMIN BODY -->
  <div class="admin-body">

    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <p class="sidebar-section-label">Manage</p>
      <button class="sidebar-btn active" data-section="sectionArticles">📰 Articles</button>
      <button class="sidebar-btn"        data-section="sectionUsers">👥 Users</button>
      <button class="sidebar-btn"        data-section="sectionComments">💬 Comments</button>
      <button class="sidebar-btn"        data-section="sectionTicker">📡 Live Ticker</button>

    </aside>

    <!-- Main panel -->
    <main class="admin-main">

      <!-- ══ Live Ticker Section ═══════════════════════════ -->
      <div class="admin-section" id="sectionTicker">
        <div class="section-header-row">
          <h2 class="section-title">📡 Live Ticker Manager</h2>
          <div class="ticker-master-control">
            <span class="ticker-live-dot" id="tickerLiveDot"></span>
            <span id="tickerMasterLabel">Ticker: Live</span>
            <button class="btn-ticker-master" id="tickerMasterBtn">⏸ Stop All</button>
          </div>
        </div>
        <div class="ticker-preview-wrap">
          <div class="ticker-preview-label">LIVE PREVIEW</div>
          <div class="ticker-preview-bar" id="tickerPreviewBar">
            <span class="ticker-preview-track" id="tickerPreviewTrack"></span>
          </div>
        </div>
        <div class="ticker-add-card">
          <div class="ticker-add-title">➕ Add New Headline</div>
          <div class="ticker-add-row">
            <input type="text" id="tickerNewText" class="ticker-input" placeholder="Type breaking news headline here…" maxlength="200" />
            <button class="btn-ticker-add" id="tickerAddBtn">Add Headline</button>
          </div>
          <div id="tickerAddMsg" class="form-msg" style="margin-top:10px;"></div>
        </div>
        <div class="ticker-headlines-header">
          <span>All Headlines <span id="tickerCount" class="ticker-count-badge">0</span></span>
          <span class="ticker-hint">Each headline has: Remove · Rewrite · Start/Stop</span>
        </div>
        <div id="tickerHeadlineList"></div>
      </div>

      <!-- ══ Articles Section ═══════════════════════════ -->
      <div class="admin-section" id="sectionArticles">
        <div class="article-form-card" id="articleForm">
          <div class="form-mode-badge" id="formModeBadge">✏️ New Article</div>
          <div class="form-grid">
            <div class="form-field">
              <label>Title (English) <span style="font-weight:400;color:#888;">— or fill Nepali below</span></label>
              <input type="text" id="formTitleEn" placeholder="Article headline in English" />
            </div>
            <div class="form-field">
              <label>शीर्षक (नेपाली) <span style="font-weight:400;color:#888;">— वा माथि अंग्रेजी</span></label>
              <input type="text" id="formTitle" placeholder="नेपालीमा शीर्षक" />
            </div>
            <div class="form-field full-width">
              <label>Summary / Lead (English)</label>
              <textarea id="formSummaryEn" style="min-height:70px;" placeholder="Short summary shown on homepage…"></textarea>
            </div>
            <div class="form-field full-width">
              <label>सारांश (नेपाली)</label>
              <textarea id="formSummary" style="min-height:70px;" placeholder="नेपालीमा सारांश…"></textarea>
            </div>
            <div class="form-field full-width">
              <label>Full Article Body (English)</label>
              <textarea id="formContentEn" placeholder="Write full article content here. Use blank lines to separate paragraphs."></textarea>
            </div>
            <div class="form-field full-width">
              <label>पूर्ण लेख (नेपाली)</label>
              <textarea id="formContent" placeholder="नेपालीमा पूर्ण लेख यहाँ लेख्नुहोस्।"></textarea>
            </div>
            <div class="form-field">
              <label>Image URL</label>
              <input type="url" id="formImage" placeholder="https://images.unsplash.com/…" />
            </div>
            <div class="form-field">
              <label>Author Name *</label>
              <input type="text" id="formAuthor" placeholder="Reporter / Editor name" />
            </div>
            <div class="form-field">
              <label>Category *</label>
              <select id="formCategory"></select>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-publish" id="saveArticleBtn">Publish Article</button>
            <button class="btn-cancel-edit" id="cancelEditBtn">Cancel</button>
            <div id="formMsg" class="form-msg" style="flex:1;"></div>
          </div>
        </div>
        <div id="adminArticleList"></div>
      </div>

      <!-- Users Section -->
      <div class="admin-section" id="sectionUsers">
        <h2 class="section-title">👥 Registered Users</h2>
        <table class="users-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
          </thead>
          <tbody id="usersTableBody"></tbody>
        </table>
      </div>

      <!-- Comments Section -->
      <div class="admin-section" id="sectionComments">
        <h2 class="section-title">💬 All Comments <span style="font-size:0.75rem;color:#27ae60;font-family:'DM Sans',sans-serif;font-weight:500;margin-left:10px;">🔴 Live — updates every 5s</span></h2>
        <div id="allCommentsList"></div>
      </div>



    </main>
  </div>

  <script src="js/data.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>
