<?php session_name('nk_user'); session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nepal Khabar — नेपाल खबर</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/article.css" />
</head>
<body>

  <!-- TOP UTILITY BAR -->
  <div class="top-bar">
    <span class="top-bar-date" id="topBarDate"></span>
    <div class="top-bar-links">
      <a href="php/login.php"    id="topBarLogin">🔐 Login</a>
      <a href="php/register.php" id="topBarRegister">📝 Register</a>
      <span id="topBarUserInfo" style="display:none; color:#ccc;">
        👤 <span id="topBarUserName"></span>
        &nbsp;<a href="#" id="topBarLogout" style="color:var(--red);">Logout</a>
      </span>
    </div>
  </div>

  <!-- BREAKING NEWS TICKER -->
  <div class="ticker-bar" id="tickerBar">
    <span class="ticker-label">🔴 Breaking</span>
    <div class="ticker-track-wrap">
      <div class="ticker-track" id="tickerTrack"></div>
    </div>
  </div>

  <!-- HEADER -->
  <header class="site-header">
    <div class="header-inner">
      <div>
        <div class="site-logo" id="logoHome" style="cursor:pointer;">Nepal<span>Khabar</span></div>
        <div class="header-tagline">नेपालको विश्वसनीय समाचार स्रोत</div>
      </div>
      </div>
    </div>
  </header>

  <!-- CATEGORY NAV -->
  <nav class="category-nav-bar" id="categoryNavBar">
    <div id="categoryNav"></div>
    <div class="search-box" style="margin-left: auto; padding-right: 15px; display: flex; align-items: center;">
      <input type="text" id="searchInput" placeholder="Search..." style="padding: 4px 12px; border-radius: 20px; border: 1px solid #ccc; outline: none; font-family: inherit; width: 140px; font-size: 0.9rem; max-width: 100%;">
    </div>
  </nav>

  <!-- HOME VIEW -->
  <div id="homeView">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
      <div id="heroContainer"></div>
    </div>
    <div class="page-layout">
      <main>
        <div class="section-heading" id="sectionHeading">📰 Top Stories</div>
        <div id="newsGrid"></div>
      </main>
      <aside class="sidebar">
        <div class="sidebar-widget">
          <div class="sidebar-widget-title">🔥 Most Read</div>
          <div class="sidebar-article-list" id="mostReadList"></div>
        </div>
        <div class="sidebar-widget sidebar-widget-latest">
          <div class="sidebar-widget-title">🕐 Latest</div>
          <div class="sidebar-article-list" id="latestList"></div>
        </div>
      </aside>
    </div>
  </div>

  <!-- ARTICLE VIEW (inline) -->
  <div id="articleView" style="display:none;">
    <main class="article-main">
      <div class="container">
        <a href="#" class="back-link" id="backToHome">← Back to News</a>
        <div class="article-wrap">
          <span id="artCategory" class="cat-badge"></span>
          <div class="article-header">
            <h1 class="article-title-en" id="artTitleEn"></h1>
            <p class="article-title-np"  id="artTitle"></p>
            <p class="article-summary"   id="artSummaryEn"></p>
          </div>
          <div class="article-meta-bar">
            <span>✍ <strong id="artAuthor"></strong></span>
            <span>📅 <span id="artDate"></span></span>
            <span>👁 <span id="artViews"></span></span>
          </div>
          <!-- Social Share Bar -->
          <div class="share-bar">
            <span class="share-label">Share:</span>
            <a class="share-btn share-facebook" id="shareFacebook" href="#" target="_blank" rel="noopener" title="Share on Facebook">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
            <a class="share-btn share-whatsapp" id="shareWhatsapp" href="#" target="_blank" rel="noopener" title="Share on WhatsApp">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a class="share-btn share-twitter" id="shareTwitter" href="#" target="_blank" rel="noopener" title="Share on X (Twitter)">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
            </a>
          </div>
          <div class="article-img-wrap">
            <img id="artImage" src="" alt="Article image" />
          </div>
          <div class="article-body" id="artBody"></div>
        </div>

        <!-- COMMENTS -->
        <div class="comments-section">
          <h2 class="comments-title">Comments</h2>
          <div id="commentList"></div>
          <div class="comment-form" id="commentForm" style="display:none;">
            <p class="comment-form-title">Leave a Comment</p>
            <textarea id="commentText" placeholder="Write your comment here…"></textarea>
            <button class="btn-post-comment" id="commentSubmit">Post Comment</button>
            <div id="commentMsg" class="form-msg"></div>
          </div>
          <div class="comment-locked" id="commentLocked" style="display:none;">
            🔒 You must <a href="php/login.php">sign in</a> or <a href="php/register.php">register</a> to leave a comment.
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- FOOTER -->
  <footer class="site-footer">
    <p>© 2026 <strong>Nepal Khabar</strong> · नेपाल खबर · All rights reserved</p>
    <p style="margin-top:8px;">
      <a href="index.php">Home</a> &nbsp;·&nbsp;
      <a href="php/login.php">Login</a> &nbsp;·&nbsp;
      <a href="php/register.php">Register</a>
    </p>
  </footer>

  <script src="js/data.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/main.js"></script>
  <script src="js/article.js"></script>
</body>
</html>